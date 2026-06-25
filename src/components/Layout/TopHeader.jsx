import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';
import { useThemeStore } from '../../state/themeStore';
import { useStore } from '../../state/useStore';
import './TopHeader.css';

export default function TopHeader({ title, subtitle }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { hasUnsavedChanges, save } = useStore();
  const navigate = useNavigate();
  const [syncTime, setSyncTime] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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
    // Simulate data refresh
    const originalText = document.title;
    document.title = "Refreshing TVS MHF data...";
    setTimeout(() => {
      document.title = originalText;
    }, 400);
  };

  // Get user initials (e.g. "System Admin" -> "SA")
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
        <h1 className="top-header__title">{title}</h1>
        {subtitle && <p className="top-header__subtitle">{subtitle}</p>}
      </div>

      <div className="top-header__actions">
        {/* Sync Indicator */}
        <div className="top-header__sync-indicator" title="Data last synchronized">
          <span className="sync-dot"></span>
          <span className="sync-text">Last Sync: {syncTime}</span>
        </div>

        {/* Action Buttons */}
        <button 
          className="top-header__btn top-header__refresh-btn" 
          onClick={handleRefresh}
          title="Refresh MHF calculations"
        >
          🔄 Refresh
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

        <button
          className="top-header__btn top-header__theme-btn"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          id="header-theme-toggle"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

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
                <button className="user-dropdown-item dropdown-logout-btn" onClick={handleLogout}>
                  🚪 Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
