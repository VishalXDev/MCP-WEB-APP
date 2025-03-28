import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 📌 Middleware to verify JWT token
export const protect = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token from header

  if (!token) return res.status(401).json({ message: "Access Denied. No token provided." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// 📌 Middleware to check if user is MCP
export const isMCP = (req, res, next) => {
  if (req.user.role !== "MCP") {
    return res.status(403).json({ message: "Access denied. MCP role required." });
  }
  next();
};

// 📌 Middleware to check if user is Pickup Partner
export const isPickupPartner = (req, res, next) => {
  if (req.user.role !== "PickupPartner") {
    return res.status(403).json({ message: "Access denied. Pickup Partner role required." });
  }
  next();
};
