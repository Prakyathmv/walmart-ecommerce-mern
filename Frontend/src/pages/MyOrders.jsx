import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axiosInstance from '../utils/axiosConfig';
import './MyOrders.css';

const ORDERS_PER_PAGE = 5;

// Helpers
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const statusClass = (status) => {
  const map = {
    Placed: 'status-placed',
    Processing: 'status-processing',
    'Out for Delivery': 'status-out-for-delivery',
    Delivered: 'status-delivered',
    Cancelled: 'status-cancelled',
  };
  return map[status] || 'status-placed';
};

const MyOrders = () => {
  const { user } = useAuth();
  const { reorderItems } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axiosInstance.get('/api/orders/myorders');
        if (res.data.success) {
          setOrders(res.data.data.orders);
        } else {
          setError(res.data.error?.message || 'Failed to load orders.');
        }
      } catch (err) {
        setError(
          err.response?.data?.error?.message ||
            'Failed to load orders. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Search
  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      o._id.toLowerCase().includes(q) ||
      o.items.some((i) => i.name.toLowerCase().includes(q))
    );
  });

  useEffect(() => setPage(1), [search]);

  const totalPages = Math.ceil(filtered.length / ORDERS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ORDERS_PER_PAGE,
    page * ORDERS_PER_PAGE
  );

  // Reorder
  const handleReorder = (items) => {
    reorderItems(items);
    showToast(`${items.length} item(s) added to cart!`);
    setTimeout(() => navigate('/cart'), 800);
  };

  return (
    <div className="my-orders-page">
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}

      <div className="my-orders-container">
        {/* Header */}
        <div className="my-orders-header">
          <h1>
            My <span>Orders</span>
          </h1>

          {!loading && orders.length > 0 && (
            <div className="my-orders-search-wrap">
              <FiSearch />
              <input
                type="text"
                placeholder="Search by order ID or product…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && <p>Loading orders...</p>}

        {/* Error */}
        {!loading && error && <div className="error-box">{error}</div>}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className="my-orders-empty">
            <FiShoppingBag size={50} />
            <h2>No orders found</h2>
            <Link to="/">Start Shopping</Link>
          </div>
        )}

        {/* TABLE */}
        {!loading && !error && paginated.length > 0 && (
          <>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((order) =>
                  order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>#{order._id.slice(-6)}</td>
                      <td>{formatDate(order.createdAt)}</td>

                      <td className="product-cell">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="product-img"
                        />
                        {item.name}
                      </td>

                      <td>{item.quantity}</td>
                      <td>${item.price.toFixed(2)}</td>

                      <td>
                        <span
                          className={`status-badge ${statusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="btn-reorder"
                          onClick={() => handleReorder(order.items)}
                        >
                          🔄 Reorder
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  ← Prev
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyOrders;