import { useState, useEffect } from "react";
import api from "../api";

function RespondentNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchNews = async () => {
    try {
      const res = await api.get("/news");
      setNews(res.data);
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredNews = news.filter(item =>
    !searchTerm ||
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryIcon = (category) => {
    switch (category) {
      case "alert": return "🚨";
      case "safety-tip": return "💡";
      case "update": return "🔄";
      default: return "📢";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "alert": return { bg: "#fee2e2", color: "#991b1b" };
      case "safety-tip": return { bg: "#d1fae5", color: "#065f46" };
      case "update": return { bg: "#fef3c7", color: "#92400e" };
      default: return { bg: "#dbeafe", color: "#1e40af" };
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "high": return { borderLeft: "4px solid #ef4444" };
      case "normal": return { borderLeft: "4px solid #3b82f6" };
      default: return { borderLeft: "4px solid #10b981" };
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div className="loading-spinner"></div>
          <h3 style={{ marginTop: "24px", color: "var(--text-secondary)" }}>Loading news...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 8px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "8px", color: "#1f2937" }}>
          📰 News & Updates
        </h1>
        <p style={{ color: "#6b7280" }}>
          Stay informed with the latest announcements and safety tips from the admin
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ position: "relative", maxWidth: "100%" }}>
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px 14px 48px",
              border: "1px solid #d1d5db",
              borderRadius: "10px",
              fontSize: "1rem",
              background: "white",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
            }}
          />
          <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "1.1rem" }}>
            🔍
          </span>
        </div>
      </div>

      {/* News List */}
      {filteredNews.length === 0 ? (
        <div className="empty-state">
          <span className="icon">📰</span>
          <h3>{searchTerm ? "No Results Found" : "No News Available"}</h3>
          <p>
            {searchTerm 
              ? `No news matching "${searchTerm}"`
              : "Check back later for updates from the admin"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filteredNews.map((item, index) => (
            <div
              key={item._id}
              className="report-card animate-slide-up"
              style={{
                ...getPriorityStyle(item.priority),
                animationDelay: `${index * 0.05}s`
              }}
            >
              <div className="report-card-body">
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start", 
                  marginBottom: "12px",
                  flexWrap: "wrap",
                  gap: "12px"
                }}>
                  <h3 style={{ 
                    fontSize: "1.125rem", 
                    fontWeight: "600",
                    color: "#1f2937",
                    flex: "1 1 200px"
                  }}>
                    {item.title}
                  </h3>
                  <span style={{ 
                    fontSize: "0.8125rem", 
                    padding: "20px 30px", 
                    borderRadius: "10px",
                    background: getCategoryColor(item.category).bg,
                    color: getCategoryColor(item.category).color,
                    fontWeight: "500",
                    whiteSpace: "nowrap"
                  }}>
                    {getCategoryIcon(item.category)} {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </span>
                </div>
                
                <p style={{ 
                  fontSize: "0.9375rem", 
                  color: "var(--text-secondary)", 
                  lineHeight: "1.7",
                  marginBottom: "16px"
                }}>
                  {item.content}
                </p>
                
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--gray-100)",
                  flexWrap: "wrap",
                  gap: "8px"
                }}>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    {item.author?.name && (
                      <span style={{ marginRight: "8px" }}>
                        👤 {item.author.name}
                      </span>
                    )}
                    <span>
                      🕐 {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  {item.priority === "high" && (
                    <span style={{ 
                      fontSize: "0.75rem", 
                      padding: "4px 8px", 
                      background: "#fef2f2", 
                      color: "#dc2626",
                      borderRadius: "4px",
                      fontWeight: "600"
                    }}>
                      ⚠️ Important
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <button onClick={fetchNews} className="btn btn-secondary">
          🔄 Refresh News
        </button>
      </div>
    </div>
  );
}

export default RespondentNews;
