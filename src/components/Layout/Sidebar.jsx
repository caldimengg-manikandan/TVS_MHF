import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';
import './Sidebar.css';

export default function Sidebar() {
  const { user } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isEditor = user?.role === 'editor';

  return (
    <aside className={`sidebar no-print ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      {/* ── Logo Section ── */}
      <div className="sidebar__logo-container">
        <div className="sidebar__logo">
          <span className="sidebar__logo-text">TVS</span>
          {/* TVS Red Running Horse SVG (Leaping to the Right) */}
          <svg className="sidebar__logo-horse" viewBox="0 0 60 40" width="45" height="30">
            <path 
              d="M 15,22 
                 C 16,19 19,15 22,14 
                 C 25,13 27,10 30,12 
                 C 33,14 36,12 39,13 
                 C 42,14 44,11 46,12
                 C 48,13 50,16 49,19
                 C 48,21 46,20 44,18
                 C 42,16 39,17 36,20
                 C 33,23 33,25 36,26
                 C 39,27 43,24 46,27
                 C 49,30 51,35 47,36
                 C 43,37 38,34 34,30
                 C 30,26 26,27 22,31
                 C 18,35 13,36 8,31
                 C 5,26 7,29 10,27
                 C 13,25 15,26 17,24
                 C 19,22 21,25 22,23 C 23,21 14,25 15,22 Z" 
              fill="#e23636" 
            />
          </svg>
        </div>
        <div className="sidebar__dept-badge">MHF</div>
      </div>

      {/* ── Navigation Menu ── */}
      <div className="sidebar__menu">
        
        {/* OPERATIONS Section */}
        <div className="sidebar__section">
          <span className="sidebar__section-title">OPERATIONS</span>
          <nav className="sidebar__nav">
            <NavLink to="/dashboard" end className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
              <span className="sidebar__link-icon">📊</span>
              <span className="sidebar__link-text">Dashboard</span>
            </NavLink>
          </nav>
        </div>

        {/* ASSETS Section */}
        <div className="sidebar__section">
          <span className="sidebar__section-title">ASSETS</span>
          <nav className="sidebar__nav">
            <NavLink to="/dashboard/details" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
              <span className="sidebar__link-icon">⚙️</span>
              <span className="sidebar__link-text">Asset Management</span>
            </NavLink>
          </nav>
        </div>

        {/* SYSTEM Section */}
        {isEditor && (
          <div className="sidebar__section">
            <span className="sidebar__section-title">MHF CALCULATOR</span>
            <nav className="sidebar__nav">
              <NavLink to="/calculate-capacity" end className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
                <span className="sidebar__link-icon">✏️</span>
                <span className="sidebar__link-text">Calculate Capacity</span>
              </NavLink>
              
              <NavLink to="/calculate-capacity/parameters" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
                <span className="sidebar__link-icon">⏱️</span>
                <span className="sidebar__link-text">Parameters</span>
              </NavLink>
            </nav>
          </div>
        )}

      </div>

      {/* ── Sidebar Footer ── */}
      <div className="sidebar__footer">
        <div className="sidebar__status">
          <span className="status-dot-pulsate"></span>
          <span className="status-text">SYSTEM ONLINE</span>
        </div>
        <button 
          className="sidebar__collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? '➡️' : '⬅️ Collapse'}
        </button>
      </div>
    </aside>
  );
}
