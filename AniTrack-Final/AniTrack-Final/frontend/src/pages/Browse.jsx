import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Search } from 'lucide-react';

const GENRES = ['Action','Adventure','Comedy','Drama','Fantasy','Horror','Romance','Sci-Fi','Supernatural','Thriller'];

export default function Browse() {
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('rating');
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const load = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, offset: reset ? 0 : offset, sort };
      if (search) params.search = search;
      if (genre) params.genre = genre;
      if (type) params.type = type;
      const data = await api.getShows(params);
      if (reset) { setShows(data.shows); setOffset(LIMIT); }
      else { setShows(p => [...p, ...data.shows]); setOffset(o => o + LIMIT); }
      setTotal(data.total);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, genre, type, sort, offset]);

  useEffect(() => { load(true); }, [search, genre, type, sort]);

  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">Browse</h1></div>
      <div className="search-box" style={{ marginBottom: 20 }}>
        <Search size={16} className="search-icon" />
        <input className="input" placeholder="Search anime, series..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {GENRES.map(g => <button key={g} className={`tag${genre === g ? ' active' : ''}`} onClick={() => setGenre(genre === g ? '' : g)}>{g}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="input" value={type} onChange={e => setType(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Types</option>
            <option value="anime">Anime</option>
            <option value="tv">TV Show</option>
          </select>
          <select className="input" value={sort} onChange={e => setSort(e.target.value)} style={{ width: 'auto' }}>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">A-Z</option>
          </select>
        </div>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>{total} shows found</p>
      {loading && shows.length === 0 ? (
        <div className="shows-grid">{Array(12).fill(0).map((_, i) => <div key={i} className="show-card"><div className="skeleton" style={{ aspectRatio: '2/3' }} /><div style={{ padding: 12 }}><div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} /><div className="skeleton" style={{ height: 12, width: '50%' }} /></div></div>)}</div>
      ) : (
        <>
          <div className="shows-grid">
            {shows.map(show => (
              <div key={show.id} className="show-card" onClick={() => navigate(`/show/${show.id}`)}>
                <img src={show.cover_image} alt={show.title} className="show-card-img" onError={e => { e.target.src = `https://placehold.co/150x225/16161f/7c5cfc?text=${encodeURIComponent(show.title.slice(0,8))}`; }} />
                <div className="show-card-body">
                  <div className="show-card-title">{show.title}</div>
                  <div className="show-card-meta"><span className="rating-badge">★ {show.rating}</span><span className={`status-badge status-${show.status}`}>{show.status}</span></div>
                  <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{show.total_episodes} eps · {show.release_year}</div>
                </div>
              </div>
            ))}
          </div>
          {shows.length < total && <div style={{ textAlign: 'center', marginTop: 24 }}><button className="btn btn-secondary" onClick={() => load(false)} disabled={loading}>{loading ? 'Loading...' : 'Load More'}</button></div>}
        </>
      )}
    </div>
  );
}
