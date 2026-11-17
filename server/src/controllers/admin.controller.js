import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const [admins] = await pool.execute(
      `SELECT id, name, email, password_hash, is_active
       FROM admins
       WHERE email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (!admins.length || !admins[0].is_active) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const admin = admins[0];
    const validPassword = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    await pool.execute(
      "UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [admin.id]
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process login.",
    });
  }
};
export const getAdminProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    admin: req.admin,
  });
};

export const getAdminStats = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM projects) AS total_projects,
        (SELECT COUNT(*) FROM projects WHERE is_visible = TRUE) AS visible_projects,
        (SELECT COUNT(*) FROM contact_messages) AS total_messages,
        (SELECT COUNT(*) FROM contact_messages WHERE status = 'unread') AS unread_messages
    `);

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard statistics.",
    });
  }
};
