import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { maidAPI, bookingAPI } from '../api/endpoints';
import { validateBookingPayload, getApiErrorMessage } from '../utils/payloadValidator';
import '../styles/BookingForm.css';

export const BookingForm = () => {
  const { maidId } = useParams();
  const navigate = useNavigate();
  const [maid, setMaid] = useState(null);
  
  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    booking_date: '',
    booking_time: '',
    service_type: 'house_cleaning',
    job_description: '',
    custom_hourly_rate: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchMaidDetails();
  }, [maidId]);

  const fetchMaidDetails = async () => {
    try {
      setLoading(true);
      const response = await maidAPI.getMaidProfile(maidId);
      setMaid(response.data);
    } catch (err) {
      setError('Failed to load service provider details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    setError(null);
    if (currentStep === 1 && !formData.service_type) {
      setError('Please select a service type.');
      return;
    }
    if (currentStep === 2) {
      if (!formData.booking_date || !formData.booking_time) {
        setError('Please select both date and time.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const notes = [];
      if (formData.job_description) notes.push(`Job Description: ${formData.job_description}`);
      if (formData.custom_hourly_rate) notes.push(`Proposed Rate: $${formData.custom_hourly_rate}`);

      const payload = validateBookingPayload({
        maid_id: maidId,
        service_type: formData.service_type,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        notes: notes.join('\n'),
      });

      await bookingAPI.createBooking(payload);
      setSuccess(true);
      setTimeout(() => navigate('/bookings'), 2500);
    } catch (err) {
      setError(err.message || getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  if (success) {
    return (
      <div className="booking-form-container">
        <div className="booking-wizard-card success-view">
          <div className="success-icon">✓</div>
          <h2 className="success-title">Booking Confirmed!</h2>
          <p className="success-text">
            Your request has been sent to <strong>{maid?.full_name}</strong>.
            You can track the status in your dashboard.
          </p>
          <button onClick={() => navigate('/bookings')} className="btn btn-primary">
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      {/* Wizard Steps Indicator */}
      <div className="wizard-steps">
        <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-number">{currentStep > 1 ? '✓' : '1'}</div>
          <div className="step-label">Service</div>
        </div>
        <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-number">{currentStep > 2 ? '✓' : '2'}</div>
          <div className="step-label">Schedule</div>
        </div>
        <div className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Confirm</div>
        </div>
      </div>

      <div className="booking-wizard-card">
        <div className="provider-mini-card">
          <div className="provider-avatar">
            {maid?.full_name?.charAt(0)}
          </div>
          <div>
            <h4 style={{marginBottom: 0}}>Booking with {maid?.full_name}</h4>
            <small style={{color: 'var(--slate-500)'}}>Rate: ${maid?.hourly_rate}/hr</small>
          </div>
        </div>

        {error && <div className="error-message mb-4">{error}</div>}

        {/* Step 1: Service Details */}
        {currentStep === 1 && (
          <div className="step-content">
            <h2 className="mb-4">What service do you need?</h2>
            
            <div className="form-group">
              <label>Service Type</label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                autoFocus
              >
                <option value="house_cleaning">House Cleaning</option>
                <option value="kitchen_cleaning">Kitchen Deep Clean</option>
                <option value="laundry">Laundry & Ironing</option>
                <option value="cooking">Cooking / Meal Prep</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Job Description & Requirements</label>
              <textarea
                name="job_description"
                value={formData.job_description}
                onChange={handleChange}
                placeholder="Briefly describe what needs to be done (e.g., 3 bedrooms, 2 baths, focus on kitchen)..."
                rows="4"
              />
            </div>
          </div>
        )}

        {/* Step 2: Schedule */}
        {currentStep === 2 && (
          <div className="step-content">
            <h2 className="mb-4">When should they arrive?</h2>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="booking_date"
                value={formData.booking_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                name="booking_time"
                value={formData.booking_time}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Custom Hourly Rate (Optional)</label>
              <input
                type="number"
                name="custom_hourly_rate"
                value={formData.custom_hourly_rate}
                onChange={handleChange}
                placeholder={`Standard rate: $${maid?.hourly_rate}`}
              />
              <small className="form-hint">Only enter if you negotiated a different rate.</small>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="step-content">
            <h2 className="mb-4">Review & Confirm</h2>
            
            <div className="review-grid">
              <div className="review-item">
                <span className="review-label">Service</span>
                <span className="review-value">{formData.service_type.replace('_', ' ')}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Date</span>
                <span className="review-value">{formData.booking_date}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Time</span>
                <span className="review-value">{formData.booking_time}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Estimated Rate</span>
                <span className="review-value">
                  ${formData.custom_hourly_rate || maid?.hourly_rate}/hr
                </span>
              </div>
              {formData.job_description && (
                <div className="review-item" style={{flexDirection: 'column', gap: '0.5rem'}}>
                  <span className="review-label">Notes</span>
                  <span className="review-value" style={{fontWeight: 400, fontSize: '0.9rem'}}>
                    {formData.job_description}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="wizard-actions">
          {currentStep > 1 ? (
            <button className="btn btn-back" onClick={prevStep}>
              ← Back
            </button>
          ) : (
            <div></div> /* Spacer */
          )}

          {currentStep < totalSteps ? (
            <button className="btn btn-primary btn-large" onClick={nextStep}>
              Next Step
            </button>
          ) : (
            <button 
              className="btn btn-primary btn-large" 
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Confirming...' : 'Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
