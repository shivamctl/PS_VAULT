import { PORT } from "./config/secrets.js";

import express from "express";
import cors from "cors";
import http from "http";
import jwt from "jsonwebtoken";

import { connectDB } from "./config/db.js";
import { JWT_SECRET } from "./config/secrets.js";
import { initSocket } from "./socketInstance.js";
import { setupListingStatusSubscriber } from "./realtime/listingStatusSubscriber.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

const SERVER_PORT = PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", listingRoutes);
app.use("/api", conversationRoutes);
app.use("/api", messageRoutes);
app.use("/api", uploadRoutes);
app.use("/api", verifyRoutes);
app.use("/api", healthRoutes);

// Socket.io auth
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("No token provided"));
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });
  socket.on("joinPendingRoom", (room) => {
    socket.join(room);
  });

  socket.on("leavePendingRoom", (listingId) =>
    socket.leave(`pending-${listingId}`),
  );

  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

// Redis subscriber for listing updates
setupListingStatusSubscriber();

// Start server
connectDB().then(() => {
  server.listen(SERVER_PORT, () => {
    console.log(`Server running on port ${SERVER_PORT}`);
  });
});
