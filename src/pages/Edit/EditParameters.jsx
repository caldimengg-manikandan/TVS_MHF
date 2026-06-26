import { useState } from 'react';
import { useStore } from '../../state/useStore';
import { DEFAULT_PARAMS } from '../../engine/calculator';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import './EditParameters.css';

export default function EditParameters() {
  const { params, setParam, resetToDefaults, discardChanges, hasUnsavedChanges, save } = useStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const paramConfig = [
    {
      key: 'workingHoursPerDay',
      label: 'Working Hours / Day',
      unit: 'hours',
      min: 1,
      max: 24,
      step: 1,
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
      description: 'Total working hours per day. Vol/Hr = Vol/Day ÷ this value.',
    },
    {
      key: 'trolleyCapacity',
      label: 'Trolley Capacity',
      unit: 'wheels',
      min: 1,
      max: 100,
      step: 1,
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>,
      description: 'Max wheels per trolley. Stage Trolleys = ⌈Pieces ÷ Capacity⌉.',
    },
    {
      key: 'supplierHours',
      label: 'Supplier Inventory Hours',
      unit: 'hours',
      min: 0,
      max: 24,
      step: 0.5,
      icon: '🏬',
      description: 'Hours of supplier inventory coverage.',
    },
    {
      key: 'transitHours',
      label: 'Transit Hours',
      unit: 'hours',
      min: 0,
      max: 24,
      step: 0.5,
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
      description: 'Transit time (fwd path). standard value is 1.5h.',
    },
    {
      key: 'openingHours',
      label: 'Opening Inventory Hours',
      unit: 'hours',
      min: 0,
      max: 24,
      step: 0.5,
      icon: '📦',
      description: 'Opening inventory at P2/HEX1/HEX2 storage locations.',
    },
    {
      key: 'pocHours',
      label: 'POC Hours',
      unit: 'hours',
      min: 0,
      max: 24,
      step: 0.5,
      icon: '⚡',
      description: 'Point-of-consumption inventory at vehicle assembly line.',
    },
  ];

  const handleChange = (key, value) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setParam(key, num);
    }
  };

  const handleReset = () => {
    resetToDefaults();
    setShowConfirm(false);
  };

  const isModified = (key) => params[key] !== DEFAULT_PARAMS[key];
  const anyModified = Object.keys(DEFAULT_PARAMS).some(
    (key) => params[key] !== DEFAULT_PARAMS[key]
  );

  return (
    <div className="edit-parameters-page">
      <Sidebar />

      <main className="edit-parameters-content animate-fade-in">
        <TopHeader 
          title="MHF Parameters" 
          subtitle="Configure MHF stages, calculation timings, and capacities" 
        />

        {/* Unsaved changes banner */}
        {hasUnsavedChanges && (
          <div className="unsaved-banner no-print">
            <span className="unsaved-banner__text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              You have unsaved changes. These will be lost if you refresh or log out.
            </span>
            <div className="unsaved-banner__actions">
              <button className="btn btn-secondary btn-sm" onClick={discardChanges}>Discard</button>
              <button className="btn btn--accent btn-sm" onClick={save}>Save Changes</button>
            </div>
          </div>
        )}

        <div className="params-sub-bar no-print">
          <span className="sub-bar__info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Fine-tune timing segments for all assembly lines
          </span>
          <div className="action-bar__buttons">
            {showConfirm ? (
              <div className="reset-confirm-box">
                <span className="text-warning">Reset to factory defaults?</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowConfirm(false)}>Cancel</button>
                <button className="btn btn-danger btn-sm" onClick={handleReset} id="btn-confirm-reset">Confirm</button>
              </div>
            ) : (
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowConfirm(true)}
                disabled={!anyModified}
                id="btn-reset-params"
              >
                🔄 Reset to Defaults
              </button>
            )}
          </div>
        </div>

        <div className="parameters-info-card">
          <p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <strong>How parameters affect calculations:</strong> Any modifications below instantly update the required number of trolleys. 
            </div>
            For example, reducing the <strong>Working Hours/Day</strong> increases the pieces required per hour, potentially raising trolley counts.
          </p>
        </div>

        {/* Parameter Cards Grid */}
        <div className="parameters-grid stagger-children">
          {paramConfig.map((cfg) => {
            const modified = isModified(cfg.key);
            return (
              <div key={cfg.key} className={`parameter-card ${modified ? 'parameter-card--modified' : ''}`}>
                <div className="parameter-card__header">
                  <div className="parameter-card__icon">{cfg.icon}</div>
                  <div className="parameter-card__title-group">
                    <h4>{cfg.label}</h4>
                    {modified && <span className="modified-badge">Modified</span>}
                  </div>
                </div>

                <div className="parameter-card__body">
                  <p className="parameter-description">{cfg.description}</p>
                  
                  <div className="parameter-input-group">
                    <input
                      type="number"
                      id={`param-${cfg.key}`}
                      value={params[cfg.key]}
                      onChange={(e) => handleChange(cfg.key, e.target.value)}
                      min={cfg.min}
                      max={cfg.max}
                      step={cfg.step}
                    />
                    <span className="parameter-unit">{cfg.unit}</span>
                  </div>

                  {modified && (
                    <div className="parameter-default-hint">
                      <span>Default: {DEFAULT_PARAMS[cfg.key]} {cfg.unit}</span>
                      <button className="btn-restore-link" onClick={() => setParam(cfg.key, DEFAULT_PARAMS[cfg.key])}>
                        Restore
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <footer className="edit-parameters-footer no-print">
          <span className="text-tertiary" style={{ fontSize: 'var(--text-xs)' }}>
            TVS Motor Company — Internal / Confidential &nbsp;·&nbsp; Hosur Plant &nbsp;·&nbsp; Dual Theme Enabled
          </span>
        </footer>
      </main>

    </div>
  );
}
