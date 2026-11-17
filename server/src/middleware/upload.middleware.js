import multer from "multer";
import path from "node:path";

const createPdfUpload = (maxSize) => {
  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxSize,
      files: 1,
    },
    fileFilter: (req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();

      if (extension !== ".pdf" || file.mimetype !== "application/pdf") {
        return callback(new Error("Only PDF files are allowed."));
      }

      callback(null, true);
    },
  });
};

export const resumeUpload = createPdfUpload(5 * 1024 * 1024);
export const certificateUpload = createPdfUpload(10 * 1024 * 1024);
export const experienceCertificateUpload = createPdfUpload(10 * 1024 * 1024);