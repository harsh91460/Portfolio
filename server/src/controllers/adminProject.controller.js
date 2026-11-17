import pool from "../config/db.js";

const parseJsonArray = (value, fieldName) => {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array.`);
  }
  return JSON.stringify(value);
};

const makeSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const getAdminProjects = async (req, res) => {
  try {
    const [projects] = await pool.query(
      `SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC`
    );

    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Admin projects fetch error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch projects.",
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const {
      title, slug, category, short_description, description,
      tech_stack = [], metrics = [], github_url, live_url,
      image_url, is_featured = false, is_visible = true,
      sort_order = 0,
    } = req.body;

    if (!title?.trim() || title.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "A valid project title is required (maximum 150 characters).",
      });
    }

    const cleanSlug = (slug?.trim() || makeSlug(title)).slice(0, 180);

    if (!cleanSlug) {
      return res.status(400).json({
        success: false,
        message: "A valid project slug is required.",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO projects
       (title, slug, category, short_description, description,
        tech_stack, metrics, github_url, live_url, image_url,
        is_featured, is_visible, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        cleanSlug,
        category || null,
        short_description || null,
        description || null,
        JSON.stringify(tech_stack),
        JSON.stringify(metrics),
        github_url || null,
        live_url || null,
        image_url || null,
        Boolean(is_featured),
        Boolean(is_visible),
        Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Create project error:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A project with this slug already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create project.",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const allowedFields = {
      title: "title",
      slug: "slug",
      category: "category",
      short_description: "short_description",
      description: "description",
      github_url: "github_url",
      live_url: "live_url",
      image_url: "image_url",
      is_featured: "is_featured",
      is_visible: "is_visible",
      sort_order: "sort_order",
    };

    const updates = [];
    const values = [];

    for (const [key, column] of Object.entries(allowedFields)) {
      if (req.body[key] !== undefined) {
        updates.push(`${column} = ?`);
        values.push(req.body[key]);
      }
    }

    for (const key of ["tech_stack", "metrics"]) {
      const value = parseJsonArray(req.body[key], key);
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (!updates.length) {
      return res.status(400).json({
        success: false,
        message: "No project fields provided for update.",
      });
    }

    if (req.body.title !== undefined && !req.body.title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project title cannot be empty.",
      });
    }

    values.push(Number(id));

    const [result] = await pool.execute(
      `UPDATE projects SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    const [existing] = await pool.execute(
      "SELECT id FROM projects WHERE id = ?",
      [Number(id)]
    );

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
    });
  } catch (error) {
    console.error("Update project error:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A project with this slug already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update project.",
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM projects WHERE id = ?",
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Delete project error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to delete project.",
    });
  }
};
