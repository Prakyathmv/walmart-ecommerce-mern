import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from "recharts";
import "./Dashboard.css";
import API_BASE from "../../utils/api";

export default function Dashboard({ setActivePage }) {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [loading, setLoading] = useState(true);

  const STATUS_COLORS = {
    Pending: '#f59e0b',
    Processing: '#6366f1',
    Shipped: '#3b82f6',
    Delivered: '#10b981',
    Cancelled: '#ef4444'
  };
  const DEFAULT_COLORS = ['#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = { Authorization: `Bearer ${token}` };

        
        const [prodRes, ordRes, userRes] = await Promise.all([
          fetch(`${API_BASE}/api/products`), 
          fetch(`${API_BASE}/api/orders`, { headers }),
          fetch(`${API_BASE}/api/auth/users`, { headers }),
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
        let statusDataArr = [];
        let topProductsArr = [];
        let paymentDataArr = [];

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

          const statusMap = {};
          const productSalesMap = {};
          const paymentMap = {};
          
          orders.forEach(o => {
             const dateVal = o.createdAt ? new Date(o.createdAt) : new Date();
             const dStr = dateVal.toISOString().split('T')[0];
             const dayObj = last7Days.find(day => day.dateString === dStr);
             if (dayObj) {
                dayObj.revenue += (Number(o.totalPrice) || 0);
             }

             const status = o.status || 'Pending';
             statusMap[status] = (statusMap[status] || 0) + 1;

             if (status !== 'Cancelled' && o.items) {
               o.items.forEach(item => {
                 if (item.name && item.quantity) {
                   productSalesMap[item.name] = (productSalesMap[item.name] || 0) + Number(item.quantity);
                 }
               });
             }

             const paymentMethod = o.paymentMethod || 'Unknown';
             paymentMap[paymentMethod] = (paymentMap[paymentMethod] || 0) + (Number(o.totalPrice) || 0);
          });
          chartDataArr = last7Days;
          
          statusDataArr = Object.keys(statusMap).map(key => ({
            name: key,
            value: statusMap[key]
          }));

          topProductsArr = Object.keys(productSalesMap)
            .map(name => ({
              productName: name,
              quantity: productSalesMap[name]
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

          paymentDataArr = Object.keys(paymentMap).map(key => ({
            name: key,
            value: paymentMap[key]
          }));
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
        setOrderStatusData(statusDataArr);
        setTopProductsData(topProductsArr);
        setPaymentMethodData(paymentDataArr);

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

          <div className="dashboard-charts-grid">
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
             
             <div className="chart-container">
               <h3>Order Distribution</h3>
               <div className="chart-wrapper">
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        stroke="none"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#111827', fontWeight: 500 }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
             </div>
          </div>
          
          <div className="dashboard-charts-grid">
             <div className="chart-container">
               <h3>Top 5 Best-Selling Products</h3>
               <div className="chart-wrapper">
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProductsData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="productName" stroke="#6b7280" fontSize={11} tickLine={false} tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + "..." : value} angle={-25} textAnchor="end" />
                      <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} cursor={{fill: '#f3f4f6'}} />
                      <Bar dataKey="quantity" fill="#0071dc" radius={[4, 4, 0, 0]} barSize={30}>
                         {topProductsData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={['#0071dc', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'][index % 5]} />
                         ))}
                      </Bar>
                    </BarChart>
                 </ResponsiveContainer>
               </div>
             </div>
             
             <div className="chart-container">
               <h3>Revenue by Payment Method</h3>
               <div className="chart-wrapper">
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#111827', fontWeight: 500 }}
                        formatter={(value) => `$${Number(value).toFixed(2)}`}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
             </div>
          </div>

          <div className="dashboard-recent-orders-section">
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