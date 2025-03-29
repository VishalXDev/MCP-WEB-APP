import PickupPartner from "../models/PickupPartner.js";
import Order from "../models/Order.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { io } from "../app.js"; // Ensure correct import of io

// 📌 Assign an Order
export const assignOrder = async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation, weight, earnings, partnerId } = req.body;

    // Validate Partner
    const partner = await PickupPartner.findById(partnerId);
    if (!partner) return res.status(404).json({ message: "Pickup Partner not found" });

    // Generate a unique order ID
    const orderId = `ORD-${Date.now()}`;

    // Create Order
    const newOrder = await Order.create({
      orderId,
      pickupLocation,
      dropoffLocation,
      weight,
      earnings,
      assignedTo: partnerId,
      status: "Pending",
    });

    // Add order to the partner’s assigned orders
    partner.assignedOrders.push(newOrder._id);
    await partner.save();

    // Save notification in DB
    await Notification.create({
      userId: partnerId,
      title: "New Order Assigned",
      message: `Order ${orderId} has been assigned to you.`,
      type: "order",
    });

    // Emit real-time notification
    io.to(`partner_${partnerId}`).emit("newOrder", {
      message: `New Order Assigned: ${orderId}`,
      orderId,
      pickupLocation,
      dropoffLocation,
      status: "Pending",
    });

    res.status(201).json({ message: "Order assigned successfully!", newOrder });
  } catch (error) {
    res.status(500).json({ message: "Error assigning order", error: error.message });
  }
};

// 📌 Add a Pickup Partner
export const addPickupPartner = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new Pickup Partner
    const newPickupPartner = await PickupPartner.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    // Add them to the main User model for authentication
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "PickupPartner",
    });

    res.status(201).json({ message: "Pickup Partner added successfully!", newPickupPartner });
  } catch (error) {
    res.status(500).json({ message: "Error adding Pickup Partner", error: error.message });
  }
};

// 📌 Remove a Pickup Partner
export const removePickupPartner = async (req, res) => {
  try {
    const { partnerId } = req.params;

    // Find and delete the partner
    const deletedPartner = await PickupPartner.findByIdAndDelete(partnerId);
    if (!deletedPartner) return res.status(404).json({ message: "Pickup Partner not found" });

    // Also remove from User model
    await User.findOneAndDelete({ email: deletedPartner.email });

    res.status(200).json({ message: "Pickup Partner removed successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error removing Pickup Partner", error: error.message });
  }
};

// 📌 Get All Orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("assignedTo", "name email phone");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};
