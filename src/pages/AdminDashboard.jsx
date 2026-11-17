import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { API_BASE_URL } from "../lib/api.js";
import {
  FolderKanban,
  Mail,
  FileText,
  Award,
  ShieldCheck,
} from "lucide-react";

export default function AdminDashboard() {
  const { admin } = useOutletContext();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");

    fetch(`${API_BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        setStats(result.data);
      })
      .catch((error) => console.error("Dashboard stats error:", error));
  }, []);

  return (
    <div className="admin-content">
      <div className="admin-page-heading">
        <div>
          <span className="admin-login-eyebrow">CONTROL CENTER</span>
          <h1>Dashboard<span>.</span></h1>
          <p>Manage your portfolio and keep everything up to date.</p>
        </div>
        <div className="admin-date-badge">
          {new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      <section className="admin-welcome-panel">
        <div>
          <span>YOUR WORKSPACE</span>
          <h2>Welcome back, {admin.name?.split(" ")[0]}.</h2>
          <p>Your portfolio management workspace is ready.</p>
        </div>
        <div className="admin-welcome-icon">
          <ShieldCheck size={35} />
        </div>
      </section>

      <div className="admin-section-heading">
        <h2>Management overview</h2>
        <span>WORKSPACE MODULES</span>
      </div>

      <section className="admin-stats-grid">
        {[
          { label: "Projects", value: stats?.total_projects ?? "â€”", note: `${stats?.visible_projects ?? "â€”"} visible publicly`, icon: FolderKanban },
          { label: "Messages", value: stats?.total_messages ?? "â€”", note: `${stats?.unread_messages ?? "â€”"} unread messages`, icon: Mail },
          { label: "Resume", value: "â€”", note: "Resume document", icon: FileText },
          { label: "Certificates", value: "â€”", note: "Certificate documents", icon: Award },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article className="admin-stat-card" key={item.label}>
              <div className="admin-stat-top">
                <span>{item.label}</span>
                <Icon size={19} />
              </div>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          );
        })}
      </section>

      <section className="admin-security-panel">
        <div className="admin-security-icon"><ShieldCheck size={21} /></div>
        <div>
          <strong>Administrator session verified</strong>
          <p>Signed in as {admin.email}. Your account is active.</p>
        </div>
        <span>PROTECTED</span>
      </section>
    </div>
  );
}

