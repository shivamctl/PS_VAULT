// listingWorker.js
import pkg from "bullmq";
import sharp from "sharp";
const { Worker } = pkg;

import { redis } from "./redisClient.js";
import OpenAI from "openai";
import axios from "axios";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { MongoClient } from "mongodb";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import { fileURLToPath } from "url";
import { publishListingUpdate } from "./utils.js";
// Shared config (single source of truth)
import {
  REDIS_URL,
  OPENAI_API_KEY,
  AWS_REGION,
  AWS_BUCKET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  DATABASE, // ✅ keep as you are using DATABASE in your project
} from "../config/secrets.js";

import { retryQueue } from "./queues.js";
import { REDIS_COMMUNICATION_EVENTS } from "./constants.js";

// ---------------- PATH DEBUG ----------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔥 Worker File Running:", __filename);
console.log("📁 Worker Folder:", __dirname);

// ---------------- REDIS ----------------
console.log("🔧 Using REDIS_URL =", REDIS_URL);

// ✅ Dedicated redis connection for BullMQ Worker (recommended)
const workerRedis = redis.duplicate();

redis.on("connect", () => console.log("WORKER (pub/sub) connected to Redis"));
redis.on("ready", () => console.log("WORKER (pub/sub) Redis is ready"));
redis.on("error", (err) => console.log("WORKER (pub/sub) Redis ERROR:", err));

workerRedis.on("connect", () =>
  console.log("WORKER (bullmq) connected to Redis"),
);
workerRedis.on("ready", () => console.log("WORKER (bullmq) Redis is ready"));
workerRedis.on("error", (err) =>
  console.log("WORKER (bullmq) Redis ERROR:", err),
);

// ---------------- OPENAI ----------------
console.log("🔑 OpenAI Key Loaded =", !!OPENAI_API_KEY);

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// ---------------- MONGO ----------------
console.log("🔗 Mongo URL =", DATABASE);

const mongo = await MongoClient.connect(DATABASE);
const db = mongo.db("psvault");

// ---------------- S3 ----------------
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

async function getSignedUrlForImage(key) {
  const command = new GetObjectCommand({
    Bucket: AWS_BUCKET,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn: 300 });
}

// ✅ Fix: extract FULL s3 key from URL (not only filename)
function extractS3KeyFromUrl(url) {
  try {
    const parsed = new URL(url);
    const key = parsed.pathname.startsWith("/")
      ? parsed.pathname.slice(1)
      : parsed.pathname;

    return key.replace(/^\/+/, "");
  } catch (e) {
    return url.substring(url.lastIndexOf("/") + 1);
  }
}

// ---------------- WORKER ----------------
new Worker(
  "listingQueue",
  async (job) => {
    const listingId = job?.data?.listingId;

    try {
      const {
        email,
        title,
        description,
        imageUrls,
        platform,
        condition,
        price,
      } = job.data;
      console.log("🔍 Worker verifying:", listingId);

      const tempListing = await db.collection("pending_listings").findOne({
        listingId,
      });

      if (!tempListing) {
        console.log("❌ Temp listing not found:", listingId);
        return;
      }

      // -------- Fetch images & convert to base64 (cached) --------
      let imageBase64Array =
        Array.isArray(tempListing.resizedImages) &&
        Array.isArray(imageUrls) &&
        tempListing.resizedImages.length === imageUrls.length
          ? tempListing.resizedImages
          : null;

      if (!imageBase64Array) {
        console.log("🖼 Processing images for first time:", listingId);

        imageBase64Array = [];

        for (const url of imageUrls) {
          const key = extractS3KeyFromUrl(url);

          const signedUrl = await getSignedUrlForImage(key);

          const imgResponse = await axios.get(signedUrl, {
            responseType: "arraybuffer",
            timeout: 15000,
          });

          const resizedBuffer = await sharp(imgResponse.data)
            .resize(1024, 1024, { fit: "inside" })
            .jpeg({ quality: 80 })
            .toBuffer();

          imageBase64Array.push(resizedBuffer.toString("base64"));
        }

        // ✅ Save resized images for retries
        await db.collection("pending_listings").updateOne(
          { listingId },
          {
            $set: { resizedImages: imageBase64Array },
          },
        );
      } else {
        console.log("♻️ Reusing cached images:", listingId);
      }

      const tools = [
        {
          type: "function",
          name: "post_processing",
          parameters: {
            type: "object",
            properties: {
              is_declined: { type: "boolean" },
              mismatch: { type: "boolean" },
              confidence: { type: "number", minimum: 0, maximum: 1 },

              decline_code: {
                type: "string",
                enum: [
                  "TITLE_IMAGE_MISMATCH",
                  "DESCRIPTION_IMAGE_MISMATCH",
                  "LOW_QUALITY_IMAGE",
                  "NO_PRODUCT_VISIBLE",
                  "MULTIPLE_PRODUCTS_CONFUSING",
                  "SUSPICIOUS_CONTENT",
                  "INCOMPLETE_INFO",
                  "OTHER",
                ],
              },

              decline_reason: { type: "string" },
            },
            required: [
              "is_declined",
              "mismatch",
              "confidence",
              "decline_code",
              "decline_reason",
            ],
          },
        },
      ];

      // -------- REAL OPENAI CALL --------
      const openAiResponse = await client.responses.create({
        model: "gpt-4o-mini",
        tools,
        tool_choice: {
          type: "function",
          name: "post_processing",
        },
        input: [
          {
            role: "system",
            content: `
You are a strict PlayStation marketplace listing verifier.
Return ONLY a function call: post_processing in the format given:
{
  "is_declined": boolean,
  "mismatch": boolean,
  "confidence": number,
  "decline_code": "...",
  "decline_reason": "..."
}
APPROVE only if ALL are true:
1) item should be (Playstation related - disc/case/console/controller/accessory).
2) Title+description match the item (accept aliases: "gta5"="GTA V"="Grand Theft Auto V").
3) If disc/case is clear but title text unreadable => do NOT mark mismatch unless confident.
(PS4 vs PS5 mismatch => reject).
4) Reject screenshots, digital codes, accounts, gift cards, unrelated/unclear images.
5) If price exceeds more then the market price => reject.

If ANY rule fails => is_declined=true.
If text/platform mismatch => mismatch=true.
`,
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Title: ${title}
Description: ${description}
Platform: ${platform}
Condition: ${condition}
Price: $${price}`,
              },
              ...imageBase64Array.map((base64) => ({
                type: "input_image",
                image_url: `data:image/jpeg;base64,${base64}`,
              })),
            ],
          },
        ],
      });

      const functionCallOutput = openAiResponse.output.find(
        (res) => res.type === "function_call" && res.name === "post_processing",
      );

      if (!functionCallOutput?.arguments) {
        throw new Error("No function_call output received from OpenAI");
      }

      const result =
        typeof functionCallOutput.arguments === "string"
          ? JSON.parse(functionCallOutput.arguments)
          : functionCallOutput.arguments;

      const {
        is_declined,
        decline_reason,
        mismatch,
        confidence,
        decline_code,
      } = result;

      console.log({
        listingId,
        is_declined,
        mismatch,
        confidence,
        decline_code,
        decline_reason,
      });

      // ✅ Validate format (no retry, reject cleanly)
      if (typeof is_declined !== "boolean" || typeof mismatch !== "boolean") {
        console.log("❌ Invalid AI response format (NO RETRY):", listingId);

        await db.collection("pending_listings").updateOne(
          { listingId },
          {
            $set: {
              status: "rejected",
              reason: "Rejected: AI returned invalid response format.",
            },
          },
        );

        await publishListingUpdate({
          listingId: listingId.toString(),
          status: "rejected",
          reason: "Rejected: AI returned invalid response format.",
        });

        return;
      }

      const approved =
        is_declined === false &&
        mismatch === false &&
        typeof confidence === "number" &&
        confidence >= 0.7;

      const reply = approved
        ? "Approved by AI verification"
        : decline_reason?.trim() ||
          "Rejected: Title/description does not match the image.";

      // ✅ Update DB status too
      await db.collection("pending_listings").updateOne(
        { listingId },
        {
          $set: {
            status: approved ? "approved" : "rejected",
            reason: reply,
          },
        },
      );

      // Notify server in order to send socket message to FE
      await publishListingUpdate({
        listingId: listingId.toString(),
        status: approved ? "approved" : "rejected",
        reason: reply,
      });

      // -------- FAILED CHECK (NO RETRY) --------
      if (!approved) {
        console.log("❌ AI DECLINED LISTING (NO RETRY):", listingId);
        return;
      }

      // -------- FINAL APPROVAL --------
      await db.collection("pending_listings").deleteOne({ listingId });

      await db.collection("listings").insertOne({
        listingId,
        email,
        title,
        description,
        price,
        condition,
        platform,
        imageUrls,
        isVerified: true,
        isSold: false,
        createdAt: new Date(),
      });

      console.log("✔ Listing approved:", listingId);
    } catch (err) {
      console.error("⚠️ TECHNICAL ERROR processing job:", err);

      const msg =
        err?.message?.includes("OpenAI") || err?.status
          ? "Verification failed due to server issue. Retrying..."
          : "Temporary issue while verifying. Retrying...";

      if (listingId) {
        await db
          .collection("pending_listings")
          .updateOne(
            { listingId },
            { $set: { status: "retrying", reason: msg } },
          );

        await publishListingUpdate({
          listingId: listingId.toString(),
          status: "retrying",
          reason: msg,
        });
      }

      // ✅ Only technical errors → retryQueue
      await retryQueue.add("retry-listing", job.data);
      return;
    }
  },
  {
    connection: workerRedis,
    attempts: 1,
  },
);
