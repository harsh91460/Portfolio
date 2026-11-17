import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  adminLogin,
  getAdminProfile,
  getAdminStats,
} from "../controllers/admin.controller.js";
import { verifyAdmin } from "../middleware/auth.middleware.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again after 15 minutes.",
  },
});

router.post("/login", loginLimiter, adminLogin);
router.get("/me", verifyAdmin, getAdminProfile);
router.get("/stats", verifyAdmin, getAdminStats);

export default router;
