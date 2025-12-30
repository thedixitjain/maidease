import { useAuth } from '../contexts/AuthContext';
import '../styles/DemoBanner.css';

export const DemoBanner = () => {
  const { isDemoUser, user } = useAuth();

  if (!isDemoUser) return null;

  const role = user?.role === 'maid' ? 'provider' : 'customer';

  return (
    <div className="demo-banner">
      <span>Demo mode ({role})</span>
      <span className="demo-banner-separator">·</span>
      <a href="/register">Create your account</a>
    </div>
  );
};
