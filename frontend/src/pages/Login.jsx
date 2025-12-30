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
    <div className="landing-page">
      <div className="landing-left">
        <div className="landing-content">
          <span className="landing-badge">Full-Stack Project</span>
          
          <h1 className="landing-title">MaidEase</h1>
          
          <p className="landing-desc">
            A modern home services marketplace connecting customers 
            with trusted cleaning professionals.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <div className="feature-info">
                <h3>Two-sided Platform</h3>
                <p>Customers book services, providers manage availability</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <div className="feature-info">
                <h3>Smart Booking System</h3>
                <p>Guided wizard with scheduling and confirmation</p>
              </div>
            </div>
            
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <div className="feature-info">
                <h3>Secure Authentication</h3>
                <p>JWT tokens, Argon2 hashing, rate limiting</p>
              </div>
            </div>
          </div>

          <div className="tech-section">
            <span className="tech-label">BUILT WITH</span>
            <div className="tech-tags">
              <span>React</span>
              <span>FastAPI</span>
              <span>PostgreSQL</span>
              <span>SQLAlchemy</span>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-right">
        <div className="auth-box">
          {!showLoginForm ? (
            <>
              <div className="auth-header">
                <h2>Welcome</h2>
                <p>Explore the platform or sign in to continue</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <div className="demo-area">
                <span className="demo-title">Try the demo</span>
                <div className="demo-grid">
                  <button
                    className="demo-card"
                    onClick={() => handleDemoLogin('customer')}
                    disabled={demoLoading !== null}
                  >
                    {demoLoading === 'customer' ? (
                      <div className="spinner"></div>
                    ) : (
                      <>
                        <span className="demo-card-icon">👤</span>
                        <strong>Customer View</strong>
                        <span>Browse and book services</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    className="demo-card"
                    onClick={() => handleDemoLogin('maid')}
                    disabled={demoLoading !== null}
                  >
                    {demoLoading === 'maid' ? (
                      <div className="spinner"></div>
                    ) : (
                      <>
                        <span className="demo-card-icon">🧹</span>
                        <strong>Provider View</strong>
                        <span>Manage bookings</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="divider"><span>or</span></div>

              <button 
                className="btn-outline"
                onClick={() => setShowLoginForm(true)}
              >
                Sign in with email
              </button>

              <p className="auth-link">
                New here? <a href="/register">Create an account</a>
              </p>
            </>
          ) : (
            <>
              <div className="auth-header">
                <button className="back-link" onClick={() => setShowLoginForm(false)}>
                  ← Back
                </button>
                <h2>Sign in</h2>
                <p>Enter your credentials to continue</p>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
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
                <div className="input-group">
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
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <div className="spinner"></div> : 'Sign in'}
                </button>
              </form>

              <p className="auth-link">
                New here? <a href="/register">Create an account</a>
              </p>
            </>
          )}
        </div>

        <p className="credit">Designed & built by <strong>Dixit Jain</strong></p>
      </div>
    </div>
  );
};
