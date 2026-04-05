import { useState, useEffect, useCallback } from "react";
import api from "../api";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [pendingResidents, setPendingResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyData, setVerifyData] = useState({ username: "", verificationCode: "" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    barangay: "",
    role: "resident"
  });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get(`/auth/users?role=${filter === "all" ? "" : filter}`);
      setUsers(res.data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchPendingResidents = useCallback(async () => {
    try {
      const res = await api.get("/auth/pending-residents");
      setPendingResidents(res.data);
    } catch {
      console.error("Failed to fetch pending residents");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchPendingResidents();
  }, [fetchUsers, fetchPendingResidents]);

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email || "",
      phone: user.phone || "",
      barangay: user.barangay || "",
      role: user.role
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/auth/users/${userId}`);
        fetchUsers();
        fetchPendingResidents();
      } catch {
        alert("Failed to delete user");
      }
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.post(`/auth/approve-resident/${userId}`);
      fetchUsers();
      fetchPendingResidents();
      alert("Resident approved successfully!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to approve resident";
      alert(errorMessage);
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm("Are you sure you want to reject this resident?")) {
      try {
        await api.post(`/auth/reject-resident/${userId}`);
        fetchUsers();
        fetchPendingResidents();
        alert("Resident rejected.");
      } catch {
        alert("Failed to reject resident");
      }
    }
  };

  const handleSendVerification = async (userId) => {
    try {
      const res = await api.post(`/auth/send-verification/${userId}`);
      alert(`Verification code sent to ${res.data.email}!`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send verification code");
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/verify-resident", verifyData);
      alert("Resident verified and approved successfully!");
      setShowVerifyModal(false);
      setVerifyData({ username: "", verificationCode: "" });
      fetchUsers();
      fetchPendingResidents();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Verification failed. Please check the username and code.";
      alert(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/auth/users/${editingUser._id}`, formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: "", email: "", phone: "", barangay: "", role: "resident" });
      fetchUsers();
    } catch {
      alert("Failed to save user");
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: { bg: "#dbeafe", text: "#1e40af", icon: "🛡️" },
      respondent: { bg: "#d1fae5", text: "#065f46", icon: "🚑" },
      resident: { bg: "#f3f4f6", text: "#374151", icon: "👤" }
    };
    const style = colors[role] || colors.resident;
    return (
      <span style={{ 
        display: "inline-flex", 
        alignItems: "center", 
        gap: "4px",
        padding: "4px 10px", 
        borderRadius: "20px", 
        fontSize: "0.75rem", 
        fontWeight: "600",
        background: style.bg,
        color: style.text
      }}>
        {style.icon} {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: "#fef3c7", text: "#92400e", icon: "⏳" },
      approved: { bg: "#d1fae5", text: "#065f46", icon: "✅" },
      rejected: { bg: "#fee2e2", text: "#991b1b", icon: "❌" }
    };
    const style = styles[status] || styles.pending;
    return (
      <span style={{ 
        display: "inline-flex", 
        alignItems: "center", 
        gap: "4px",
        padding: "4px 10px", 
        borderRadius: "20px", 
        fontSize: "0.75rem", 
        fontWeight: "600",
        background: style.bg,
        color: style.text
      }}>
        {style.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="page-header">
        <h1>👥 User Management</h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            onClick={() => setShowVerifyModal(true)}
            className="btn btn-outline"
          >
            🔐 Verify with Code
          </button>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ 
              padding: "10px 16px", 
              borderRadius: "8px", 
              border: "2px solid var(--gray-200)",
              fontSize: "0.875rem"
            }}
          >
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="respondent">Respondents</option>
            <option value="resident">Residents</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-message" style={{ marginBottom: "24px" }}>
          <span className="icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Pending Residents Section */}
      {pendingResidents.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <div style={{ 
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "16px"
          }}>
            <h2 style={{ fontSize: "1.125rem", marginBottom: "12px", color: "#92400e" }}>
              ⏳ Pending Approvals ({pendingResidents.length})
            </h2>
            <p style={{ fontSize: "0.875rem", color: "#78350f", marginBottom: "16px" }}>
              These residents have registered and are waiting for approval. Review their information and approve or reject them.
            </p>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            {pendingResidents.map((user) => (
              <div key={user._id} style={{ 
                background: "white", 
                borderRadius: "12px", 
                padding: "20px",
                boxShadow: "var(--shadow-sm)",
                border: "1px solid var(--gray-200)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ 
                      width: "56px", 
                      height: "56px", 
                      borderRadius: "50%", 
                      background: "var(--primary-100)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "700",
                      fontSize: "1.25rem",
                      color: "var(--primary-700)"
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "1.125rem", color: "var(--text-primary)" }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--text-tertiary)", marginTop: "4px" }}>
                        @{user.username}
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                        <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                          📍 {user.barangay}
                        </span>
                        {user.phone && (
                          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                            📞 {user.phone}
                          </span>
                        )}
                        {user.email && (
                          <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                            ✉️ {user.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {user.email ? (
                      <button 
                        onClick={() => handleSendVerification(user._id)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: "0.8125rem" }}
                      >
                        📧 Send Code
                      </button>
                    ) : (
                      <span style={{ 
                        fontSize: "0.75rem", 
                        color: "var(--text-tertiary)",
                        padding: "6px 12px"
                      }}>
                        No email
                      </span>
                    )}
                    <button 
                      onClick={() => handleApprove(user._id)}
                      className="btn btn-success btn-sm"
                    >
                      ✅ Approve
                    </button>
                    <button 
                      onClick={() => handleReject(user._id)}
                      className="btn btn-sm"
                      style={{ background: "#fee2e2", color: "#991b1b" }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
                {user.verificationCode && (
                  <div style={{ 
                    marginTop: "16px", 
                    padding: "12px", 
                    background: "var(--gray-50)", 
                    borderRadius: "8px",
                    fontSize: "0.8125rem",
                    color: "var(--text-secondary)"
                  }}>
                    <strong>Verification Code:</strong> {user.verificationCode}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Users Table */}
      <div style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "var(--gray-50)" }}>
            <tr>
              <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "600", color: "var(--text-secondary)", fontSize: "0.8125rem" }}>User</th>
              <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "600", color: "var(--text-secondary)", fontSize: "0.8125rem" }}>Contact</th>
              <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "600", color: "var(--text-secondary)", fontSize: "0.8125rem" }}>Barangay</th>
              <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "600", color: "var(--text-secondary)", fontSize: "0.8125rem" }}>Role</th>
              <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: "600", color: "var(--text-secondary)", fontSize: "0.8125rem" }}>Status</th>
              <th style={{ padding: "16px 20px", textAlign: "right", fontWeight: "600", color: "var(--text-secondary)", fontSize: "0.8125rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} style={{ borderTop: "1px solid var(--gray-100)" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ 
                        width: "40px", 
                        height: "40px", 
                        borderRadius: "50%", 
                        background: "var(--primary-100)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                        color: "var(--primary-700)"
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>{user.name}</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>@{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                      {user.email || "-"}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-tertiary)" }}>
                      {user.phone || "-"}
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    {user.barangay || "-"}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    {getRoleBadge(user.role)}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    {user.role === "resident" ? getStatusBadge(user.status) : (
                      <span style={{ 
                        display: "inline-flex", 
                        alignItems: "center", 
                        gap: "4px",
                        padding: "4px 10px", 
                        borderRadius: "20px", 
                        fontSize: "0.75rem", 
                        fontWeight: "600",
                        background: "#d1fae5",
                        color: "#065f46"
                      }}>
                        ✅ Active
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button 
                        onClick={() => handleEdit(user)}
                        className="btn btn-secondary btn-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="btn btn-sm"
                        style={{ background: "#fee2e2", color: "#991b1b" }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Barangay</label>
                  <input
                    type="text"
                    value={formData.barangay}
                    onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                    placeholder="Barangay"
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="resident">Resident</option>
                    <option value="respondent">Respondent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && (
        <div className="modal-overlay" onClick={() => setShowVerifyModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <div className="modal-header" style={{ background: "var(--primary-600)", color: "white" }}>
              <h2>🔐 Verify Resident with Code</h2>
              <button 
                onClick={() => setShowVerifyModal(false)}
                style={{ background: "none", border: "none", color: "white", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleVerifySubmit}>
              <div className="modal-body">
                <p style={{ marginBottom: "16px", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  Enter the resident's username and verification code to approve their registration.
                </p>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={verifyData.username}
                    onChange={(e) => setVerifyData({ ...verifyData, username: e.target.value })}
                    required
                    placeholder="Enter resident's username"
                  />
                </div>
                <div className="form-group">
                  <label>Verification Code</label>
                  <input
                    type="text"
                    value={verifyData.verificationCode}
                    onChange={(e) => setVerifyData({ ...verifyData, verificationCode: e.target.value })}
                    required
                    placeholder="Enter verification code"
                    style={{ fontSize: "1.25rem", letterSpacing: "4px", textTransform: "uppercase" }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowVerifyModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Verify & Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
