import { useState } from "react";
import { Link } from "react-router-dom";

function MyReports({ myReports, myMessages }) {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Transform messages to match report structure for display
  const transformedMessages = myMessages?.map(msg => ({
    _id: msg._id,
    emergencyType: msg.type === "resident-emergency" ? (msg.emergencyType || "Emergency") : "Message to Admin",
    description: msg.message,
    location: null,
    date: msg.createdAt,
    status: "Sent",
    type: "message",
    subject: msg.title,
    isMessage: true
  })) || [];

  // Combine reports and messages
  const allItems = [
    ...(myReports || []).map(r => ({ ...r, isMessage: false })),
    ...transformedMessages
  ];

  const filteredItems = allItems
    .filter((item) => {
      const matchesFilter = 
        filter === "all" || 
        (item.isMessage ? filter === "sent" : item.status.toLowerCase() === filter.toLowerCase());
      const matchesSearch =
        !searchTerm ||
        (item.emergencyType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.location?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.subject || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const stats = {
    total: myReports?.length || 0,
    pending: myReports?.filter((r) => r.status === "Pending").length || 0,
    inProgress: myReports?.filter((r) => r.status === "In Progress").length || 0,
    resolved: myReports?.filter((r) => r.status === "Resolved").length || 0,
    messages: myMessages?.length || 0
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit", 
      minute: "2-digit"
    });
  };

  const getStatusConfig = (status, isMessage, itemType = null) => {
    if (isMessage) {
      // Check message type for icon
      if (itemType === "resident-emergency") {
        return { bg: "#fee2e2", color: "#991b1b", icon: "🚨", border: "#ef4444" };
      }
      return { bg: "#e0e7ff", color: "#3730a3", icon: "📩", border: "#6366f1" };
    }
    const configs = {
      Pending: { bg: "#fef3c7", color: "#92400e", icon: "⏳", border: "#f59e0b" },
      "In Progress": { bg: "#dbeafe", color: "#1e40af", icon: "🔄", border: "#3b82f6" },
      Resolved: { bg: "#dcfce7", color: "#166534", icon: "✅", border: "#22c55e" },
    };
    return configs[status] || configs.Pending;
  };

  const getTypeConfig = (type, isMessage) => {
    if (isMessage) {
      if (type === "Emergency" || type?.includes("Emergency")) {
        return { icon: "🚨", bg: "#fee2e2", color: "#991b1b" };
      }
      return { icon: "📩", bg: "#e0e7ff", color: "#3730a3" };
    }
    const configs = {
      Medical: { icon: "🚑", bg: "#fee2e2", color: "#991b1b" },
      Fire: { icon: "🔥", bg: "#ffedd5", color: "#c2410c" },
      Crime: { icon: "🚔", bg: "#ede9fe", color: "#5b21b6" },
      "Natural Disaster": { icon: "🌊", bg: "#e0e7ff", color: "#3730a3" },
      Accident: { icon: "💥", bg: "#fce7f3", color: "#9d174d" },
      Other: { icon: "⚠️", bg: "#f3f4f6", color: "#4b5563" },
    };
    return configs[type] || configs.Other;
  };

  return (
    <div className="dashboard-content" style={{ padding: "0" }}>
      {/* Page Header */}
      <div
        style={{
          marginBottom: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "#111827",
              marginBottom: "4px",
            }}
          >
            📋 My Reports & Messages
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
            Track and manage your submitted emergency reports and messages to admin
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div
          className="stat-card"
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            📊
          </div>
          <div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              {stats.total}
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginTop: "2px",
              }}
            >
              Total Reports
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#fef3c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            ⏳
          </div>
          <div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "#92400e",
              }}
            >
              {stats.pending}
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginTop: "2px",
              }}
            >
              Pending
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            🔄
          </div>
          <div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "#1e40af",
              }}
            >
              {stats.inProgress}
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginTop: "2px",
              }}
            >
              In Progress
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            ✅
          </div>
          <div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "#166534",
              }}
            >
              {stats.resolved}
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginTop: "2px",
              }}
            >
              Resolved
            </div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "#e0e7ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            📩
          </div>
          <div>
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: "700",
                color: "#3730a3",
              }}
            >
              {stats.messages}
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginTop: "2px",
              }}
            >
              Messages Sent
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search & Tabs */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {/* Search */}
          <div style={{ flex: "1", minWidth: "200px", position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search reports and messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "0.95rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { key: "all", label: "All", color: "#6b7280" },
              { key: "pending", label: "Pending", color: "#f59e0b" },
              { key: "in progress", label: "In Progress", color: "#3b82f6" },
              { key: "resolved", label: "Resolved", color: "#22c55e" },
              { key: "sent", label: "Sent Messages", color: "#6366f1" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  background: filter === tab.key ? tab.color : "transparent",
                  color: filter === tab.key ? "white" : "#6b7280",
                  fontWeight: "500",
                  fontSize: "0.875rem",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports & Messages List */}
      {filteredItems.length === 0 ? (
        <div
          className="empty-state"
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "60px 40px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>📋</div>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            {searchTerm ? "No Results Found" : "No Reports or Messages Yet"}
          </h3>
          <p
            style={{
              color: "#6b7280",
              marginBottom: "24px",
              maxWidth: "100%",
              margin: "0 auto 24px",
            }}
          >
            {searchTerm
              ? `No items matching "${searchTerm}" were found.`
              : "You haven't submitted any emergency reports or messages to the admin yet. When you do, they will appear here."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredItems.map((item) => {
            const statusConfig = getStatusConfig(item.status, item.isMessage, item.type);
            const typeConfig = getTypeConfig(item.emergencyType, item.isMessage);
            return (
              <div
                key={item._id}
                className="report-card"
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.2s",
                  borderLeft: item.isMessage ? "4px solid #6366f1" : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background: typeConfig.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.25rem",
                      }}
                    >
                      {typeConfig.icon}
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: "2px",
                        }}
                      >
                        {item.isMessage ? (item.subject || "Message to Admin") : item.emergencyType}
                      </h4>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: "#6b7280",
                        }}
                      >
                        {item.isMessage ? "Message to Admin" : `${item.type} Emergency`}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 14px",
                      background: statusConfig.bg,
                      color: statusConfig.color,
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                    }}
                  >
                    <span>{statusConfig.icon}</span>
                    {item.isMessage ? "Sent" : item.status}
                  </div>
                </div>

                <p
                  style={{
                    color: "#374151",
                    lineHeight: "1.6",
                    marginBottom: "16px",
                    fontSize: "0.95rem",
                  }}
                >
                  {item.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "24px",
                    flexWrap: "wrap",
                    paddingTop: "16px",
                    borderTop: "1px solid #f3f4f6",
                  }}
                >
                  {item.location && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "#6b7280" }}>📍</span>
                      <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                        {item.location || "Location not specified"}
                      </span>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "#6b7280" }}>🕐</span>
                    <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                      {formatDate(item.date)}
                    </span>
                  </div>
                  {item.isMessage && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        background: "#e0e7ff",
                        borderRadius: "8px",
                      }}
                    >
                      <span style={{ color: "#3730a3" }}>📩</span>
                      <span style={{ fontSize: "0.875rem", color: "#3730a3" }}>
                        Sent to Admin
                      </span>
                    </div>
                  )}
                  {!item.isMessage && item.respondentName && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        background: "#f0fdf4",
                        borderRadius: "8px",
                      }}
                    >
                      <span style={{ color: "#166534" }}>👤</span>
                      <span style={{ fontSize: "0.875rem", color: "#166534" }}>
                        Assigned to <strong>{item.respondentName}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {item.status === "Resolved" && item.resolution && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px 16px",
                      background: "#f0fdf4",
                      borderRadius: "8px",
                      borderLeft: "4px solid #22c55e",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        color: "#166534",
                        marginBottom: "4px",
                      }}
                    >
                      Resolution:
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#374151" }}>
                      {item.resolution}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyReports;
