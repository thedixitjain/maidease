import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI, reviewAPI } from '../api/endpoints';
import { validateReviewPayload, getApiErrorMessage } from '../utils/payloadValidator';
import '../styles/ReviewForm.css';

export const ReviewForm = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching booking details for:', bookingId);
      const response = await bookingAPI.getBookingDetail(bookingId);
      console.log('Booking response:', response.data);
      setBooking(response.data);
    } catch (err) {
      const errorMsg = getApiErrorMessage(err);
      setError(`Failed to load booking details: ${errorMsg}`);
      console.error('Fetch booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.comment.trim()) {
      setError('Please add a comment');
      return;
    }

    setSubmitting(true);

    try {
      // Validate and construct payload according to backend schema
      const reviewPayload = validateReviewPayload({
        booking_id: bookingId,
        rating: formData.rating,
        comment: formData.comment,
      });

      console.log('Submitting review:', reviewPayload);
      const response = await reviewAPI.createReview(reviewPayload);
      console.log('Review created successfully:', response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (err) {
      const errorMessage = err.message || getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Review error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate('/bookings')} className="btn">
          Back to Bookings
        </button>
      </div>
    );
  }

  const renderStarPicker = () => {
    return (
      <div className="star-picker">
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} className={`star ${star <= formData.rating ? 'selected' : ''}`}>
            <input
              type="radio"
              name="rating"
              value={star}
              checked={formData.rating === star}
              onChange={handleChange}
              disabled={submitting}
            />
            <span className="star-icon">★</span>
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="review-form-container">
      <button
        className="back-link"
        onClick={() => navigate('/bookings')}
      >
        ← Back to Bookings
      </button>

      <div className="review-form-card">
        <h1>Leave a Review</h1>

        {success && (
          <div className="success-message">
            <p>✓ Review submitted successfully! Redirecting...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {booking && (
          <div className="booking-summary">
            <h3>Service Details</h3>
            <div className="summary-item">
              <span className="label">Service Type:</span>
              <span className="value">{booking.service_type}</span>
            </div>
            <div className="summary-item">
              <span className="label">Date:</span>
              <span className="value">
                {new Date(booking.booking_date).toLocaleDateString()}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Time Slot:</span>
              <span className="value">{booking.time_slot}</span>
            </div>
            <div className="summary-item">
              <span className="label">Status:</span>
              <span className="value">{booking.status}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating *</label>
            <p className="rating-label">How would you rate this service?</p>
            {renderStarPicker()}
          </div>

          <div className="form-group">
            <label>Your Review *</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Share your experience with this service provider..."
              rows="6"
              required
              disabled={submitting}
            />
            <p className="char-count">
              {formData.comment.length}/500 characters
            </p>
          </div>

          <div className="rating-description">
            <p className="description-label">Rating Guidelines:</p>
            <ul>
              <li>★ - Poor: Did not meet expectations</li>
              <li>★★ - Fair: Needs improvement</li>
              <li>★★★ - Good: Satisfactory service</li>
              <li>★★★★ - Very Good: Exceeded expectations</li>
              <li>★★★★★ - Excellent: Outstanding service</li>
            </ul>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={submitting}
          >
            {submitting ? 'Submitting Review...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};
