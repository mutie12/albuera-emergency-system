import { useState, useEffect } from "react";
import api from "../api";
import { Link } from "react-router-dom";

function SendMessage() {
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

  const [formData, setFormData] = useState({
    recipientId: "",
    recipientName: "",
    title: "",
    message: "",
    barangay: "",
    subLocation: ""
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      // Filter out admins to prevent sending to self
      const nonAdmins = res.data.filter(u => u.role !== "admin");
      setUsers(nonAdmins);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "recipientId") {
      const selectedUser = users.find(u => u._id === value);
      setFormData({
        ...formData,
        recipientId: value,
        recipientName: selectedUser ? selectedUser.name : ""
      });
    } else if (name === "barangay") {
      setFormData({ ...formData, barangay: value, subLocation: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const fullLocation = formData.barangay && formData.subLocation
        ? `${formData.barangay} - ${formData.subLocation}`
        : formData.barangay;
      const fullMessage = `📍 Location: ${fullLocation}\n\n📝 Message: ${formData.message}`;
      await api.post("/notifications/send", {
        recipientId: formData.recipientId,
        recipientName: formData.recipientName,
        title: formData.title,
        message: fullMessage
      });

      setSuccess("✅ Message sent successfully!");
      setFormData({ recipientId: "", recipientName: "", title: "", message: "", barangay: "", subLocation: "" });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div style={{ background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, color: "#1f2937" }}>📤 Send Message</h2>
          <Link to="/resident-messages" style={{ textDecoration: "none", color: "#6366f1", fontSize: "0.875rem" }}>
            ← Back to Messages
          </Link>
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Select Recipient *
            </label>
            <select
              name="recipientId"
              value={formData.recipientId}
              onChange={handleChange}
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
              <option value="">-- Select a user --</option>
              <optgroup label="Respondents">
                {users.filter(u => u.role === "respondent").map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} {user.station ? `(${user.station})` : ""}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Residents">
                {users.filter(u => u.role === "resident").map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Subject/Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem"
              }}
              placeholder="Enter message subject"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              📍 Location (Barangay) *
            </label>
            <select
              name="barangay"
              value={formData.barangay}
              onChange={handleChange}
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
              {barangays.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {barangaySubAreas[formData.barangay] && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
                {formData.barangay} Sub-Area
              </label>
              <select
                name="subLocation"
                value={formData.subLocation}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem",
                  backgroundColor: "white"
                }}
              >
                <option value="">All {formData.barangay}</option>
                {barangaySubAreas[formData.barangay].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem",
                resize: "vertical",
                fontFamily: "inherit"
              }}
              placeholder="Enter your message here..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px 24px",
              background: loading ? "#9ca3af" : "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%"
            }}
          >
            {loading ? "Sending..." : "📤 Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SendMessage;
