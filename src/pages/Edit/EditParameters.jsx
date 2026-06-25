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
      icon: '⏱️',
      description: 'Total working hours per day. Vol/Hr = Vol/Day ÷ this value.',
    },
    {
      key: 'trolleyCapacity',
      label: 'Trolley Capacity',
      unit: 'wheels',
      min: 1,
      max: 100,
      step: 1,
      icon: '🛒',
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
      icon: '🚚',
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
            <span className="unsaved-banner__text">⚠️ You have unsaved changes. These will be lost if you refresh or log out.</span>
            <div className="unsaved-banner__actions">
              <button className="btn btn-secondary btn-sm" onClick={discardChanges}>Discard</button>
              <button className="btn btn--accent btn-sm" onClick={save}>Save Changes</button>
            </div>
          </div>
        )}

        <div className="params-sub-bar no-print">
          <span className="sub-bar__info">⏱️ Fine-tune timing segments for all assembly lines</span>
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
            ℹ️ <strong>How parameters affect calculations:</strong> Any modifications below instantly update the required number of trolleys. 
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
