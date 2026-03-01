import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Home, Search, BookmarkCheck, Users, BarChart2, User, Moon, Sun, LogOut } from 'lucide-react';

const NAV = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/browse', icon: Search, label: 'Browse' },
  { to: '/watchlist', icon: BookmarkCheck, label: 'My List' },
  { to: '/clubs', icon: Users, label: 'Clubs' },
  { to: '/analytics', icon: BarChart2, label: 'Stats' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Ani<span>Track</span></div>
        <nav className="sidebar-nav">
          {NAV.map(({ to, icon: Icon, label, exact }) => (
            <NavLink key={to} to={to} end={exact} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button className="btn-icon" onClick={toggle}>{theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}</button>
            <button className="btn-icon" onClick={handleLogout}><LogOut size={16} /></button>
          </div>
          <div className="user-chip">
            <div className="avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Anime Fan</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content"><Outlet /></main>

      <nav className="mobile-nav">
        {NAV.slice(0, 5).map(({ to, icon: Icon, label, exact }) => (
          <NavLink key={to} to={to} end={exact} className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
            <Icon size={22} />{label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
