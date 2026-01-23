import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { sanitizeEmail } from "../utils/sanitizeEmail.js";

const router = express.Router();

// Get user conversations
router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const conversations = await db
      .collection("conversations")
      .find({ participants: req.user.email })
      .sort({ lastMessageAt: -1 })
      .toArray();

    const detailed = await Promise.all(
      conversations.map(async (conv) => {
        const listing = await db.collection("listings").findOne({
          listingId: conv.listingId,
        });

        const fullListing = listing
          ? {
              listingId: listing.listingId,
              email: listing.email,
              title: listing.title,
              description: listing.description,
              price: listing.price,
              platform: listing.platform,
              condition: listing.condition,
              imageUrls: listing.imageUrls || [],
              createdAt: listing.createdAt,
            }
          : {
              listingId: conv.listingId,
              email: null,
              title: "Listing Removed",
              description: "",
              price: 0,
              platform: "",
              condition: "",
              imageUrls: [],
              createdAt: null,
            };

        const otherEmail = conv.participants.find((e) => e !== req.user.email);

        const otherUser = await db.collection("users").findOne({
          email: otherEmail,
        });

        return {
          ...conv,
          id: conv._id.toString(),
          listing: fullListing,
          otherUser: otherUser
            ? { email: otherUser.email, name: otherUser.name }
            : { email: "Unknown", name: "Deleted User" },
        };
      })
    );

    res.json(detailed);
  } catch (err) {
    console.error("Conversation fetch error:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Create or get conversation
router.post("/conversations", authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { listingId, sellerEmail } = req.body;

    if (!listingId || !sellerEmail) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await db.collection("conversations").findOne({
      listingId,
      participants: { $all: [req.user.email, sellerEmail] },
    });

    if (existing) {
      return res.json({
        ...existing,
        id: existing._id.toString(),
      });
    }

    const conv = {
      listingId,
      participants: [req.user.email, sellerEmail],
      unread: {
        [sanitizeEmail(req.user.email)]: 0,
        [sanitizeEmail(sellerEmail)]: 0,
      },
      lastMessageAt: new Date(),
      createdAt: new Date(),
    };

    const result = await db.collection("conversations").insertOne(conv);

    res.json({
      ...conv,
      id: result.insertedId.toString(),
    });
  } catch (err) {
    console.error("Create conversation error:", err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Mark as read (legacy)
router.post("/conversations/mark-read", authenticateToken, async (req, res) => {
  const db = getDb();
  const { conversationId } = req.body;

  await db
    .collection("conversations")
    .updateOne(
      { _id: new ObjectId(conversationId), participants: req.user.email },
      { $set: { [`unread.${sanitizeEmail(req.user.email)}`]: 0 } }
    );

  res.json({ success: true });
});

// Reset unread (duplicate route kept for compatibility)
router.post(
  "/conversations/reset-unread",
  authenticateToken,
  async (req, res) => {
    const db = getDb();
    const { conversationId } = req.body;

    await db
      .collection("conversations")
      .updateOne(
        { _id: new ObjectId(conversationId), participants: req.user.email },
        { $set: { [`unread.${sanitizeEmail(req.user.email)}`]: 0 } }
      );

    res.json({ success: true });
  }
);

export default router;
