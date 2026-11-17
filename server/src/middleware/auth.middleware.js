import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access denied.",
      });
    }

    const [admins] = await pool.execute(
      "SELECT id, name, email FROM admins WHERE id = ? AND is_active = TRUE LIMIT 1",
      [decoded.id]
    );

    if (!admins.length) {
      return res.status(401).json({
        success: false,
        message: "Admin account is inactive or no longer exists.",
      });
    }

    req.admin = admins[0];
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
    }

    console.error("Admin authentication error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Authentication service error.",
    });
  }
};
