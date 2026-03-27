import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import walmartLogo from '../assets/walmartlogo.jpeg';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email first to receive an OTP.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/send-otp', { email });
      setIsOtpStep(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to send OTP. Ensure you are registered.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/auth/verify-otp', { email, otp });
      const { accessToken, user } = response.data.data;
      login(user, accessToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      
      const { accessToken, user } = response.data.data;

      
      login(user, accessToken);

      console.log('✓ Login successful:', user);
      
      
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
      <form onSubmit={isOtpStep ? handleVerifyOtp : handleSubmit}>
        <img src={walmartLogo} alt="Walmart Logo" style={{ display: 'block', margin: '-100px auto 1rem auto', height: '80px' }} />
        <h2 style={{ textAlign: 'center' }}>Sign in or create your account</h2>
        <br></br>
        
        {error && <div className="error-message">{error}</div>}

        {!isOtpStep ? (
          <>
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

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #ccc' }} />
              <span style={{ padding: '0 10px', color: '#444', fontSize: '14px' }}>or</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #ccc' }} />
            </div>

            <button 
              type="button" 
              onClick={handleSendOtp}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'transparent',
                color: '#222',
                border: '1px solid #222',
                borderRadius: '30px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '20px',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f4f4f4'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {loading ? 'Sending...' : 'Continue with OTP'}
            </button>

            <p>
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
            <p>
              <Link to="/forgot-password">Forgot password?</Link>
            </p>
          </>
        ) : (
          <>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#444' }}>
              We've sent a 6-digit verification code to <strong>{email}</strong>
            </p>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              required
              disabled={loading}
              style={{ textAlign: 'center', letterSpacing: '2px', fontSize: '20px' }}
            />
            <button type="submit" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button 
                type="button" 
                onClick={() => setIsOtpStep(false)}
                style={{ background: 'none', border: 'none', color: '#1a5bd7', textDecoration: 'underline', width: 'auto', padding: 0, fontWeight: 'normal', fontSize: '14px' }}
              >
                Use Password Instead
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default Login;