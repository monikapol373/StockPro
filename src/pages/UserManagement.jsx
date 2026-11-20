import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

const getToken = () => {
  try { return sessionStorage.getItem("stockpro:token") || null; } catch { return null; }
};

const ROLE_COLORS = {
  admin: "#ef4444",
  manager: "#f59e0b",
  staff: "#10b981",
};

const ROLE_LABELS = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
};

const UserManagement = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateUser = async (userId, changes) => {
    setUpdating(userId);
    try {
      const res = await fetch(`${API}/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(changes),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="um-wrap">
        <div className="um-denied">
          <h2>Access Denied</h2>
          <p>Only admins can manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="um-wrap">
      <div className="um-header">
        <h1>User Management</h1>
        <p>Manage roles and access for your team members.</p>
      </div>

      {error && <div className="um-error">{error}</div>}

      {loading ? (
        <div className="um-loading">Loading users...</div>
      ) : (
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className={!u.isActive ? "um-inactive" : ""}>
                  <td>
                    <div className="um-avatar">
                      <span className="um-av-circle">{u.name[0].toUpperCase()}</span>
                      <span>{u.name}</span>
                      {u.email === user?.email && <span className="um-you">You</span>}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="um-role" style={{ background: ROLE_COLORS[u.role] + "22", color: ROLE_COLORS[u.role] }}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td>
                    <span className={`um-status ${u.isActive ? "active" : "inactive"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    {u.email !== user?.email && (
                      <div className="um-actions">
                        <select
                          value={u.role}
                          disabled={updating === u._id}
                          onChange={(e) => updateUser(u._id, { role: e.target.value })}
                          className="um-select"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="staff">Staff</option>
                        </select>
                        <button
                          className={`um-btn ${u.isActive ? "deactivate" : "activate"}`}
                          disabled={updating === u._id}
                          onClick={() => updateUser(u._id, { isActive: !u.isActive })}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="um-legend">
        <h3>Role Permissions</h3>
        <div className="um-legend-grid">
          <div className="um-legend-item">
            <span className="um-role" style={{ background: "#ef444422", color: "#ef4444" }}>Admin</span>
            <p>Full access — manage users, all data, settings</p>
          </div>
          <div className="um-legend-item">
            <span className="um-role" style={{ background: "#f59e0b22", color: "#f59e0b" }}>Manager</span>
            <p>Can manage inventory, orders, suppliers, production, reports</p>
          </div>
          <div className="um-legend-item">
            <span className="um-role" style={{ background: "#10b98122", color: "#10b981" }}>Staff</span>
            <p>Read-only access - can view inventory and stock movements only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;