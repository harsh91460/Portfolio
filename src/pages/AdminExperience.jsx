import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase, Plus, RefreshCw, Pencil, Trash2,
  X, FileText, ExternalLink, Upload, Award
} from "lucide-react";
import { API_BASE_URL, getFileUrl } from "../lib/api.js";
import "./Admin.css";

const API = `${API_BASE_URL}/experience`;
const token = () => sessionStorage.getItem("adminToken");

const emptyForm = {
  company: "",
  role: "",
  employment_type: "Internship",
  location: "",
  start_date: "",
  end_date: "",
  currently_working: false,
  description: "",
  sort_order: 0,
};

export default function AdminExperience() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [experiences, setExperiences] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [existingCertificate, setExistingCertificate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${token()}`,
  };

  const fetchExperiences = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/admin`, { headers });
      const result = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken");
        navigate("/admin");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Unable to load experience.");
      }

      setExperiences(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token()) {
      navigate("/admin");
      return;
    }

    fetchExperiences();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setExistingCertificate("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingId(item.id);
    setForm({
      company: item.company || "",
      role: item.role || "",
      employment_type: item.employment_type || "Internship",
      location: item.location || "",
      start_date: item.start_date
        ? String(item.start_date).slice(0, 10)
        : "",
      end_date: item.end_date
        ? String(item.end_date).slice(0, 10)
        : "",
      currently_working: Boolean(item.currently_working),
      description: item.description || "",
      sort_order: item.sort_order ?? 0,
    });
    setFile(null);
    setExistingCertificate(item.certificate_path || "");
    setError("");
    setShowForm(true);
  };

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (file && file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    if (file && file.size > 10 * 1024 * 1024) {
      setError("Certificate PDF must be 10 MB or smaller.");
      return;
    }

    if (
      form.start_date &&
      form.end_date &&
      !form.currently_working &&
      form.end_date < form.start_date
    ) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    const payload = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, String(value));
    });

    if (file) payload.append("file", file);

    setSaving(true);

    try {
      const response = await fetch(
        editingId ? `${API}/admin/${editingId}` : `${API}/admin`,
        {
          method: editingId ? "PUT" : "POST",
          headers,
          body: payload,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save experience.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setFile(null);
      setExistingCertificate("");
      await fetchExperiences();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteExperience = async (item) => {
    if (!window.confirm(`Permanently delete "${item.role}" at "${item.company}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API}/admin/${item.id}`, {
        method: "DELETE",
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete experience.");
      }

      setExperiences((current) =>
        current.filter((entry) => entry.id !== item.id)
      );
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDuration = (item) => {
    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
    };

    const start = formatDate(item.start_date);
    const end = item.currently_working
      ? "Present"
      : formatDate(item.end_date);

    return [start, end].filter(Boolean).join(" â€“ ") || "Dates not specified";
  };

  return (
    <main className="admin-projects-page">
      <header className="admin-messages-header">
        <button
          className="admin-messages-refresh"
          onClick={fetchExperiences}
          disabled={loading}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <section className="admin-projects-content">
        <div className="admin-projects-heading">
          <div>
            <span className="admin-login-eyebrow">PORTFOLIO MANAGEMENT</span>
            <h1>Experience<span>.</span></h1>
            <p>Manage internships, professional roles and their certificates.</p>
          </div>

          <button className="admin-project-add" onClick={openCreateForm}>
            <Plus size={18} /> Add experience
          </button>
        </div>

        <div className="admin-projects-count">
          <Briefcase size={19} />
          <strong>{experiences.length}</strong>
          <span>Total experience entries</span>
        </div>

        <div className="admin-project-card">
          <div className="admin-project-card-info">
            <h2>Resume Management</h2>
            <p>Upload or replace the resume displayed on your public portfolio.</p>
          </div>
          <button
            className="admin-project-add"
            type="button"
            onClick={() => navigate("/admin/resume")}
          >
            <Upload size={16} /> Manage Resume
          </button>
        </div>

        {error && (
          <div className="admin-login-error" role="alert">{error}</div>
        )}

        {showForm && (
          <form className="admin-project-form" onSubmit={handleSubmit}>
            <div className="admin-project-form-heading">
              <div>
                <span className="admin-login-eyebrow">
                  {editingId ? "UPDATE DETAILS" : "NEW ENTRY"}
                </span>
                <h2>{editingId ? "Edit experience" : "Add experience"}</h2>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-project-form-grid">
              <label>
                Company / Organization *
                <input
                  name="company"
                  value={form.company}
                  onChange={updateField}
                  maxLength={150}
                  required
                />
              </label>

              <label>
                Role / Position *
                <input
                  name="role"
                  value={form.role}
                  onChange={updateField}
                  maxLength={150}
                  required
                />
              </label>

              <label>
                Employment type
                <select
                  name="employment_type"
                  value={form.employment_type}
                  onChange={updateField}
                >
                  <option>Internship</option>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Virtual Experience</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Location
                <input
                  name="location"
                  value={form.location}
                  onChange={updateField}
                  maxLength={150}
                  placeholder="Remote / Noida / ..."
                />
              </label>

              <label>
                Start date
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={updateField}
                />
              </label>

              <label>
                End date
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={updateField}
                  disabled={form.currently_working}
                />
              </label>

              <label>
                Display order
                <input
                  type="number"
                  name="sort_order"
                  value={form.sort_order}
                  onChange={updateField}
                />
              </label>

              <label className="full">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  rows={4}
                />
              </label>

              <div className="full document-upload-box">
                <input
                  ref={fileInputRef}
                  id="experience-certificate-file"
                  className="document-file-hidden"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(event) => {
                    setFile(event.target.files?.[0] || null);
                    setError("");
                  }}
                />

                <button
                  type="button"
                  className="document-choose-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={20} />
                  <span>
                    {editingId ? "Replace Internship Certificate PDF" : "Choose Internship Certificate PDF"}
                  </span>
                </button>

                <div className="document-file-info">
                  <FileText size={19} />
                  <span>
                    {file
                      ? `${file.name} Â· ${(file.size / 1024 / 1024).toFixed(2)} MB`
                      : existingCertificate
                        ? "Existing certificate will be kept unless replaced."
                        : "No PDF selected"}
                  </span>
                </div>

                {existingCertificate && (
                  <a
                    href={`${getFileUrl(existingCertificate)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={14} /> View current certificate
                  </a>
                )}

                <small>PDF only. Maximum size: 10 MB. Uploading a new PDF replaces the existing certificate.</small>
              </div>
            </div>

            <div className="admin-project-checkboxes">
              <label>
                <input
                  type="checkbox"
                  name="currently_working"
                  checked={form.currently_working}
                  onChange={updateField}
                />
                I am currently working here
              </label>
            </div>

            <div className="admin-project-form-actions">
              <button
                type="button"
                className="admin-project-cancel"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-project-save admin-project-add"
                disabled={saving}
              >
                {saving ? "Saving..." : editingId ? "Update experience" : "Save experience"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p>Loading experience...</p>
        ) : experiences.length === 0 ? (
          <div className="admin-project-card">
            <div className="admin-project-card-info">
              <h2>No experience entries yet</h2>
              <p>Add your internship or professional experience using the button above.</p>
            </div>
          </div>
        ) : (
          <div className="admin-project-list">
            {experiences.map((item) => (
              <article className="admin-project-card" key={item.id}>
                <div className="admin-project-card-main">
                  <div className="admin-project-card-icon">
                    <Briefcase size={21} />
                  </div>

                  <div className="admin-project-card-info">
                    <h2>{item.role}</h2>
                    <span>
                      {item.company} Â· {formatDuration(item)}
                      {item.location ? ` Â· ${item.location}` : ""}
                    </span>

                    {item.description && <p>{item.description}</p>}

                    <div className="admin-project-tags">
                      <span className="admin-project-visibility visible">
                        {item.employment_type || "Experience"}
                      </span>

                      {item.currently_working && (
                        <span className="admin-project-visibility visible">
                          Current
                        </span>
                      )}

                      {item.certificate_path && (
                        <a
                          href={`${getFileUrl(item.certificate_path)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Award size={13} /> Certificate PDF
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-project-card-actions">
                  <button
                    type="button"
                    title="Edit"
                    onClick={() => openEditForm(item)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    className="admin-project-delete"
                    title="Delete"
                    onClick={() => deleteExperience(item)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

