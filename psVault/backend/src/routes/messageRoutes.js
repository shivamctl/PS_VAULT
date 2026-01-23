import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { sanitizeEmail } from "../utils/sanitizeEmail.js";
import { getIo } from "../socketInstance.js";

const router = express.Router();

// Get messages for a conversation
router.get("/messages/:conversationId", authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const conversationId = req.params.conversationId;

    const conversation = await db.collection("conversations").findOne({
      _id: new ObjectId(conversationId),
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (!conversation.participants.includes(req.user.email)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const messages = await db
      .collection("messages")
      .find({ conversationId })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(
      messages.map((msg) => ({
        ...msg,
        id: msg._id.toString(),
      }))
    );
  } catch (e) {
    console.error("Get messages error:", e);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send message
router.post("/messages", authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const io = getIo();
    const { conversationId, message } = req.body;

    const conversation = await db.collection("conversations").findOne({
      _id: new ObjectId(conversationId),
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    if (!conversation.participants.includes(req.user.email)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const otherUser = conversation.participants.find(
      (p) => p !== req.user.email
    );

    const newMessage = {
      conversationId,
      senderEmail: req.user.email,
      message,
      createdAt: new Date(),
    };

    const result = await db.collection("messages").insertOne(newMessage);

    await db.collection("conversations").updateOne(
      { _id: new ObjectId(conversationId) },
      {
        $set: { lastMessageAt: new Date() },
        $inc: { [`unread.${sanitizeEmail(otherUser)}`]: 1 },
      }
    );

    const finalMessage = {
      ...newMessage,
      id: result.insertedId.toString(),
    };

    io.to(conversationId).emit("newMessage", finalMessage);

    res.status(201).json(finalMessage);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
