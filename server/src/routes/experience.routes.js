import { Router } from "express";
import { verifyAdmin } from "../middleware/auth.middleware.js";
import { experienceCertificateUpload } from "../middleware/upload.middleware.js";
import {
  getPublicExperience,
  getAdminExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} from "../controllers/experience.controller.js";

const router = Router();

const handleUpload = (req, res, next) => {
  experienceCertificateUpload.single("file")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Certificate upload failed.",
      });
    }
    next();
  });
};

router.get("/", getPublicExperience);

router.get("/admin", verifyAdmin, getAdminExperience);
router.post("/admin", verifyAdmin, handleUpload, createExperience);
router.put("/admin/:id", verifyAdmin, handleUpload, updateExperience);
router.delete("/admin/:id", verifyAdmin, deleteExperience);

export default router;