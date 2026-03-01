import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { BookmarkPlus, BookmarkCheck, ExternalLink, Play } from 'lucide-react';

export default function ShowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [recs, setRecs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [wlItem, setWlItem] = useState(null);
  const [tab, setTab] = useState('info');
  const [reviewForm, setReviewForm] = useState({ rating: 8, title: '', content: '', has_spoiler: 0 });
  const [spoilerRevealed, setSpoilerRevealed] = useState({});
  const [loading, setLoading] = useState(true);
  const [addStatus, setAddStatus] = useState('plan_to_watch');

  useEffect(() => {
    Promise.all([
      api.getShow(id), api.getRecommendations(id), api.getReviews(id),
      api.getWatchlist().then(wl => wl.find(i => i.show_id === id)),
    ]).then(([s, r, rv, wl]) => { setShow(s); setRecs(r); setReviews(rv); setWlItem(wl || null); })
      .catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const addToWatchlist = async () => {
    try { await api.addToWatchlist(id, addStatus); setWlItem({ show_id: id, status: addStatus, episodes_watched: 0 }); }
    catch (e) { alert(e.message); }
  };

  const submitReview = async () => {
    try {
      await api.submitReview(id, reviewForm);
      setReviews(await api.getReviews(id));
      setReviewForm({ rating: 8, title: '', content: '', has_spoiler: 0 });
    } catch (e) { alert(e.message); }
  };

  if (loading) return <div className="page"><div className="skeleton" style={{ height: 300, borderRadius: 12 }} /></div>;
  if (!show) return <div className="page"><p>Show not found</p></div>;

  return (
    <div>
      <div style={{ background: `linear-gradient(to right, var(--bg-primary) 30%, transparent), url(${show.cover_image}) right/cover`, minHeight: 220, padding: '40px 24px', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-primary) 0%, rgba(0,0,0,0.5) 100%)' }} />
        <div style={{ position: 'relative', display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <img src={show.cover_image} alt={show.title} style={{ width: 100, height: 140, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--border)', flexShrink: 0 }} onError={e => { e.target.src = `https://placehold.co/100x140/16161f/7c5cfc?text=?`; }} />
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 4 }}>{show.title}</h1>
            {show.original_title && show.original_title !== show.title && <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>{show.original_title}</p>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="rating-badge">★ {show.rating}</span>
              <span className={`status-badge status-${show.status}`}>{show.status}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{show.type?.toUpperCase()} · {show.release_year} · {show.total_episodes} eps</span>
            </div>
          </div>
        </div>
      </div>

      <div className="page">
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          {wlItem ? (
            <button className="btn btn-secondary" style={{ color: 'var(--accent-3)' }}><BookmarkCheck size={16} /> In Your List ({wlItem.status.replace('_', ' ')})</button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="input" value={addStatus} onChange={e => setAddStatus(e.target.value)} style={{ width: 'auto' }}>
                {['watching','plan_to_watch','completed','on_hold','dropped'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
              <button className="btn btn-primary" onClick={addToWatchlist}><BookmarkPlus size={16} /> Add to List</button>
            </div>
          )}
          {show.streaming_url && (
            <a href={show.streaming_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <Play size={16} /> Watch on {show.streaming_platform} <ExternalLink size={12} />
            </a>
          )}
        </div>

        <div className="tabs" style={{ marginBottom: 20 }}>
          {['info','reviews','recommendations'].map(t => <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>)}
        </div>

        {tab === 'info' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 10 }}>Synopsis</div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{show.synopsis || 'No synopsis available.'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {[['Genre', show.genre?.split(',').join(', ')], ['Language', show.language], ['Year', show.release_year], ['Episodes', show.total_episodes], ['Seasons', show.total_seasons], ['Platform', show.streaming_platform]].map(([k, v]) => v && (
                <div key={k} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{v}</div>
                </div>
              ))}
            </div>
            {show.tags && <div style={{ marginTop: 16 }}><div className="section-title" style={{ marginBottom: 10 }}>Tags</div><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{show.tags.split(',').map(t => <span key={t} className="tag">{t.trim()}</span>)}</div></div>}
          </div>
        )}

        {tab === 'reviews' && (
          <div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 14 }}>Write a Review</div>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} onClick={() => setReviewForm(f => ({...f, rating: n}))} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border)', background: reviewForm.rating >= n ? 'var(--accent)' : 'var(--bg-hover)', color: reviewForm.rating >= n ? 'white' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>{n}</button>
                  ))}
                </div>
              </div>
              <div className="form-group"><label className="form-label">Title</label><input className="input" placeholder="Review title..." value={reviewForm.title} onChange={e => setReviewForm(f => ({...f, title: e.target.value}))} /></div>
              <div className="form-group"><label className="form-label">Review</label><textarea className="input" placeholder="Share your thoughts..." value={reviewForm.content} onChange={e => setReviewForm(f => ({...f, content: e.target.value}))} /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem', marginBottom: 12 }}>
                <input type="checkbox" checked={reviewForm.has_spoiler === 1} onChange={e => setReviewForm(f => ({...f, has_spoiler: e.target.checked ? 1 : 0}))} /> Contains spoilers
              </label>
              <button className="btn btn-primary" onClick={submitReview}>Submit Review</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reviews.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first!</p> : reviews.map(r => (
                <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{r.username?.[0]?.toUpperCase()}</div>
                    <strong>{r.username}</strong>
                    <span className="rating-badge">★ {r.rating}/10</span>
                    {r.has_spoiler === 1 && <span style={{ fontSize: '0.7rem', background: 'rgba(252,92,125,0.1)', color: 'var(--accent-2)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>SPOILER</span>}
                  </div>
                  {r.title && <div style={{ fontWeight: 700, marginBottom: 6 }}>{r.title}</div>}
                  {r.has_spoiler === 1 && !spoilerRevealed[r.id] ? (
                    <div onClick={() => setSpoilerRevealed(p => ({...p, [r.id]: true}))} style={{ background: 'var(--bg-hover)', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.875rem' }}>⚠ Spoiler — click to reveal</div>
                  ) : (<p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.content}</p>)}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'recommendations' && (
          <div>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Shows you might enjoy based on {show.title}</p>
            {recs.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No recommendations found.</p> : (
              <div className="shows-grid">
                {recs.map(r => (
                  <div key={r.id} className="show-card" onClick={() => navigate(`/show/${r.id}`)}>
                    <img src={r.cover_image} alt={r.title} className="show-card-img" onError={e => { e.target.src = `https://placehold.co/150x225/16161f/7c5cfc?text=?`; }} />
                    <div className="show-card-body"><div className="show-card-title">{r.title}</div><div className="show-card-meta"><span className="rating-badge">★ {r.rating}</span></div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
