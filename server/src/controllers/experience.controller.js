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

const getBoolean = (value) =>
  value === true || value === "true" || value === 1 || value === "1";

const getExperienceFields = (body) => ({
  company: body.company?.trim(),
  role: body.role?.trim(),
  employment_type: body.employment_type?.trim() || null,
  location: body.location?.trim() || null,
  start_date: body.start_date || null,
  end_date: getBoolean(body.currently_working) ? null : (body.end_date || null),
  currently_working: getBoolean(body.currently_working),
  description: body.description?.trim() || null,
  sort_order: Number.isInteger(Number(body.sort_order))
    ? Number(body.sort_order)
    : 0,
});

const validateExperience = (fields) =>
  fields.company &&
  fields.company.length <= 150 &&
  fields.role &&
  fields.role.length <= 150 &&
  (!fields.employment_type || fields.employment_type.length <= 100) &&
  (!fields.location || fields.location.length <= 150);

export const getPublicExperience = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, company, role, employment_type, location,
        start_date, end_date, currently_working, description,
        certificate_path, certificate_original_name, sort_order
       FROM experience
       ORDER BY sort_order ASC, start_date DESC, created_at DESC`
    );

    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("Public experience error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch experience.",
    });
  }
};

export const getAdminExperience = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM experience ORDER BY sort_order ASC, created_at DESC"
    );

    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("Admin experience error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch experience.",
    });
  }
};

export const createExperience = async (req, res) => {
  let certificatePath = null;

  try {
    const fields = getExperienceFields(req.body);

    if (!validateExperience(fields)) {
      return res.status(400).json({
        success: false,
        message: "Valid company and role are required.",
      });
    }

    if (req.file) {
      certificatePath = await uploadPdf(
        req.file.buffer,
        "experience-certificates"
      );
    }

    const [result] = await pool.execute(
      `INSERT INTO experience
       (company, role, employment_type, location, start_date, end_date,
        currently_working, description, certificate_path,
        certificate_original_name, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fields.company,
        fields.role,
        fields.employment_type,
        fields.location,
        fields.start_date,
        fields.end_date,
        fields.currently_working,
        fields.description,
        certificatePath,
        req.file?.originalname || null,
        fields.sort_order,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Experience created successfully.",
      id: result.insertId,
    });
  } catch (error) {
    if (certificatePath) await safelyDeleteFile(certificatePath);

    console.error("Create experience error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to create experience.",
    });
  }
};

export const updateExperience = async (req, res) => {
  let newCertificatePath = null;

  try {
    const fields = getExperienceFields(req.body);

    if (!validateExperience(fields)) {
      return res.status(400).json({
        success: false,
        message: "Valid company and role are required.",
      });
    }

    const [existingRows] = await pool.execute(
      "SELECT certificate_path, certificate_original_name FROM experience WHERE id = ? LIMIT 1",
      [req.params.id]
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: "Experience not found.",
      });
    }

    const oldCertificate = existingRows[0].certificate_path;

    if (req.file) {
      newCertificatePath = await uploadPdf(
        req.file.buffer,
        "experience-certificates"
      );
    }

    const certificatePath = newCertificatePath || oldCertificate;

    await pool.execute(
      `UPDATE experience SET
        company = ?, role = ?, employment_type = ?, location = ?,
        start_date = ?, end_date = ?, currently_working = ?,
        description = ?, certificate_path = ?,
        certificate_original_name = ?, sort_order = ?
       WHERE id = ?`,
      [
        fields.company,
        fields.role,
        fields.employment_type,
        fields.location,
        fields.start_date,
        fields.end_date,
        fields.currently_working,
        fields.description,
        certificatePath,
        req.file?.originalname || existingRows[0].certificate_original_name || null,
        fields.sort_order,
        req.params.id,
      ]
    );

    if (newCertificatePath && oldCertificate) {
      await safelyDeleteFile(oldCertificate);
    }

    return res.json({
      success: true,
      message: "Experience updated successfully.",
    });
  } catch (error) {
    if (newCertificatePath) await safelyDeleteFile(newCertificatePath);

    console.error("Update experience error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to update experience.",
    });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT certificate_path FROM experience WHERE id = ? LIMIT 1",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Experience not found.",
      });
    }

    await pool.execute("DELETE FROM experience WHERE id = ?", [req.params.id]);
    await safelyDeleteFile(rows[0].certificate_path);

    return res.json({
      success: true,
      message: "Experience deleted successfully.",
    });
  } catch (error) {
    console.error("Delete experience error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to delete experience.",
    });
  }
};
