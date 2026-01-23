import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "../config/db.js";
import { JWT_SECRET } from "../config/secrets.js";

const router = express.Router();

// Sign Up
router.post("/signup", async (req, res) => {
  try {
    const db = getDb();
    const { email, password, name, publicKey } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      name,
      publicKey,
      location: {
        latitude: null,
        longitude: null,
      },
      createdAt: new Date(),
    });

    const user = { email, name, publicKey };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// Sign In
router.post("/signin", async (req, res) => {
  try {
    const db = getDb();
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userResponse = {
      email: user.email,
      name: user.name,
      publicKey: user.publicKey,
    };

    const token = jwt.sign(userResponse, JWT_SECRET, { expiresIn: "7d" });

    res.json({ user: userResponse, token });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ error: "Signin failed" });
  }
});

export default router;
