import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, userAPI } from '../api/endpoints';
import { setTokens } from '../api/client';
import '../styles/Auth.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const [error, setError] = useState(null);
  const [demoCredentials, setDemoCredentials] = useState(null);
  const { login, updateProfile } = useAuth();
  const navigate = useNavigate();

  // Fetch demo credentials on mount
  useEffect(() => {
    const fetchDemoCredentials = async () => {
      try {
        const response = await authAPI.getDemoCredentials();
        if (response.data.enabled) {
          setDemoCredentials(response.data);
        }
      } catch (err) {
        // Demo mode might be disabled, that's okay
        console.log('Demo mode not available');
      }
    };
    fetchDemoCredentials();
  }, []);

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

    try {
      // Use the quick demo login endpoint
      const response = await authAPI.demoLogin(role);
      const { access_token, refresh_token } = response.data;
      setTokens(access_token, refresh_token);

      // Fetch user profile
      const userResponse = await userAPI.getProfile();
      updateProfile(userResponse.data);
      
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Demo login failed. Please try again.');
    } finally {
      setDemoLoading(null);
    }
  };

  const fillDemoCredentials = (type) => {
    if (demoCredentials) {
      const creds = demoCredentials[type];
      setEmail(creds.email);
      setPassword(creds.password);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Login to manage your bookings</p>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {/* Demo Login Section */}
        {demoCredentials && (
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
            <div className="demo-divider">
              <span>or login with your account</span>
            </div>
          </div>
        )}

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
