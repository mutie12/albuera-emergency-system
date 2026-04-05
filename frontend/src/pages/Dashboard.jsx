import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import api from "../api";

function Dashboard(props) {
  const [reports, setReports] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [respondents, setRespondents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedRespondent, setSelectedRespondent] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [assigning, setAssigning] = useState(false);
  // Emergency alert state
  const [emergencyTitle, setEmergencyTitle] = useState("");
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [emergencyType, setEmergencyType] = useState("both"); // sms, email, both
  const [emergencyPriority, setEmergencyPriority] = useState("high");
  const [sendingEmergency, setSendingEmergency] = useState(false);
  // Create respondent state
  const [showCreateRespondentModal, setShowCreateRespondentModal] = useState(false);
  const [respondentName, setRespondentName] = useState("");
  const [respondentUsername, setRespondentUsername] = useState("");
  const [respondentPassword, setRespondentPassword] = useState("");
  const [respondentBarangay, setRespondentBarangay] = useState("");
  const [respondentEmail, setRespondentEmail] = useState("");
  const [respondentPhone, setRespondentPhone] = useState("");
  const [creatingRespondent, setCreatingRespondent] = useState(false);
  const [createdAccount, setCreatedAccount] = useState(null);
  // Create news state
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsCategory, setNewsCategory] = useState("announcement");
  const [newsPriority, setNewsPriority] = useState("normal");
  const [creatingNews, setCreatingNews] = useState(false);
  // Edit news state
  const [editingNewsId, setEditingNewsId] = useState(null);
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  // Get props from layout if passed
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const _userId = localStorage.getItem("userId");
  
  const {
    reports: layoutReports,
    fetchReports: layoutFetchReports,
    handleStatusUpdate: layoutHandleStatusUpdate,
    pendingReports: layoutPendingReports,
    myRespondingReports: layoutMyRespondingReports
  } = props;

  const useLayoutData = !!layoutReports;
  const reportsData = useLayoutData ? layoutReports : reports;
  const fetchReportsData = useLayoutData ? layoutFetchReports : null;
  const handleStatusUpdateData = useLayoutData ? layoutHandleStatusUpdate : null;
  const pendingReportsData = useLayoutData ? layoutPendingReports : null;
  const myRespondingReportsData = useLayoutData ? layoutMyRespondingReports : null;

   // Filter news based on search term (for residents and respondents)
  const filteredNews = role === "resident" || role === "respondent"
    ? news.filter(item =>
        !searchTerm ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : news;

  useEffect(() => {
    if (!useLayoutData) {
      fetchReports();
    } else {
      // When using layout-provided data, loading is managed by the layout
      setLoading(false);
    }
    if (role === "admin") {
      fetchRespondents();
      fetchNews();
    }
    if (role === "resident" || role === "respondent") {
      fetchNews();
    }
  }, [useLayoutData, role]);

  const fetchReports = async () => {
    try {
      const res = await api.get("/reports");
      setReports(res.data);
    } catch {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchRespondents = async () => {
    try {
      const res = await api.get("/auth/respondents");
      setRespondents(res.data);
    } catch (err) {
      console.error("Failed to fetch respondents:", err);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await api.get("/news");
      setNews(res.data);
    } catch (err) {
      console.error("Failed to fetch news:", err);
    }
  };

  const handleCreateNews = async () => {
    if (!newsTitle || !newsContent) {
      alert("Please enter news title and content");
      return;
    }

    setCreatingNews(true);
    try {
      if (editingNewsId) {
        // Update existing news
        await api.put(`/news/${editingNewsId}`, {
          title: newsTitle,
          content: newsContent,
          category: newsCategory,
          priority: newsPriority
        });
        alert("News updated successfully!");
      } else {
        // Create new news
        await api.post("/news", {
          title: newsTitle,
          content: newsContent,
          category: newsCategory,
          priority: newsPriority
        });
        alert("News published successfully!");
      }
      
      setShowNewsModal(false);
      setEditingNewsId(null);
      setNewsTitle("");
      setNewsContent("");
      setNewsCategory("announcement");
      setNewsPriority("normal");
      fetchNews();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save news");
    } finally {
      setCreatingNews(false);
    }
  };

  // Open news modal for editing
  const handleEditNews = (item) => {
    setEditingNewsId(item._id);
    setNewsTitle(item.title);
    setNewsContent(item.content);
    setNewsCategory(item.category || "announcement");
    setNewsPriority(item.priority || "normal");
    setShowNewsModal(true);
  };

  // Delete news
  const handleDeleteNews = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news item?")) {
      return;
    }
    
    try {
      await api.delete(`/news/${id}`);
      alert("News deleted successfully!");
      fetchNews();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete news");
    }
  };

  // Close news modal and reset
  const handleCloseNewsModal = () => {
    setShowNewsModal(false);
    setEditingNewsId(null);
    setNewsTitle("");
    setNewsContent("");
    setNewsCategory("announcement");
    setNewsPriority("normal");
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/reports/${id}/status`, { status });
      if (!useLayoutData) {
        fetchReports();
      } else {
        fetchReportsData();
      }
    } catch {
      alert("Failed to update status");
    }
  };

  const handleAssignRespondent = async () => {
    if (!selectedReport || !selectedRespondent) {
      alert("Please select a respondent");
      return;
    }

    setAssigning(true);
    try {
      const respondent = respondents.find(r => r._id === selectedRespondent);
      await api.patch(`/reports/${selectedReport._id}/assign`, {
        respondentId: selectedRespondent,
        respondentName: respondent?.name || "Respondent"
      });

      setShowAssignModal(false);
      setSelectedReport(null);
      setSelectedRespondent("");
      if (!useLayoutData) {
        fetchReports();
      } else {
        fetchReportsData();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign respondent");
    } finally {
      setAssigning(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageSubject || !messageBody) {
      alert("Please enter a subject and message");
      return;
    }

    setSendingMessage(true);
    try {
      if (isBroadcast) {
        // Broadcast to all respondents
        await api.post("/notifications/broadcast", {
          adminId: localStorage.getItem("userId"),
          adminName: name,
          subject: messageSubject,
          message: messageBody
        });
        alert(`Message sent to all ${respondents.length} respondents`);
      } else {
        // Send to specific respondent
        const respondent = respondents.find(r => r._id === selectedRespondent);
        await api.post("/notifications/message", {
          respondentId: selectedRespondent,
          respondentName: respondent?.name,
          adminId: localStorage.getItem("userId"),
          adminName: name,
          subject: messageSubject,
          message: messageBody
        });
        alert("Message sent successfully");
      }

      setShowMessageModal(false);
      setMessageSubject("");
      setMessageBody("");
      setSelectedRespondent("");
      setIsBroadcast(false);
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSendEmergencyAlert = async () => {
    if (!emergencyTitle || !emergencyMessage) {
      alert("Please enter alert title and message");
      return;
    }

    setSendingEmergency(true);
    try {
      const res = await api.post("/notifications/emergency-alert", {
        adminId: localStorage.getItem("userId"),
        adminName: name,
        alertType: emergencyType,
        title: emergencyTitle,
        message: emergencyMessage,
        priority: emergencyPriority
      });

      alert(`Emergency alert sent!\nIn-app notifications: ${res.data.inAppNotifications}\nSMS sent: ${res.data.sms?.sent || 0}\nEmail sent: ${res.data.email?.sent || 0}`);

      setShowEmergencyModal(false);
      setEmergencyTitle("");
      setEmergencyMessage("");
      setEmergencyType("both");
      setEmergencyPriority("high");
    } catch (err) {
      console.error("Failed to send emergency alert:", err);
      alert("Failed to send emergency alert");
    } finally {
      setSendingEmergency(false);
    }
  };

  const handleCreateRespondent = async () => {
    if (!respondentName || !respondentUsername || !respondentPassword || !respondentBarangay) {
      alert("Please fill in all required fields (Name, Username, Password, Barangay)");
      return;
    }

    setCreatingRespondent(true);
    try {
      const res = await api.post("/auth/create-respondent", {
        name: respondentName,
        username: respondentUsername,
        password: respondentPassword,
        barangay: respondentBarangay,
        email: respondentEmail,
        phone: respondentPhone
      });

      setCreatedAccount(res.data.user);
      setRespondentName("");
      setRespondentUsername("");
      setRespondentPassword("");
      setRespondentBarangay("");
      setRespondentEmail("");
      setRespondentPhone("");
      
      // Refresh respondents list
      fetchRespondents();
      
      alert("Respondent account created successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create respondent account");
    } finally {
      setCreatingRespondent(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "status-badge-pending";
      case "Responding": return "status-badge-responding";
      case "Resolved": return "status-badge-resolved";
      case "Declined": return "status-badge-declined";
      default: return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return "⏳";
      case "Responding": return "🚨";
      case "Resolved": return "✅";
      case "Declined": return "❌";
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
      default: return "#6b7280";
    }
  };

  // Filter reports based on location state (for admin)
  const filter = location.state?.filter;
  
  let filteredReports = reportsData;
  if (filter === "pending") {
    filteredReports = reportsData.filter(r => r.status === "Pending");
  } else if (filter === "responding") {
    filteredReports = reportsData.filter(r => r.status === "Responding");
  } else if (filter === "resolved") {
    filteredReports = reportsData.filter(r => r.status === "Resolved");
  }

  // Stats
  const pendingCount = reportsData.filter(r => r.status === "Pending").length;
  const respondingCount = reportsData.filter(r => r.status === "Responding").length;
  const resolvedCount = reportsData.filter(r => r.status === "Resolved").length;

  // Get the appropriate reports to display
  let displayReports = filteredReports;
  let showDashboardView = false;

  if (role === "resident") {
    showDashboardView = true;
    displayReports = [];
  } else if (role === "respondent") {
    if (location.state?.view === "responses") {
      displayReports = myRespondingReportsData || [];
    } else if (location.state?.view === "dashboard" || !location.state?.view) {
      showDashboardView = true;
      displayReports = [];
    } else {
      displayReports = pendingReportsData || reportsData.filter(r => r.status === "Pending");
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="main-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="empty-state" style={{ boxShadow: "none" }}>
          <div className="loading-spinner"></div>
          <h3 style={{ marginTop: "24px" }}>Loading dashboard...</h3>
        </div>
      </div>
    );
  }

  // Get page title based on role and view
  let pageTitle = "🚨 Emergency Dashboard";
  let pageSubtitle = "All emergency reports";

  if (role === "resident") {
    pageTitle = "🏠 Resident Dashboard";
    if (location.state?.view === "my-reports") {
      pageTitle = "📋 My Reports";
      pageSubtitle = "Emergency reports you have submitted";
    } else {
      pageTitle = "";
      pageSubtitle = "";
    }
  } else if (role === "respondent") {
    pageTitle = "🚑 Respondent Dashboard";
    if (location.state?.view === "responses") {
      pageTitle = "🔴 My Active Response";
      pageSubtitle = "Emergencies you are currently responding to";
    } else if (location.state?.view === "dashboard" || !location.state?.view) {
      pageTitle = "🚑 Respondent Dashboard";
      pageSubtitle = `Welcome back, ${name || "Respondent"}`;
    } else {
      pageTitle = "🚨 Queue";
      pageSubtitle = "Available emergency reports";
    }
  } else if (role === "admin") {
    if (filter === "pending") {
      pageSubtitle = "Pending emergency reports";
    } else if (filter === "responding") {
      pageSubtitle = "Reports currently being responded to";
    } else if (filter === "resolved") {
      pageSubtitle = "Resolved emergency reports";
    }
  }

  return (
    <div className="admin-page-container">
      {/* Modern Welcome Section */}
      {role === "admin" && (
        <div className="dashboard-welcome admin-welcome">
          <h2>🛡️ Welcome back, {name || "Admin"}!</h2>
          <p>Here's what's happening with emergencies in your community today.</p>
        </div>
      )}

      {(showDashboardView && role === "respondent") && (
        <div className="dashboard-welcome respondent-welcome">
          <h2>🚑 Welcome back, {name || "Respondent"}!</h2>
          <p>Ready to help? Check the queue for emergencies or view your active responses.</p>
        </div>
      )}

      {/* New Resident Dashboard Welcome */}
      {(showDashboardView && role === "resident") && (
        <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', padding: '48px 40px', borderRadius: '24px', marginBottom: '32px', width: '100%' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>🏠 Welcome to Your Community, {name || "Resident"}!</h2>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.95)', maxWidth: '600px' }}>Stay informed about emergencies in your community, report incidents, and connect with your neighbors.</p>
        </div>
      )}


      {/* Modern Stats Grid */}
      <div className="stats-grid-modern">
        <div className="stat-card-modern">
          <div className="stat-icon total">📊</div>
          <div className="stat-info">
            <h3>{reportsData.length}</h3>
            <p>Total Reports</p>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon pending">⏳</div>
          <div className="stat-info">
            <h3>{pendingCount}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon responding">🚨</div>
          <div className="stat-info">
            <h3>{respondingCount}</h3>
            <p>Responding</p>
          </div>
        </div>
        <div className="stat-card-modern">
          <div className="stat-icon resolved">✅</div>
          <div className="stat-info">
            <h3>{resolvedCount}</h3>
            <p>Resolved</p>
          </div>
        </div>
        {role === "admin" && (
          <div className="stat-card-modern">
            <div className="stat-icon respondent">👨‍🚒</div>
            <div className="stat-info">
              <h3>{respondents.length}</h3>
              <p>Respondents</p>
            </div>
          </div>
        )}
      </div>

      {/* Respondent Quick Actions */}
      {role === "respondent" && (
        <div className="quick-actions">
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>{pageTitle}</h1>
          <p style={{ color: "var(--text-tertiary)", marginTop: "4px" }}>{pageSubtitle}</p>
        </div>
      </div>

      {/* Admin News Management Section */}
      {role === "admin" && (
        <div style={{ marginBottom: "32px" }}>
          <div className="section-header">
            <h2>📰 Published News <span className="count-badge">{news.length}</span></h2>
          </div>
          {news.length === 0 ? (
            <div className="empty-state-enhanced">
              <div className="empty-icon">📰</div>
              <h3>No News Published</h3>
              <p>Create your first news update to inform residents and respondents.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "16px" }}>
              {news.map((item) => (
                <div 
                  key={item._id}
                  className={`news-card-enhanced ${item.priority}-priority`}
                >
                  <span className={`news-category ${item.category}`}>
                    {item.category === "announcement" ? "📢" : 
                     item.category === "safety-tip" ? "💡" : 
                     item.category === "alert" ? "🚨" : "📰"} 
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </span>
                  <h4>{item.title}</h4>
                  <p>{item.content.length > 150 ? item.content.substring(0, 150) + "..." : item.content}</p>
                  <div className="news-meta">
                    <span>{item.author?.name && <span>By {item.author.name}</span>}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      onClick={() => handleEditNews(item)}
                      className="btn btn-secondary"
                      style={{ padding: "8px 16px", fontSize: "0.875rem", background: "#f59e0b", color: 'white' }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNews(item._id)}
                      className="btn btn-secondary"
                      style={{ padding: "8px 16px", fontSize: "0.875rem", background: "#ef4444", color: 'white' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message" style={{ marginBottom: "24px" }}>
          <span className="icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Respondent Dashboard Welcome */}
      {(showDashboardView && role === "respondent") && (
        <div className="empty-state-enhanced">
          <div className="empty-icon">🚑</div>
          <h3>Ready to Respond?</h3>
          <p>Check the emergency queue for incidents or monitor your active responses.</p>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/respondent" className="btn btn-primary" style={{ background: '#059669' }} state={{ view: "queue" }}>
              🚨 Emergency Queue ({pendingCount} pending)
            </Link>
            <Link to="/respondent" className="btn btn-warning" state={{ view: "responses" }}>
              🔴 My Active Responses ({respondingCount})
            </Link>
          </div>
          
          {/* Quick Status */}
          {pendingCount > 0 && (
            <div className="alert-banner warning" style={{ maxWidth: '500px', marginTop: '20px' }}>
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <h4>{pendingCount} Emergency{pendingCount > 1 ? 's' : ''} Waiting</h4>
                <p>There {pendingCount > 1 ? 'are' : 'is'} {pendingCount} pending incident{pendingCount > 1 ? 's' : ''} that require{pendingCount === 1 ? 's' : ''} immediate attention.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resident Dashboard Welcome & Search */}
      {(showDashboardView && role === "resident") && (
        <div className="empty-state-enhanced">
          <div className="empty-icon">🏠</div>
          <h3>Your Community Dashboard</h3>
          <p>Stay informed about emergencies in your area and report incidents quickly.</p>
          
          {/* Enhanced Search Bar */}
          <div className="search-bar-enhanced" style={{ maxWidth: "500px", width: "100%" }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search news, updates, and community reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* News & Updates Section (for residents and respondents) */}
      {(role === "resident" || role === "respondent") && filteredNews.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <div className="section-header">
            <h2>📰 News & Updates <span className="count-badge">{filteredNews.length}</span></h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "16px" }}>
            {filteredNews.map((item) => (
              <div 
                key={item._id}
                className={`news-card-enhanced ${item.priority}-priority`}
              >
                <span className={`news-category ${item.category}`}>
                  {item.category === "announcement" ? "📢" : 
                   item.category === "safety-tip" ? "💡" : 
                   item.category === "alert" ? "🚨" : "📰"} 
                  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </span>
                <h4>{item.title}</h4>
                <p>{item.content.length > 120 ? item.content.substring(0, 120) + "..." : item.content}</p>
                <div className="news-meta">
                  <span>{item.author?.name && <span>By {item.author.name}</span>}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Reports Section (for residents) */}
      {role === "resident" && (
        <div style={{ marginBottom: "32px" }}>
          <div className="section-header">
            <h2>🚨 Community Emergency Reports <span className="count-badge">{filteredReports.length}</span></h2>
          </div>
          {filteredReports.length === 0 ? (
            <div className="empty-state-enhanced">
              <div className="empty-icon">🛡️</div>
              <h3>{searchTerm ? "No Results Found" : "No Emergency Reports"}</h3>
              <p>{searchTerm ? `No reports matching "${searchTerm}"` : "The community is safe at the moment."}</p>
            </div>
          ) : (
            <div className="reports-grid">
              {filteredReports.slice(0, 6).map((report, index) => (
                <div 
                  key={report._id} 
                  className="report-card-enhanced animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="card-header">
                    <div className="emergency-badge">
                      <div 
                        className={`type-icon ${report.emergencyType?.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {getEmergencyIcon(report.emergencyType)}
                      </div>
                      <div className="type-info">
                        <h4>{report.emergencyType}</h4>
                        <span>📍 {report.location}</span>
                      </div>
                    </div>
                    <span className={`status-chip ${report.status?.toLowerCase()}`}>
                      {getStatusIcon(report.status)} {report.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <p>{report.description}</p>
                    <div className="card-meta">
                      <span className="meta-tag">
                        <span>👤</span>
                        {report.name || "Anonymous"}
                      </span>
                      <span className="meta-tag">
                        <span>🕐</span>
                        {new Date(report.date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {filteredReports.length > 6 && (
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <p style={{ color: "var(--text-tertiary)", fontSize: "0.875rem" }}>
                Showing {Math.min(6, filteredReports.length)} of {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reports */}
      {!showDashboardView && (
        <>
          {(role === "respondent" || role === "admin") && (
            <div className="section-header" style={{ marginBottom: "24px" }}>
              <h2>
                {role === "respondent" && location.state?.view === "responses"
                  ? "🔴 My Active Response"
                  : role === "respondent"
                    ? "🚨 Emergency Queue"
                    : "🚨 Emergency Reports"}
                <span className="count-badge">{displayReports.length}</span>
              </h2>
            </div>
          )}
          {displayReports.length === 0 ? (
            <div className="empty-state">
              <span className="icon">🛡️</span>
              <h3>
                {role === "respondent" && location.state?.view === "responses" 
                  ? "No Active Responses" 
                  : role === "respondent" 
                    ? "No Emergency Reports" 
                    : "No Emergency Reports"}
              </h3>
              <p>
                {role === "respondent" && location.state?.view === "responses"
                  ? "You don't have any active responses at the moment."
                  : role === "respondent"
                    ? "No pending emergencies in the queue."
                    : "There are no emergency reports to display."}
              </p>
              {role === "respondent" && !location.state?.view && (
                <Link to="/respondent" className="btn btn-primary" style={{ marginTop: "16px" }} state={{ view: "responses" }}>
                  View My Active Responses
                </Link>
              )}
            </div>
          ) : (
            <div className="reports-grid">
              {displayReports.map((report, index) => (
                <div 
                  key={report._id} 
                  className="report-card animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="report-card-header">
                    <div className="emergency-info">
                      <div 
                        className="emergency-icon"
                        style={{ 
                          background: `${getEmergencyColor(report.emergencyType)}15`,
                          color: getEmergencyColor(report.emergencyType)
                        }}
                      >
                        {getEmergencyIcon(report.emergencyType)}
                      </div>
                      <div>
                        <span className="emergency-type">{report.emergencyType}</span>
                        <span className="emergency-location">
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
                        {report.name || "Anonymous"}
                      </span>
                      <span className="meta-item">
                        <span className="icon">🕐</span>
                        {new Date(report.date).toLocaleString()}
                      </span>
                      {report.assignedTo?.respondentName && (
                        <span className="meta-item">
                          <span className="icon">🚑</span>
                          Assigned: {report.assignedTo.respondentName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {(role === "admin" || role === "respondent") && report.status !== "Resolved" && (
                    <div className="report-card-footer action-buttons">
                      {role === "respondent" && report.status === "Pending" && (
                        <button
                          onClick={() => handleStatusUpdateData ? handleStatusUpdateData(report._id, "Responding", "accept") : handleStatusUpdate(report._id, "Responding", "accept")}
                          className="btn btn-warning"
                        >
                          🚨 Accept & Respond
                        </button>
                      )}
                      {role === "respondent" && report.status === "Pending" && (
                        <button
                          onClick={() => handleStatusUpdateData ? handleStatusUpdateData(report._id, "Declined", "decline") : handleStatusUpdate(report._id, "Declined", "decline")}
                          className="btn btn-danger"
                        >
                          ❌ Decline
                        </button>
                      )}
                      {role === "admin" && report.status === "Pending" && (
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowAssignModal(true);
                          }}
                          className="btn btn-primary"
                          style={{ background: "#0d9488" }}
                        >
                          📋 Assign Respondent
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusUpdate(report._id, "Resolved")}
                        className="btn btn-success"
                      >
                        ✅ Mark Resolved
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Assign Respondent Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h2>📋 Assign Respondent</h2>
              <button 
                onClick={() => setShowAssignModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: "16px", padding: "12px", background: "#fef3c7", borderRadius: "8px" }}>
                <strong>Emergency:</strong> {selectedReport?.emergencyType}<br />
                <strong>Location:</strong> {selectedReport?.location}
              </div>
              <div className="form-group">
                <label>Select Respondent</label>
                <select
                  value={selectedRespondent}
                  onChange={(e) => setSelectedRespondent(e.target.value)}
                  required
                >
                  <option value="">Choose a respondent...</option>
                  {respondents.map((respondent) => (
                    <option key={respondent._id} value={respondent._id}>
                      {respondent.name} {respondent.barangay ? `(${respondent.barangay})` : ""}
                    </option>
                  ))}
                </select>
                {respondents.length === 0 && (
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", marginTop: "8px" }}>
                    No respondents available. Please register respondents first.
                  </p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAssignModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={handleAssignRespondent} 
                className="btn btn-primary"
                disabled={!selectedRespondent || assigning}
                style={{ background: "#0d9488" }}
              >
                {assigning ? "Assigning..." : "📤 Send Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="modal-overlay" onClick={() => setShowMessageModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>{isBroadcast ? "📢 Broadcast Message" : "💬 Send Message"}</h2>
              <button 
                onClick={() => setShowMessageModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {isBroadcast ? (
                <div style={{ marginBottom: "16px", padding: "12px", background: "#dbeafe", borderRadius: "8px" }}>
                  <strong>Broadcast:</strong> This message will be sent to all {respondents.length} respondents.
                </div>
              ) : (
                <div className="form-group">
                  <label>Select Recipient</label>
                  <select
                    value={selectedRespondent}
                    onChange={(e) => setSelectedRespondent(e.target.value)}
                    required
                  >
                    <option value="">Choose a respondent...</option>
                    {respondents.map((respondent) => (
                      <option key={respondent._id} value={respondent._id}>
                        {respondent.name} {respondent.barangay ? `(${respondent.barangay})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Enter message subject"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Enter your message..."
                  rows={4}
                  style={{ 
                    width: "100%",
                    padding: "10px",
                    border: "1px solid var(--gray-300)",
                    borderRadius: "6px",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowMessageModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={handleSendMessage} 
                className="btn btn-primary"
                disabled={(!isBroadcast && !selectedRespondent) || !messageSubject || !messageBody || sendingMessage}
                style={{ background: "#6366f1" }}
              >
                {sendingMessage ? "Sending..." : (isBroadcast ? "📢 Broadcast" : "💬 Send Message")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* News Modal */}
      {showNewsModal && (
        <div className="modal-overlay" onClick={handleCloseNewsModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px" }}>
            <div className="modal-header" style={{ background: editingNewsId ? "#f59e0b" : "#8b5cf6", color: "white" }}>
              <h2>{editingNewsId ? "📝 Update News" : "📰 Create News & Updates"}</h2>
              <button 
                onClick={handleCloseNewsModal}
                style={{ background: "none", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: "16px", padding: "12px", background: "#f3e8ff", borderRadius: "8px" }}>
                <strong>{editingNewsId ? "Edit this news item" : "Publish news and updates"}</strong> that will be visible to all residents and respondents.
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newsCategory}
                  onChange={(e) => setNewsCategory(e.target.value)}
                >
                  <option value="announcement">📢 Announcement</option>
                  <option value="safety-tip">💡 Safety Tip</option>
                  <option value="update">🔄 Community Update</option>
                  <option value="alert">🚨 Alert</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newsPriority}
                  onChange={(e) => setNewsPriority(e.target.value)}
                >
                  <option value="low">🟢 Low - Regular update</option>
                  <option value="normal">🔵 Normal - Standard news</option>
                  <option value="high">🟠 High - Important announcement</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="Enter news title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  placeholder="Enter news content..."
                  rows={5}
                  style={{ 
                    width: "100%",
                    padding: "10px",
                    border: "1px solid var(--gray-300)",
                    borderRadius: "6px",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseNewsModal} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={handleCreateNews} 
                className="btn btn-primary"
                disabled={!newsTitle || !newsContent || creatingNews}
                style={{ background: editingNewsId ? "#f59e0b" : "#8b5cf6" }}
              >
                {creatingNews ? "Saving..." : editingNewsId ? "📝 Update News" : "📰 Publish News"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Alert Modal */}
      {showEmergencyModal && (
        <div className="modal-overlay" onClick={() => setShowEmergencyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "550px" }}>
            <div className="modal-header" style={{ background: "#dc2626", color: "white" }}>
              <h2>🚨 Send Emergency Alert</h2>
              <button 
                onClick={() => setShowEmergencyModal(false)}
                style={{ background: "none", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: "16px", padding: "12px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
                <strong style={{ color: "#dc2626" }}>⚠️ Warning:</strong> This will send an emergency alert to ALL residents and respondents via in-app notification, SMS, and email.
              </div>
              
              <div className="form-group">
                <label>Alert Type</label>
                <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="emergencyType"
                      value="sms"
                      checked={emergencyType === "sms"}
                      onChange={(e) => setEmergencyType(e.target.value)}
                    />
                    📱 SMS Only
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="emergencyType"
                      value="email"
                      checked={emergencyType === "email"}
                      onChange={(e) => setEmergencyType(e.target.value)}
                    />
                    📧 Email Only
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="emergencyType"
                      value="both"
                      checked={emergencyType === "both"}
                      onChange={(e) => setEmergencyType(e.target.value)}
                    />
                    🔔 Both
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label>Priority Level</label>
                <select
                  value={emergencyPriority}
                  onChange={(e) => setEmergencyPriority(e.target.value)}
                  style={{ marginTop: "4px" }}
                >
                  <option value="critical">🔴 Critical - Immediate action required</option>
                  <option value="high">🟠 High - Urgent attention needed</option>
                  <option value="medium">🟡 Medium - Advisory/warning</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Alert Title</label>
                <input
                  type="text"
                  value={emergencyTitle}
                  onChange={(e) => setEmergencyTitle(e.target.value)}
                  placeholder="e.g., Flash Flood Warning, Fire Alert"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Alert Message</label>
                <textarea
                  value={emergencyMessage}
                  onChange={(e) => setEmergencyMessage(e.target.value)}
                  placeholder="Enter the emergency alert message..."
                  rows={4}
                  style={{ 
                    width: "100%",
                    padding: "10px",
                    border: "1px solid var(--gray-300)",
                    borderRadius: "6px",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                  required
                />
              </div>
              
              <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)", marginTop: "8px" }}>
                This alert will be delivered to all registered users with phone numbers and email addresses.
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowEmergencyModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={handleSendEmergencyAlert} 
                className="btn btn-danger"
                disabled={!emergencyTitle || !emergencyMessage || sendingEmergency}
                style={{ background: "#dc2626" }}
              >
                {sendingEmergency ? "Sending..." : "🚨 Send Emergency Alert"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Respondent Modal */}
      {showCreateRespondentModal && (
        <div className="modal-overlay" onClick={() => setShowCreateRespondentModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
            <div className="modal-header" style={{ background: "#10b981", color: "white" }}>
              <h2>➕ Create Respondent Account</h2>
              <button 
                onClick={() => setShowCreateRespondentModal(false)}
                style={{ background: "none", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: "16px", padding: "12px", background: "#d1fae5", borderRadius: "8px" }}>
                <strong>Create a ready-to-use respondent account.</strong> Fill in the details below to create an account that can be used immediately.
              </div>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={respondentUsername}
                  onChange={(e) => setRespondentUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={respondentPassword}
                  onChange={(e) => setRespondentPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Barangay *</label>
                <input
                  type="text"
                  value={respondentBarangay}
                  onChange={(e) => setRespondentBarangay(e.target.value)}
                  placeholder="Enter barangay"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={respondentPhone}
                  onChange={(e) => setRespondentPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              
              {createdAccount && (
                <div style={{ marginTop: "16px", padding: "16px", background: "#fef3c7", borderRadius: "8px", border: "1px solid #f59e0b" }}>
                  <strong style={{ color: "#92400e" }}>✓ Account Created Successfully!</strong>
                  <div style={{ marginTop: "12px", fontSize: "0.875rem" }}>
                    <p><strong>Name:</strong> {createdAccount.name}</p>
                    <p><strong>Username:</strong> {createdAccount.username}</p>
                    <p><strong>Barangay:</strong> {createdAccount.barangay}</p>
                    {createdAccount.email && <p><strong>Email:</strong> {createdAccount.email}</p>}
                    {createdAccount.phone && <p><strong>Phone:</strong> {createdAccount.phone}</p>}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowCreateRespondentModal(false)} className="btn btn-secondary">
                Close
              </button>
              <button 
                onClick={handleCreateRespondent} 
                className="btn btn-success"
                disabled={!respondentName || !respondentUsername || !respondentPassword || !respondentBarangay || creatingRespondent}
                style={{ background: "#10b981" }}
              >
                {creatingRespondent ? "Creating..." : "✓ Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
