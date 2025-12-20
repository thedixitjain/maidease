import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, RoleBasedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { MaidsList } from './pages/MaidsList';
import { MaidDetail } from './pages/MaidDetail';
import { BookingForm } from './pages/BookingForm';
import { BookingsList } from './pages/BookingsList';
import { ReviewForm } from './pages/ReviewForm';
import { UserProfile } from './pages/UserProfile';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="main-content">
          <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maids"
                element={
                  <RoleBasedRoute allowedRoles="customer">
                    <MaidsList />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/maid/:maidId"
                element={
                  <RoleBasedRoute allowedRoles="customer">
                    <MaidDetail />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/book/:maidId"
                element={
                  <RoleBasedRoute allowedRoles="customer">
                    <BookingForm />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <BookingsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/review/:bookingId"
                element={
                  <ProtectedRoute>
                    <ReviewForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
