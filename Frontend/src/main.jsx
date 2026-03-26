import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import AddProduct from "./admin/pages/AddProduct.jsx";
import AdminRoute from "./admin/components/AdminRoute.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        } />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/add-product" element={
          <AdminRoute>
            <AddProduct />
          </AdminRoute>
        } />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
