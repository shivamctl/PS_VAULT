import { MongoClient } from "mongodb";
import { DATABASE, DB_NAME } from "./secrets.js";

let db;

export async function connectDB() {
  if (db) return db;

  console.log("FINAL MONGO URL = ", DATABASE);

  const client = await MongoClient.connect(DATABASE);
  db = client.db(DB_NAME);
  console.log("Connected to MongoDB");

  // Indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("listings").createIndex({ userId: 1 });
  await db.collection("listings").createIndex({ createdAt: -1 });
  await db.collection("conversations").createIndex({ participants: 1 });
  await db.collection("messages").createIndex({ conversationId: 1 });

  console.log("Database indexes created");
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB() first.");
  }
  return db;
}
