import { useState } from "react";
import api from "../api";

function RespondentMessageAdmin() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("general");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("name");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!subject.trim() && messageType === "general") {
        setError("Please enter a subject for your message");
        setLoading(false);
        return;
      }

      await api.post("/notifications/respondent-message", {
        respondentId: userId,
        respondentName: userName,
        subject: messageType === "emergency" && subject 
          ? subject 
          : subject,
        message: message,
        messageType: messageType
      });
      
      setSuccess("✅ Your message has been sent to the admin successfully!");
      setSubject("");
      setMessage("");
      
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
    <div className="respondent-page-container">
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
                      setSubject("");
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
                  <span>🚨 Urgent Report</span>
                </label>
              </div>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "8px" }}>
                {messageType === "emergency" 
                  ? "Use this to report urgent matters requiring immediate attention."
                  : "Use this for general inquiries, concerns, or status updates."
                }
              </p>
            </div>

            {messageType === "general" && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Subject <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required={messageType === "general"}
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

            {messageType === "emergency" && (
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                  Subject / Title <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of the urgency"
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
                    ? "Describe the urgent situation in detail..."
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
                <>🚨 Send Urgent Report</>
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
              <li>Urgent reports will be prioritized by the admin</li>
              <li>For active emergencies, use your Emergency Tasks queue</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RespondentMessageAdmin;