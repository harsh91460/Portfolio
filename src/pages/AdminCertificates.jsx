import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award, Plus, RefreshCw, Pencil, Trash2,
  Eye, EyeOff, X, FileText, ExternalLink, Upload
} from "lucide-react";
import { API_BASE_URL, getFileUrl } from "../lib/api.js";
import "./Admin.css";

const API = `${API_BASE_URL}/documents`;
const token = () => sessionStorage.getItem("adminToken");

const emptyForm = {
  title: "",
  issuer: "",
  description: "",
  issue_date: "",
  credential_url: "",
  sort_order: 0,
  is_visible: true,
};

export default function AdminCertificates() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [certificates, setCertificates] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [currentFilePath, setCurrentFilePath] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${token()}`,
  };

  const fetchCertificates = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/admin/certificates`, {
        headers,
      });
      const result = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken");
        navigate("/admin");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Unable to load certificates.");
      }

      setCertificates(result.data || []);
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
    fetchCertificates();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFile(null);
    setCurrentFilePath("");
    setError("");
    setShowForm(true);
  };

  const openEditForm = (certificate) => {
    setEditingId(certificate.id);
    setCurrentFilePath(certificate.file_path || "");
    setForm({
      title: certificate.title || "",
      issuer: certificate.issuer || "",
      description: certificate.description || "",
      issue_date: certificate.issue_date
        ? String(certificate.issue_date).slice(0, 10)
        : "",
      credential_url: certificate.credential_url || "",
      sort_order: certificate.sort_order ?? 0,
      is_visible: Boolean(certificate.is_visible),
    });
    setFile(null);
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

    if (file && file.size > 10 * 1024 * 1024) {
      setError("Certificate PDF must be 10 MB or smaller.");
      return;
    }

    if (file && file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    if (form.credential_url) {
      try {
        const url = new URL(form.credential_url);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        setError("Enter a valid HTTP or HTTPS credential URL.");
        return;
      }
    }

    setSaving(true);

    try {
      const payload = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        payload.append(key, String(value));
      });

      if (file) payload.append("file", file);

      const response = await fetch(
        editingId
          ? `${API}/admin/certificates/${editingId}`
          : `${API}/admin/certificates`,
        {
          method: editingId ? "PUT" : "POST",
          headers,
          body: payload,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save certificate.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setFile(null);
      setCurrentFilePath("");
      await fetchCertificates();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  const toggleVisibility = async (certificate) => {
    try {
      const response = await fetch(
        `${API}/admin/certificates/${certificate.id}`,
        {
          method: "PUT",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: certificate.title,
            issuer: certificate.issuer || "",
            description: certificate.description || "",
            issue_date: certificate.issue_date
              ? String(certificate.issue_date).slice(0, 10)
              : "",
            credential_url: certificate.credential_url || "",
            sort_order: certificate.sort_order ?? 0,
            is_visible: !Boolean(certificate.is_visible),
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to update visibility.");
      }

      setCertificates((current) =>
        current.map((item) =>
          item.id === certificate.id
            ? { ...item, is_visible: !Boolean(item.is_visible) }
            : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteCertificate = async (certificate) => {
    if (!window.confirm(`Permanently delete "${certificate.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/admin/certificates/${certificate.id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Unable to delete certificate.");
      }

      setCertificates((current) =>
        current.filter((item) => item.id !== certificate.id)
      );
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="admin-projects-page">
      <header className="admin-messages-header">
<button
          className="admin-messages-refresh"
          onClick={fetchCertificates}
          disabled={loading}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <section className="admin-projects-content">
        <div className="admin-projects-heading">
          <div>
            <span className="admin-login-eyebrow">PORTFOLIO MANAGEMENT</span>
            <h1>Certificates<span>.</span></h1>
            <p>Upload, organize and control the certificates displayed publicly.</p>
          </div>

          <button className="admin-project-add" onClick={openCreateForm}>
            <Plus size={18} /> Add certificate
          </button>
        </div>

        <div className="admin-projects-count">
          <Award size={19} />
          <strong>{certificates.length}</strong>
          <span>Total certificates</span>
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
                <h2>{editingId ? "Edit certificate" : "Add a certificate"}</h2>
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
                Certificate title *
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  maxLength={200}
                  required
                />
              </label>

              <label>
                Issuing organization
                <input
                  name="issuer"
                  value={form.issuer}
                  onChange={updateField}
                  maxLength={150}
                />
              </label>

              <label>
                Issue date
                <input
                  type="date"
                  name="issue_date"
                  value={form.issue_date}
                  onChange={updateField}
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
                  rows={3}
                  placeholder="What did you learn or complete?"
                />
              </label>
              <label className="full">
                Credential URL
                <input
                  type="url"
                  name="credential_url"
                  value={form.credential_url}
                  onChange={updateField}
                  maxLength={500}
                  placeholder="https://..."
                />
              </label>

              <div className="full document-upload-box">
                  <input
                    ref={fileInputRef}
                    id="certificate-file"
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
                    <span>Choose Certificate PDF from Laptop</span>
                  </button>

                  {currentFilePath && (
                    <p className="full">Current PDF: <a href={`${getFileUrl(currentFilePath)}`} target="_blank" rel="noreferrer">View existing certificate</a></p>
                  )}
                  <div className="document-file-info">
                    <FileText size={19} />
                    <span>
                      {file
                        ? `${file.name} ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· ${(file.size / 1024 / 1024).toFixed(2)} MB`
                        : "No PDF selected"}
                    </span>
                  </div>
              </div>
            </div>

            <div className="admin-project-checkboxes">
              <label>
                <input
                  type="checkbox"
                  name="is_visible"
                  checked={form.is_visible}
                  onChange={updateField}
                />
                Show on public portfolio
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
                {saving ? "Saving..." : editingId ? "Update certificate" : "Save certificate"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p>Loading certificates...</p>
        ) : certificates.length === 0 ? (
          <div className="admin-project-card">
            <div className="admin-project-card-info">
              <h2>No certificates yet</h2>
              <p>Add your first certificate using the button above.</p>
            </div>
          </div>
        ) : (
          <div className="admin-project-list">
            {certificates.map((certificate) => (
              <article className="admin-project-card" key={certificate.id}>
                <div className="admin-project-card-main">
                  <div className="admin-project-card-icon">
                    <Award size={21} />
                  </div>

                  <div className="admin-project-card-info">
                    <h2>{certificate.title}</h2>
                    <span>
                      {certificate.issuer || "Issuer not specified"}
                      {certificate.issue_date
                        ? ` ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· ${String(certificate.issue_date).slice(0, 10)}`
                        : ""}
                    </span>

                    <div className="admin-project-tags">
                      <span className={`admin-project-visibility ${
                        certificate.is_visible ? "visible" : "hidden"
                      }`}>
                        {certificate.is_visible ? "Visible" : "Hidden"}
                      </span>

                      {certificate.file_path && (
                        <a
                          href={`${getFileUrl(certificate.file_path)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FileText size={13} /> PDF
                        </a>
                      )}

                      {certificate.credential_url && (
                        <a
                          href={certificate.credential_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink size={13} /> Credential
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-project-card-actions">
                  <button
                    type="button"
                    title={certificate.is_visible ? "Hide" : "Show"}
                    onClick={() => toggleVisibility(certificate)}
                  >
                    {certificate.is_visible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>

                  <button
                    type="button"
                    title="Edit"
                    onClick={() => openEditForm(certificate)}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    className="admin-project-delete"
                    title="Delete"
                    onClick={() => deleteCertificate(certificate)}
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



