import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  BriefcaseBusiness,
  Mail,
  FileText,
  Award,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { API_BASE_URL } from "../lib/api.js";
import "./Admin.css";

const navigation = [
  { label: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Projects", path: "/admin/projects", icon: FolderKanban },
  { label: "Experience", path: "/admin/experience", icon: BriefcaseBusiness },
  { label: "Messages", path: "/admin/messages", icon: Mail },
  { label: "Resume", path: "/admin/resume", icon: FileText },
  { label: "Certificates", path: "/admin/certificates", icon: Award },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      navigate("/admin", { replace: true });
      return;
    }

    fetch(`${API_BASE_URL}/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Authentication failed.");
        setAdmin(result.admin);
      })
      .catch(() => {
        sessionStorage.removeItem("adminToken");
        sessionStorage.removeItem("adminUser");
        navigate("/admin", { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    navigate("/admin", { replace: true });
  };

  if (loading || !admin) {
    return <div className="admin-loading">Verifying secure session...</div>;
  }

  const currentPage = navigation.find(
    (item) => item.path === location.pathname
  );

  return (
    <main className="admin-dashboard">
      {sidebarOpen && (
        <button
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-brand">
          <div className="admin-brand-icon"><ShieldCheck size={22} /></div>
          <div>
            <strong>HARSH<span>.</span></strong>
            <small>ADMIN WORKSPACE</small>
          </div>
          <button
            className="admin-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-nav-label">WORKSPACE</div>

        <nav className="admin-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-user-card">
            <div className="admin-avatar">
              {admin.name?.charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-details">
              <strong>{admin.name}</strong>
              <small>Administrator</small>
            </div>
          </div>

          <button className="admin-logout" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-mobile-menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>
          <div className="admin-breadcrumb">
            Workspace <span>/</span> {currentPage?.label || "Management"}
          </div>
          <div className="admin-topbar-status">
            <span className="admin-status-dot" />
            Secure session active
          </div>
        </header>

        <Outlet context={{ admin }} />
      </section>
    </main>
  );
}

