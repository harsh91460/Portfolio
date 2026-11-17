import pool from "../config/db.js";

const parseArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const getProjects = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        id,
        title AS name,
        category,
        description,
        tech_stack AS technologies,
        metrics,
        github_url AS github,
        live_url AS live,
        is_featured AS featured
      FROM projects
      WHERE is_visible = TRUE
      ORDER BY sort_order ASC, created_at DESC`
    );

    const projects = rows.map((project) => ({
      ...project,
      technologies: parseArray(project.technologies),
      metrics: parseArray(project.metrics),
      featured: Boolean(project.featured),
    }));

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Get projects error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to fetch projects",
    });
  }
};
