import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { maidAPI } from '../api/endpoints';
import '../styles/Maids.css';

export const MaidsList = () => {
  const [maids, setMaids] = useState([]);
  const [filteredMaids, setFilteredMaids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    minRate: 0,
    maxRate: 500,
    minExperience: 0,
  });

  useEffect(() => {
    fetchMaids();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, maids]);

  const fetchMaids = async () => {
    try {
      setLoading(true);
      const response = await maidAPI.getAvailableMaids();
      setMaids(response.data || []);
    } catch (err) {
      setError('Failed to load maids');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = maids.filter((maid) => {
      const matchSearch =
        !filters.search ||
        maid.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        (maid.skills && maid.skills.toLowerCase().includes(filters.search.toLowerCase()));

      const matchRate =
        maid.hourly_rate >= filters.minRate && maid.hourly_rate <= filters.maxRate;

      const matchExperience = maid.experience_years >= filters.minExperience;

      return matchSearch && matchRate && matchExperience;
    });

    setFilteredMaids(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={`star ${i < Math.round(rating) ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="maids-container">
      {/* 1. Hero Section */}
      <div className="hero-section">
        <h1 className="hero-title">Trusted House Services</h1>
        <p className="hero-subtitle">
          Discover top-rated professionals for cleaning, cooking, and household help.
          Book instantly with confidence.
        </p>

        {/* 2. Search & Filters Bar */}
        <div className="search-bar-container">
          <div className="filter-group">
            <label>Search Services</label>
            <input
              type="text"
              placeholder="E.g. Cleaning, Cooking..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Hourly Rate ($)</label>
            <div className="range-inputs">
              <input
                type="number"
                placeholder="Min"
                min="0"
                value={filters.minRate}
                onChange={(e) => handleFilterChange('minRate', parseInt(e.target.value) || 0)}
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxRate}
                onChange={(e) => handleFilterChange('maxRate', parseInt(e.target.value) || 500)}
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Min Experience</label>
            <input
              type="number"
              placeholder="Years"
              value={filters.minExperience}
              onChange={(e) => handleFilterChange('minExperience', parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="filter-group">
             {/* Spacer for alignment */}
          </div>
          
           <button 
             className="btn-reset" 
             onClick={() => setFilters({ search: '', minRate: 0, maxRate: 500, minExperience: 0 })}
            >
            Reset Filters
          </button>
        </div>
      </div>

      {/* 3. Loading & Error States */}
      {loading && (
        <div className="container text-center">
          <div className="spinner"></div>
          <p>Finding the best matches...</p>
        </div>
      )}

      {error && <div className="container error-message text-center">{error}</div>}

      {/* 4. Maid Cards Grid */}
      {!loading && !error && (
        <div className="maids-grid">
          {filteredMaids.length > 0 ? (
            filteredMaids.map((maid) => (
              <div key={maid.id} className="maid-card">
                <div className="maid-header">
                  <div>
                    <h3>{maid.full_name}</h3>
                    <div style={{fontSize: '0.85rem', color: 'var(--slate-500)'}}>
                      {maid.skills ? maid.skills.split(',')[0] : 'Professional Maid'}
                    </div>
                  </div>
                  <div className="rating">
                    {renderStars(maid.average_rating || 0)}
                    <span className="rating-value">
                      {maid.average_rating ? maid.average_rating.toFixed(1) : 'New'}
                    </span>
                  </div>
                </div>

                <p className="maid-bio">
                  {maid.bio || "Dedicated professional with verified experience ready to help with your household needs."}
                </p>

                <div className="maid-details">
                  <div className="detail">
                    <span className="label">Rate</span>
                    <span className="value" style={{color: 'var(--success)', fontWeight: '700'}}>
                      ${maid.hourly_rate}/hr
                    </span>
                  </div>
                  <div className="detail">
                    <span className="label">Experience</span>
                    <span className="value">{maid.experience_years} years</span>
                  </div>
                  <div className="detail">
                    <span className="label">Availability</span>
                    <span className="value">
                      {maid.availability_schedule ? 'Partial' : 'Full-time'}
                    </span>
                  </div>
                </div>

                <div className="maid-actions">
                  <Link to={`/maid/${maid.id}`} className="btn btn-view">
                    Profile
                  </Link>
                  <Link to={`/book/${maid.id}`} className="btn btn-book">
                    Book Now
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results text-center" style={{gridColumn: '1 / -1', padding: '4rem'}}>
              <h3>No matches found</h3>
              <p>Try adjusting your price range or filters to see more professionals.</p>
              <button 
                className="btn btn-secondary mt-4"
                onClick={() => setFilters({ search: '', minRate: 0, maxRate: 500, minExperience: 0 })}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
