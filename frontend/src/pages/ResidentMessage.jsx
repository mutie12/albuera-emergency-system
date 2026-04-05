import { useState } from "react";
import api from "../api";

function ResidentMessage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("general");
  const [emergencyType, setEmergencyType] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("name");

  const barangays = [
    "Poblacion",
    "Balugo",
    "Damula-an",
    "Antipolo",
    "Benolho",
    "Doña Maria (Kangkuirina)",
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

  const emergencyTypes = [
    "Fire",
    "Flood",
    "Earthquake",
    "Typhoon",
    "Landslide",
    "Medical Emergency",
    "Vehicular Accident",
    "Crime/Violence",
    "Infrastructure Damage",
    "Power Outage",
    "Water Supply Issue",
    "Other"
  ];

  const getEmergencyIcon = (type) => {
    switch (type) {
      case "Fire": return "🔥";
      case "Flood": return "🌊";
      case "Earthquake": return "🌍";
      case "Typhoon": return "🌀";
      case "Landslide": return "⛰️";
      case "Medical Emergency": return "🏥";
      case "Vehicular Accident": return "🚗";
      case "Crime/Violence": return "🚔";
      case "Infrastructure Damage": return "🏚️";
      case "Power Outage": return "⚡";
      case "Water Supply Issue": return "💧";
      default: return "⚠️";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Validate based on message type
      if (messageType === "general") {
        if (!subject.trim()) {
          setError("Please enter a subject for your message");
          setLoading(false);
          return;
        }
      } else if (messageType === "emergency") {
        if (!emergencyType) {
          setError("Please select an emergency type");
          setLoading(false);
          return;
        }
      }

      const fullLocation = location && subLocation
        ? `${location} - ${subLocation}`
        : location;

      await api.post("/notifications/resident-message", {
        residentId: userId,
        residentName: userName,
        subject: messageType === "emergency" && emergencyType 
          ? `[${emergencyType}] Emergency Report` 
          : subject,
        message: message,
        messageType: messageType,
        location: fullLocation
      });
      
      setSuccess("✅ Your message has been sent to the admin successfully!");
      setSubject("");
      setMessage("");
      setEmergencyType("");
      setLocation("");
      setSubLocation("");
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resident-page-container">
      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ marginBottom: "8px", color: "#1f2937" }}>📩 Message Admin</h2>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>
            Send a private message to the admin. This will not be posted publicly.
          </p>
          
          {success && (
            <div style={{ 
              padding: "12px 16px", 
              borderRadius: "8px", 
              marginBottom: "20px",
              background: "#d1fae5",
              color: "#065f46"
            }}>
              {success}
            </div>
          )}
          
          {error && (
            <div style={{ 
              padding: "12px 16px", 
              borderRadius: "8px", 
              marginBottom: "20px",
              background: "#fee2e2",
              color: "#991b1b"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Message Type
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                <label style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: messageType === "general" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                  background: messageType === "general" ? "#eff6ff" : "white",
                  cursor: "pointer",
                  flex: 1
                }}>
                  <input
                    type="radio"
                    name="messageType"
                    value="general"
                    checked={messageType === "general"}
                    onChange={(e) => {
                      setMessageType(e.target.value);
                      setEmergencyType("");
                    }}
                    style={{ margin: 0 }}
                  />
                  <span>💬 General Message</span>
                </label>
                
                <label style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: messageType === "emergency" ? "2px solid #ef4444" : "1px solid #d1d5db",
                  background: messageType === "emergency" ? "#fef2f2" : "white",
                  cursor: "pointer",
                  flex: 1
                }}>
                  <input
                    type="radio"
                    name="messageType"
                    value="emergency"
                    checked={messageType === "emergency"}
                    onChange={(e) => {
                      setMessageType(e.target.value);
                      setSubject("");
                    }}
                    style={{ margin: 0 }}
                  />
                  <span>🚨 Report Emergency</span>
                </label>
              </div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "8px" }}>
                {messageType === "emergency" 
                  ? "Use this to report an emergency that requires immediate attention. The admin will be notified immediately."
                  : "Use this for general inquiries, concerns, or non-urgent matters."
                }
              </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Location (Barangay) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                value={location}
                onChange={(e) => { setLocation(e.target.value); setSubLocation(""); }}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem",
                  backgroundColor: "white"
                }}
              >
                <option value="">-- Select a location --</option>
                {barangays.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {barangaySubAreas[location] && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  {location} Sub-Area
                </label>
                <select
                  value={subLocation}
                  onChange={(e) => setSubLocation(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem",
                    backgroundColor: "white"
                  }}
                >
                  <option value="">All {location}</option>
                  {barangaySubAreas[location].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {messageType === "emergency" && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Emergency Type <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {emergencyTypes.map((type) => (
                    <div
                      key={type}
                      onClick={() => setEmergencyType(type)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: emergencyType === type ? "2px solid #ef4444" : "1px solid #d1d5db",
                        background: emergencyType === type ? "#fef2f2" : "white",
                        cursor: "pointer",
                        textAlign: "center",
                        fontSize: "0.875rem"
                      }}
                    >
                      <span style={{ fontSize: "1.25rem" }}>{getEmergencyIcon(type)}</span>
                      <div style={{ marginTop: "4px" }}>{type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {messageType === "general" && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Subject <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="What is this about?"
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem"
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                Message <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                placeholder={
                  messageType === "emergency" 
                    ? "Provide details about the emergency:\n- Location (address/area)\n- What's happening\n- Any immediate dangers\n- Your contact number if different from profile"
                    : "Type your message here..."
                }
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 24px",
                background: loading ? "#9ca3af" : (messageType === "emergency" ? "#ef4444" : "#3b82f6"),
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              {loading ? (
                "Sending..."
              ) : messageType === "emergency" ? (
                <>🚨 Submit Emergency Report</>
              ) : (
                <>📤 Send Message</>
              )}
            </button>
          </form>

          <div style={{ 
            marginTop: "24px", 
            padding: "16px", 
            background: "#f3f4f6", 
            borderRadius: "8px",
            fontSize: "0.875rem",
            color: "#6b7280"
          }}>
            <p style={{ margin: 0, fontWeight: "500", marginBottom: "8px" }}>ℹ️ Note:</p>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              <li>Your message is sent privately to the admin only</li>
              <li>Emergency reports will be prioritized by the admin</li>
              <li>For life-threatening emergencies, please also dial 911</li>
              <li>For public emergency reports, use the "Report Emergency" button</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResidentMessage;