import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function AdminRegister() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        username,
        password,
        name,
        email,
        role: "admin"
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)" }}>
      <div className="auth-card">
        <div className="logo">
          <span className="logo-icon" style={{ fontSize: "3rem" }}>🛡️</span>
        </div>
        <h1 style={{ color: "#1e40af" }}>Admin Portal</h1>
        <p className="subtitle">Create an administrator account</p>

        <p className="welcome-text">Admin Registration</p>

        {error && (
          <div className="error-message" style={{ marginBottom: "20px" }}>
            <span className="icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name <span className="required">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Username <span className="required">*</span></label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Choose a username"
            />
          </div>

          <div className="form-group">
            <label>Password <span className="required">*</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password (min. 6 characters)"
              minLength={6}
            />
            <p className="form-hint">Must be at least 6 characters long</p>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={loading}
            style={{ marginTop: "8px", background: "#1e40af" }}
          >
            {loading ? (
              <>
                <span className="loading-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }}></span>
                Creating account...
              </>
            ) : (
              "🛡️ Create Admin Account"
            )}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
            Already have an account?{" "}
            <Link to="/admin-login" style={{ fontWeight: "600", color: "#1e40af" }}>
              Sign in here
            </Link>
          </p>
        </div>

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Link to="/" className="btn btn-ghost" style={{ fontSize: "0.875rem" }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
