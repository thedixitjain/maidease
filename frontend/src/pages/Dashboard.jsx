import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { maidAPI, bookingAPI, reviewAPI } from '../api/endpoints';
import { getApiErrorMessage } from '../utils/payloadValidator';
import '../styles/Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [maidStats, setMaidStats] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (user?.role === 'maid') {
      fetchMaidStats();
    } else {
      fetchCustomerData();
    }
  }, [user?.role]);

  const fetchMaidStats = async () => {
    try {
      setLoading(true);
      const bookingsRes = await bookingAPI.getMaidBookings();
      setMaidStats(user);
      setUpcomingBookings(bookingsRes.data || []);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const bookingsRes = await bookingAPI.getMyBookings();
      setUpcomingBookings(bookingsRes.data || []);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      setActionLoading(bookingId);
      const statusMap = {
        accept: 'accepted',
        decline: 'canceled',
        complete: 'completed'
      };
      await bookingAPI.updateBookingStatus(bookingId, statusMap[action]);
      setSelectedBooking(null);
      fetchMaidStats();
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="container">
          <h1>Welcome back, {user?.full_name?.split(' ')[0]}!</h1>
          <p className="user-role">
            {user?.role === 'maid' ? 'Service Provider Dashboard' : 'Customer Dashboard'}
          </p>
        </div>
      </div>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Active Bookings</h3>
            <div className="stat-value">
              {upcomingBookings.filter(b => b.status === 'accepted' || b.status === 'pending').length}
            </div>
          </div>
          <div className="stat-card">
            <h3>Total Completed</h3>
            <div className="stat-value">
              {upcomingBookings.filter(b => b.status === 'completed').length}
            </div>
          </div>
          {user?.role === 'maid' && (
            <>
              <div className="stat-card">
                <h3>Rating</h3>
                <div className="stat-value">
                  {user.average_rating ? user.average_rating.toFixed(1) : '-'}★
                </div>
              </div>
              <div className="stat-card">
                <h3>Hourly Rate</h3>
                <div className="stat-value">${user.hourly_rate || 0}</div>
              </div>
            </>
          )}
        </div>

        {/* Profile Prompt for Maids */}
        {user?.role === 'maid' && !user.bio && (
          <div className="bio-prompt-banner">
            <div className="bio-prompt-content">
              <h3>📝 Complete Your Profile</h3>
              <p>Add a bio and skills to get 3x more bookings.</p>
            </div>
            <div className="bio-prompt-actions">
              <button className="btn btn-primary" onClick={() => navigate('/profile')}>
                Update Profile
              </button>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className="bookings-section">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
            <button className="btn btn-secondary" onClick={() => navigate('/bookings')}>
              View All
            </button>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className="bookings-list">
              {upcomingBookings.slice(0, 5).map((booking) => (
                <div 
                  key={booking.id} 
                  className="booking-card"
                  onClick={() => setSelectedBooking(booking)}
                  style={{cursor: 'pointer'}}
                >
                  <div className="booking-info">
                    <div className="booking-service">{booking.service_type.replace('_', ' ')}</div>
                    <div className="booking-meta">
                      <span>📅 {new Date(booking.booking_date).toLocaleDateString()}</span>
                      <span>⏰ {booking.time_slot}</span>
                      <span>👤 {user?.role === 'maid' ? booking.customer?.full_name : booking.maid?.full_name}</span>
                    </div>
                  </div>
                  <div className="booking-status" data-status={booking.status}>
                    {booking.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-500 mb-4">No bookings found.</p>
              {user?.role === 'customer' && (
                <button className="btn btn-primary" onClick={() => navigate('/maids')}>
                  Find a Professional
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="modal-close" onClick={() => setSelectedBooking(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Service</span>
                <span className="detail-value">{selectedBooking.service_type.replace('_', ' ')}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date</span>
                <span className="detail-value">{new Date(selectedBooking.booking_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time</span>
                <span className="detail-value">{selectedBooking.time_slot}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="detail-value" style={{textTransform: 'capitalize'}}>{selectedBooking.status}</span>
              </div>
              {selectedBooking.notes && (
                <div className="mt-4 p-4 bg-slate-50 rounded-md">
                  <span className="detail-label block mb-2">Notes:</span>
                  <p className="text-slate-700 text-sm">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
            
            {/* Maid Actions */}
            {user?.role === 'maid' && selectedBooking.status === 'pending' && (
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleBookingAction(selectedBooking.id, 'decline')}
                  disabled={actionLoading === selectedBooking.id}
                >
                  Decline
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleBookingAction(selectedBooking.id, 'accept')}
                  disabled={actionLoading === selectedBooking.id}
                >
                  Accept Booking
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
