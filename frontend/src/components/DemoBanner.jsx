import { useAuth } from '../contexts/AuthContext';
import '../styles/DemoBanner.css';

export const DemoBanner = () => {
  const { isDemoUser, user } = useAuth();

  if (!isDemoUser) return null;

  return (
    <div className="demo-banner">
      <div className="demo-banner-content">
        <span className="demo-banner-icon">🎯</span>
        <span className="demo-banner-text">
          You're using a <strong>demo account</strong> ({user?.role === 'maid' ? 'Service Provider' : 'Customer'}).
          <a href="/register" className="demo-banner-link">Create your own account</a> to save your data.
        </span>
      </div>
    </div>
  );
};
