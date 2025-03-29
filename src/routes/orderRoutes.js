import express from "express";
import { createOrder, updateOrderStatus, getOrderDetails, trackOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to create an order
router.post("/create", protect, createOrder);

// Route to update order status
router.put("/update-status", protect, updateOrderStatus);

// Route to get order details
router.get("/:orderId", protect, getOrderDetails);

// Route to track an order
router.get("/track/:orderId", protect, trackOrder);

export default router;
