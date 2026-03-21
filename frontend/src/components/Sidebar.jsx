import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ navItems, role }) {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();

  const roleColors = {
    seeker: 'seeker',
    recruiter: 'recruiter',
    admin: 'admin',
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <span className="logo-mark">TB</span>
        <div>
          <div className="logo-text">TalentBridge</div>
          <div className={`sidebar__role-badge ${roleColors[role]}`}>{role}</div>
        </div>
      </div>

      {/* User info */}
      <div className="sidebar__user">
        <div className="sidebar__avatar">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user?.name} />
          ) : (
            <span>{user?.name?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="sidebar__user-info">
          <div className="sidebar__user-name">{user?.name}</div>
          <div className="sidebar__user-email">{user?.email}</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `sidebar__nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar__nav-icon">{item.icon}</span>
            <span className="sidebar__nav-label">{item.label}</span>
            {item.label === 'Notifications' && unreadCount > 0 && (
              <span className="sidebar__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="sidebar__bottom">
        <button className="sidebar__logout" onClick={logout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
