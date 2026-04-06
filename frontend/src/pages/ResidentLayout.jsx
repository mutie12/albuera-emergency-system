import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api";

function ResidentLayout({ children }) {
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [myMessages, setMyMessages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const fetchMyMessages = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/notifications/sent/${userId}`);
      setMyMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch sent messages:", err);
    }
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (mounted) {
        await fetchReports();
        await fetchNotifications();
        await fetchMyMessages();
      }
    };
    loadData();
    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchReports, fetchNotifications, fetchMyMessages]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const unreadCount = notifications.filter(n => n.status !== "read").length;

  // Filter reports to show only this user's reports
  const myReports = reports.filter(r => 
    r.reporterId === userId || r.reporterName === userName
  );

  const myPendingCount = myReports.filter(r => r.status === "Pending").length;
  const myResolvedCount = myReports.filter(r => r.status === "Resolved").length;

  const childWithProps = React.isValidElement(children) 
    ? React.cloneElement(children, { 
        reports, 
        fetchReports,
        myReports,
        myPendingCount,
        myResolvedCount,
        myMessages
      })
    : children;

  return (
    <div className="resident-layout" style={{ display: "flex", minHeight: "100vh" }}>
      <aside className="sidebar" style={{ 
        background: '#ffffff', 
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)', 
        width: '300px', 
        minWidth: '300px',
        position: "fixed",
        height: "100vh",
        zIndex: 100
      }}>
        <div className="sidebar-header" style={{ padding: '24px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div className="logo">
            <img src="/logo.webp" alt="Logo" style={{ width: '180px', height: '180px', objectFit: 'contain', borderRadius: '12px' }} />
          </div>
          <div className="user-info" style={{ marginTop: '16px', padding: '12px', background: '#f0f9ff', borderRadius: '12px' }}>
            <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '1.25rem', background: '#0ea5e9', color: 'white' }}>{userInitial}</div>
            <div>
              <div className="user-name" style={{ fontWeight: '600', fontSize: '0.9375rem' }}>{userName}</div>
              <div className="user-role" style={{ fontSize: '0.75rem', color: '#06b6d4' }}>Resident</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ padding: '16px 12px' }}>
          <div className="nav-section" style={{ marginBottom: '24px' }}>
            <div className="nav-section-title" style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Main Menu</div>
            <Link 
              to="/resident" 
              className={`nav-item ${location.state?.view === "dashboard" || (!location.state?.view && location.pathname === "/resident") ? "active" : ""}`}
              state={{ view: "dashboard" }}
              style={{ 
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: location.state?.view === "dashboard" || (!location.state?.view && location.pathname === "/resident") ? "var(--primary-50)" : "transparent",
                color: location.state?.view === "dashboard" || (!location.state?.view && location.pathname === "/resident") ? "var(--primary-600)" : "var(--text-secondary)",
                fontWeight: location.state?.view === "dashboard" || (!location.state?.view && location.pathname === "/resident") ? 600 : 500,
                textDecoration: "none",
                transition: "all 0.2s"
              }}
            >
              <span>📊</span>
              Dashboard
            </Link>
            <Link 
              to="/my-reports" 
              className={`nav-item ${location.pathname === "/my-reports" ? "active" : ""}`}
            >
              <span className="icon">📋</span>
              My Reports
              <span className="badge" style={{ background: "#6366f1" }}>{myReports.length}</span>
            </Link>
            <Link 
              to="/profile" 
              className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`}
            >
              <span className="icon">👤</span>
              My Profile
            </Link>
            <Link 
              to="/resident/message" 
              className={`nav-item ${location.pathname === "/resident/message" ? "active" : ""}`}
            >
              <span className="icon">📩</span>
              Message Admin
            </Link>
          </div>

          <div className="nav-section" style={{ marginBottom: '24px' }}>
            <div className="nav-section-title" style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Emergency Hotlines</div>
            <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                { icon: "📞", name: "Emergency (Nationwide)", number: "911", color: "#dc2626" },
                { icon: "🚔", name: "PNP Hotline", number: "117", color: "#3b82f6" },
                { icon: "🔥", name: "Bureau of Fire", number: "160", color: "#f97316" },
                { icon: "🏥", name: "Red Cross", number: "143", color: "#ef4444" },
                { icon: "🚑", name: "Albuera MDRRMO", number: "(053) 323-2692", color: "#10b981" },
                { icon: "🏛️", name: "Municipal Hall", number: "(053) 323-2693", color: "#6366f1" },
                { icon: "⚕️", name: "Albuera RHU", number: "(053) 323-2694", color: "#14b8a6" },
              ].map((hotline) => (
                <a
                  key={hotline.name}
                  href={`tel:${hotline.number.replace(/[^0-9]/g, '')}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    background: "#fafafa",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s",
                    border: "1px solid #f3f4f6"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f0f9ff";
                    e.currentTarget.style.borderColor = "#bae6fd";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fafafa";
                    e.currentTarget.style.borderColor = "#f3f4f6";
                  }}
                >
                  <span style={{ fontSize: "1rem" }}>{hotline.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", lineHeight: "1.2" }}>{hotline.name}</div>
                    <div style={{ fontSize: "0.9375rem", fontWeight: "700", color: hotline.color }}>{hotline.number}</div>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>📞</span>
                </a>
              ))}
            </div>
          </div>
        </nav>

        <div className="sidebar-footer" style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
          <div className="nav-item" onClick={handleLogout} style={{ color: '#ef4444', padding: '12px 16px', borderRadius: '8px', background: '#fef2f2' }}>
            <span className="icon">🚪</span>
            Logout
          </div>
        </div>
      </aside>

      <main className="main-content" style={{ marginLeft: "300px", flex: 1 }}>
        <div className="main-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button 
              className="btn btn-secondary mobile-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ padding: "8px 12px", display: "none" }}
            >
              ☰
            </button>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>{location.pathname === "/profile" ? "👤 My Profile" : "🏠 Resident Dashboard"}</h1>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button onClick={fetchReports} className="btn btn-secondary" title="Refresh">
              🔄
            </button>
            <div style={{ position: "relative" }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn btn-secondary"
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{ 
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
                      {notif.type === "emergency" ? (
                        <div>
                          <div style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "4px", color: "#dc2626" }}>
                            🚨 {notif.title}
                          </div>
                          <div style={{ fontSize: "0.875rem", marginBottom: "4px" }}>{notif.message}</div>
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

export default ResidentLayout;
