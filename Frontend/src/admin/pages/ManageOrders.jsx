import React, { useState, useEffect } from "react";
import "./ManageOrders.css";
import API_BASE from "../../utils/api";

const STATUSES = ["Placed", "Processing", "Out for Delivery", "Delivered", "Cancelled"];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      
      const response = await fetch(`${API_BASE}/api/orders`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const startEdit = (order) => {
    setEditingId(order._id);
    setEditData({ ...order });
  };

  const saveEdit = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          
        },
        body: JSON.stringify({ status: editData.status })
      });
      const data = await response.json();
      if (data.success) {
        
        const updated = orders.map((o) => (o._id === id ? data.data.order : o));
        setOrders(updated);
        setEditingId(null);
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error saving edit:", error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const response = await fetch(`${API_BASE}/api/orders/${id}`, {
        method: "DELETE",
        
      });
      const data = await response.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o._id !== id));
      } else {
        alert("Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  return (
    <div className="manage-orders-container">
      <h2>Manage Orders</h2>

      {orders.length === 0 && <p>No orders found.</p>}

      {orders.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) =>
              editingId === order._id ? (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.shippingAddress?.fullName}</td>
                  <td>{order.shippingAddress?.phoneNumber}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <ul className="order-items-list">
                      {order.items?.map((item, idx) => (
                        <li key={idx}>
                          {item.name} <strong>(x{item.quantity})</strong>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>${Number(order.totalPrice).toFixed(2)}</td>
                  <td>
                    <select
                      value={editData.status || ""}
                      onChange={(e) =>
                         setEditData({ ...editData, status: e.target.value })
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => saveEdit(order._id)}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.shippingAddress?.fullName}</td>
                  <td>{order.shippingAddress?.phoneNumber}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <ul className="order-items-list">
                      {order.items?.map((item, idx) => (
                        <li key={idx}>
                          {item.name} <strong>(x{item.quantity})</strong>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>${Number(order.totalPrice).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${(order.status || "").toLowerCase().replace(/ /g, '-')}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => startEdit(order)}>Edit</button>
                    <button onClick={() => deleteOrder(order._id)}>Delete</button>
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