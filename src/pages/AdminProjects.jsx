import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Plus, Pencil, Trash2, Eye, EyeOff,
  Star, RefreshCw, X, Save, FolderKanban,
} from "lucide-react";
import { API_BASE_URL } from "../lib/api.js";
import "./Admin.css";

const emptyForm = {
  title: "",
  category: "",
  short_description: "",
  description: "",
  tech_stack: "",
  metrics: "[]",
  github_url: "",
  live_url: "",
  image_url: "",
  is_featured: false,
  is_visible: true,
  sort_order: 0,
};

export default function AdminProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const token = sessionStorage.getItem("adminToken");

  const fetchProjects = async () => {
    if (!token) {
      navigate("/admin", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/projects/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUser");
        navigate("/admin", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Unable to load projects.");
      }

      setProjects(result.data || []);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (project) => {
    setEditingId(project.id);
    setForm({
      title: project.title || "",
      category: project.category || "",
      short_description: project.short_description || "",
      description: project.description || "",
      tech_stack: Array.isArray(project.tech_stack)
        ? project.tech_stack.join(", ")
        : "",
      metrics: JSON.stringify(
        Array.isArray(project.metrics)
          ? project.metrics
          : typeof project.metrics === "string"
            ? JSON.parse(project.metrics || "[]")
            : [],
        null,
        2
      ),
      github_url: project.github_url || "",
      live_url: project.live_url || "",
      image_url: project.image_url || "",
      is_featured: Boolean(project.is_featured),
      is_visible: Boolean(project.is_visible),
      sort_order: project.sort_order ?? 0,
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    let metrics;

    try {
      metrics = JSON.parse(form.metrics || "[]");

      if (!Array.isArray(metrics)) {
        throw new Error("Metrics must be a JSON array.");
      }
    } catch {
      setError("Metrics must contain valid JSON in array format.");
      return;
    }

    const payload = {
      ...form,
      tech_stack: form.tech_stack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      metrics,
      sort_order: Number(form.sort_order),
    };

    setSaving(true);

    try {
      const response = await fetch(
        editingId
          ? `${API_BASE_URL}/projects/admin/${editingId}`
          : `${API_BASE_URL}/projects/admin`,
        {
          method: editingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save project.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await fetchProjects();
    } catch (err) {
      setError(err.message || "Unable to save project.");
    } finally {
      setSaving(false);
    }
  };

  const toggleProject = async (project, field) => {
    const updatedValue = !Boolean(project[field]);

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/admin/${project.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [field]: updatedValue }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update project.");
      }

      setProjects((current) =>
        current.map((item) =>
          item.id === project.id
            ? { ...item, [field]: updatedValue }
            : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteProject = async (project) => {
    const confirmed = window.confirm(
      `Permanently delete "${project.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/admin/${project.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete project.");
      }

      setProjects((current) =>
        current.filter((item) => item.id !== project.id)
      );
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <main className="admin-projects-page">
      <header className="admin-messages-header">
<button className="admin-messages-refresh" onClick={fetchProjects}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <section className="admin-projects-content">
        <div className="admin-projects-heading">
          <div>
            <span className="admin-login-eyebrow">PORTFOLIO MANAGEMENT</span>
            <h1>Projects<span>.</span></h1>
            <p>Add, edit and manage the projects displayed on your portfolio.</p>
          </div>

          <button className="admin-project-add" onClick={openCreateForm}>
            <Plus size={18} /> Add project
          </button>
        </div>

        <div className="admin-projects-count">
          <FolderKanban size={19} />
          <strong>{projects.length}</strong>
          <span>Total projects</span>
        </div>

        {error && <div className="admin-login-error" role="alert">{error}</div>}

        {showForm && (
          <form className="admin-project-form" onSubmit={handleSubmit}>
            <div className="admin-project-form-heading">
              <div>
                <span className="admin-login-eyebrow">
                  {editingId ? "UPDATE DETAILS" : "NEW ENTRY"}
                </span>
                <h2>{editingId ? "Edit project" : "Add a project"}</h2>
              </div>

              <button type="button" onClick={() => setShowForm(false)}
                aria-label="Close form">
                <X size={20} />
              </button>
            </div>

            <div className="admin-project-form-grid">
              <label>
                Project title *
                <input name="title" value={form.title} onChange={updateField}
                  maxLength={150} required />
              </label>

              <label>
                Category
                <input name="category" value={form.category}
                  onChange={updateField} maxLength={100}
                  placeholder="Machine Learning, Web Development..." />
              </label>

              <label className="full">
                Short description
                <input name="short_description"
                  value={form.short_description} onChange={updateField}
                  maxLength={300} />
              </label>

              <label className="full">
                Full description
                <textarea name="description" value={form.description}
                  onChange={updateField} rows={5} />
              </label>

              <label className="full">
                Technologies (comma separated)
                <input name="tech_stack" value={form.tech_stack}
                  onChange={updateField}
                  placeholder="Python, React, MySQL" />
              </label>

              <label className="full">
                Metrics (JSON array)
                <textarea name="metrics" value={form.metrics}
                  onChange={updateField} rows={4}
                  placeholder='[{"label":"Accuracy","value":"90%"}]' />
              </label>

              <label>
                GitHub URL
                <input name="github_url" type="url"
                  value={form.github_url} onChange={updateField} />
              </label>

              <label>
                Live project URL
                <input name="live_url" type="url"
                  value={form.live_url} onChange={updateField} />
              </label>

              <label className="full">
                Image URL
                <input name="image_url" type="url"
                  value={form.image_url} onChange={updateField} />
              </label>

              <label>
                Display order
                <input name="sort_order" type="number"
                  value={form.sort_order} onChange={updateField} />
              </label>
            </div>

            <div className="admin-project-checkboxes">
              <label>
                <input type="checkbox" name="is_featured"
                  checked={form.is_featured} onChange={updateField} />
                Featured project
              </label>

              <label>
                <input type="checkbox" name="is_visible"
                  checked={form.is_visible} onChange={updateField} />
                Visible on portfolio
              </label>
            </div>

            <div className="admin-project-form-actions">
              <button type="button" className="admin-project-cancel"
                onClick={() => setShowForm(false)}>
                Cancel
              </button>

              <button type="submit" className="admin-project-save"
                disabled={saving}>
                <Save size={16} />
                {saving ? "Saving..." : editingId ? "Save changes" : "Create project"}
              </button>
            </div>
          </form>
        )}

        <section className="admin-project-list">
          {loading ? (
            <p className="admin-message-empty">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="admin-message-empty">No projects found.</p>
          ) : (
            projects.map((project) => (
              <article className="admin-project-card" key={project.id}>
                <div className="admin-project-card-main">
                  <div className="admin-project-card-icon">
                    <FolderKanban size={21} />
                  </div>

                  <div className="admin-project-card-info">
                    <h2>{project.title}</h2>
                    <span>{project.category || "Uncategorised"}</span>
                    <p>{project.short_description || project.description || "No description added."}</p>
                    <div className="admin-project-tags">
                      {(Array.isArray(project.tech_stack)
                        ? project.tech_stack
                        : []
                      ).map((tech) => <span key={tech}>{tech}</span>)}
                    </div>
                  </div>
                </div>

                <div className="admin-project-card-actions">
                  <span className={`admin-project-visibility ${project.is_visible ? "visible" : "hidden"}`}>
                    {project.is_visible ? "Visible" : "Hidden"}
                  </span>

                  <button title={project.is_visible ? "Hide project" : "Show project"}
                    onClick={() => toggleProject(project, "is_visible")}>
                    {project.is_visible ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>

                  <button title={project.is_featured ? "Remove featured" : "Mark featured"}
                    onClick={() => toggleProject(project, "is_featured")}>
                    <Star size={17} fill={project.is_featured ? "currentColor" : "none"} />
                  </button>

                  <button title="Edit project" onClick={() => openEditForm(project)}>
                    <Pencil size={17} />
                  </button>

                  <button className="admin-project-delete" title="Delete project"
                    onClick={() => deleteProject(project)}>
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </section>
    </main>
  );
}

