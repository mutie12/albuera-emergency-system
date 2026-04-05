import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function Home() {
  const [reports, setReports] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublicReports();
    fetchNews();
  }, []);

  // Update loading state when both are done
  useEffect(() => {
    if (!reportsLoading && !newsLoading) {
      setLoading(false);
    }
  }, [reportsLoading, newsLoading]);

  const fetchPublicReports = async () => {
    try {
      const res = await api.get("/reports/public");
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Failed to load reports");
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await api.get("/news");
      setNews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load news", err);
      // Don't set error for news - it's optional
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "status-badge-pending";
      case "Responding": return "status-badge-responding";
      case "Resolved": return "status-badge-resolved";
      default: return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return "⏳";
      case "Responding": return "🚨";
      case "Resolved": return "✅";
      default: return "";
    }
  };

  const getEmergencyIcon = (type) => {
    switch (type) {
      case "Fire": return "🔥";
      case "Flood": return "🌊";
      case "Medical Emergency": return "🏥";
      case "Vehicular Accident": return "🚗";
      case "Crime/Violence": return "🚔";
      case "Natural Disaster": return "🌪️";
      case "Earthquake": return "🌍";
      case "Typhoon": return "🌀";
      case "Landslide": return "⛰️";
      default: return "⚠️";
    }
  };

  const getEmergencyColor = (type) => {
    switch (type) {
      case "Fire": return "#ef4444";
      case "Flood": return "#3b82f6";
      case "Medical Emergency": return "#10b981";
      case "Vehicular Accident": return "#f59e0b";
      case "Crime/Violence": return "#8b5cf6";
      case "Natural Disaster": return "#f97316";
      case "Earthquake": return "#78716c";
      case "Typhoon": return "#06b6d4";
      case "Landslide": return "#a16207";
      default: return "#6b7280";
    }
  };

  const pendingCount = reports.filter(r => r.status === "Pending").length;
  const respondingCount = reports.filter(r => r.status === "Responding").length;
  const resolvedCount = reports.filter(r => r.status === "Resolved").length;

  if (loading) {
    return (
      <div className="public-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="empty-state" style={{ boxShadow: "none", padding: "60px 40px" }}>
          <div className="loading-spinner"></div>
          <h3 style={{ marginTop: "24px" }}>Loading emergency updates...</h3>
          <p style={{ marginTop: "8px" }}>Please wait while we fetch the latest data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      {/* Header */}
      <header className="public-header">
        <div className="public-header-content">
          <div className="public-header-left">
            <span className="logo-icon">🚨</span>
            <div>
              <h1>Albuera Poblacion Emergency Portal</h1>
              <p className="subtitle">Real-time emergency updates for our community</p>
            </div>
          </div>
          <div className="public-header-right">
            <Link to="/login" className="btn btn-outline">
              🔐 Staff Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              📝 Register
            </Link>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="public-content">
        <div className="public-stats">
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-value">{reports.length}</span>
              <span className="stat-label">Total Reports</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-value" style={{ color: "#f59e0b" }}>{pendingCount}</span>
              <span className="stat-label">⏳ Pending</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-value" style={{ color: "#ef4444" }}>{respondingCount}</span>
              <span className="stat-label">🚨 Responding</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-content">
              <span className="stat-value" style={{ color: "#10b981" }}>{resolvedCount}</span>
              <span className="stat-label">✅ Resolved</span>
            </div>
          </div>
        </div>

        {/* Admin Announcements Section */}
        {news.length > 0 && (
          <div className="public-section">
            <h2>📢 Admin Announcements & News</h2>
            <div className="news-grid">
              {news.map((item) => (
                <div key={item._id} className="news-card animate-slide-up" style={{ animationDelay: `${news.indexOf(item) * 0.1}s` }}>
                  <div className="news-card-header">
                    <div className="news-category" data-category={item.category}>
                      {item.category === "announcement" && "📢"}
                      {item.category === "safety-tip" && "🛡️"}
                      {item.category === "update" && "🔄"}
                      {item.category === "alert" && "🚨"}
                      {item.category}
                    </div>
                    {item.priority === "high" && (
                      <span className="priority-badge high">🔥 High Priority</span>
                    )}
                  </div>
                  <h3 className="news-title">{item.title}</h3>
                  <p className="news-content">{item.content}</p>
                  <div className="news-meta">
                    <span className="meta-item">
                      <span className="icon">👤</span>
                      {item.author?.name || "Admin"}
                    </span>
                    <span className="meta-item">
                      <span className="icon">🕐</span>
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest Reports */}
        <div className="public-section">
          <h2>📋 Latest Emergency Reports</h2>
          
          {error && (
            <div className="error-message" style={{ marginBottom: "24px" }}>
              <span className="icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {reports.length === 0 ? (
            <div className="empty-state">
              <span className="icon">🛡️</span>
              <h3>No Emergency Reports</h3>
              <p>The community is safe at the moment. Stay vigilant and report any emergencies promptly.</p>
              <Link to="/register" className="btn btn-primary" style={{ marginTop: "16px" }}>
                Register to Report
              </Link>
            </div>
          ) : (
            <div className="reports-grid">
              {reports.map((report) => (
                <div key={report._id} className="report-card animate-slide-up" style={{ animationDelay: `${reports.indexOf(report) * 0.1}s` }}>
                  <div className="report-card-header">
                    <div className="emergency-info">
                      <div className="emergency-icon" style={{ background: `${getEmergencyColor(report.emergencyType)}20`, color: getEmergencyColor(report.emergencyType) }}>
                        {getEmergencyIcon(report.emergencyType)}
                      </div>
                      <div>
                        <span className="emergency-type">{report.emergencyType}</span>
                        <span className="emergency-location" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          📍 {report.location}
                        </span>
                      </div>
                    </div>
                    <span className={`status-badge ${getStatusClass(report.status)}`}>
                      {getStatusIcon(report.status)} {report.status}
                    </span>
                  </div>
                  <div className="report-card-body">
                    <p className="description">{report.description}</p>
                    <div className="report-card-meta">
                      <span className="meta-item">
                        <span className="icon">👤</span>
                        {report.reporterName || "Anonymous"}
                      </span>
                      <span className="meta-item">
                        <span className="icon">🕐</span>
                        {new Date(report.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="public-section" style={{ marginTop: "48px" }}>
          <h2>🚨 Are You A resident Of Albuera Poblacion? Register Na!</h2>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "20px" }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              🚨 Report Emergency
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="public-footer">
        <p>🚨 Albuera Poblacion Emergency Management System — Keeping our community safe</p>
        <p className="footer-note">
          For life-threatening emergencies, always dial 911 immediately.
        </p>
      </footer>
    </div>
  );
}

export default Home;
