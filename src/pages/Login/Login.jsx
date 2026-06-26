import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../state/authStore';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const res = login(email, password, rememberMe);
      setIsLoading(false);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error);
        setTimeout(() => setError(''), 5000); // Auto clear toast after 5s
      }
    }, 600);
  };

  return (
    <div className="login-split-page">
      {/* Toast Notification */}
      {error && (
        <div className="toast-notification animate-slide-down">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="toast-icon"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span className="toast-message">{error}</span>
          <button type="button" className="toast-close" onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* ── Left Side: Branded Visual Panel ── */}
      <div className="login-visual-panel">
        <div className="visual-panel__header">
          <div className="header-capsule">
            <div className="capsule-logo" style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '240px' }}>
              <img src="/logo.jpg" alt="TVS Logo" style={{ height: '120px', width: '100%', objectFit: 'contain', transform: 'scale(1.8)' }} />
            </div>
            <div className="capsule-text">
              <h2 className="capsule-title">MHF</h2>
              <span className="capsule-subtitle">Asset Management & Performance</span>
            </div>
            <button type="button" className="capsule-btn">SECURE LOGIN</button>
          </div>
        </div>

        {/* Center visual: TVS Motorcycle portfolio card */}
        <div className="visual-panel__content">
          <div className="portfolio-card fade-in">
            <img 
              src="/tvs_portfolio.png" 
              alt="TVS Motors Portfolio Collage" 
              className="portfolio-card__img"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="portfolio-card__overlay">
              <span className="portfolio-tag">TVS PORTFOLIO</span>
              <h3 className="portfolio-title">Scooters, commuters and performance machines in one view</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Side: Sign-In Form Panel ── */}
      <div className="login-form-panel">
        <div className="form-panel__container fade-in">
          
          <div className="form-panel__heading">
            <h1 className="welcome-title">Welcome back</h1>
            <p className="welcome-subtitle">Sign in to your <strong>MHF Asset</strong> account.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="field-label">Email address</label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="superadmin@miscpro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={error ? 'input-error' : ''}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password" className="field-label">Password</label>
                <button type="button" className="btn-forgot-password">Forgot password?</button>
              </div>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={error ? 'input-error' : ''}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="btn-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="form-options">
              <label className="checkbox-container">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-login"
              className={`btn-login-blue ${isLoading ? 'btn-login--loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                <>Sign in to dashboard <span className="btn-arrow">→</span></>
              )}
            </button>
          </form>

          {/* Centered Divider & Demo Credentials Helper */}
          <div className="demo-credentials-divider">
            <span className="divider-text">DEMO CREDENTIALS</span>
          </div>

          <div className="demo-credentials-text">
            <span>Email: <strong>admin@tvs.com</strong> Pass: <strong>admin123</strong></span>
          </div>

          {/* Equipment Overview section */}
          <div className="equipment-overview">
            <h4 className="equipment-title">MHF EQUIPMENT OVERVIEW</h4>
            <p className="equipment-subtitle">Quick view of key trolley variants used across TVS MHF plants.</p>
            
            <div className="trolley-grid">
              {/* Trolley 1 */}
              <div className="trolley-item" title="Standard Wheel Trolley">
                <div className="trolley-icon-svg">
                  <svg viewBox="0 0 40 40" width="100%" height="100%">
                    <path d="M10 30 h22 M14 10 v20 M26 10 v20 M14 10 h12 M14 18 h12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <circle cx="15" cy="33" r="3" fill="currentColor" />
                    <circle cx="27" cy="33" r="3" fill="currentColor" />
                  </svg>
                </div>
              </div>
              
              {/* Trolley 2 */}
              <div className="trolley-item" title="Heavy-duty Trolley">
                <div className="trolley-icon-svg">
                  <svg viewBox="0 0 40 40" width="100%" height="100%">
                    <rect x="8" y="12" width="24" height="15" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
                    <line x1="8" y1="20" x2="32" y2="20" stroke="currentColor" strokeWidth="2" />
                    <line x1="20" y1="12" x2="20" y2="27" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="32" r="3.5" fill="currentColor" />
                    <circle cx="28" cy="32" r="3.5" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Trolley 3 */}
              <div className="trolley-item" title="Platform Tow-Cart">
                <div className="trolley-icon-svg">
                  <svg viewBox="0 0 40 40" width="100%" height="100%">
                    <path d="M5 24 h28 M12 24 v-14 h4 M33 24 v-8 h-8" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <circle cx="10" cy="28" r="3" fill="currentColor" />
                    <circle cx="28" cy="28" r="3" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Trolley 4 */}
              <div className="trolley-item" title="Box Cage Trolley">
                <div className="trolley-icon-svg">
                  <svg viewBox="0 0 40 40" width="100%" height="100%">
                    <rect x="10" y="8" width="20" height="20" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M10 13 h20 M10 18 h20 M10 23 h20 M15 8 v20 M20 8 v20 M25 8 v20" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                    <circle cx="13" cy="32" r="3" fill="currentColor" />
                    <circle cx="27" cy="32" r="3" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Trolley 5 */}
              <div className="trolley-item" title="Special Carrier">
                <div className="trolley-icon-svg">
                  <svg viewBox="0 0 40 40" width="100%" height="100%">
                    <path d="M8 30 h24 M12 30 v-22 h16 v6 M28 14 h-16 M18 8 v14 M22 8 v14" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="14" cy="33" r="3" fill="currentColor" />
                    <circle cx="26" cy="33" r="3" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="form-panel__footer">
            <p>© 2026 TVS Group · MHF Department.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
