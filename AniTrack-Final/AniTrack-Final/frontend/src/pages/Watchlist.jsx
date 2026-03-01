import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Trash2, Edit3, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STATUSES = [
  { key: 'all', label: 'All' }, { key: 'watching', label: 'Watching' },
  { key: 'completed', label: 'Completed' }, { key: 'on_hold', label: 'On Hold' },
  { key: 'dropped', label: 'Dropped' }, { key: 'plan_to_watch', label: 'Plan to Watch' },
];

export default function Watchlist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { load(); }, [status]);

  const load = async () => {
    setLoading(true);
    try { setItems(await api.getWatchlist(status)); } catch (e) {}
    setLoading(false);
  };

  const remove = async (showId, e) => {
    e.stopPropagation();
    if (!confirm('Remove from watchlist?')) return;
    await api.removeFromWatchlist(showId);
    setItems(items.filter(i => i.show_id !== showId));
  };

  const update = async (data) => {
    await api.updateWatchlist(editItem.show_id, data);
    setItems(items.map(i => i.show_id === editItem.show_id ? { ...i, ...data } : i));
    setEditItem(null);
  };

  const copyShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/watchlist/share/${user.id}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Watchlist</h1>
        <button className="btn btn-secondary btn-sm" onClick={copyShare}><Share2 size={14} /> {copied ? 'Copied!' : 'Share'}</button>
      </div>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {STATUSES.map(s => <button key={s.key} className={`tab${status === s.key ? ' active' : ''}`} onClick={() => setStatus(s.key)}>{s.label}</button>)}
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 10 }} />)}</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
          <p style={{ fontWeight: 700 }}>Nothing here yet</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/browse')}>Browse Shows</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => (
            <div key={item.id} className="watch-row" onClick={() => navigate(`/show/${item.show_id}`)}>
              <img src={item.cover_image} alt={item.title} className="watch-row-img" onError={e => { e.target.src = `https://placehold.co/48x68/16161f/7c5cfc?text=?`; }} />
              <div className="watch-row-info">
                <div className="watch-row-title">{item.title}</div>
                <div className="watch-row-sub">{item.episodes_watched}/{item.total_episodes} eps{item.score > 0 ? ` · ★ ${item.score}/10` : ''}</div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${item.total_episodes ? (item.episodes_watched / item.total_episodes) * 100 : 0}%` }} /></div>
                {item.notes && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>📝 {item.notes.slice(0, 60)}{item.notes.length > 60 ? '...' : ''}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                <span className={`status-badge status-${item.status}`}>{item.status.replace('_', ' ')}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-icon" onClick={e => { e.stopPropagation(); setEditItem(item); }}><Edit3 size={14} /></button>
                  <button className="btn-icon" onClick={e => remove(item.show_id, e)}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {editItem && <EditModal item={editItem} onSave={update} onClose={() => setEditItem(null)} />}
    </div>
  );
}

function EditModal({ item, onSave, onClose }) {
  const [form, setForm] = useState({ status: item.status, episodes_watched: item.episodes_watched, score: item.score, notes: item.notes || '' });
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><span className="modal-title">Edit: {item.title}</span><button className="btn-icon" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="input" value={form.status} onChange={e => upd('status', e.target.value)}>
              {['watching','completed','on_hold','dropped','plan_to_watch'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Episodes Watched</label>
            <input className="input" type="number" min={0} max={item.total_episodes} value={form.episodes_watched} onChange={e => upd('episodes_watched', parseInt(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label className="form-label">My Score (1-10)</label>
            <input className="input" type="number" min={0} max={10} value={form.score} onChange={e => upd('score', parseInt(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="input" placeholder="Your notes..." value={form.notes} onChange={e => upd('notes', e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  );
}
