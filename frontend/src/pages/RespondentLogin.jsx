import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function RespondentLogin() {
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
      
      // Only allow respondent role
      if (res.data.role !== "respondent") {
        setError("This login is for respondents only.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("userId", res.data.userId);
      navigate("/respondent");
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
        <div className="auth-card" style={{ background: "#fff7ed", border: "2px solid #f97316" }}>
          <div className="logo">
            <span className="logo-icon">🚑</span>
          </div>
          <h1>Respondent Portal</h1>
          <p className="subtitle">Sign in to respond to emergencies</p>

          <p className="welcome-text">Emergency Respondent Login</p>

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
                placeholder="Enter respondent username"
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
              style={{ marginTop: "8px", background: "#f97316", border: "2px solid #ea580c" }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }}></span>
                  Signing in...
                </>
              ) : (
                "Sign In as Respondent"
              )}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
              Don't have an account?{" "}
              <Link to="/respondent-register" style={{ fontWeight: "600" }}>
                Register here
              </Link>
            </p>
          </div>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Link to="/" className="btn btn-ghost" style={{ fontSize: "0.875rem" }}>
              ← Back to Home
            </Link>
          </div>

          {/* Back to main login */}
          <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid var(--gray-200)" }}>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center" }}>
              Not a respondent?
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "8px" }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Resident
              </Link>
              <Link to="/admin-login" className="btn btn-secondary btn-sm">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RespondentLogin;
