import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = { watching: '#43e97b', completed: '#7c5cfc', on_hold: '#f6d365', dropped: '#fc5c7d', plan_to_watch: '#888' };

export default function Analytics() {
  const [data, setData] = useState(null);
  useEffect(() => { api.getAnalytics().then(setData).catch(console.error); }, []);
  if (!data) return <div className="page"><div className="skeleton" style={{ height: 200, borderRadius: 12 }} /></div>;

  const statusData = (data.by_status || []).map(s => ({ name: s.status.replace('_', ' '), value: s.count, color: COLORS[s.status] || '#888' }));
  const genreData = (data.top_genres || []).flatMap(g => g.genre ? g.genre.split(',').map(genre => ({ name: genre.trim(), count: g.count })) : []).slice(0, 8);

  return (
    <div className="page">
      <div className="page-header"><h1 className="page-title">My Stats</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[['📺', 'Episodes Watched', data.total_episodes_watched || 0], ['⏱', 'Hours Watched', `${data.estimated_hours || 0}h`], ['⭐', 'Average Score', data.average_score > 0 ? `${data.average_score}/10` : '—'], ['🎌', 'Total Shows', (data.by_status || []).reduce((a, b) => a + b.count, 0)]].map(([icon, label, value]) => (
          <div key={label} className="stat-card"><div style={{ fontSize: '1.8rem', marginBottom: 4 }}>{icon}</div><div className="stat-number" style={{ fontSize: '1.6rem' }}>{value}</div><div className="stat-label">{label}</div></div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
        {statusData.length > 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Watchlist Breakdown</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>{statusData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} /></PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {statusData.map(s => <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} /><span style={{ color: 'var(--text-secondary)' }}>{s.name}: <strong>{s.value}</strong></span></div>)}
            </div>
          </div>
        )}
        {genreData.length > 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Favorite Genres</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={genreData} layout="vertical"><XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} /><YAxis type="category" dataKey="name" width={80} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} /><Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} /><Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} /></BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {data.recent_activity?.length > 0 && (
        <div>
          <div className="section-title" style={{ marginBottom: 14 }}>Recent Activity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.recent_activity.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px' }}>
                <img src={a.cover_image} alt={a.title} style={{ width: 36, height: 50, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(a.updated_at).toLocaleDateString()}</div>
                </div>
                <span className={`status-badge status-${a.status}`}>{a.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
