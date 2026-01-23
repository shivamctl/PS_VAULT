// retryWorker.js
import pkg from "bullmq";
const { Worker } = pkg;

import { redis } from "./redisClient.js";
import { MongoClient } from "mongodb";

import { verifyAgain, publishListingUpdate } from "./utils.js";
import { notifyQueue } from "./queues.js";

// Shared config (loaded by secrets.js)
import { REDIS_URL, DATABASE } from "../config/secrets.js";

// ---------------- DEBUG ----------------
console.log("🔥 RETRY WORKER LOADED");
console.log("🔧 Using REDIS_URL =", REDIS_URL);
console.log("🔗 Mongo URI =", DATABASE);

// ✅ Dedicated connection for BullMQ
const workerRedis = redis.duplicate();

redis.on("connect", () => console.log("RETRY (pub/sub) connected to Redis"));
redis.on("ready", () => console.log("RETRY (pub/sub) Redis ready"));
redis.on("error", (err) => console.log("RETRY (pub/sub) Redis error:", err));

workerRedis.on("connect", () =>
  console.log("RETRY (bullmq) connected to Redis"),
);
workerRedis.on("ready", () => console.log("RETRY (bullmq) Redis ready"));
workerRedis.on("error", (err) =>
  console.log("RETRY (bullmq) Redis error:", err),
);

// ---------------- MONGO ----------------
const mongo = await MongoClient.connect(DATABASE);
const db = mongo.db("psvault");

// ---------------- WORKER ----------------
new Worker(
  "retryQueue",
  async (job) => {
    const data = job.data;

    const pending = await db.collection("pending_listings").findOne({
      listingId: data.listingId,
    });

    if (!pending) {
      console.log("❌ Pending listing missing on retry:", data.listingId);
      return;
    }

    console.log("🟧 SECOND CHECK FOR:", data.listingId);

    // -------- SECOND AI VERIFICATION --------
    const result = await verifyAgain({
      ...data,
      resizedImages: pending.resizedImages,
    });

    const approved = !!result?.approved;
    const reason = result?.reason || (approved ? "Approved" : "Rejected");

    if (approved) {
      console.log("✔ APPROVED on second attempt:", data.listingId);

      await publishListingUpdate({
        listingId: data.listingId,
        status: "approved",
        reason,
      });

      await db.collection("pending_listings").deleteOne({
        listingId: data.listingId,
      });

      await db.collection("listings").insertOne({
        listingId: data.listingId,
        email: pending.email,
        title: pending.title,
        description: pending.description,
        price: pending.price,
        condition: pending.condition,
        platform: pending.platform,
        imageUrls: pending.imageUrls,
        isVerified: true,
        rejected: false,
        reason,
        isSold: false,
        createdAt: new Date(),
      });

      return;
    }

    // -------- FINAL REJECTION --------
    console.log("❌ FINAL REJECTION:", data.listingId);

    await db.collection("pending_listings").deleteOne({
      listingId: data.listingId,
    });

    await db.collection("listings").insertOne({
      listingId: data.listingId,
      email: pending.email,
      title: pending.title,
      description: pending.description,
      price: pending.price,
      condition: pending.condition,
      platform: pending.platform,
      imageUrls: pending.imageUrls,
      isVerified: false,
      rejected: true,
      reason,
      isSold: false,
      createdAt: new Date(),
    });

    await publishListingUpdate({
      listingId: data.listingId,
      status: "rejected",
      reason,
    });

    await notifyQueue.add("notify-user", {
      ...data,
      reason,
    });
  },
  {
    connection: workerRedis,
    attempts: 1, // DO NOT retry the retry worker again
  },
);
