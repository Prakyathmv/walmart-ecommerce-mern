import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      
      const { accessToken, user } = response.data.data;

      // Persist using AuthContext
      login(user, accessToken);

      console.log('✓ Login successful:', user);
      
      // Redirect to home or dashboard
      navigate('/');
      
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        errorMessage = 'Network Error: Cannot connect to the backend server (ensure backend is running).';
      }
      setError(errorMessage);
      console.error('✗ Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        
        {error && <div className="error-message">{error}</div>}

        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          disabled={loading}
        />
        
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          disabled={loading}
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;