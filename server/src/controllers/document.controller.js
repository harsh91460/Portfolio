import pool from "../config/db.js";
import {
  uploadPdf,
  deleteCloudinaryFile,
} from "../utils/cloudinary.js";

const safelyDeleteFile = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    await deleteCloudinaryFile(fileUrl);
  } catch (error) {
    console.error("Cloudinary deletion error:", error.message);
  }
};

// Public resume information
export const getPublicResume = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT file_path FROM portfolio_documents WHERE document_type = 'resume' LIMIT 1"
    );

    return res.json({
      success: true,
      data: rows[0] || null,
    });
  } catch (error) {
    console.error("Public resume error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to fetch resume." });
  }
};

// Admin resume information
export const getAdminResume = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM portfolio_documents WHERE document_type = 'resume' LIMIT 1"
    );

    return res.json({ success: true, data: rows[0] || null });
  } catch (error) {
    console.error("Admin resume error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to fetch resume." });
  }
};

// Upload or replace resume
export const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Please select a PDF file." });
  }

  let newFilePath = null;

  try {
    const [existing] = await pool.execute(
      "SELECT file_path FROM portfolio_documents WHERE document_type = 'resume' LIMIT 1"
    );

    newFilePath = await uploadPdf(req.file.buffer, "resumes");

    await pool.execute(
      `INSERT INTO portfolio_documents (document_type, file_path, original_name)
       VALUES ('resume', ?, ?)
       ON DUPLICATE KEY UPDATE file_path = VALUES(file_path), original_name = VALUES(original_name)`,
      [newFilePath, req.file.originalname]
    );

    if (existing.length) {
      await safelyDeleteFile(existing[0].file_path);
    }

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully.",
      data: { file_path: newFilePath, original_name: req.file.originalname },
    });
  } catch (error) {
    if (newFilePath) await safelyDeleteFile(newFilePath);

    console.error("Resume upload error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to save resume." });
  }
};

// Delete resume
export const deleteResume = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT file_path FROM portfolio_documents WHERE document_type = 'resume' LIMIT 1"
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "No resume found."
      });
    }

    await pool.execute(
      "DELETE FROM portfolio_documents WHERE document_type = 'resume'"
    );

    await safelyDeleteFile(rows[0].file_path);

    return res.json({
      success: true,
      message: "Resume deleted successfully."
    });
  } catch (error) {
    console.error("Resume deletion error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to delete resume."
    });
  }
};

// Public visible certificates
export const getPublicCertificates = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, issuer, description, issue_date, credential_url, file_path
       FROM certifications
       WHERE is_visible = TRUE
       ORDER BY sort_order ASC, created_at DESC`
    );

    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("Public certificates error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to fetch certificates." });
  }
};

// Admin certificate listing
export const getAdminCertificates = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM certifications ORDER BY sort_order ASC, created_at DESC"
    );

    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("Admin certificates error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to fetch certificates." });
  }
};

// Create certificate
export const createCertificate = async (req, res) => {
  const { title, issuer, description, issue_date, credential_url, sort_order } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ success: false, message: "Certificate title is required." });
  }

  let filePath = null;

  try {
    if (req.file) {
      filePath = await uploadPdf(req.file.buffer, "certificates");
    }

    const [result] = await pool.execute(
      `INSERT INTO certifications
       (title, issuer, description, issue_date, credential_url, file_path, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        issuer?.trim() || null,
        description?.trim() || null,
        issue_date || null,
        credential_url?.trim() || null,
        filePath,
        Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Certificate created successfully.",
      id: result.insertId,
    });
  } catch (error) {
    if (filePath) await safelyDeleteFile(filePath);

    console.error("Create certificate error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to create certificate." });
  }
};

// Delete certificate
export const deleteCertificate = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, message: "Invalid certificate ID." });
    }

    const [rows] = await pool.execute(
      "SELECT file_path FROM certifications WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Certificate not found." });
    }

    await pool.execute("DELETE FROM certifications WHERE id = ?", [id]);
    await safelyDeleteFile(rows[0].file_path);

    return res.json({ success: true, message: "Certificate deleted successfully." });
  } catch (error) {
    console.error("Delete certificate error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to delete certificate." });
  }
};

// Update certificate
export const updateCertificate = async (req, res) => {
  const id = Number(req.params.id);
  const { title, issuer, description, issue_date, credential_url, sort_order, is_visible } = req.body;

  if (!Number.isInteger(id) || id < 1 || !title?.trim()) {
    return res.status(400).json({ success: false, message: "Valid certificate ID and title are required." });
  }

  if (issue_date && !/^\d{4}-\d{2}-\d{2}$/.test(issue_date)) {
    return res.status(400).json({ success: false, message: "Invalid issue date." });
  }

  let newFilePath = null;

  try {
    const [existing] = await pool.execute(
      "SELECT id, file_path FROM certifications WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Certificate not found." });
    }

    if (req.file) {
      newFilePath = await uploadPdf(req.file.buffer, "certificates");
    }

    const finalFilePath = newFilePath || existing[0].file_path;

    await pool.execute(
      `UPDATE certifications
       SET title = ?, issuer = ?, description = ?, issue_date = ?,
           credential_url = ?, file_path = ?, sort_order = ?, is_visible = ?
       WHERE id = ?`,
      [
        title.trim(),
        issuer?.trim() || null,
        description?.trim() || null,
        issue_date || null,
        credential_url?.trim() || null,
        finalFilePath,
        Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0,
        is_visible === true || is_visible === "true" || is_visible === 1 || is_visible === "1" ? 1 : 0,
        id,
      ]
    );

    if (newFilePath && existing[0].file_path) {
      await safelyDeleteFile(existing[0].file_path);
    }

    return res.json({ success: true, message: "Certificate updated successfully." });
  } catch (error) {
    if (newFilePath) await safelyDeleteFile(newFilePath);

    console.error("Update certificate error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update certificate." });
  }
};
