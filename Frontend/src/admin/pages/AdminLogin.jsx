import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import walmartLogo from '../../assets/walmartlogo.jpeg';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    if (email === "admin@gmail.com" && password === "admin") {
      localStorage.setItem("adminToken", "admin-static-token");
      navigate('/admin/dashboard');
    } else {
      alert("Invalid credentials");
    }
  }

  return ( 
    <div className="al-page-wrapper">
      <div className="al-card">
        
        <div className="al-logo-wrapper">
          <img src={walmartLogo} alt="Walmart Logo" className="al-logo" />
        </div>

        <h1 className="al-title">Admin Login</h1>
        <br></br>
        <p className="al-subtitle">Sign in to manage your Walmart store</p>

        <form className="al-form" onSubmit={handleSubmit}>
          
          <div className="al-input-group">
            <label className="al-label" htmlFor="email">Email Address</label>
            <input
              className="al-input"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          
          <div className="al-input-group">
            <label className="al-label" htmlFor="password">Password</label>
            <input
              className="al-input"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button className="al-btn-submit" type="submit">
            Sign In
          </button>

        </form>
      </div>
    </div>
   );
}
 
export default AdminLogin;