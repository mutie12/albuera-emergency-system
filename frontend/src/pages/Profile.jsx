import { useState, useEffect } from "react";
import api from "../api";

function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    barangay: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await api.get(`/auth/users/${userId}`);
      setUser({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        barangay: res.data.barangay || ""
      });
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const userId = localStorage.getItem("userId");
      await api.put(`/auth/users/${userId}`, {
        name: user.name,
        email: user.email,
        phone: user.phone
      });
      localStorage.setItem("name", user.name);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Failed to update profile" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setSaving(false);
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      await api.put(`/auth/users/${userId}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Failed to change password" 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>👤 My Profile</h1>
      </div>

      {message.text && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "24px",
          background: message.type === "success" ? "#d1fae5" : "#fee2e2",
          color: message.type === "success" ? "#065f46" : "#991b1b"
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: "grid", gap: "24px", maxWidth: "100%" }}>
        {/* Profile Information */}
        <div className="report-card" style={{ padding: "24px" }}>
          <h2 style={{ marginBottom: "20px", fontSize: "1.25rem" }}>Profile Information</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="Enter your email"
              />
              <p className="form-hint">For emergency alerts and notifications</p>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={user.phone}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                placeholder="Enter your phone number"
              />
              <p className="form-hint">For SMS emergency alerts</p>
            </div>

            <div className="form-group">
              <label>Barangay</label>
              <input
                type="text"
                value={user.barangay}
                disabled
                style={{ background: "var(--gray-100)" }}
              />
              <p className="form-hint">Contact admin to change your barangay</p>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>

        {/* Password Change */}
        <div className="report-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.25rem" }}>Password</h2>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              {showPasswordForm ? "Cancel" : "Change Password"}
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  placeholder="Enter new password"
                  minLength={6}
                />
                <p className="form-hint">Must be at least 6 characters</p>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  placeholder="Confirm new password"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></span>
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </button>
            </form>
          )}

          {!showPasswordForm && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Keep your account secure by using a strong password.
            </p>
          )}
        </div>

        {/* Account Info */}
        <div className="report-card" style={{ padding: "24px" }}>
          <h2 style={{ marginBottom: "20px", fontSize: "1.25rem" }}>Account Information</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-tertiary)" }}>Account Status</span>
              <span style={{ 
                padding: "4px 12px", 
                borderRadius: "12px", 
                background: "var(--status-approved-bg, #d1fae5)",
                color: "var(--status-approved-text, #065f46)",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}>
                Approved
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-tertiary)" }}>Account Type</span>
              <span>Resident</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
