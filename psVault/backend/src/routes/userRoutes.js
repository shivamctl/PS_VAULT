import express from "express";
import { getDb } from "../config/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get public key for any user
router.get("/publicKey/:email", async (req, res) => {
  try {
    const db = getDb();
    const email = decodeURIComponent(req.params.email);

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ publicKey: user.publicKey || null });
  } catch (error) {
    console.error("Public key fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update public key
router.post("/updatePublicKey", authenticateToken, async (req, res) => {
  const db = getDb();
  const { publicKey } = req.body;
  if (!publicKey) return res.status(400).json({ error: "Missing public key" });

  await db
    .collection("users")
    .updateOne({ email: req.user.email }, { $set: { publicKey } });

  res.json({ success: true });
});

// Update user location
router.post("/location", authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude & longitude required" });
    }

    await db
      .collection("users")
      .updateOne(
        { email: req.user.email },
        { $set: { location: { latitude, longitude } } }
      );

    res.json({ success: true, message: "Location updated" });
  } catch (error) {
    console.error("Location update error:", error);
    res.status(500).json({ error: "Failed to update location" });
  }
});

export default router;
