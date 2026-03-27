import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      
      const { accessToken, user } = response.data.data;

      
      login(user, accessToken);

      console.log('✓ Registration successful:', user);
      
      
      navigate('/');
      
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response?.data?.error?.details) {
        
        const details = err.response.data.error.details;
        errorMessage = Object.values(details).join(', ');
      } else if (err.response?.data?.error?.message) {
        errorMessage = err.response.data.error.message;
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        errorMessage = 'Network Error: Cannot connect to the backend server (ensure backend is running).';
      }
      setError(errorMessage);
      console.error('✗ Registration failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <form onSubmit={handleSubmit}>
        <h1>Register</h1>
        
        {error && <div className="error-message">{error}</div>}

        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          required
          disabled={loading}
        />

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
          minLength={6}
        />

        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
          disabled={loading}
          minLength={6}
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>

        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
