import express from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  AWS_BUCKET,
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} from "../config/secrets.js";

const router = express.Router();

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

router.post(
  "/upload",
  authenticateToken,
  upload.array("images", 3),
  async (req, res) => {
    try {
      console.log("Files received:", req.files && req.files.length);
      console.log("region", AWS_REGION);

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedUrls = [];

      for (const file of req.files) {
        const key = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

        const params = {
          Bucket: AWS_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(params));

        const fileUrl = `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${encodeURIComponent(
          key
        )}`;

        uploadedUrls.push(fileUrl);
      }

      return res.json({ urls: uploadedUrls });
    } catch (err) {
      console.error("S3 upload error:", err);
      return res
        .status(500)
        .json({ error: "Upload to S3 failed", details: err.message });
    }
  }
);

export default router;
