import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Upload, Download, RefreshCw, CheckCircle2, Trash2 } from "lucide-react";
import { API_BASE_URL, getFileUrl } from "../lib/api.js";
import "./Admin.css";

export default function AdminResume() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = sessionStorage.getItem("adminToken");

  const fetchResume = async () => {
    if (!token) {
      navigate("/admin", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/documents/admin/resume`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUser");
        navigate("/admin", { replace: true });
        return;
      }

      if (!response.ok) throw new Error(result.message || "Unable to fetch resume.");

      setResume(result.data);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Resume must be smaller than 5 MB.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/documents/admin/resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUser");
        navigate("/admin", { replace: true });
        return;
      }

      if (!response.ok) throw new Error(result.message || "Resume upload failed.");

      setMessage("Resume uploaded successfully.");
      setFile(null);
      event.target.reset();
      await fetchResume();
    } catch (err) {
      setError(err.message || "Unable to upload resume.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!resume) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your current resume?"
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/documents/admin/resume`, {
        method: "DELETE",
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
        throw new Error(result.message || "Resume deletion failed.");
      }

      setResume(null);
      setFile(null);
      setMessage("Resume deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete resume.");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div className="admin-content">
          <div className="admin-page-heading">
            <div>
              <span className="admin-login-eyebrow">DOCUMENT MANAGEMENT</span>
              <h1>Resume<span>.</span></h1>
              <p>Upload or replace the resume displayed on your public portfolio.</p>
            </div>
          </div>

          {error && <div className="admin-error">{error}</div>}
          {message && <div className="admin-security-panel"><CheckCircle2 size={20} /><strong>{message}</strong></div>}

          <section className="admin-welcome-panel">
            <div>
              <span>CURRENT DOCUMENT</span>
              <h2>{resume?.original_name || "No resume uploaded"}</h2>
              <p>{resume ? "Your current resume is stored and ready to be served." : "Upload a PDF to make your resume available."}</p>
              {resume?.file_path && (
                <a className="secondary-btn" href={`${getFileUrl(resume.file_path)}`} target="_blank" rel="noreferrer">
                  <Download size={16} /> View current resume
                </a>
              )}
              {resume?.file_path && (
                <button
                  type="button"
                  className="admin-danger-btn"
                  onClick={handleDelete}
                  disabled={deleting || uploading}
                >
                  <Trash2 size={16} />
                  {deleting ? "Deleting..." : "Delete Resume"}
                </button>
              )}
            </div>
            <div className="admin-welcome-icon"><FileText size={35} /></div>
          </section>

          <section className="admin-security-panel">
            <div className="admin-security-icon"><Upload size={21} /></div>
            <div>
              <strong>Upload a new resume</strong>
              <p>PDF format only. Maximum file size: 5 MB. Uploading replaces the previous resume.</p>
            </div>
          </section>

          <form className="admin-form" onSubmit={handleUpload}>
            <div className="document-upload-box">
              <input
                ref={fileInputRef}
                id="resume-file"
                className="document-file-hidden"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => {
                  setFile(event.target.files?.[0] || null);
                  setError("");
                  setMessage("");
                }}
              />

              <button
                type="button"
                className="document-choose-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} />
                <span>Choose PDF from Laptop</span>
              </button>

              <div className="document-file-info">
                <FileText size={19} />
                <span>
                  {file
                    ? `${file.name} Ãƒâ€šÃ‚Â· ${(file.size / 1024 / 1024).toFixed(2)} MB`
                    : "No PDF selected"}
                </span>
              </div>
              <small>Select a PDF from Desktop, Downloads or any folder on your laptop.</small>
            </div>
            <button className="admin-primary-btn" type="submit" disabled={uploading || !file}>
              {uploading ? <RefreshCw size={17} className="spin" /> : <Upload size={17} />}
              {uploading ? "Uploading..." : resume ? "Replace Resume" : "Upload Resume"}
            </button>
          </form>

          {loading && <p className="admin-loading">Loading resume details...</p>}
        </div>
  );
}








