import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Header.css';

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  const closeMenu = () => setMenuOpen(false);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo" onClick={closeMenu}>
          MaidEase
        </Link>

        {/* Mobile menu button */}
        <button 
          className={`menu-toggle ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation */}
        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            Dashboard
          </Link>
          {user?.role === 'customer' && (
            <Link 
              to="/maids" 
              className={`nav-link ${isActive('/maids') ? 'active' : ''}`}
              onClick={closeMenu}
            >
              Browse Maids
            </Link>
          )}
          <Link 
            to="/bookings" 
            className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            My Bookings
          </Link>
          
          {/* Mobile only user section */}
          <div className="nav-user-mobile">
            <Link 
              to="/profile" 
              className="nav-link"
              onClick={closeMenu}
            >
              Profile
            </Link>
            <button className="nav-link nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>

        {/* Desktop user menu */}
        <div className="user-menu">
          <Link to="/profile" className="user-profile">
            {user?.full_name}
          </Link>
          <button className="btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {menuOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
    </header>
  );
};
