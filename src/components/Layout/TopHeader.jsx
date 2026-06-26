import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';
import { useStore } from '../../state/useStore';
import './TopHeader.css';

export default function TopHeader({ title, subtitle }) {
  const { user, logout } = useAuthStore();
  const { hasUnsavedChanges, save } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [syncTime, setSyncTime] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Generate breadcrumb from path or title
  const pathParts = location.pathname.split('/').filter(p => p);
  let breadcrumb = '';
  if (pathParts.length > 0) {
    breadcrumb = pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' ')).join(' / ');
  } else {
    breadcrumb = 'Dashboard';
  }

  // Format current date and time on mount (and on refresh)
  const updateSyncTime = () => {
    const now = new Date();
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    setSyncTime(now.toLocaleString('en-US', options));
  };

  useEffect(() => {
    updateSyncTime();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRefresh = () => {
    updateSyncTime();
  };

  const getInitials = (name) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="top-header no-print">
      <div className="top-header__title-group">
        <div className="top-header__breadcrumb" style={{ textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--primary-color)', fontSize: '0.85rem' }}>{breadcrumb}</div>
      </div>

      <div className="top-header__actions">
        {/* Plant Selector */}
        <div className="top-header__plant-selector">
          <select className="input-inline" style={{ width: '150px' }}>
            <option value="hosur">Hosur Plant 1</option>
            <option value="hosur2">Hosur Plant 2</option>
            <option value="mysore">Mysore Plant</option>
          </select>
        </div>

        {/* Sync Indicator */}
        <div className="top-header__sync-indicator" title="Data last synchronized">
          <span className="sync-dot"></span>
          <span className="sync-text">Last Sync: {syncTime}</span>
        </div>

        {/* Refresh Button */}
        <button 
          className="top-header__btn top-header__refresh-btn" 
          onClick={handleRefresh}
          title="Refresh MHF calculations"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          Refresh
        </button>

        {/* Notifications */}
        <button className="top-header__btn top-header__icon-btn" title="Notifications" style={{ color: '#f59e0b', backgroundColor: '#fef3c7', borderColor: '#fde68a' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>

        {hasUnsavedChanges && user?.role === 'editor' && (
          <button 
            className="top-header__btn top-header__save-btn animate-pulse" 
            onClick={save} 
            id="header-save-trigger"
          >
            <span className="save-pulsate-dot"></span>
            Save Changes
          </button>
        )}

        {/* User Capsule */}
        <div className="top-header__user-wrapper">
          <div 
            className={`top-header__user-capsule ${showUserDropdown ? 'active' : ''}`}
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            title="Click to manage account"
          >
            <span className="user-capsule__name">{user?.name || 'System Admin'}</span>
            <div className="user-capsule__avatar">
              {getInitials(user?.name || 'System Admin')}
            </div>
          </div>

          {showUserDropdown && (
            <>
              <div className="dropdown-overlay" onClick={() => setShowUserDropdown(false)}></div>
              <div className="user-dropdown-menu animate-slide-up">
                <div className="user-dropdown-header">
                  <span className="dropdown-user-name">{user?.name || 'System Admin'}</span>
                  <span className="dropdown-user-role">{user?.role || 'Guest Viewer'}</span>
                </div>
                <div className="user-dropdown-divider"></div>
                <button className="user-dropdown-item dropdown-logout-btn" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
