import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateRegistrationPayload, getApiErrorMessage } from '../utils/payloadValidator';
import '../styles/Auth.css';

export const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone_number: '',
    role: 'customer',
    password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        email: formData.email,
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        role: formData.role,
        password: formData.password,
      };

      const validatedData = validateRegistrationPayload(dataToSend);
      await register(validatedData);
      navigate('/login');
    } catch (err) {
      setError(err.message || getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join thousands of trusted users</p>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>I want to...</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="customer">Hire a Professional (Customer)</option>
              <option value="maid">Offer Services (Maid)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Min 8 characters"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <a href="/login">Sign in</a>
        </div>
      </div>
    </div>
  );
};
