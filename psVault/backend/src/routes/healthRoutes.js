import express from "express";
import { getDb } from "../config/db.js";

const router = express.Router();

router.get("/health", (req, res) => {
  let status = "disconnected";
  try {
    const db = getDb();
    if (db) status = "connected";
  } catch {
    status = "disconnected";
  }
  res.json({ status: "ok", database: status });
});

export default router;
