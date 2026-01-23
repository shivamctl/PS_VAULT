import express from "express";
import { getDb } from "../config/db.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { listingQueue } from "./../workers/queues.js";
import { randomUUID } from "crypto";

const router = express.Router();

function generateListingId() {
  return randomUUID();
}

// Pending listing status
router.get("/listings/pending/:id", async (req, res) => {
  const db = getDb();
  const listing = await db
    .collection("pending_listings")
    .findOne({ listingId: req.params.id });

  if (!listing) {
    return res.json({ status: "not_found" });
  }

  return res.json({
    status: listing.status,
    reason: listing.reason || null,
  });
});

// Get all listings
router.get("/listings", async (req, res) => {
  try {
    const db = getDb();
    const listings = await db
      .collection("listings")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    const listingsWithUsers = await Promise.all(
      listings.map(async (listing) => {
        const user = await db.collection("users").findOne({
          email: listing.email,
        });

        return {
          ...listing,
          id: listing.listingId.toString(),
          userId: listing.email.toString(),
          userName: user?.email || "Unknown User",
        };
      }),
    );

    res.json(listingsWithUsers);
  } catch (error) {
    console.error("Get listings error:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// Get listing by id
router.get("/listings/:id", async (req, res) => {
  try {
    const db = getDb();
    const listing = await db
      .collection("listings")
      .findOne({ listingId: req.params.id });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const user = await db.collection("users").findOne({ email: listing.email });

    res.json({
      ...listing,
      id: listing.listingId.toString(),
      userId: listing.email.toString(),
      userName: user?.email || "Unknown User",
    });
  } catch (error) {
    console.error("Get listing error:", error);
    res.status(500).json({ error: "Failed to fetch listing" });
  }
});

// Create pending listing
router.post("/listings/pending", authenticateToken, async (req, res) => {
  console.log("USER FROM TOKEN =", req.user);

  try {
    const db = getDb();
    const { title, description, price, condition, platform, imageUrls } =
      req.body;
    const email = req.user.email;

    if (!title || !description || !imageUrls || imageUrls.length === 0) {
      return res.status(400).json({ error: "Missing fields" });
    }
    if (!Array.isArray(imageUrls) || imageUrls.length > 3) {
      return res.status(400).json({
        error: "Invalid number of images (minimum 1, maximum 3)",
      });
    }
    const listingId = generateListingId();

    await db.collection("pending_listings").insertOne({
      listingId,
      email,
      title,
      description,
      price,
      platform,
      condition,
      imageUrls,
      status: "pending",
      createdAt: new Date(),
    });

    await listingQueue.add("verify", {
      listingId,
      email,
      title,
      description,
      price,
      platform,
      condition,
      imageUrls,
    });

    return res.json({
      success: true,
      listingId,
      status: "pending",
    });
  } catch (err) {
    console.error("Pending listing error:", err);
    res.status(500).json({
      error: "Could not create pending listing",
      details: err.message,
    });
  }
});

// Update listing
router.put("/listings/:id", authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const listing = await db
      .collection("listings")
      .findOne({ listingId: req.params.id });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if ((listing.email && listing.email.toString()) !== req.user.email) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updates = { ...req.body };
    delete updates.listingId;
    delete updates.userId;

    await db
      .collection("listings")
      .updateOne({ listingId: req.params.id }, { $set: updates });

    const updatedListing = await db
      .collection("listings")
      .findOne({ listingId: req.params.id });

    res.json({
      ...updatedListing,
      id: updatedListing.listingId.toString(),
    });
  } catch (error) {
    console.error("Update listing error:", error);
    res.status(500).json({ error: "Failed to update listing" });
  }
});

// Delete listing
router.delete("/listings/:id", authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const listing = await db
      .collection("listings")
      .findOne({ listingId: req.params.id });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    if ((listing.email && listing.email.toString()) !== req.user.email) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await db.collection("listings").deleteOne({ listingId: req.params.id });

    res.json({ success: true });
  } catch (error) {
    console.error("Delete listing error:", error);
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

export default router;
