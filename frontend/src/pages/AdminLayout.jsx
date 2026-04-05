import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api";

function AdminLayout({ children }) {
  const [reports, setReports] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem("name");
  const userId = localStorage.getItem("userId");
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "A";

  const fetchReports = useCallback(async () => {
    try {
      const res = await api.get("/reports");
      setReports(res.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/notifications/${userId}`);
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => n.status === "unread").length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [userId]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (mounted) {
        await fetchReports();
        await fetchNotifications();
      }
    };
    loadData();
    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchReports, fetchNotifications]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");
    navigate("/admin-login");
  };

  const pendingCount = reports.filter(r => r.status === "Pending").length;
  const respondingCount = reports.filter(r => r.status === "Responding").length;
  const resolvedCount = reports.filter(r => r.status === "Resolved").length;

  // Get resident message counts from notifications
  const unreadResidentMessagesCount = notifications.filter(n => 
    (n.type === "resident-message" || n.type === "resident-emergency") && n.status === "unread"
  ).length;

  return (
    <div className="resident-layout admin-layout" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <img src="/logo.webp" alt="Logo" style={{ width: '240px', height: '200px', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
          <div className="user-info">
            <div className="user-avatar">{userInitial}</div>
            <div>
              <div className="user-name">{userName}</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main Menu</div>
            <Link 
              to="/dashboard" 
              className={`nav-item ${location.pathname === "/dashboard" ? "active" : ""}`}
            >
              <span className="icon">📊</span>
              Dashboard
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Reports</div>
            <Link 
              to="/dashboard" 
              className={`nav-item ${location.state?.filter === "pending" ? "active" : ""}`}
              state={{ filter: "pending" }}
            >
              <span className="icon">⏳</span>
              Pending
              <span className="badge" style={{ background: "#f59e0b" }}>{pendingCount}</span>
            </Link>
            <Link 
              to="/dashboard" 
              className={`nav-item ${location.state?.filter === "responding" ? "active" : ""}`}
              state={{ filter: "responding" }}
            >
              <span className="icon">🚨</span>
              Responding
              <span className="badge" style={{ background: "#ef4444" }}>{respondingCount}</span>
            </Link>
            <Link 
              to="/dashboard" 
              className={`nav-item ${location.state?.filter === "resolved" ? "active" : ""}`}
              state={{ filter: "resolved" }}
            >
              <span className="icon">✅</span>
              Resolved
              <span className="badge" style={{ background: "#10b981" }}>{resolvedCount}</span>
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Management</div>
            <Link 
              to="/users" 
              className={`nav-item ${location.pathname === "/users" ? "active" : ""}`}
            >
              <span className="icon">👥</span>
              User List
            </Link>
            <Link 
              to="/news" 
              className={`nav-item ${location.pathname === "/news" ? "active" : ""}`}
            >
              <span className="icon">📰</span>
              Create News
            </Link>
            <Link 
              to="/add-respondent" 
              className={`nav-item ${location.pathname === "/add-respondent" ? "active" : ""}`}
            >
              <span className="icon">🚑</span>
              Add Respondent
            </Link>
            <Link 
              to="/send-message" 
              className={`nav-item ${location.pathname === "/send-message" ? "active" : ""}`}
            >
              <span className="icon">📧</span>
              Send Message
            </Link>
            <Link 
              to="/emergency-alerts" 
              className={`nav-item ${location.pathname === "/emergency-alerts" ? "active" : ""}`}
            >
              <span className="icon">🚨</span>
              Emergency Alerts
            </Link>
            <Link 
              to="/resident-messages" 
              className={`nav-item ${location.pathname === "/resident-messages" ? "active" : ""}`}
            >
              <span className="icon">📩</span>
              Resident Messages
              {unreadResidentMessagesCount > 0 && (
                <span className="badge" style={{ background: "#ef4444", marginLeft: "auto" }}>
                  {unreadResidentMessagesCount}
                </span>
              )}
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" onClick={handleLogout} style={{ color: "#ef4444" }}>
            <span className="icon">🚪</span>
            Logout
          </div>
        </div>
      </aside>
      
     
      {/* Main Content */}
      <main className="main-content" style={{ padding: "0 16px", flex: 1, display: "flex", gap: "16px", overflow: "hidden" }}>
        {/* Header */}
        <div className="main-header">
          <center></center><h1>🛡️ Admin Dashboard</h1>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ padding: "10px 12px" }}
                title="Notifications"
              >
                🔔
              </button>
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "#ef4444",
                  color: "white",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  fontSize: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "600"
                }}>
                  {unreadCount}
                </span>
              )}
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  right: "0",
                  marginTop: "8px",
                  width: "350px",
                  maxHeight: "400px",
                  overflowY: "auto",
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  zIndex: 1000,
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{
                    padding: "16px",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>Notifications</h3>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem" }}
                    >
                      ✕
                    </button>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
                      No notifications
                    </div>
                  ) : (
                    <div>
                      {notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => markAsRead(notification._id)}
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #f3f4f6",
                            cursor: "pointer",
                            background: notification.status === "unread" ? "#eff6ff" : "white",
                            transition: "background 0.2s"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                            <div style={{ fontSize: "1.25rem" }}>
                              {notification.type === "resident-emergency" ? "🚨" : 
                               notification.type === "resident-message" ? "📩" :
                               notification.type === "assignment" ? "📋" :
                               notification.type === "emergency" ? "🚨" : "🔔"}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "0.875rem" }}>
                                {notification.title}
                              </p>
                              <p style={{ margin: "0 0 4px 0", fontSize: "0.8125rem", color: "#6b7280" }}>
                                {notification.message?.substring(0, 80)}...
                              </p>
                              <p style={{ margin: 0, fontSize: "0.75rem", color: "#9ca3af" }}>
                                {notification.senderName && `From: ${notification.senderName}`}
                                {notification.senderName && " • "}
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {notification.status === "unread" && (
                              <div style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#3b82f6",
                                flexShrink: 0
                              }} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button onClick={fetchReports} className="btn btn-secondary">
              🔄 
            </button>
          </div>
        </div>
       

        {/* Page Content */}
        <div className="main-body" style={{ flex: 1, padding: "16px", overflowX: "hidden" }}>
          {children}
        </div>


      </main>


       
    </div>
  
  );
}

export default AdminLayout;
