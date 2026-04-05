import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api";

function RespondentLayout({ children }) {
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]); 
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userName = localStorage.getItem("name");
  const userId = localStorage.getItem("userId");
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "R";

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
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [userId]);

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

  const handleStatusUpdate = async (id, status, action = null) => {
    try {
      await api.patch(`/reports/${id}/status`, { status, action });
      fetchReports();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");
    navigate("/respondent-login");
  };

  const unreadCount = notifications.filter(n => n.status !== "read").length;

  const pendingReports = reports.filter(r => r.status === "Pending");
  const myRespondingReports = reports.filter(r => 
    r.status === "Responding" && r.assignedTo?.respondentId === userId
  );

  const pendingCount = pendingReports.length;
  const activeCount = myRespondingReports.length;

  const childWithProps = React.isValidElement(children) 
    ? React.cloneElement(children, { 
        reports, 
        fetchReports, 
        handleStatusUpdate,
        pendingReports,
        myRespondingReports
      })
    : children;

  return (
    <div className="resident-layout respondent-layout" style={{ display: "flex", minHeight: "100vh" }}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <img src="/logo.webp" alt="Logo" style={{ width: '260px', height: '200px', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
          <div className="user-info">
            <div className="user-avatar" style={{ background: '#f97316', color: 'white' }}>{userInitial}</div>
            <div>
              <div className="user-name">{userName}</div>
              <div className="user-role">🚑 Respondent</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main Menu</div>
            <Link 
              to="/respondent" 
              className={`nav-item ${location.state?.view === "queue" ? "active" : ""}`}
              state={{ view: "queue" }}
            >
              <span className="icon">🚨</span>
              Emergency Tasks
              <span className="badge" style={{ background: "#f59e0b" }}>{pendingCount}</span>
            </Link>
            <Link 
              to="/respondent/news" 
              className={`nav-item ${location.pathname === "/respondent/news" ? "active" : ""}`}
            >
              <span className="icon">📰</span>
              News & Updates
            </Link>
            <Link 
              to="/respondent/profile" 
              className={`nav-item ${location.pathname === "/respondent/profile" ? "active" : ""}`}
            >
              <span className="icon">👤</span>
              My Profile
            </Link>
            <Link 
              to="/respondent/message" 
              className={`nav-item ${location.pathname === "/respondent/message" ? "active" : ""}`}
            >
              <span className="icon">📩</span>
              Message Admin
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Quick Stats</div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Available</span>
                <span style={{ fontWeight: "600", color: "#f59e0b" }}>{pendingCount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--text-tertiary)" }}>Active</span>
                <span style={{ fontWeight: "600", color: "#ef4444" }}>{activeCount}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" onClick={handleLogout} style={{ color: "#ef4444" }}>
            <span className="icon">🚪</span>
            Logout
          </div>
        </div>
      </aside>

      <main className="main-content" style={{ paddingLeft: "64px", paddingRight: "24px" }}>
        <div className="main-header">
          <h1>🚑 Respondent Dashboard</h1>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button onClick={fetchReports} className="btn btn-secondary" title="Refresh">
              🔄
            </button>
            <div style={{ position: "relative" }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn btn-secondary"
                title="Notifications"
                style={{ position: "relative" }}
              >
                🔔
                {unreadCount > 0 && (
                  <span className="badge" style={{ 
                    position: "absolute", 
                    top: "-4px", 
                    right: "-4px",
                    background: "#ef4444",
                    color: "white",
                    fontSize: "0.7rem",
                    minWidth: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%"
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  background: "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  width: "320px",
                  maxHeight: "400px",
                  overflow: "auto",
                  zIndex: 1000
                }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--gray-200)" }}>
                    <strong>Notifications</strong>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)" }}>
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div key={idx} style={{ 
                        padding: "12px 16px", 
                        borderBottom: "1px solid var(--gray-100)",
                        background: notif.status === "read" ? "transparent" : "var(--blue-50)"
                      }}>
                        {notif.type === "assignment" ? (
                          <div>
                            <div style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "4px" }}>
                              🚨 New assignment
                            </div>
                            <div style={{ fontSize: "0.875rem", marginBottom: "4px" }}>
                              {notif.emergencyType} at {notif.location}
                            </div>
                          </div>
                        ) : notif.type === "broadcast" || notif.type === "message" ? (
                          <div>
                            <div style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                              📢 {notif.subject || "Admin Message"}
                            </div>
                            <div style={{ fontSize: "0.875rem", marginBottom: "4px", color: "var(--text-secondary)" }}>
                              {notif.message}
                            </div>
                          </div>
                        ) : notif.type === "emergency-alert" ? (
                          <div>
                            <div style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px", color: "#dc2626" }}>
                              🚨 Emergency Alert
                            </div>
                            <div style={{ fontSize: "0.875rem", marginBottom: "4px" }}>
                              {notif.message}
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: "0.875rem", marginBottom: "4px" }}>{notif.message}</div>
                        )}
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {new Date(notif.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="main-body">
          {childWithProps}
        </div>
      </main>
    </div>
  );
}

export default RespondentLayout;
