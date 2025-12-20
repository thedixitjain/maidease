import { api, setTokens, clearTokens } from './client';

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
};

// User endpoints
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getUserById: (userId) => api.get(`/users/${userId}`),
};

// Maid endpoints
export const maidAPI = {
  getAvailableMaids: (params) => api.get('/maids', { params }),
  getMaidProfile: (maidId) => api.get(`/maids/${maidId}`),
};

// Booking endpoints
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getMaidBookings: () => api.get('/bookings/my-bookings'),
  getBookingDetail: (bookingId) => api.get(`/bookings/${bookingId}`),
  updateBookingStatus: (bookingId, status) =>
    api.put(`/bookings/${bookingId}`, { status }),
};

// Review endpoints
export const reviewAPI = {
  createReview: (reviewData) => api.post('/reviews', reviewData),
  getReviewsForMaid: (maidId) => api.get(`/reviews/maid/${maidId}`),
  getReviewsByBooking: (bookingId) => api.get(`/reviews/booking/${bookingId}`),
  checkReviewExists: (bookingId) => api.get(`/reviews/check/${bookingId}`),
};
