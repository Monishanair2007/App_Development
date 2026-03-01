import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Save } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: user?.username || '', bio: user?.bio || '' });
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => { api.getNotifications().then(setNotifs).catch(() => {}); }, []);

  const save = async () => { await api.updateProfile(form); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleLogout = () => { logout(); navigate('/login'); };
  const markAllRead = async () => { await api.markAllRead(); setNotifs(notifs.map(n => ({...n, is_read: 1}))); };

  return (
    <div className="page">
      <h1 className="page-title" style={{ marginBottom: 24 }}>Profile & Settings</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>My Profile</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div className="avatar" style={{ width: 72, height: 72, fontSize: '1.8rem' }}>{user?.username?.[0]?.toUpperCase()}</div>
          </div>
          <div className="form-group"><label className="form-label">Username</label><input className="input" value={form.username} onChange={e => setForm(f => ({...f, username: e.target.value}))} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="input" value={user?.email} disabled style={{ opacity: 0.6 }} /></div>
          <div className="form-group"><label className="form-label">Bio</label><textarea className="input" placeholder="Tell us about yourself..." value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} /></div>
          <button className="btn btn-primary" onClick={save} style={{ width: '100%', justifyContent: 'center' }}><Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 14 }}>Appearance</div>
            <button className="btn btn-secondary" onClick={toggle} style={{ width: '100%', justifyContent: 'center' }}>
              {theme === 'dark' ? <><Sun size={16} /> Switch to Light Mode</> : <><Moon size={16} /> Switch to Dark Mode</>}
            </button>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 14 }}>Share My Watchlist</div>
            <div style={{ background: 'var(--bg-hover)', borderRadius: 8, padding: '10px 12px', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10, wordBreak: 'break-all' }}>{window.location.origin}/watchlist/share/{user?.id}</div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/watchlist/share/${user?.id}`)}>Copy Link</button>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Notifications</div>
              {notifs.some(n => !n.is_read) && <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark all read</button>}
            </div>
            {notifs.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No notifications</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 250, overflowY: 'auto' }}>
                {notifs.slice(0, 10).map(n => (
                  <div key={n.id} style={{ padding: '10px 12px', borderRadius: 8, background: n.is_read ? 'var(--bg-hover)' : 'var(--accent-glow)', border: `1px solid ${n.is_read ? 'transparent' : 'var(--accent)'}`, opacity: n.is_read ? 0.7 : 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{n.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-danger" onClick={handleLogout} style={{ justifyContent: 'center' }}><LogOut size={16} /> Logout</button>
        </div>
      </div>
    </div>
  );
}
