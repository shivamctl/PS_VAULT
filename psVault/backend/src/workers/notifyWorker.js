// notifyWorker.js
import pkg from "bullmq";
const { Worker } = pkg;

import { redis } from "./redisClient.js";
import { MongoClient } from "mongodb";
import { publishListingUpdate } from "./utils.js";

// Shared config (loaded by secrets.js)
import { REDIS_URL, DATABASE } from "../config/secrets.js";

// ---------------- DEBUG ----------------
console.log("🔥 NOTIFY WORKER LOADED");
console.log("🔧 Using REDIS_URL =", REDIS_URL);
console.log("🔗 Mongo URI =", DATABASE);

// Dedicated connection for BullMQ
const workerRedis = redis.duplicate();

redis.on("connect", () => console.log("NOTIFY (pub/sub) connected to Redis"));
redis.on("ready", () => console.log("NOTIFY (pub/sub) Redis ready"));
redis.on("error", (err) => console.log("NOTIFY (pub/sub) Redis error:", err));

workerRedis.on("connect", () =>
  console.log("NOTIFY (bullmq) connected to Redis"),
);
workerRedis.on("ready", () => console.log("NOTIFY (bullmq) Redis ready"));
workerRedis.on("error", (err) =>
  console.log("NOTIFY (bullmq) Redis error:", err),
);

// ---------------- MONGO ----------------
const mongo = await MongoClient.connect(DATABASE);
const db = mongo.db("psvault");

// ---------------- WORKER ----------------
new Worker(
  "notifyQueue",
  async (job) => {
    try {
      const data = job.data;

      console.log("📢 FINAL FAIL received:", data.listingId);

      // ✅ Update frontend -> FAILED listing
      await publishListingUpdate({
        listingId: data.listingId,
        status: "rejected",
        reason: data.reason,
      });

      // ✅ Future: Add real email/push notification here
      console.log("📨 User notified:", data.email);
    } catch (err) {
      console.error("⚠️ Notify worker error:", err);
      throw err; // BullMQ will mark it failed (attempts=1 so no infinite loop)
    }
  },
  {
    connection: workerRedis,
    attempts: 1,
  },
);
