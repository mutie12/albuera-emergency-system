import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function RespondentRegister() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [barangay, setBarangay] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [otpInfo, setOtpInfo] = useState("");
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const barangays = [
    "Poblacion", "Balugo", "Damula-an", "Antipolo", "Benolho",
    "Doña Maria", "Mahayag", "Mahayahay", "Salvacion",
    "San Pedro", "Seguinon", "Sherwood", "Tabgas", "Talisayan", "Tinag-an"
  ];

  const poblacionSubAreas = [
    "Canlalin / Canlalen", "Gungab", "Malitbog", "Soob", "Bagtan",
    "Sudlon", "San Andres", "Urban", "GK Village"
  ];

  const balugoSubAreas = [
    "Lawis", "Marka Baling", "Beachfront Area", "Balugo Proper"
  ];

  const barangaySubAreas = {
    Poblacion: poblacionSubAreas,
    Balugo: balugoSubAreas
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }
    setError("");
    setSendingCode(true);
    setOtpInfo("");

    try {
      const res = await api.post("/auth/send-otp", { email });
      setOtpSent(true);
      setCountdown(60);
      setOtpInfo(res.data.otp || "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setSendingCode(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      setError("Please enter the verification code");
      return;
    }
    setError("");
    setVerifyingCode(true);

    try {
      await api.post("/auth/verify-otp", { email, otp });
      setEmailVerified(true);
      setOtpInfo("");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailVerified(false);
    setOtpSent(false);
    setOtp("");
    setOtpInfo("");
    setCountdown(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const fullBarangay = barangay && subLocation
        ? `${barangay} - ${subLocation}`
        : barangay;
      const res = await api.post("/auth/register", {
        username,
        password,
        name,
        email,
        phone,
        barangay: fullBarangay,
        role: "respondent"
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      navigate("/respondent");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Image Panel - Left Side */}
      <div className="auth-image-panel">
        <div className="auth-image-content">
          <span className="emergency-icon">🚑</span>
          <h2>Join Our Emergency Response Team</h2>
          <p>Register as a respondent to help respond to emergencies and protect our community.</p>
        </div>
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
          <p className="subtitle">Create an emergency respondent account</p>

          <p className="welcome-text">Respondent Registration</p>

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
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  placeholder="Enter your email"
                  style={{ flex: 1 }}
                />
                {email && !emailVerified && (
                  <button
                    type="button"
                    onClick={sendOTP}
                    disabled={sendingCode || countdown > 0}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      background: countdown > 0 ? "#9ca3af" : "#3b82f6",
                      color: "white",
                      cursor: countdown > 0 ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                      fontSize: "0.875rem",
                      fontWeight: "500"
                    }}
                  >
                    {sendingCode ? "Sending..." : countdown > 0 ? `Resend (${countdown}s)` : otpSent ? "Resend Code" : "Send Code"}
                  </button>
                )}
                {emailVerified && (
                  <span style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    padding: "8px 12px",
                    background: "#d1fae5",
                    borderRadius: "8px",
                    color: "#065f46",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    whiteSpace: "nowrap"
                  }}>
                    Verified
                  </span>
                )}
              </div>
            </div>

            {otpSent && !emailVerified && (
              <div className="form-group">
                <label>Verification Code <span className="required">*</span></label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    style={{ flex: 1, letterSpacing: "4px", textAlign: "center", fontSize: "1.25rem" }}
                  />
                  <button
                    type="button"
                    onClick={verifyOTP}
                    disabled={verifyingCode || otp.length < 6}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      background: verifyingCode || otp.length < 6 ? "#9ca3af" : "#22c55e",
                      color: "white",
                      cursor: verifyingCode || otp.length < 6 ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                      fontSize: "0.875rem",
                      fontWeight: "500"
                    }}
                  >
                    {verifyingCode ? "Verifying..." : "Verify"}
                  </button>
                </div>
                <p className="form-hint">
                  {otpInfo 
                    ? `Email service not configured. Your code is: ${otpInfo}`
                    : "Enter the 6-digit code sent to your email"
                  }
                </p>
              </div>
            )}

            <div className="form-group">
              <label>Phone Number <span className="required">*</span></label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label>Barangay <span className="required">*</span></label>
              <select
                value={barangay}
                onChange={(e) => { setBarangay(e.target.value); setSubLocation(""); }}
                required
              >
                <option value="">Select your barangay</option>
                {barangays.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {barangaySubAreas[barangay] && (
              <div className="form-group">
                <label>{barangay} Sub-Area</label>
                <select
                  value={subLocation}
                  onChange={(e) => setSubLocation(e.target.value)}
                >
                  <option value="">All {barangay}</option>
                  {barangaySubAreas[barangay].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

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
              style={{ marginTop: "8px", background: "#f97316", border: "2px solid #ea580c" }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }}></span>
                  Creating account...
                </>
              ) : (
                "Create Respondent Account"
              )}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
              Already have an account?{" "}
              <Link to="/respondent-login" style={{ fontWeight: "600" }}>
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
    </div>
  );
}

export default RespondentRegister;
