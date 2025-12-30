import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, userAPI } from '../api/endpoints';
import { setTokens } from '../api/client';
import '../styles/Auth.css';

// Demo credentials - always visible for recruiters
const DEMO_CREDENTIALS = {
  customer: {
    email: 'demo.customer@maidease.com',
    password: 'DemoPass123',
    role: 'customer',
    description: 'Browse & book services'
  },
  maid: {
    email: 'demo.maid@maidease.com',
    password: 'DemoPass123',
    role: 'maid',
    description: 'Manage bookings'
  }
};

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const [error, setError] = useState(null);
  const { login, updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setDemoLoading(role);
    setError(null);

    const creds = DEMO_CREDENTIALS[role];

    try {
      // Try the quick demo login endpoint first
      try {
        const response = await authAPI.demoLogin(role);
        const { access_token, refresh_token } = response.data;
        setTokens(access_token, refresh_token);
      } catch {
        // Fallback to regular login with demo credentials
        const response = await authAPI.login(creds.email, creds.password);
        const { access_token, refresh_token } = response.data;
        setTokens(access_token, refresh_token);
      }

      // Fetch user profile
      const userResponse = await userAPI.getProfile();
      updateProfile(userResponse.data);
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Demo login failed. The demo account may not exist yet.');
    } finally {
      setDemoLoading(null);
    }
  };

  const fillDemoCredentials = (role) => {
    const creds = DEMO_CREDENTIALS[role];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Login to manage your bookings</p>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {/* Demo Login Section - Always visible */}
        <div className="demo-section">
          <div className="demo-header">
            <span className="demo-badge">🎯 Demo Access</span>
            <p className="demo-subtitle">Try MaidEase without signing up</p>
          </div>
          <div className="demo-buttons">
            <button
              type="button"
              className="btn btn-demo btn-demo-customer"
              onClick={() => handleDemoLogin('customer')}
              disabled={demoLoading !== null || loading}
            >
              {demoLoading === 'customer' ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                <>
                  <span className="demo-icon">👤</span>
                  <span className="demo-text">
                    <strong>Demo as Customer</strong>
                    <small>Browse & book services</small>
                  </span>
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-demo btn-demo-maid"
              onClick={() => handleDemoLogin('maid')}
              disabled={demoLoading !== null || loading}
            >
              {demoLoading === 'maid' ? (
                <span className="loading-spinner">⏳</span>
              ) : (
                <>
                  <span className="demo-icon">🧹</span>
                  <span className="demo-text">
                    <strong>Demo as Provider</strong>
                    <small>Manage bookings</small>
                  </span>
                </>
              )}
            </button>
          </div>
          
          {/* Demo Credentials Display */}
          <div className="demo-credentials">
            <p className="demo-credentials-title">Or use these credentials:</p>
            <div className="demo-credentials-grid">
              <div className="demo-credential-item" onClick={() => fillDemoCredentials('customer')}>
                <span className="demo-credential-role">Customer:</span>
                <span className="demo-credential-email">{DEMO_CREDENTIALS.customer.email}</span>
              </div>
              <div className="demo-credential-item" onClick={() => fillDemoCredentials('maid')}>
                <span className="demo-credential-role">Provider:</span>
                <span className="demo-credential-email">{DEMO_CREDENTIALS.maid.email}</span>
              </div>
            </div>
            <p className="demo-credentials-password">Password: <code>DemoPass123</code></p>
          </div>
          
          <div className="demo-divider">
            <span>or login with your account</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              disabled={loading || demoLoading !== null}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading || demoLoading !== null}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{width: '100%'}} 
            disabled={loading || demoLoading !== null}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <a href="/register">Sign up for free</a>
        </div>
      </div>
    </div>
  );
};
