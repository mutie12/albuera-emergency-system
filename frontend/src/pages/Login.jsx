import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function Login() {
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
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("userId", res.data.userId);
      
      // Redirect based on role
      if (res.data.role === "respondent") {
        navigate("/respondent");
      } else if (res.data.role === "resident") {
        navigate("/resident");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed. Please try again.";
      const status = err.response?.data?.status;
      
      if (status === "pending") {
        setError(
          <div>
            <strong>{errorMsg}</strong>
            <p style={{ marginTop: "8px", fontSize: "0.875rem" }}>
              Your registration is pending approval. Please wait for the admin to verify your residency.
            </p>
          </div>
        );
      } else if (status === "rejected") {
        setError(
          <div>
            <strong>{errorMsg}</strong>
            <p style={{ marginTop: "8px", fontSize: "0.875rem" }}>
              Your registration has been rejected. Please contact the admin for more information.
            </p>
          </div>
        );
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Image Panel - Left Side */}
      <div className="auth-image-panel">
        <div className="auth-image-content">
          \
        </div>
        <div className="auth-image-footer">
          <p style={{ fontSize: "1rem", fontWeight: "600" }}>24/7 Emergency Response System</p>
        </div>
      </div>
      
      {/* Form Panel - Right Side */}
      <div className="auth-form-panel">
        <div className="auth-card" style={{ background: "#f0fdf4", border: "2px solid #22c55e" }}>
          <div className="logo">
            <span className="logo-icon">🚨</span>
          </div>
          <h1>Albuera Poblacion Emergency</h1>
          <p className="subtitle">Sign in to access your dashboard</p>
          
          <p className="welcome-text">Welcome back!</p>

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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
              disabled={loading}
              style={{ marginTop: "8px", background: "#22c55e", border: "2px solid #16a34a" }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }}></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="auth-links" style={{ marginTop: "24px", textAlign: "center" }}>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ fontWeight: "600" }}>
                Register here
              </Link>
            </p>
          </div>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Link to="/" className="btn btn-ghost" style={{ fontSize: "0.875rem" }}>
              ← Back to Home
            </Link>
          </div>

          {/* Quick Login Options */}
          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--gray-200)" }}>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "12px" }}>
              Staff login options
            </p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <Link to="/admin-login" className="btn btn-secondary btn-sm" style={{ fontSize: "0.75rem" }}>
                Admin
              </Link>
              <Link to="/respondent-login" className="btn btn-secondary btn-sm" style={{ fontSize: "0.75rem" }}>
                Respondent
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
