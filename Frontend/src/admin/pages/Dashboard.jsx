import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./Dashboard.css";

export default function Dashboard({ setActivePage }) {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = { Authorization: `Bearer ${token}` };

        
        const [prodRes, ordRes, userRes] = await Promise.all([
          fetch("http://localhost:3000/api/products"), 
          fetch("http://localhost:3000/api/orders", { headers }),
          fetch("http://localhost:3000/api/auth/users", { headers }),
        ]);

        const [prodData, ordData, userData] = await Promise.all([
          prodRes.json(),
          ordRes.json(),
          userRes.json(),
        ]);

        let productsCount = 0;
        let ordersCount = 0;
        let usersCount = 0;
        let totalRevenue = 0;
        
        
        let recentOrdersData = [];
        let chartDataArr = [];

        if (prodData.success) {
          productsCount = prodData.data.products?.length || 0;
        }

        if (ordData.success) {
          const orders = ordData.data.orders || [];
          ordersCount = orders.length;
          totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);
          
          
          const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          recentOrdersData = sortedOrders.slice(0, 5); 

          
          const last7Days = Array.from({length: 7}).map((_, i) => {
             const d = new Date();
             d.setDate(d.getDate() - i);
             return { 
                 dateString: d.toISOString().split('T')[0], 
                 revenue: 0, 
                 display: d.toLocaleDateString('en-US', {weekday: 'short'}) 
             };
          }).reverse();

          
          orders.forEach(o => {
             const dateVal = o.createdAt ? new Date(o.createdAt) : new Date();
             const dStr = dateVal.toISOString().split('T')[0];
             const dayObj = last7Days.find(day => day.dateString === dStr);
             if (dayObj) {
                dayObj.revenue += (Number(o.totalPrice) || 0);
             }
          });
          chartDataArr = last7Days;
        }

        if (userData.success) {
          usersCount = userData.data.users?.length || 0;
        }

        setStats({
          products: productsCount,
          orders: ordersCount,
          users: usersCount,
          revenue: totalRevenue,
        });
        
        setRecentOrders(recentOrdersData);
        setChartData(chartDataArr);

      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Welcome to Admin Dashboard</h2>
      <p className="dashboard-subtitle">Here is an overview of your store's performance.</p>

      {loading ? (
        <p className="loading-text">Loading premium metrics...</p>
      ) : (
        <>
          <div className="dashboard-metrics-grid">
            <div className="metric-card" onClick={() => setActivePage("Manage Products")}>
              <div className="icon-wrapper bg-blue">
                 <i className="fa-solid fa-box-open"></i>
              </div>
              <div className="metric-info">
                 <h3>{stats.products}</h3>
                 <p>Total Products</p>
              </div>
            </div>

            <div className="metric-card" onClick={() => setActivePage("Manage Orders")}>
              <div className="icon-wrapper bg-green">
                 <i className="fa-solid fa-cart-shopping"></i>
              </div>
              <div className="metric-info">
                 <h3>{stats.orders}</h3>
                 <p>Total Orders</p>
              </div>
            </div>

            <div className="metric-card" onClick={() => setActivePage("Manage Users")}>
              <div className="icon-wrapper bg-purple">
                 <i className="fa-solid fa-users"></i>
              </div>
              <div className="metric-info">
                 <h3>{stats.users}</h3>
                 <p>Registered Users</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="icon-wrapper bg-orange">
                 <i className="fa-solid fa-dollar-sign"></i>
              </div>
              <div className="metric-info">
                 <h3>${stats.revenue.toFixed(2)}</h3>
                 <p>Total Revenue</p>
              </div>
            </div>
          </div>

          <div className="dashboard-analytics-section">
             <div className="chart-container">
               <h3>Revenue Trend (Last 7 Days)</h3>
               <div className="chart-wrapper">
                 <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0071dc" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0071dc" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="display" stroke="#6b7280" fontSize={12} tickLine={false} />
                      <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#0071dc" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
             </div>
             
             <div className="recent-orders-container">
                <div className="recent-orders-header">
                   <h3>Recent Orders</h3>
                   <button className="view-all-btn" onClick={() => setActivePage("Manage Orders")}>View All</button>
                </div>
                <div className="table-responsive">
                   <table className="admin-table">
                     <thead>
                       <tr>
                         <th>Order ID</th>
                         <th>Date</th>
                         <th>Amount</th>
                         <th>Status</th>
                       </tr>
                     </thead>
                     <tbody>
                       {recentOrders.length > 0 ? (
                         recentOrders.map((order) => (
                           <tr key={order._id}>
                             <td className="font-medium">#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                             <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                             <td>${Number(order.totalPrice).toFixed(2)}</td>
                             <td>
                               <span className={`status-badge status-${(order.status || 'Pending').toLowerCase()}`}>
                                 {order.status || 'Pending'}
                               </span>
                             </td>
                           </tr>
                         ))
                       ) : (
                         <tr>
                           <td colSpan="4" className="text-center">No recent orders found.</td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                </div>
             </div>
          </div>
          
          <div className="quick-actions-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions-flex">
               <button className="primary-action-btn" onClick={() => setActivePage("Add Product")}>
                 <i className="fa-solid fa-plus"></i> Add New Product
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}