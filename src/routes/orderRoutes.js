import express from "express";
import {
  createOrder,
  updateOrderStatus,
  getOrderDetails,
  trackOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
const router = express.Router();

// Route to create an order
router.post("/create", protect, createOrder);

// Route to update order status
router.put("/update-status", protect, updateOrderStatus);

// Route to get order details
router.get("/:orderId", protect, getOrderDetails);

// Route to track an order
router.get("/track/:orderId", protect, trackOrder);

// Route to update order location
router.put("/updateLocation/:orderId", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { latitude, longitude },
      { new: true }
    );

    // Emit the updated location to all clients (make sure io is initialized)
    io.emit("orderLocationUpdated", {
      orderId: order._id,
      latitude,
      longitude,
    });

    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: "Error updating order location", error });
  }
});

export default router;
