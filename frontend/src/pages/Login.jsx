import { useState } from 'react';
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

    const credentials = {
      customer: { email: 'demo.customer@maidease.com', password: 'DemoPass123' },
      maid: { email: 'demo.maid@maidease.com', password: 'DemoPass123' }
    };

    try {
      const creds = credentials[role];
      const response = await authAPI.login(creds.email, creds.password);
      const { access_token, refresh_token } = response.data;
      setTokens(access_token, refresh_token);

      const userResponse = await userAPI.getProfile();
      updateProfile(userResponse.data);
      navigate('/');
    } catch (err) {
      setError('Demo login failed. Please try again.');
    } finally {
      setDemoLoading(null);
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don't have an account?</span>
          <a href="/register">Create account</a>
        </div>

        <div className="demo-access">
          <p className="demo-access-label">Just exploring?</p>
          <div className="demo-access-buttons">
            <button
              type="button"
              className="demo-access-btn"
              onClick={() => handleDemoLogin('customer')}
              disabled={demoLoading !== null || loading}
            >
              {demoLoading === 'customer' ? 'Loading...' : 'Try as Customer'}
            </button>
            <span className="demo-access-divider">or</span>
            <button
              type="button"
              className="demo-access-btn"
              onClick={() => handleDemoLogin('maid')}
              disabled={demoLoading !== null || loading}
            >
              {demoLoading === 'maid' ? 'Loading...' : 'Try as Provider'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
