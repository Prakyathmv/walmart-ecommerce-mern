import React, { useState, useEffect } from "react";
import "./ManageUsers.css";
import API_BASE from "../../utils/api";

const ROLES = ["user", "admin"];
const STATUSES = ["Active", "Inactive"];

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      } else {
        throw new Error(data.error?.message || "Failed to load users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Could not load users. The users API may not be available.");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditData({ ...user });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE}/api/auth/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editData.name,
          role: editData.role,
        }),
      });

      if (!response.ok) {
        alert("Failed to update user");
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? data.data.user : u))
        );
        setEditingId(null);
      } else {
        alert(data.error?.message || "Failed to update user");
      }
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Error updating user");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${API_BASE}/api/auth/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        alert("Failed to delete user");
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert(data.error?.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user");
    }
  };

  return (
    <div className="manage-users-container">
      <h2>Manage Users</h2>

      {loading && <p>Loading users...</p>}

      {error && (
        <div className="error-box">
          <p>{error}</p>
          <button onClick={fetchUsers}>Retry</button>
        </div>
      )}

      {!loading && !error && users.length === 0 && (
        <p>No users found.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) =>
              editingId === user.id ? (
                <tr key={user.id}>
                  <td>
                    <input
                      value={editData.name || ""}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                    />
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={editData.role || "user"}
                      onChange={(e) =>
                        setEditData({ ...editData, role: e.target.value })
                      }
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => saveEdit(user.id)}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={user.id}>
                  <td>{user.name || "—"}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button onClick={() => startEdit(user)}>Edit</button>
                    <button onClick={() => deleteUser(user.id)}>Delete</button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}