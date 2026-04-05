import { useState } from "react";
import api from "../api";

function EmergencyAlerts() {
  const barangays = [
    "Poblacion", "Balugo", "Damula-an", "Antipolo", "Benolho",
    "Doña Maria (Kangkuirina)", "Mahayag", "Mahayahay", "Salvacion",
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

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    urgency: "high",
    barangay: "",
    subLocation: ""
  });
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "barangay") {
      setFormData({ ...formData, barangay: value, subLocation: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlertMessage("");

    try {
      const location = formData.barangay && formData.subLocation
        ? `${formData.barangay} - ${formData.subLocation}`
        : formData.barangay;
      await api.post("/news/emergency-alert", { ...formData, location });
      setAlertMessage("🚨 Emergency alert sent successfully!");
      setFormData({ title: "", message: "", urgency: "high", barangay: "", subLocation: "" });
      
      setTimeout(() => setAlertMessage(""), 5000);
    } catch (err) {
      console.error("Failed to send emergency alert:", err);
      setAlertMessage(err.response?.data?.message || "❌ Failed to send emergency alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div style={{ background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "8px", color: "#dc2626" }}>🚨 Send Emergency Alert</h2>
        <p style={{ color: "#6b7280", marginBottom: "24px" }}>
          Send an urgent emergency alert to all users (respondents and residents).
        </p>

        {alertMessage && (
          <div style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            background: alertMessage.includes("🚨") ? "#d1fae5" : "#fee2e2",
            color: alertMessage.includes("🚨") ? "#065f46" : "#991b1b"
          }}>
            {alertMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Alert Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem"
              }}
              placeholder="e.g., FLOOD WARNING - AREA A"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Urgency Level
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem",
                backgroundColor: "white"
              }}
            >
              <option value="critical">🔴 Critical - Immediate action required</option>
              <option value="high">🟠 High - Urgent attention needed</option>
              <option value="medium">🟡 Medium - Attention required</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Location (Barangay)
            </label>
            <select
              name="barangay"
              value={formData.barangay}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem",
                backgroundColor: "white"
              }}
            >
              <option value="">All Locations</option>
              {barangays.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {barangaySubAreas[formData.barangay] && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                {formData.barangay} Sub-Area
              </label>
              <select
                name="subLocation"
                value={formData.subLocation}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem",
                  backgroundColor: "white"
                }}
              >
                <option value="">All {formData.barangay}</option>
                {barangaySubAreas[formData.barangay].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Alert Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem",
                resize: "vertical",
                fontFamily: "inherit"
              }}
              placeholder="Enter the emergency details and instructions..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px 24px",
              background: loading ? "#9ca3af" : "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%"
            }}
          >
            {loading ? "Sending..." : "🚨 Send Emergency Alert"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmergencyAlerts;
