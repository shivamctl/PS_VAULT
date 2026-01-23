import express from "express";
import axios from "axios";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config/secrets.js";

const router = express.Router();

const client = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

router.post("/verify", async (req, res) => {
  if (!client) {
    return res.status(503).json({
      error: "Verification temporarily disabled (no OPENAI_API_KEY set)",
    });
  }

  try {
    const { title, description, images } = req.body;

    const imageUrl = images[0];

    const imgResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });
    const imageBase64 = Buffer.from(imgResponse.data).toString("base64");

    const result = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a marketplace verifier. Approve only if item is game-related (game discs, controllers, consoles). Reject if irrelevant.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Title: ${title}\nDescription: ${description}`,
            },
            {
              type: "image_url",
              image_url: `data:image/jpeg;base64,${imageBase64}`,
            },
          ],
        },
      ],
    });

    const reply = result.choices[0].message.content;
    const isGameRelated = reply.toLowerCase().includes("approve");

    return res.json({
      verified: isGameRelated,
      reason: reply,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Verification failed" });
  }
});

export default router;
