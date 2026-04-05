import { useState } from "react";
import api from "../api";

function CreateNews() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "update"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await api.post("/news", formData);
      setMessage("✅ News created successfully!");
      setFormData({ title: "", content: "", category: "update" });
      
      // Auto-hide success message
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to create news:", err);
      setMessage(err.response?.data?.message || "❌ Failed to create news");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div style={{ background: "white", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: "24px", color: "#1f2937" }}>📰 Create News</h2>
        
        {message && (
          <div style={{ 
            padding: "12px 16px", 
            borderRadius: "8px", 
            marginBottom: "20px",
            background: message.includes("✅") ? "#d1fae5" : "#fee2e2",
            color: message.includes("✅") ? "#065f46" : "#991b1b"
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Category
            </label>
            <select
              name="category"
              value={formData.category}
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
              <option value="update">🔄 Community Update</option>
              <option value="alert">🚨 Alert</option>
              <option value="safety-tip">💡 Safety Tip</option>
              <option value="announcement">📢 Announcement</option>
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Title *
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
              placeholder="Enter news title"
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={8}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "1rem",
                resize: "vertical",
                fontFamily: "inherit"
              }}
              placeholder="Enter news content..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px 24px",
              background: loading ? "#9ca3af" : "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%"
            }}
          >
            {loading ? "Creating..." : "📰 Create News"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateNews;
