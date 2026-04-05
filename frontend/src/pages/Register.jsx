import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [barangay, setBarangay] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [otpInfo, setOtpInfo] = useState("");
  const [countdown, setCountdown] = useState(0);
  
  // Phone verification states
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingPhoneCode, setSendingPhoneCode] = useState(false);
  const [verifyingPhoneCode, setVerifyingPhoneCode] = useState(false);
  const [phoneOtpInfo, setPhoneOtpInfo] = useState("");
  const [phoneCountdown, setPhoneCountdown] = useState(0);
  
  const navigate = useNavigate();

  const barangays = [
    "Poblacion",
    "Balugo",
    "Damula-an",
    "Antipolo",
    "Benolho",
    "Doña Maria",
    "Mahayag",
    "Mahayahay",
    "Salvacion",
    "San Pedro",
    "Seguinon",
    "Sherwood",
    "Tabgas",
    "Talisayan",
    "Tinag-an",
  
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

  useEffect(() => {
    if (phoneCountdown > 0) {
      const timer = setTimeout(() => setPhoneCountdown(phoneCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneCountdown]);

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

  const handleBarangayChange = (e) => {
    setBarangay(e.target.value);
    setSubLocation("");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailVerified(false);
    setOtpSent(false);
    setOtp("");
    setOtpInfo("");
    setCountdown(0);
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    setPhoneVerified(false);
    setPhoneOtpSent(false);
    setPhoneOtp("");
    setPhoneOtpInfo("");
    setPhoneCountdown(0);
  };

  const sendPhoneOTP = async () => {
    if (!phone) {
      setError("Please enter your phone number first");
      return;
    }
    setError("");
    setSendingPhoneCode(true);
    setPhoneOtpInfo("");

    try {
      const res = await api.post("/auth/send-phone-otp", { phone });
      setPhoneOtpSent(true);
      setPhoneCountdown(60);
      setPhoneOtpInfo(res.data.otp || "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setSendingPhoneCode(false);
    }
  };

  const verifyPhoneOTP = async () => {
    if (!phoneOtp) {
      setError("Please enter the verification code");
      return;
    }
    setError("");
    setVerifyingPhoneCode(true);

    try {
      await api.post("/auth/verify-phone-otp", { phone, otp: phoneOtp });
      setPhoneVerified(true);
      setPhoneOtpInfo("");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setVerifyingPhoneCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation: at least one must be verified
    if (!emailVerified && !phoneVerified) {
      setError("Please verify either your email or phone number to register");
      return;
    }

    // Validation: if provided, must be verified
    if (email && !emailVerified) {
      setError("Please verify your email address");
      return;
    }
    if (phone && !phoneVerified) {
      setError("Please verify your phone number");
      return;
    }

    setLoading(true);

    try {
      const fullBarangay = barangay && subLocation
        ? `${barangay} - ${subLocation}`
        : barangay;
      const res = await api.post("/auth/register", {
        name,
        username,
        password,
        barangay: fullBarangay,
        email,
        phone,
        emailVerified,
        phoneVerified
      });
      
      setVerificationCode(res.data.verificationCode);
      setEmailSent(res.data.emailSent || false);
      setSuccess(res.data.message);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMsg);
      if (err.response?.data?.hint) {
        setError(errorMsg + " " + err.response.data.hint);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success) {
    return (
      <div className="auth-container">
        {/* Image Panel - Left Side */}
        <div className="auth-image-panel">
          <div className="auth-image-content">
            <span className="emergency-icon">✅</span>
            <h2>Registration Successful!</h2>
            <p>Your account has been created and is pending admin approval.</p>
          </div>
          <div className="auth-image-footer">
            <p>We'll verify your account soon</p>
          </div>
        </div>
        
        {/* Form Panel - Right Side */}
        <div className="auth-form-panel">
          <div className="auth-card" style={{ textAlign: "center" }}>
            <div className="logo">
              <span className="logo-icon">✅</span>
            </div>
            <h1>Registration Successful!</h1>
            <p className="subtitle">Your barangay verification has been confirmed. Your account is pending admin approval.</p>
            
            {emailSent && (
              <div style={{ 
                background: "#d1fae5", 
                padding: "12px 16px", 
                borderRadius: "var(--radius-md)",
                margin: "16px 0"
              }}>
                <p style={{ fontSize: "0.875rem", color: "#065f46" }}>
                  ✅ A verification email has been sent to your email address
                </p>
              </div>
            )}
            
            <div style={{ 
              background: "var(--primary-50)", 
              padding: "20px", 
              borderRadius: "var(--radius-md)",
              margin: "24px 0"
            }}>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                {emailSent ? "Your verification code (if email wasn't received):" : "Please share this verification code with the admin for approval:"}
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                <p style={{ 
                  fontSize: "1.5rem", 
                  fontWeight: "700", 
                  color: "var(--primary-700)",
                  letterSpacing: "4px",
                  margin: 0
                }}>
                  {verificationCode}
                </p>
                <button 
                  onClick={copyToClipboard}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: "8px 12px" }}
                >
                  {copied ? "✅" : "📋"}
                </button>
              </div>
            </div>

            <div style={{ 
              background: "#fef3c7", 
              padding: "16px", 
              borderRadius: "var(--radius-md)",
              marginBottom: "24px"
            }}>
              <p style={{ fontSize: "0.875rem", color: "#92400e" }}>
                <strong>Next Steps:</strong><br />
                1. {(email && emailSent) ? "Check your email for the verification code" : "Save your verification code above"}<br />
                2. Contact the admin to verify your residency<br />
                3. Admin will approve your account<br />
                4. Once approved, you can login to report emergencies
              </p>
            </div>

            <button 
              onClick={() => navigate("/login")} 
              className="btn btn-primary btn-block"
            >
              Go to Login
            </button>
            
            <div style={{ marginTop: "16px" }}>
              <Link to="/" className="btn btn-ghost" style={{ fontSize: "0.875rem" }}>
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {/* Image Panel - Left Side */}
      <div className="auth-image-panel">
        <div className="auth-image-footer">
        </div>
      </div>
      
      {/* Form Panel - Right Side */}
      <div className="auth-form-panel">
        <div className="auth-card" style={{ background: "#f0fdf4", border: "2px solid #22c55e" }}>
          <div className="logo">
            <span className="logo-icon">🚨</span>
          </div>
          <h1>Albuera Emergency</h1>
          <p className="subtitle">Create your account to report emergencies</p>

          <p className="welcome-text">Create an Account</p>

          <div style={{ 
            background: "#eff6ff", 
            padding: "12px 16px", 
            borderRadius: "8px", 
            marginBottom: "20px",
            border: "1px solid #bfdbfe"
          }}>
            <p style={{ fontSize: "0.875rem", color: "#1e40af", margin: 0 }}>
              <strong>Important:</strong> Please verify your email OR phone number to complete registration. At least one verification is required.
            </p>
          </div>

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
              <label>Barangay <span className="required">*</span></label>
              <select
                value={barangay}
                onChange={handleBarangayChange}
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

            <div className="form-group">
              <label>Email Address</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email address (optional)"
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
              <p className="form-hint">For emergency alerts and notifications</p>
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
              <label>Phone Number <span className="required"></span></label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="09xxxxxxxxx (optional)"
                  style={{ flex: 1 }}
                />
                {phone && !phoneVerified && (
                  <button
                    type="button"
                    onClick={sendPhoneOTP}
                    disabled={sendingPhoneCode || phoneCountdown > 0}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      background: phoneCountdown > 0 ? "#9ca3af" : "#3b82f6",
                      color: "white",
                      cursor: phoneCountdown > 0 ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                      fontSize: "0.875rem",
                      fontWeight: "500"
                    }}
                  >
                    {sendingPhoneCode ? "Sending..." : phoneCountdown > 0 ? `Resend (${phoneCountdown}s)` : phoneOtpSent ? "Resend Code" : "Send Code"}
                  </button>
                )}
                {phoneVerified && (
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
              <p className="form-hint">For SMS emergency alerts</p>
            </div>

            {phoneOtpSent && !phoneVerified && (
              <div className="form-group">
                <label>Phone Verification Code <span className="required">*</span></label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    style={{ flex: 1, letterSpacing: "4px", textAlign: "center", fontSize: "1.25rem" }}
                  />
                  <button
                    type="button"
                    onClick={verifyPhoneOTP}
                    disabled={verifyingPhoneCode || phoneOtp.length < 6}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      background: verifyingPhoneCode || phoneOtp.length < 6 ? "#9ca3af" : "#22c55e",
                      color: "white",
                      cursor: verifyingPhoneCode || phoneOtp.length < 6 ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap",
                      fontSize: "0.875rem",
                      fontWeight: "500"
                    }}
                  >
                    {verifyingPhoneCode ? "Verifying..." : "Verify"}
                  </button>
                </div>
                <p className="form-hint">
                  {phoneOtpInfo 
                    ? `Your code is: ${phoneOtpInfo}`
                    : "Enter the 6-digit code sent to your phone"
                  }
                </p>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
              disabled={loading}
              style={{ marginTop: "8px", background: "#22c55e", border: "2px solid #16a34a" }}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }}></span>
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="auth-links" style={{ marginTop: "24px", textAlign: "center" }}>
            <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ fontWeight: "600" }}>
                Sign in here
              </Link>
            </p>
          </div>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Link to="/" className="btn btn-ghost" style={{ fontSize: "0.875rem" }}>
              ← Back to Home
            </Link>
          </div>

          {/* Benefits */}
          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--gray-200)" }}>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "12px" }}>
              Why register?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "var(--accent-emerald)" }}>✓</span>
                <span>Report and track emergencies</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "var(--accent-emerald)" }}>✓</span>
                <span>Get real-time status updates</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "var(--accent-emerald)" }}>✓</span>
                <span>Help keep your community safe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
