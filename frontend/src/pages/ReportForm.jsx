import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { submitReportOffline } from "../apiOffline";

function ReportForm() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [emergencyType, setEmergencyType] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const nameFromStorage = localStorage.getItem("name");
  const userInitial = nameFromStorage ? nameFromStorage.charAt(0).toUpperCase() : "U";

  const emergencyTypes = [
    "Fire",
    "Flood",
    "Earthquake",
    "Typhoon",
    "Landslide",
    "Medical Emergency",
    "Vehicular Accident",
    "Crime/Violence",
    "Other"
  ];

  const barangays = [
    "Poblacion", "Balugo", "Damula-an", "Antipolo", "Benolho",
    "Doña Maria (Kangkuirina)", "Mahayag", "Mahayahay", "Salvacion",
    "San Pedro", "Seguinon", "Sherwood", "Tabgas", "Talisayan", "Tinag-an"
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const fullLocation = location && subLocation
        ? `${location} - ${subLocation}`
        : location;
      const result = await submitReportOffline({ 
        name: name || nameFromStorage || "Anonymous",
        location: fullLocation, 
        emergencyType, 
        description 
      });
      
      if (result.offline) {
        // Report was saved offline
        setError(""); // Clear any error
        alert("Report saved offline! It will be submitted when you are back online.");
        navigate("/resident");
      } else {
        // Report was submitted successfully
        navigate("/resident");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      default: return "⚠️";
    }
  };

  const getEmergencyColor = (type) => {
    switch (type) {
      case "Fire": return "#ef4444";
      case "Flood": return "#3b82f6";
      case "Earthquake": return "#78716c";
      case "Typhoon": return "#06b6d4";
      case "Landslide": return "#a16207";
      case "Medical Emergency": return "#10b981";
      case "Vehicular Accident": return "#f59e0b";
      case "Crime/Violence": return "#8b5cf6";
      default: return "#6b7280";
    }
  };

  return (
    <div className="resident-layout" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🚨</span>
          </div>
          <div className="user-info">
            <div className="user-avatar">{userInitial}</div>
            <div>
              <div className="user-name">{nameFromStorage}</div>
              <div className="user-role">Resident</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Menu</div>
            <Link to="/resident" className="nav-item">
              <span className="icon">📋</span>
              Emergency List
            </Link>
            <div className="nav-item active">
              <span className="icon">📢</span>
              Report Emergency
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Quick Help</div>
            <div style={{ padding: "12px 16px", fontSize: "0.8125rem", color: "var(--text-tertiary)", lineHeight: "1.6" }}>
              <p style={{ marginBottom: "8px" }}>In case of life-threatening emergency, please also dial 911.</p>
              <p>Your report helps us respond faster to emergencies in your community.</p>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link to="/login" className="nav-item" style={{ color: "var(--accent-red)" }}>
            <span className="icon">🚪</span>
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <div className="main-header">
          <h1>🚨 Report Emergency</h1>
        </div>

        {/* Body */}
        <div className="main-body">
          <div className="report-form-card">
            <h1>Submit Emergency Report</h1>
            <p className="form-description">
              Please provide as much detail as possible to help us respond quickly and effectively.
            </p>

            {error && (
              <div className="error-message" style={{ marginBottom: "24px" }}>
                <span className="icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={nameFromStorage || "Your name (optional)"}
                />
                <p className="form-hint">Leave blank to report anonymously</p>
              </div>

              {/* Location */}
              <div className="form-group">
                <label>📍 Location <span className="required">*</span></label>
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
                <p className="form-hint">Select the barangay where the emergency occurred</p>
              </div>

              {barangaySubAreas[location] && (
                <div className="form-group">
                  <label>{location} Sub-Area</label>
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

              {/* Emergency Type */}
              <div className="form-group">
                <label>Emergency Type <span className="required">*</span></label>
                <div className="emergency-types-grid">
                  {emergencyTypes.map((type) => (
                    <div
                      key={type}
                      className={`emergency-type-option ${emergencyType === type ? "selected" : ""}`}
                      onClick={() => setEmergencyType(type)}
                    >
                      <span className="icon" style={{ color: getEmergencyColor(type) }}>{getEmergencyIcon(type)}</span>
                      <span className="label">{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description <span className="required">*</span></label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Describe the emergency situation. Include details like: number of people involved, severity, any immediate dangers, etc."
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  type="submit"
                  className="btn btn-danger btn-lg"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner" style={{ width: "20px", height: "20px", borderWidth: "2px", borderTopColor: "white" }}></span>
                      Submitting...
                    </>
                  ) : (
                    "🚨 Submit Emergency Report"
                  )}
                </button>
                <Link to="/resident" className="btn btn-secondary btn-lg" style={{ padding: "12px 24px" }}>
                  Cancel
                </Link>
              </div>
            </form>

            {/* Important Notice */}
            <div style={{ marginTop: "32px", padding: "16px", background: "#fef3c7", borderRadius: "10px", border: "1px solid #fde68a" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ fontSize: "1.25rem" }}>⚠️</span>
                <div>
                  <h4 style={{ fontSize: "0.9375rem", marginBottom: "4px" }}>Important</h4>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                    For immediate life-threatening emergencies, please also contact emergency services directly at 911.
                    This reporting system is for non-life-threatening emergencies and community awareness.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ReportForm;
