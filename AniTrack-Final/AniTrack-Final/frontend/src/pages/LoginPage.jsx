import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const demoLogin = async () => {
    setLoading(true);
    try { await login('demo@anitrack.com', 'demo123'); navigate('/'); }
    catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AniTrack</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Your ultimate anime & TV tracker</p>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', padding: 32 }}>
          <div className="tabs" style={{ marginBottom: 24 }}>
            <button className={`tab${mode === 'login' ? ' active' : ''}`} onClick={() => setMode('login')}>Login</button>
            <button className={`tab${mode === 'register' ? ' active' : ''}`} onClick={() => setMode('register')}>Sign Up</button>
          </div>
          <form onSubmit={submit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="input" type="text" placeholder="AnimeKing99" value={form.username} onChange={e => upd('username', e.target.value)} required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => upd('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={e => upd('password', e.target.value)} required />
            </div>
            {error && <p style={{ color: 'var(--accent-2)', fontSize: '0.875rem', marginBottom: 12 }}>⚠ {error}</p>}
            <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
          <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>or</div>
          <button className="btn btn-secondary" onClick={demoLogin} style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>🎌 Try Demo Account</button>
        </div>
      </div>
    </div>
  );
}
