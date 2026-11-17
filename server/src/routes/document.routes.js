import { Router } from "express";
import multer from "multer";
import { verifyAdmin } from "../middleware/auth.middleware.js";
import {
  resumeUpload,
  certificateUpload,
} from "../middleware/upload.middleware.js";
import {
  getPublicResume,
  getAdminResume,
  uploadResume,
  deleteResume,
  getPublicCertificates,
  getAdminCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from "../controllers/document.controller.js";

const router = Router();

const handleUpload = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware.single("file")(req, res, (error) => {
    if (error) {
      const status = error instanceof multer.MulterError &&
        error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

      return res.status(status).json({
        success: false,
        message: error.message || "File upload failed.",
      });
    }

    if (req.file) {
      const signature = req.file.buffer.subarray(0, 5).toString("ascii");

      if (signature !== "%PDF-") {
        return res.status(400).json({
          success: false,
          message: "Invalid PDF file. Please upload a genuine PDF.",
        });
      }
    }

    next();
  });
};

router.get("/resume", getPublicResume);
router.get("/certificates", getPublicCertificates);

router.get("/admin/resume", verifyAdmin, getAdminResume);
router.post("/admin/resume", verifyAdmin, handleUpload(resumeUpload), uploadResume);
router.delete("/admin/resume", verifyAdmin, deleteResume);

router.get("/admin/certificates", verifyAdmin, getAdminCertificates);
router.post("/admin/certificates", verifyAdmin, handleUpload(certificateUpload), createCertificate);
router.put("/admin/certificates/:id", verifyAdmin, handleUpload(certificateUpload), updateCertificate);
router.delete("/admin/certificates/:id", verifyAdmin, deleteCertificate);

export default router;
