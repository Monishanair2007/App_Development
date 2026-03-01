import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Bell, Star, Play, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [shows, setShows] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getWatchlist('watching').then(setWatchlist).catch(() => {});
    api.getShows({ limit: 8, sort: 'rating' }).then(d => setShows(d.shows)).catch(() => {});
    api.getNotifications().then(setNotifications).catch(() => {});
    api.getWatchlistStats().then(setStats).catch(() => {});
  }, []);

  const unread = notifications.filter(n => !n.is_read);

  return (
    <div>
      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome back, Monisha!</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>{watchlist.length > 0 ? `You have ${watchlist.length} shows in progress` : 'Start tracking your anime today!'}</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate('/browse')}><Play size={16} /> Browse Shows</button>
            <button className="btn btn-secondary" onClick={() => navigate('/watchlist')}><Clock size={16} /> My Watchlist</button>
          </div>
        </div>
      </div>

      <div className="page">
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Episodes Watched', value: stats.total_episodes_watched || 0 },
              { label: 'Watching', value: stats.by_status?.find(s => s.status === 'watching')?.count || 0 },
              { label: 'Completed', value: stats.by_status?.find(s => s.status === 'completed')?.count || 0 },
              { label: 'Plan to Watch', value: stats.by_status?.find(s => s.status === 'plan_to_watch')?.count || 0 },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-number">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {unread.length > 0 && (
          <div className="section">
            <div className="section-title"><Bell size={14} /> Notifications ({unread.length})</div>
            {unread.slice(0, 3).map(n => (
              <div key={n.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)', borderRadius: 10, padding: '12px 16px', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{n.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.message}</div>
              </div>
            ))}
          </div>
        )}

        {watchlist.length > 0 && (
          <div className="section">
            <div className="section-title"><Play size={14} /> Currently Watching</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {watchlist.slice(0, 5).map(item => (
                <div key={item.id} className="watch-row" onClick={() => navigate(`/show/${item.show_id}`)}>
                  <img src={item.cover_image} alt={item.title} className="watch-row-img" onError={e => e.target.style.display = 'none'} />
                  <div className="watch-row-info">
                    <div className="watch-row-title">{item.title}</div>
                    <div className="watch-row-sub">{item.episodes_watched} / {item.total_episodes} episodes</div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${item.total_episodes ? (item.episodes_watched / item.total_episodes) * 100 : 0}%` }} /></div>
                  </div>
                  <span className="status-badge status-watching" style={{ flexShrink: 0 }}>Watching</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section">
          <div className="section-title"><Star size={14} /> Top Rated</div>
          <div className="shows-grid">
            {shows.map(show => (
              <div key={show.id} className="show-card" onClick={() => navigate(`/show/${show.id}`)}>
                <img src={show.cover_image} alt={show.title} className="show-card-img" onError={e => { e.target.src = `https://placehold.co/150x225/16161f/7c5cfc?text=${encodeURIComponent(show.title.slice(0,8))}`; }} />
                <div className="show-card-body">
                  <div className="show-card-title">{show.title}</div>
                  <div className="show-card-meta"><span className="rating-badge">★ {show.rating}</span><span>{show.release_year}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
