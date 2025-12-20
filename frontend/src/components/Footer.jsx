import '../styles/Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>MaidEase</h3>
            <p>Professional cleaning and household service management platform.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/maids">Browse Maids</a></li>
              <li><a href="/bookings">My Bookings</a></li>
              <li><a href="/profile">Profile</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="mailto:support@maidease.com">Email Support</a></li>
              <li><a href="tel:+1234567890">Call Us</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 MaidEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
