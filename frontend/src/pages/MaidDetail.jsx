import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { maidAPI, reviewAPI } from '../api/endpoints';
import '../styles/MaidDetail.css';

export const MaidDetail = () => {
  const { maidId } = useParams();
  const [maid, setMaid] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaidDetails();
  }, [maidId]);

  const fetchMaidDetails = async () => {
    try {
      setLoading(true);
      const [maidRes, reviewsRes] = await Promise.all([
        maidAPI.getMaidProfile(maidId),
        reviewAPI.getReviewsForMaid(maidId),
      ]);
      setMaid(maidRes.data);
      setReviews(reviewsRes.data || []);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < Math.round(rating) ? 'filled' : 'empty'}`}>★</span>
    ));
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  if (error || !maid) {
    return (
      <div className="container text-center" style={{padding: '4rem'}}>
        <h2>Professional Not Found</h2>
        <p className="text-slate-500 mb-4">This profile might have been removed or is unavailable.</p>
        <Link to="/maids" className="btn btn-primary">Browse Professionals</Link>
      </div>
    );
  }

  return (
    <div className="maid-detail-container">
      {/* 1. Profile Header with Gradient */}
      <div className="profile-header-section">
        <div className="back-link-wrapper">
          <Link to="/maids" style={{color: 'var(--slate-500)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem'}}>
            ← Back to Browse
          </Link>
        </div>

        <div className="profile-avatar-large">
          {maid.full_name.charAt(0)}
        </div>
        
        <h1 className="profile-name">{maid.full_name}</h1>
        
        <div className="profile-meta">
          <div className="meta-item">
            <span className="star filled">★</span>
            <span style={{fontWeight: 700, color: 'var(--slate-900)'}}>
              {maid.average_rating ? maid.average_rating.toFixed(1) : 'New'}
            </span>
            <span>({reviews.length} reviews)</span>
          </div>
          <div className="meta-item">
            <span>{maid.availability_schedule || 'Flexible Schedule'}</span>
          </div>
        </div>
      </div>

      {/* 2. Main Layout Grid */}
      <div className="profile-content">
        <div className="main-info">
          
          <div className="section-card">
            <h2 className="section-title">About Me</h2>
            <p className="about-text">
              {maid.bio || "Hi, I'm a dedicated home service professional. I take pride in my work and ensure every job is done to the highest standard."}
            </p>
          </div>

          <div className="section-card">
            <h2 className="section-title">Verified Skills</h2>
            <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
              {(maid.skills || 'General Cleaning').split(',').map((skill, i) => (
                <span key={i} className="badge badge-success" style={{fontSize: '0.9rem', padding: '0.5rem 1rem'}}>
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="section-card">
            <h2 className="section-title">Client Reviews</h2>
            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <span className="review-author">{review.customer_name || 'Verified Client'}</span>
                      <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{marginBottom: '0.5rem', fontSize: '0.85rem'}}>
                      {renderStars(review.rating)}
                    </div>
                    <p className="review-text">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{color: 'var(--slate-500)', fontStyle: 'italic'}}>No reviews yet for this professional.</p>
            )}
          </div>
        </div>

        {/* Sidebar Sticky CTA */}
        <div className="sidebar">
          <div className="booking-cta-card">
            <div className="cta-price">${maid.hourly_rate}</div>
            <div className="cta-unit">per hour</div>
            
            <Link to={`/book/${maid.id}`} className="btn btn-primary btn-large" style={{width: '100%', marginTop: '1.5rem'}}>
              Request Booking
            </Link>
            
            <div className="cta-guarantee">
              100% Satisfaction Guarantee
            </div>
          </div>

          <div className="stats-grid mt-4">
            <div className="stat-card">
              <div className="stat-label">Experience</div>
              <div className="stat-value">{maid.experience_years} Years</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Jobs Completed</div>
              <div className="stat-value">12+</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
