import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, LockKeyhole, Mail, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../lib/api.js";
import "./Admin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed.");
      }

      sessionStorage.setItem("adminToken", result.token);
      sessionStorage.setItem("adminUser", JSON.stringify(result.admin));

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-glow admin-login-glow-one" />
      <div className="admin-login-glow admin-login-glow-two" />

      <a href="/" className="admin-back-home">? Back to portfolio</a>

      <section className="admin-login-card">
        <div className="admin-login-icon">
          <ShieldCheck size={27} />
        </div>

        <span className="admin-login-eyebrow">PRIVATE ACCESS</span>
        <h1>Welcome <span>back.</span></h1>
        <p className="admin-login-description">
          Sign in to manage your portfolio workspace.
        </p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <label htmlFor="admin-email">Email address</label>
          <div className="admin-input-wrap">
            <Mail size={18} />
            <input
              id="admin-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <label htmlFor="admin-password">Password</label>
          <div className="admin-input-wrap">
            <LockKeyhole size={18} />
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="admin-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <div className="admin-login-error" role="alert">{error}</div>}

          <button className="admin-login-submit" type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "Access dashboard"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="admin-login-footer">
          <LockKeyhole size={13} />
          <span>Secure administrator access</span>
        </div>
      </section>

      <p className="admin-login-copyright">
        © {new Date().getFullYear()} Harsh Mishra · Private workspace
      </p>
    </main>
  );
}


