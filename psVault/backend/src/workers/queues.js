import { Queue } from "bullmq";
import Redis from "ioredis";

// Shared config (single source of truth)
import { REDIS_URL } from "../config/secrets.js";

// ---------------- DEBUG ----------------
console.log("🔥 queues.js loaded");
console.log("🔧 Using REDIS_URL =", REDIS_URL);

// ---------------- REDIS CONNECTION ----------------
const redis = new Redis(REDIS_URL, {
  tls: {}, // Upstash requires TLS
  maxRetriesPerRequest: null, // Required for BullMQ
});

// ---------------- EXPORT QUEUES ----------------
export const listingQueue = new Queue("listingQueue", {
  connection: redis,
});

export const retryQueue = new Queue("retryQueue", {
  connection: redis,
});

export const notifyQueue = new Queue("notifyQueue", {
  connection: redis,
});

// ---------------- GRACEFUL SHUTDOWN (OPTIONAL) ----------------
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down queues...");

  await listingQueue.close();
  await retryQueue.close();
  await notifyQueue.close();
  await redis.quit();

  process.exit(0);
});
