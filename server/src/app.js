import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";

import healthRoutes from "./routes/health.routes.js";
import projectRoutes from "./routes/project.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import documentRoutes from "./routes/document.routes.js";
import experienceRoutes from "./routes/experience.routes.js";

const app = express();

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(currentDir, "../uploads");

app.use(helmet());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://harshmishra91.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Public PDF access
app.use("/uploads", express.static(uploadsDir, {
  dotfiles: "deny",
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.toLowerCase().endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("X-Content-Type-Options", "nosniff");
    }
  },
}));

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
}));

app.use("/api/health", healthRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/experience", experienceRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

export default app;
