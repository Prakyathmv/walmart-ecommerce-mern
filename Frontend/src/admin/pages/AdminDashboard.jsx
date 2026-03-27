import React, { useState } from "react";
import Dashboard from "./Dashboard";
import AddProduct from "./AddProduct";
import ManageProducts from "./ManageProducts";
import ManageOrders from "./ManageOrders";
import ManageUsers from "./ManageUsers";
import { useNavigate } from "react-router-dom";
import walmartLogo from '../../assets/walmartlogo.jpeg';
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const renderPage = () => {
    if (activePage === "Add Product") return <AddProduct />;
    if (activePage === "Manage Products") return <ManageProducts />;
    if (activePage === "Manage Orders") return <ManageOrders />;
    if (activePage === "Manage Users") return <ManageUsers />;
    return <Dashboard setActivePage={setActivePage} />;
  };

  return (
    <div className="admin-portal-layout">
      {}
      <header className="admin-top-nav">
        <div className="admin-nav-left">
           <img src={walmartLogo} alt="Walmart Logo" className="admin-brand-logo" />
           <span className="admin-brand-title">Seller Center</span>
        </div>
        <div className="admin-nav-right">
           <div className="admin-profile-menu">
             <i className="fa-solid fa-circle-user"></i>
             <span>Admin User</span>
           </div>
        </div>
      </header>

      <div className="admin-body-container">
        {}
        <aside className="admin-sidebar-menu">
          <nav>
            <button 
              className={`sidebar-btn ${activePage === "Dashboard" ? "active" : ""}`} 
              onClick={() => setActivePage("Dashboard")}
            >
              <i className="fa-solid fa-chart-line"></i> Dashboard
            </button>

            <button 
              className={`sidebar-btn ${activePage === "Add Product" ? "active" : ""}`} 
              onClick={() => setActivePage("Add Product")}
            >
              <i className="fa-solid fa-plus-circle"></i> Add Product
            </button>

            <button 
              className={`sidebar-btn ${activePage === "Manage Products" ? "active" : ""}`} 
              onClick={() => setActivePage("Manage Products")}
            >
              <i className="fa-solid fa-box-open"></i> Manage Products
            </button>

            <button 
              className={`sidebar-btn ${activePage === "Manage Orders" ? "active" : ""}`} 
              onClick={() => setActivePage("Manage Orders")}
            >
              <i className="fa-solid fa-clipboard-list"></i> Manage Orders
            </button>

            <button 
              className={`sidebar-btn ${activePage === "Manage Users" ? "active" : ""}`} 
              onClick={() => setActivePage("Manage Users")}
            >
              <i className="fa-solid fa-users-gear"></i> Manage Users
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="sidebar-btn sign-out-action" onClick={handleSignOut}>
               <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
            </button>
          </div>
        </aside>

        {}
        <main className="admin-main-viewport">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}