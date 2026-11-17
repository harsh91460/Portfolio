import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

// API health check
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Harsh Portfolio API is running",
    timestamp: new Date().toISOString(),
  });
});

// Database health check
router.get("/db", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DATABASE() AS database_name, VERSION() AS mysql_version"
    );

    res.status(200).json({
      success: true,
      message: "MySQL database connected successfully",
      database: rows[0].database_name,
      version: rows[0].mysql_version,
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

export default router;