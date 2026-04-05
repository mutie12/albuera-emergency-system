import { useState, useEffect, useCallback } from "react";
import api from "../api";

function ResidentMessages() {
  const [notifications, setNotifications] = useState([]);
  const [respondents, setRespondents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageFilter, setMessageFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedRespondent, setSelectedRespondent] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get(`/notifications/${userId}`);
      // Filter to only resident messages
      const residentMessages = res.data.filter(n => 
        n.type === "resident-message" || n.type === "resident-emergency"
      );
      setNotifications(residentMessages);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    fetchRespondents();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const fetchRespondents = async () => {
    try {
      const res = await api.get("/auth/respondents");
      setRespondents(res.data);
    } catch (err) {
      console.error("Failed to fetch respondents:", err);
    }
  };

  // Filter notifications based on message status
  const filteredNotifications = notifications.filter(n => {
    if (messageFilter === "pending") return n.status === "unread";
    if (messageFilter === "responding") return n.status === "read" && !n.responded;
    if (messageFilter === "resolved") return n.responded === true;
    return true;
  });

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleRespond = async () => {
    if (!selectedMessage || !replyMessage.trim()) {
      setError("Please enter a reply message");
      return;
    }

    setSendingReply(true);
    setError("");
    setSuccess("");

    try {
      // Send response back to the resident
      await api.post("/notifications", {
        recipientId: selectedMessage.senderId,
        title: `Re: ${selectedMessage.title}`,
        message: replyMessage,
        type: "message"
      });

      // Mark the original message as responded
      await api.patch(`/notifications/${selectedMessage._id}/read`);
      
      setSuccess("Response sent successfully!");
      setReplyMessage("");
      setSelectedMessage(null);
      fetchNotifications();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to send response:", err);
      setError(err.response?.data?.message || "Failed to send response");
    } finally {
      setSendingReply(false);
    }
  };

  const handleAssignRespondent = async () => {
    if (!selectedMessage || !selectedRespondent) {
      setError("Please select a respondent to assign");
      return;
    }

    setAssigning(true);
    setError("");
    setSuccess("");

    try {
      const respondent = respondents.find(r => r._id === selectedRespondent);
      
      // Create a report from the resident's message
      const emergencyType = selectedMessage.emergencyType || 
        (selectedMessage.type === "resident-emergency" ? selectedMessage.title?.replace(/\[|\]/g, "") : "General Inquiry");
      
      // Try to extract location from message
      let location = "Location not specified";
      const locationMatch = selectedMessage.message?.match(/Location:\s*([^\n]+)/);
      if (locationMatch) {
        location = locationMatch[1].trim();
      }
      
      await api.post("/reports", {
        reporterName: selectedMessage.senderName,
        reporterId: selectedMessage.senderId,
        location: location,
        emergencyType: emergencyType,
        description: selectedMessage.message
      });

      // Get the latest report to assign
      const reportsRes = await api.get("/reports");
      const latestReport = reportsRes.data[0];

      if (latestReport) {
        await api.patch(`/reports/${latestReport._id}/assign`, {
          respondentId: selectedRespondent,
          respondentName: respondent?.name || "Respondent"
        });
      }

      await api.patch(`/notifications/${selectedMessage._id}/read`);
      
      setSuccess(`Assigned ${respondent?.name} to handle this message!`);
      setSelectedRespondent("");
      setSelectedMessage(null);
      fetchNotifications();
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to assign respondent:", err);
      setError(err.response?.data?.message || "Failed to assign respondent");
    } finally {
      setAssigning(false);
    }
  };

  const getStatusBadge = (notification) => {
    if (notification.status === "unread") {
      return <span style={{ 
        background: "#fef3c7", 
        color: "#92400e", 
        padding: "4px 8px", 
        borderRadius: "4px",
        fontSize: "0.75rem",
        fontWeight: "600"
      }}>PENDING</span>;
    }
    if (notification.responded) {
      return <span style={{ 
        background: "#d1fae5", 
        color: "#065f46", 
        padding: "4px 8px", 
        borderRadius: "4px",
        fontSize: "0.75rem",
        fontWeight: "600"
      }}>RESOLVED</span>;
    }
    return <span style={{ 
      background: "#dbeafe", 
      color: "#1e40af", 
      padding: "4px 8px", 
      borderRadius: "4px",
      fontSize: "0.75rem",
      fontWeight: "600"
    }}>RESPONDING</span>;
  };

  const getEmergencyIcon = (type) => {
    if (type === "resident-emergency") return "\u{1F6A8}";
    return "\u{1F4E9}";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  // Stats
  const pendingCount = notifications.filter(n => n.status === "unread").length;
  const respondingCount = notifications.filter(n => n.status === "read" && !n.responded).length;
  const resolvedCount = notifications.filter(n => n.responded).length;

  return (
    <div className="admin-page-container">
      {/* Header Stats */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: "16px",
        marginBottom: "24px"
      }}>
        <div style={{ 
          background: "white", 
          padding: "20px", 
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#f59e0b" }}>{pendingCount}</div>
          <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Pending</div>
        </div>
        <div style={{ 
          background: "white", 
          padding: "20px", 
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#3b82f6" }}>{respondingCount}</div>
          <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Responding</div>
        </div>
        <div style={{ 
          background: "white", 
          padding: "20px", 
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#10b981" }}>{resolvedCount}</div>
          <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Resolved</div>
        </div>
      </div>

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "24px" }}>
        {/* Message List */}
        <div style={{ 
          background: "white", 
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          <div style={{ 
            padding: "16px 20px", 
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap"
          }}>
            <button
              onClick={() => setMessageFilter("all")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: messageFilter === "all" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                background: messageFilter === "all" ? "#eff6ff" : "white",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setMessageFilter("pending")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: messageFilter === "pending" ? "2px solid #f59e0b" : "1px solid #d1d5db",
                background: messageFilter === "pending" ? "#fffbeb" : "white",
                cursor: "pointer",
                fontWeight: "500",
                color: messageFilter === "pending" ? "#92400e" : "inherit"
              }}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setMessageFilter("responding")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: messageFilter === "responding" ? "2px solid #3b82f6" : "1px solid #d1d5db",
                background: messageFilter === "responding" ? "#eff6ff" : "white",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              Responding ({respondingCount})
            </button>
            <button
              onClick={() => setMessageFilter("resolved")}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: messageFilter === "resolved" ? "2px solid #10b981" : "1px solid #d1d5db",
                background: messageFilter === "resolved" ? "#ecfdf5" : "white",
                cursor: "pointer",
                fontWeight: "500",
                color: messageFilter === "resolved" ? "#065f46" : "inherit"
              }}
            >
              Resolved ({resolvedCount})
            </button>
          </div>

          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                Loading...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
                No messages found
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => {
                    setSelectedMessage(notification);
                    if (notification.status === "unread") {
                      handleMarkAsRead(notification._id);
                    }
                  }}
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #f3f4f6",
                    cursor: "pointer",
                    background: selectedMessage?._id === notification._id ? "#f3f4f6" : 
                             notification.status === "unread" ? "#fffbeb" : "white",
                    transition: "background 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ fontSize: "1.5rem" }}>
                      {getEmergencyIcon(notification.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>
                          {notification.title}
                        </h3>
                        {getStatusBadge(notification)}
                      </div>
                      <p style={{ margin: "0 0 8px 0", fontSize: "0.875rem", color: "#6b7280" }}>
                        {notification.message?.substring(0, 100)}...
                      </p>
                      <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                        From: {notification.senderName} - {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    {notification.status === "unread" && (
                      <div style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: "#f59e0b",
                        flexShrink: 0,
                        marginTop: "6px"
                      }} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail Panel */}
        <div style={{ 
          background: "white", 
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: "20px",
          height: "fit-content"
        }}>
          {selectedMessage ? (
            <div>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "1.5rem" }}>
                    {getEmergencyIcon(selectedMessage.type)}
                  </span>
                  <span style={{ fontWeight: "600", fontSize: "1.125rem" }}>
                    {selectedMessage.type === "resident-emergency" ? "Emergency Report" : "General Message"}
                  </span>
                </div>
                {getStatusBadge(selectedMessage)}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "0.75rem", color: "#6b7280", display: "block", marginBottom: "4px" }}>
                  FROM
                </label>
                <div style={{ fontWeight: "500" }}>{selectedMessage.senderName}</div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "0.75rem", color: "#6b7280", display: "block", marginBottom: "4px" }}>
                  SUBJECT
                </label>
                <div style={{ fontWeight: "500" }}>{selectedMessage.title}</div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "0.75rem", color: "#6b7280", display: "block", marginBottom: "4px" }}>
                  MESSAGE
                </label>
                <div style={{ 
                  padding: "12px", 
                  background: "#f9fafb", 
                  borderRadius: "8px",
                  whiteSpace: "pre-wrap",
                  fontSize: "0.875rem"
                }}>
                  {selectedMessage.message}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "0.75rem", color: "#6b7280", display: "block", marginBottom: "4px" }}>
                  RECEIVED
                </label>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                  {formatDate(selectedMessage.createdAt)}
                </div>
              </div>

              {/* Assign Respondent Section */}
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px", marginBottom: "16px" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", display: "block", marginBottom: "8px" }}>
                  Assign Respondent
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <select
                    value={selectedRespondent}
                    onChange={(e) => setSelectedRespondent(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.875rem",
                      background: "white"
                    }}
                  >
                    <option value="">Select a respondent...</option>
                    {respondents.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.barangay})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignRespondent}
                    disabled={assigning || !selectedRespondent}
                    style={{
                      padding: "10px 16px",
                      background: assigning ? "#9ca3af" : "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "500",
                      cursor: assigning ? "not-allowed" : "pointer"
                    }}
                  >
                    {assigning ? "Assigning..." : "Assign"}
                  </button>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "8px" }}>
                  Assigning will create an emergency report and notify the respondent
                </p>
              </div>

              {/* Response Section */}
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: "500", display: "block", marginBottom: "8px" }}>
                  Send Response
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response to the resident..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.875rem",
                    resize: "vertical",
                    fontFamily: "inherit",
                    marginBottom: "12px"
                  }}
                />
                <button
                  onClick={handleRespond}
                  disabled={sendingReply || !replyMessage.trim()}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: sendingReply ? "#9ca3af" : "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "500",
                    cursor: sendingReply ? "not-allowed" : "pointer"
                  }}
                >
                  {sendingReply ? "Sending..." : "Send Response"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ 
              textAlign: "center", 
              color: "#6b7280",
              padding: "40px 20px"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>
                {String.fromCodePoint(0x1F4E9)}
              </div>
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResidentMessages;
