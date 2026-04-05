import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });
      
      // Only allow admin role
      if (res.data.role !== "admin") {
        setError("This login is for administrators only.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("userId", res.data.userId);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Image Panel - Left Side */}
      <div className="auth-image-panel">
        <div className="auth-image-footer">
          <p style={{ fontSize: "1rem", fontWeight: "600" }}>24/7 Emergency Response System</p>
        </div>
      </div>
      
      {/* Form Panel - Right Side */}
      <div className="auth-form-panel">
        <div className="auth-card" style={{ background: "#fefce8", border: "2px solid #eab308" }}>
          <div className="logo">
            <span className="logo-icon">🛡️</span>
          </div>
          <h1>Admin Portal</h1>
          <p className="subtitle">Sign in to manage emergency responses</p>

          <p className="welcome-text">Administrator Login</p>

          {error && (
            <div className="error-message" style={{ marginBottom: "20px" }}>
              <span className="icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter admin username"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
              disabled={loading}
              style={{ marginTop: "8px", background: "#eab308", border: "2px solid #ca8a04", color: "#000" }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }}></span>
                  Signing in...
                </>
              ) : (
                "Sign In as Admin"
              )}
            </button>
          </form>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Link to="/" className="btn btn-ghost" style={{ fontSize: "0.875rem" }}>
              ← Back to Home
            </Link>
          </div>

          {/* Back to main login */}
          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--gray-200)" }}>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center" }}>
              Not an admin?
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "8px" }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Resident
              </Link>
              <Link to="/respondent-login" className="btn btn-secondary btn-sm">
                Respondent
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
