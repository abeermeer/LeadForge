import { useState } from 'react';

export default function SearchForm({ onStart }) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(50000);
  const [minRating, setMinRating] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query || !location) return;
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          location,
          radius,
          min_rating: minRating ? parseFloat(minRating) : null,
        }),
      });
      const data = await res.json();
      onStart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass fade-in">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 4 }}>New Lead Search</h2>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>
          Find local businesses without websites in any area.
        </p>
      </div>

      <div className="grid-2">
        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text2)' }}>
            Business Type *
          </label>
          <input
            className="input"
            placeholder="e.g. restaurant, plumber, dentist"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text2)' }}>
            Location *
          </label>
          <input
            className="input"
            placeholder="e.g. Austin, TX"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text2)' }}>
            Search Radius (meters)
          </label>
          <select
            className="input"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
          >
            <option value={5000}>5 km (small area)</option>
            <option value={10000}>10 km</option>
            <option value={25000}>25 km</option>
            <option value={50000}>50 km (city-wide)</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: 'var(--text2)' }}>
            Min Rating (optional)
          </label>
          <input
            className="input"
            type="number"
            min="1"
            max="5"
            step="0.5"
            placeholder="e.g. 4.0"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ marginTop: 20, width: '100%' }}
      >
        {loading ? 'Starting Search...' : '🔍 Find Leads'}
      </button>
    </form>
  );
}
