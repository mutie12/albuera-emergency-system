import { useState, useEffect, useCallback } from "react";
import api from "../api";

function RespondentProfile() {
  const userId = localStorage.getItem("userId");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    barangay: "",
    station: "",
    badgeNumber: "",
    vehicleNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/auth/users/${userId}`);
      const user = res.data;
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        barangay: user.barangay || "",
        station: user.station || "",
        badgeNumber: user.badgeNumber || "",
        vehicleNumber: user.vehicleNumber || ""
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.put(`/auth/users/${userId}`, formData);
      setMessage("✅ Profile updated successfully!");
      localStorage.setItem("name", formData.name);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setMessage("❌ Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("❌ New passwords do not match.");
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage("❌ Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      await api.put(`/auth/users/${userId}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage("✅ Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Failed to change password:", err);
      setMessage(err.response?.data?.message || "❌ Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        {/* Profile Header */}
        <div style={{ 
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", 
          borderRadius: "16px", 
          padding: "32px",
          marginBottom: "24px",
          color: "white"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#f97316"
            }}>
              {formData.name?.charAt(0)?.toUpperCase() || "R"}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.75rem" }}>{formData.name}</h2>
              <p style={{ margin: "4px 0 0", opacity: 0.9 }}>🚑 Emergency Respondent</p>
            </div>
          </div>
        </div>

        {message && (
          <div style={{ 
            padding: "14px 18px", 
            borderRadius: "10px", 
            marginBottom: "20px",
            background: message.includes("✅") ? "#d1fae5" : "#fee2e2",
            color: message.includes("✅") ? "#065f46" : "#991b1b",
            fontWeight: "500"
          }}>
            {message}
          </div>
        )}

        {/* Profile Form */}
        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "28px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: "24px"
        }}>
          <h3 style={{ marginBottom: "20px", color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
            👤 Personal Information
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#374151" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#374151" }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#374151" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#374151" }}>
                  Barangay
                </label>
                <input
                  type="text"
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#374151" }}>
                  Station/Department
                </label>
                <input
                  type="text"
                  name="station"
                  value={formData.station}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#374151" }}>
                  Badge Number
                </label>
                <input
                  type="text"
                  name="badgeNumber"
                  value={formData.badgeNumber}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem"
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "8px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#374151" }}>
                Vehicle Number
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 24px",
                background: "#f97316",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "8px"
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "28px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <h3 style={{ marginBottom: "20px", color: "#1f2937", display: "flex", alignItems: "center", gap: "8px" }}>
            🔐 Change Password
          </h3>
          
          <form onSubmit={handlePasswordSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#374151" }}>
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#374151" }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", color: "#374151" }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem"
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 24px",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RespondentProfile;
