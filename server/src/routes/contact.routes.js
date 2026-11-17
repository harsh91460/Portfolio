import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  sendContactMessage,
  getAdminMessages,
  updateAdminMessageStatus,
  deleteAdminMessage,
} from "../controllers/contact.controller.js";
import { verifyAdmin } from "../middleware/auth.middleware.js";

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: {
    success: false,
    message: "Too many messages. Please try again after 15 minutes.",
  },
});

// Public contact form
router.post("/", contactLimiter, sendContactMessage);

// Protected admin message management
router.get("/admin", verifyAdmin, getAdminMessages);
router.patch("/admin/:id/status", verifyAdmin, updateAdminMessageStatus);
router.delete("/admin/:id", verifyAdmin, deleteAdminMessage);

export default router;

