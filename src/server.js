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
import { initializeSocket } from "./socket.io";
import logger from "./logger.js";
import apiLimiter from "./middleware/rateLimiter.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import mcpRoutes from "./routes/mcpRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import pickupPartnerRoutes from "./routes/pickupPartnerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config(); // Load environment variables

// Initialize Express App
const app = express();
const server = http.createServer(app);

// Initialize Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
});

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust based on frontend URL
    methods: ["GET", "POST"],
  },
});

initializeSocket(io); // Initialize socket connection

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());
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
app.use("/api/users", userRoutes);

// Connect to MongoDB and Start Server
connectDB();

// WebSocket Event Listeners
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("joinOrderRoom", (orderId) => {
    socket.join(orderId);
    console.log(`User joined order room: ${orderId}`);
  });

  socket.on("orderStatusUpdate", ({ orderId, status }) => {
    io.to(orderId).emit("orderStatusUpdated", { orderId, status });
  });

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB and start server only after successful DB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((error) => {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);  // Exit process on DB connection failure
  });

export { io, server };
