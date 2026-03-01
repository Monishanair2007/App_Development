import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Users, Plus } from 'lucide-react';

export default function Clubs() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', is_private: false });

  useEffect(() => { api.getClubs().then(setClubs).catch(console.error); }, []);

  const createClub = async () => {
    if (!form.name) return;
    try { const { id } = await api.createClub({ ...form, is_private: form.is_private ? 1 : 0 }); setShowCreate(false); navigate(`/clubs/${id}`); }
    catch (e) { alert(e.message); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Community Clubs</h1>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16} /> Create Club</button>
      </div>
      {clubs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}><Users size={40} style={{ marginBottom: 12 }} /><p style={{ fontWeight: 700 }}>No clubs yet. Create the first one!</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {clubs.map(club => (
            <div key={club.id} className="club-card" onClick={() => navigate(`/clubs/${club.id}`)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>{club.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>by {club.owner_name}</div>
                </div>
                <div style={{ background: 'var(--accent-glow)', borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>{club.member_count} members</div>
              </div>
              {club.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{club.description.slice(0, 100)}{club.description.length > 100 ? '...' : ''}</p>}
            </div>
          ))}
        </div>
      )}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><span className="modal-title">Create a Club</span><button className="btn-icon" onClick={() => setShowCreate(false)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Club Name</label><input className="input" placeholder="e.g. Shonen Fans United" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="input" placeholder="What is this club about?" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}><input type="checkbox" checked={form.is_private} onChange={e => setForm(f => ({...f, is_private: e.target.checked}))} /> Private club</label>
            </div>
            <div className="modal-footer"><button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" onClick={createClub}>Create Club</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
