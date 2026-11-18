import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "FRONTEND_URL",
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "JWT_SECRET",
  "GOOGLE_SCRIPT_URL",
  "API_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingEnv = requiredEnv.filter(
  (key) => !process.env[key]?.trim()
);

if (missingEnv.length > 0) {
  console.error("Missing required environment variables:", missingEnv.join(", "));
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must contain at least 32 characters.");
  process.exit(1);
}

const PORT = Number(process.env.PORT || 5000);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error("Invalid PORT configuration.");
  process.exit(1);
}

const { default: app } = await import("./app.js");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Portfolio API running on port ${PORT}`);
});
