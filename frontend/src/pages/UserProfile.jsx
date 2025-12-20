import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../api/endpoints';
import { validateUserUpdatePayload, getApiErrorMessage } from '../utils/payloadValidator';
import '../styles/UserProfile.css';

export const UserProfile = () => {
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    initializeFormData();
  }, [user]);

  const initializeFormData = () => {
    if (user) {
      const baseData = {
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
      };
      
      if (user.role === 'maid') {
        setFormData({
          ...baseData,
          hourly_rate: user.hourly_rate || 0,
          bio: user.bio || '',
          skills: user.skills || '',
          experience_years: user.experience_years || 0,
          availability_schedule: user.availability_schedule || '',
        });
      } else {
        setFormData(baseData);
      }
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experience_years' || name === 'hourly_rate' 
        ? parseFloat(value) 
        : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      // Validate and sanitize payload according to backend schema
      const validatedData = validateUserUpdatePayload(formData, user?.role);

      // Only send if there are fields to update
      if (Object.keys(validatedData).length === 0) {
        setError('No changes to save');
        setSaving(false);
        return;
      }

      await userAPI.updateProfile(validatedData);
      await updateProfile(validatedData);
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err.message || getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>{user?.full_name}</h1>
          <p className="profile-role">
            {user?.role === 'maid' ? 'Service Provider' : 'Customer'}
          </p>
        </div>

        {success && (
          <div className="success-message">
            ✓ Profile updated successfully
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!isEditing ? (
          <div className="profile-view">
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{user?.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Phone:</span>
                <span className="value">{user?.phone_number || 'Not provided'}</span>
              </div>
            </div>

            {user?.role === 'maid' && (
              <>
                <div className="profile-section">
                  <h3>Professional Information</h3>
                  <div className="info-row">
                    <span className="label">Bio:</span>
                    <span className="value">{user?.bio || 'Not provided'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Skills:</span>
                    <span className="value">{user?.skills || 'Not provided'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Experience:</span>
                    <span className="value">{user?.experience_years} years</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Hourly Rate:</span>
                    <span className="value">${user?.hourly_rate || 'Not provided'}/hour</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Availability:</span>
                    <span className="value">
                      {user?.availability_schedule || 'Not specified'}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="profile-actions">
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
              <button
                className="btn btn-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="profile-edit">
            <div className="form-section">
              <h3>Personal Information</h3>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
            </div>

            {user?.role === 'maid' && (
              <div className="form-section">
                <h3>Professional Information</h3>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Describe your experience and services"
                    rows="4"
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label>Skills</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g., House Cleaning, Kitchen Cleaning"
                    disabled={saving}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Experience (years)</label>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleChange}
                      min="0"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label>Hourly Rate ($)</label>
                    <input
                      type="number"
                      name="hourly_rate"
                      value={formData.hourly_rate}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Availability</label>
                  <input
                    type="text"
                    name="availability_schedule"
                    value={formData.availability_schedule}
                    onChange={handleChange}
                    placeholder="e.g., Monday-Friday, 9AM-5PM"
                    disabled={saving}
                  />
                </div>
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  initializeFormData();
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
