import { Router } from "express";
import { getProjects } from "../controllers/project.controller.js";
import {
  getAdminProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/adminProject.controller.js";
import { verifyAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Public projects
router.get("/", getProjects);

// Protected admin project management
router.get("/admin", verifyAdmin, getAdminProjects);
router.post("/admin", verifyAdmin, createProject);
router.put("/admin/:id", verifyAdmin, updateProject);
router.delete("/admin/:id", verifyAdmin, deleteProject);

export default router;
