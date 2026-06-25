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
      }
    }, 600);
  };

  return (
    <div className="login-split-page">
      {/* ── Left Side: Branded Visual Panel ── */}
      <div className="login-visual-panel">
        <div className="visual-panel__header">
          <div className="header-capsule">
            <div className="capsule-logo">
              <span className="capsule-logo-text">TVS</span>
              <svg className="capsule-logo-horse" viewBox="0 0 60 40" width="30" height="20">
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
            {error && (
              <div className="login-error animate-shake" role="alert">
                <span className="login-error__icon">⚠️</span>
                <span className="login-error__msg">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="field-label">Email address</label>
              <div className="input-with-icon">
                <span className="input-icon-left">✉️</span>
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
                <span className="input-icon-left">🔒</span>
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
                  🔗
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
