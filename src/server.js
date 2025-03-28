import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import helmet from "helmet";
import compression from "compression";
import Redis from "ioredis";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import { initializeSocket } from "./socket.js"; // Import socket setup
import logger from "./logger.js";
import apiLimiter from "./middleware/rateLimiter.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import mcpRoutes from "./routes/mcpRoutes.js";
import pickupPartnerRoutes from "./routes/pickupPartnerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config(); // ✅ Load environment variables

// Initialize Express App
const app = express();
const server = http.createServer(app);

// Initialize Redis
const redis = new Redis();

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust based on frontend URL
    methods: ["GET", "POST"],
  },
});

initializeSocket(io); // ✅ Initialize socket connection

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet()); // ✅ Security headers
app.use(compression()); // ✅ Compress responses
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Rate Limiting
app.use("/api/auth", apiLimiter);

// Cache Middleware
const cacheMiddleware = async (req, res, next) => {
  const cachedData = await redis.get(req.originalUrl);
  if (cachedData) return res.json(JSON.parse(cachedData));
  next();
};
app.use(cacheMiddleware);

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/mcp", mcpRoutes);
app.use("/api/partner", pickupPartnerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

// Connect to MongoDB and Start Server
connectDB(); // ✅ Ensures database connection

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((error) => console.log("❌ MongoDB Connection Error:", error));

export { io, server };
