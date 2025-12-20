import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, reviewAPI } from '../api/endpoints';
import { getApiErrorMessage } from '../utils/payloadValidator';
import '../styles/BookingsList.css';

export const BookingsList = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [reviewedBookings, setReviewedBookings] = useState(new Set());

  useEffect(() => {
    fetchBookings();
  }, [user?.role]);

  useEffect(() => {
    applyFilter();
  }, [filter, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('User role:', user?.role);
      
      const response =
        user?.role === 'maid'
          ? await bookingAPI.getMaidBookings()
          : await bookingAPI.getMyBookings();
      
      console.log('Bookings response:', response);
      console.log('Bookings data:', response.data);
      
      setBookings(response.data || []);
      
      // Check which bookings have reviews (for customers)
      if (user?.role === 'customer' && response.data) {
        const completedBookings = response.data.filter(b => b.status === 'completed');
        const reviewStatus = new Set();
        
        for (const booking of completedBookings) {
          try {
            const checkRes = await reviewAPI.checkReviewExists(booking.id);
            // Check if review exists based on response data
            if (checkRes.data?.exists) {
              reviewStatus.add(booking.id);
            }
          } catch (err) {
            console.warn(`Error checking review for booking ${booking.id}:`, err);
          }
        }
        
        setReviewedBookings(reviewStatus);
      }
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = bookings;

    if (filter !== 'all') {
      filtered = bookings.filter((booking) => booking.status === filter);
    }

    filtered.sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date));
    setFilteredBookings(filtered);
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setActionLoading(bookingId);
      // Map frontend status to backend status enum values
      const backendStatus = newStatus === 'confirmed' ? 'accepted' : newStatus === 'cancelled' ? 'canceled' : newStatus;
      await bookingAPI.updateBookingStatus(bookingId, backendStatus);
      fetchBookings();
    } catch (err) {
      const errorMessage = getApiErrorMessage(err);
      setError(errorMessage);
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to remove this booking?')) {
      await handleStatusUpdate(bookingId, 'cancelled');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      accepted: '#17a2b8',
      completed: '#28a745',
      canceled: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <h1>{user?.role === 'maid' ? 'My Bookings' : 'My Bookings'}</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({bookings.length})
        </button>
        <button
          className={`tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({bookings.filter((b) => b.status === 'pending').length})
        </button>
        <button
          className={`tab ${filter === 'accepted' ? 'active' : ''}`}
          onClick={() => setFilter('accepted')}
        >
          Accepted ({bookings.filter((b) => b.status === 'accepted').length})
        </button>
        <button
          className={`tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({bookings.filter((b) => b.status === 'completed').length})
        </button>
      </div>

      {filteredBookings.length > 0 ? (
        <div className="bookings-grid">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-card-detail">
              <div className="booking-header">
                <h3>
                  {user?.role === 'maid' 
                    ? booking.customer?.full_name || 'Unknown Customer'
                    : booking.maid?.full_name || 'Unknown Maid'
                  }
                </h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(booking.status) }}
                >
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>

              <div className="booking-details">
                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span className="value">{formatDate(booking.booking_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Time:</span>
                  <span className="value">{booking.time_slot}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Service Type:</span>
                  <span className="value">{booking.service_type.replace('_', ' ')}</span>
                </div>
                {booking.notes && (
                  <div className="detail-row">
                    <span className="label">Notes:</span>
                    <span className="value">{booking.notes}</span>
                  </div>
                )}
                <div className="detail-row amount">
                  <span className="label">Amount:</span>
                  <span className="value">
                    {booking.total_amount ? `$${booking.total_amount.toFixed(2)}` : 'TBD'}
                  </span>
                </div>
              </div>

              <div className="booking-actions">
                {user?.role === 'maid' ? (
                  <>
                    {booking.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-accept"
                          onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                          disabled={actionLoading === booking.id}
                        >
                          {actionLoading === booking.id ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          className="btn btn-decline"
                          onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                          disabled={actionLoading === booking.id}
                        >
                          {actionLoading === booking.id ? 'Declining...' : 'Decline'}
                        </button>
                      </>
                    )}
                    {booking.status === 'accepted' && (
                      <button
                        className="btn btn-complete"
                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        disabled={actionLoading === booking.id}
                      >
                        {actionLoading === booking.id ? 'Completing...' : 'Mark Complete'}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {booking.status === 'pending' && (
                      <button
                        className="btn btn-cancel"
                        onClick={() => handleCancel(booking.id)}
                        disabled={actionLoading === booking.id}
                      >
                        {actionLoading === booking.id ? 'Removing...' : 'Remove Booking'}
                      </button>
                    )}
                    {booking.status === 'accepted' && (
                      <button
                        className="btn btn-cancel"
                        onClick={() => handleCancel(booking.id)}
                        disabled={actionLoading === booking.id}
                      >
                        {actionLoading === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                    {booking.status === 'completed' && (
                      <>
                        {reviewedBookings.has(booking.id) ? (
                          <button className="btn btn-reviewed" disabled>
                            ✓ Already Reviewed
                          </button>
                        ) : (
                          <a href={`/review/${booking.id}`} className="btn btn-review">
                            Leave Review
                          </a>
                        )}
                        <button
                          className="btn btn-cancel"
                          onClick={() => handleCancel(booking.id)}
                          disabled={actionLoading === booking.id}
                        >
                          {actionLoading === booking.id ? 'Removing...' : 'Remove Booking'}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="no-bookings">
          <p className="error-text">{error}</p>
          <button onClick={fetchBookings} className="btn btn-retry">
            Retry
          </button>
        </div>
      ) : (
        <div className="no-bookings">
          <p>
            {user?.role === 'maid'
              ? 'No bookings yet. Explore the app!'
              : 'No bookings yet. Start your first booking!'
            }
          </p>
          {user?.role === 'maid' ? (
            <a href="/" className="btn btn-primary">
              Explore Bookings
            </a>
          ) : (
            <a href="/maids" className="btn btn-primary">
              Start Booking
            </a>
          )}
        </div>
      )}
    </div>
  );
};
