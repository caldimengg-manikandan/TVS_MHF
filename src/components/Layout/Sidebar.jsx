import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';
import './Sidebar.css';

export default function Sidebar() {
  const { user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // We show Administration to Admins, others are visible based on roles if needed.
  // For the Enterprise UI, we show all sections structurally.
  const isAdmin = user?.role === 'Admin';
  const canEditMasters = ['Admin', 'Planner', 'Production Engineer'].includes(user?.role);

  return (
    <aside className={`sidebar no-print ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      {/* ── Logo Section ── */}
      <div className="sidebar__logo-container">
        <div className="sidebar__logo" style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src="/logo.jpg" alt="TVS Logo" style={{ height: '120px', width: '100%', objectFit: 'contain', transform: 'scale(1.8)' }} />
        </div>
      </div>

      {/* ── Navigation Menu ── */}
      <div className="sidebar__menu">
        
        <div className="sidebar__section">
          <span className="sidebar__section-title">DASHBOARD</span>
          <nav className="sidebar__nav">
            <NavLink to="/dashboard" end className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
              <span className="sidebar__link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
              </span>
              <span className="sidebar__link-text">Analytics Dashboard</span>
            </NavLink>
          </nav>
        </div>

        <div className="sidebar__section">
          <span className="sidebar__section-title">OPERATIONS</span>
          <nav className="sidebar__nav">
            <NavLink to="/dashboard/details" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
              <span className="sidebar__link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </span>
              <span className="sidebar__link-text">Asset List</span>
            </NavLink>
            <NavLink to="/operations/allocation" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
              <span className="sidebar__link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </span>
              <span className="sidebar__link-text">MHF Allocation</span>
            </NavLink>
            <NavLink to="/operations/gap-management" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
              <span className="sidebar__link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </span>
              <span className="sidebar__link-text">Gap Management</span>
            </NavLink>
            <NavLink to="/operations/transfer-management" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
              <span className="sidebar__link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              </span>
              <span className="sidebar__link-text">Transfer Management</span>
            </NavLink>
            <NavLink to="/operations/request-management" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
              <span className="sidebar__link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </span>
              <span className="sidebar__link-text">Request Management</span>
            </NavLink>
          </nav>
        </div>

        <div className="sidebar__section">
          <span className="sidebar__section-title">PLANNING</span>
          <nav className="sidebar__nav">
            <NavLink to="/planning/daily" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
              <span className="sidebar__link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </span>
              <span className="sidebar__link-text">Daily Planning</span>
            </NavLink>
            <NavLink to="/planning/calendar" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
              <span className="sidebar__link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </span>
              <span className="sidebar__link-text">Planning Calendar</span>
            </NavLink>
            <NavLink to="/planning/history" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
              <span className="sidebar__link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </span>
              <span className="sidebar__link-text">Planning History</span>
            </NavLink>
          </nav>
        </div>

        <div className="sidebar__section">
          <span className="sidebar__section-title">REPORTS</span>
          <nav className="sidebar__nav">
            <NavLink to="/reports" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
              <span className="sidebar__link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              </span>
              <span className="sidebar__link-text">Reports & Analytics</span>
            </NavLink>
          </nav>
        </div>
        
        {isAdmin && (
          <div className="sidebar__section">
            <span className="sidebar__section-title">ADMINISTRATION</span>
            <nav className="sidebar__nav">
              <NavLink to="/admin/users" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
                <span className="sidebar__link-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </span>
                <span className="sidebar__link-text">Users</span>
              </NavLink>
              {canEditMasters && (
                <>
                  <NavLink to="/masters/vehicle-models" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
                    <span className="sidebar__link-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    </span>
                    <span className="sidebar__link-text">Vehicle Models</span>
                  </NavLink>
                  <NavLink to="/masters/production-parts" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
                    <span className="sidebar__link-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                    </span>
                    <span className="sidebar__link-text">Production Parts</span>
                  </NavLink>
                  <NavLink to="/masters/suppliers" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
                    <span className="sidebar__link-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                    </span>
                    <span className="sidebar__link-text">Suppliers</span>
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        )}

      </div>

      {/* ── Sidebar Footer ── */}
      <div className="sidebar__footer">
        <button 
          className="sidebar__collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span style={{ display: isCollapsed ? 'none' : 'inline' }}>Collapse Sidebar</span>
        </button>
      </div>
    </aside>
  );
}
