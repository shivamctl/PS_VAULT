// utils.js
import OpenAI from "openai";
import axios from "axios";
import { redis } from "./redisClient.js";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ------------------------------
// Load shared config
// ------------------------------
import {
  OPENAI_API_KEY,
  REDIS_URL,
  AWS_REGION,
  AWS_BUCKET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} from "../config/secrets.js";
import { REDIS_COMMUNICATION_EVENTS } from "./constants.js";

// ------------------------------
// Debug
// ------------------------------
console.log("🔥 utils.js loaded");
console.log("🔧 REDIS_URL =", REDIS_URL);
console.log("🔑 OpenAI Key Loaded =", !!OPENAI_API_KEY);
console.log("📦 AWS Bucket =", AWS_BUCKET);

// ------------------------------
// Redis (Upstash)
// ------------------------------

redis.on("connect", () => console.log("UTILS Redis connected"));
redis.on("ready", () => console.log("UTILS Redis ready"));
redis.on("error", (err) => console.log("UTILS Redis error:", err));

// ------------------------------
// OpenAI client
// ------------------------------
const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// ------------------------------
// S3 client
// ------------------------------
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// ✅ Fix: extract FULL s3 key from URL safely
function extractS3KeyFromUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.startsWith("/")
      ? parsed.pathname.slice(1)
      : parsed.pathname;
  } catch (e) {
    return url.substring(url.lastIndexOf("/") + 1);
  }
}

// ------------------------------
// Convert S3 file → base64
// ------------------------------
async function getImageBase64FromS3(url) {
  const key = extractS3KeyFromUrl(url);

  const signedUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: AWS_BUCKET,
      Key: key,
    }),
    { expiresIn: 300 },
  );

  const response = await axios.get(signedUrl, {
    responseType: "arraybuffer",
    timeout: 15000,
  });

  return Buffer.from(response.data).toString("base64");
}

// ------------------------------
// REAL AI SECOND CHECK
// ------------------------------
export async function verifyAgain(data) {
  let base64Images = [];

  // ✅ Use cached resized images if present
  if (Array.isArray(data.resizedImages) && data.resizedImages.length > 0) {
    console.log("♻️ verifyAgain using cached resized images");
    base64Images = data.resizedImages;
  } else {
    console.log("🖼 verifyAgain fetching images from S3");

    for (const url of data.imageUrls) {
      const imgBase64 = await getImageBase64FromS3(url);
      base64Images.push(imgBase64);
    }
  }

  // ✅ FIXED TOOL FORMAT (must include tools[0].name)
  const tools = [
    {
      type: "function",
      name: "post_processing",
      parameters: {
        type: "object",
        properties: {
          is_declined: { type: "boolean" },
          decline_reason: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          mismatch: { type: "boolean" },
        },
        required: ["is_declined", "decline_reason", "confidence", "mismatch"],
      },
    },
  ];

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
You are a strict listing verifier (SECOND CHECK).
Return ONLY a function call: post_processing in the format given:
{
  "is_declined": boolean,
  "decline_reason": string,
  "confidence": number (0-1),
  "mismatch": boolean
}
APPROVE only if ALL are true:
1) Images clearly show a PHYSICAL PlayStation item (disc/case/console/controller/accessory).
2) Title+description match the item (accept aliases: "gta5"="GTA V"="Grand Theft Auto V").
3) Platform must match image (PS4 vs PS5 mismatch => reject).
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
            text: `Title: ${data.title}\nDescription: ${data.description}`,
          },
          ...base64Images.map((img) => ({
            type: "input_image",
            image_url: `data:image/jpeg;base64,${img}`,
          })),
        ],
      },
    ],
  });

  const functionCallOutput = openAiResponse.output.find(
    (res) => res.type === "function_call" && res.name === "post_processing",
  );

  if (!functionCallOutput?.arguments) {
    throw new Error(
      "No function_call output received from OpenAI (retry check)",
    );
  }

  const parsed =
    typeof functionCallOutput.arguments === "string"
      ? JSON.parse(functionCallOutput.arguments)
      : functionCallOutput.arguments;

  const { is_declined, decline_reason, mismatch, confidence } = parsed;

  if (
    typeof is_declined !== "boolean" ||
    typeof mismatch !== "boolean" ||
    typeof confidence !== "number"
  ) {
    throw new Error("Invalid AI response format (retry check)");
  }

  const approved =
    is_declined === false && mismatch === false && confidence >= 0.75;

  return {
    approved,
    reason: approved
      ? "Approved by AI verification (retry check)"
      : decline_reason?.trim() ||
        "Rejected: Title/description does not match the image.",
    confidence,
    mismatch,
  };
}

// ------------------------------
// PUSH update to frontend
// ------------------------------
export async function publishListingUpdate(update) {
  await redis.publish(
    REDIS_COMMUNICATION_EVENTS.LISTING_UPDATES,
    JSON.stringify(update),
  );
}
