import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Header.css';

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          MaidEase
        </Link>

        <nav className="nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Dashboard
          </Link>
          {user?.role === 'customer' && (
            <Link to="/maids" className={`nav-link ${isActive('/maids') ? 'active' : ''}`}>
              Browse Maids
            </Link>
          )}
          <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>
            My Bookings
          </Link>
        </nav>

        <div className="user-menu">
          <Link to="/profile" className="user-profile">
            {user?.full_name}
          </Link>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
