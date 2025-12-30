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
  const [showLoginForm, setShowLoginForm] = useState(false);
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
    <div className="landing-container">
      {/* Left Side - Product Info */}
      <div className="landing-info">
        <div className="landing-info-content">
          <div className="landing-badge">Full-Stack Project</div>
          <h1 className="landing-title">MaidEase</h1>
          <p className="landing-tagline">
            A modern home services marketplace connecting customers with trusted cleaning professionals.
          </p>
          
          <div className="landing-features">
            <div className="landing-feature">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="landing-feature-text">
                <strong>Two-sided Platform</strong>
                <span>Customers book services, providers manage availability</span>
              </div>
            </div>
            <div className="landing-feature">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="landing-feature-text">
                <strong>Smart Booking System</strong>
                <span>Guided wizard with scheduling and confirmation</span>
              </div>
            </div>
            <div className="landing-feature">
              <div className="landing-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="landing-feature-text">
                <strong>Secure Authentication</strong>
                <span>JWT tokens, Argon2 hashing, rate limiting</span>
              </div>
            </div>
          </div>

          <div className="landing-tech">
            <span className="tech-label">Built with</span>
            <div className="tech-stack">
              <span>React</span>
              <span>FastAPI</span>
              <span>PostgreSQL</span>
              <span>SQLAlchemy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth */}
      <div className="landing-auth">
        <div className="auth-card">
          {!showLoginForm ? (
            <>
              <div className="auth-header">
                <h2 className="auth-title">Welcome</h2>
                <p className="auth-subtitle">Explore the platform or sign in to continue</p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="demo-section">
                <p className="demo-label">Try the demo</p>
                <div className="demo-buttons">
                  <button
                    className="demo-btn"
                    onClick={() => handleDemoLogin('customer')}
                    disabled={demoLoading !== null}
                  >
                    {demoLoading === 'customer' ? (
                      <span className="btn-loading"></span>
                    ) : (
                      <>
                        <span className="demo-btn-title">Customer View</span>
                        <span className="demo-btn-desc">Browse and book services</span>
                      </>
                    )}
                  </button>
                  <button
                    className="demo-btn"
                    onClick={() => handleDemoLogin('maid')}
                    disabled={demoLoading !== null}
                  >
                    {demoLoading === 'maid' ? (
                      <span className="btn-loading"></span>
                    ) : (
                      <>
                        <span className="demo-btn-title">Provider View</span>
                        <span className="demo-btn-desc">Manage bookings</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-divider">
                <span>or</span>
              </div>

              <button 
                className="btn btn-secondary" 
                style={{width: '100%'}}
                onClick={() => setShowLoginForm(true)}
              >
                Sign in with email
              </button>

              <div className="auth-footer">
                <span>New here?</span>
                <a href="/register">Create an account</a>
              </div>
            </>
          ) : (
            <>
              <div className="auth-header">
                <button className="back-btn" onClick={() => setShowLoginForm(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <h2 className="auth-title">Sign in</h2>
                <p className="auth-subtitle">Enter your credentials to continue</p>
              </div>

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{width: '100%'}} 
                  disabled={loading}
                >
                  {loading ? <span className="btn-loading"></span> : 'Sign in'}
                </button>
              </form>

              <div className="auth-footer">
                <span>New here?</span>
                <a href="/register">Create an account</a>
              </div>
            </>
          )}
        </div>

        <p className="landing-credit">
          Designed & built by <strong>Dixit Jain</strong>
        </p>
      </div>
    </div>
  );
};
