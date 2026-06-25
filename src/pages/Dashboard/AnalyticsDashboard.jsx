import { useState, useMemo } from 'react';
import { useStore, useCalculatedRows, useActiveTotals } from '../../state/useStore';
import { useAuthStore } from '../../state/authStore';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import ExportPanel from '../../components/Export/ExportPanel';
import './AnalyticsDashboard.css';

export default function AnalyticsDashboard() {
  const { params } = useStore();
  const allRows = useCalculatedRows();
  const calculatedRows = allRows.filter((row) => row.status === 'Active');
  const totals = useActiveTotals();
  const { user } = useAuthStore();
  const isEditor = user?.role === 'editor';

  const [selectedModel, setSelectedModel] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Group calculations by model name
  const modelStats = useMemo(() => {
    const map = new Map();
    calculatedRows.forEach((row) => {
      if (!map.has(row.model)) {
        map.set(row.model, {
          name: row.model,
          volumePerDay: row.volumePerDay,
          qtyPerVehicle: row.qtyPerVehicle || 1,
          totalRequired: 0,
          plantAvailable: 0,
          hasAvailable: false,
          remarks: [],
          lines: [],
        });
      }
      const m = map.get(row.model);
      m.totalRequired += row.totalRequired;
      m.lines.push(row);
      if (row.plantAvailableTrolleys != null) {
        m.plantAvailable += row.plantAvailableTrolleys;
        m.hasAvailable = true;
      }
      if (row.remarks) {
        m.remarks.push(`${row.wheelLine.replace(' wheel Assy', '')}: ${row.remarks}`);
      }
    });

    return Array.from(map.values()).map((m) => {
      const gap = m.hasAvailable ? m.plantAvailable - m.totalRequired : null;
      return {
        ...m,
        gap,
      };
    });
  }, [calculatedRows]);

  const filteredModelStats = useMemo(() => {
    if (statusFilter === 'all') return modelStats;
    return modelStats.filter((m) => {
      const status = m.gap == null ? 'neutral' : m.gap >= 0 ? 'surplus' : 'shortage';
      return status === statusFilter;
    });
  }, [modelStats, statusFilter]);

  const maxRequired = useMemo(() => {
    if (!modelStats.length) return 1;
    return Math.max(...modelStats.map((m) => m.totalRequired));
  }, [modelStats]);

  const gapSummary = useMemo(() => {
    let shortage = 0;
    let surplus = 0;
    let neutral = 0;

    calculatedRows.forEach((r) => {
      if (r.gap == null) {
        neutral++;
      } else if (r.gap < 0) {
        shortage++;
      } else {
        surplus++;
      }
    });

    const total = shortage + surplus + neutral;
    return {
      shortage,
      surplus,
      neutral,
      shortagePct: total ? (shortage / total) * 100 : 0,
      surplusPct: total ? (surplus / total) * 100 : 0,
      neutralPct: total ? (neutral / total) * 100 : 0,
    };
  }, [calculatedRows]);

  const gapClass = (gap) => {
    if (gap == null) return 'neutral';
    return gap >= 0 ? 'positive' : 'negative';
  };

  const selectedModelDetail = useMemo(() => {
    if (!selectedModel) return null;
    return modelStats.find(m => m.name === selectedModel);
  }, [selectedModel, modelStats]);

  const kpis = [
    {
      label: 'Total Volume / Day',
      value: totals.totalVolumePerDay.toLocaleString(),
      unit: 'wheels',
      icon: '⚙️',
      status: 'neutral',
    },
    {
      label: 'Trolleys Required',
      value: totals.totalRequired.toLocaleString(),
      unit: 'trolleys',
      icon: '🛒',
      accent: true,
    },
    {
      label: 'Plant Available',
      value: totals.totalPlantAvailable != null ? totals.totalPlantAvailable.toLocaleString() : '—',
      unit: totals.totalPlantAvailable != null ? 'trolleys' : 'not entered',
      icon: '🏭',
      status: 'neutral',
    },
    {
      label: 'Total Gap',
      value: totals.totalGap != null ? (totals.totalGap >= 0 ? `+${totals.totalGap}` : totals.totalGap) : '—',
      unit: totals.totalGap != null ? (totals.totalGap >= 0 ? 'surplus' : 'shortage') : '',
      icon: totals.totalGap != null ? (totals.totalGap >= 0 ? '✓' : '⚠️') : '—',
      status: totals.totalGap != null ? (totals.totalGap >= 0 ? 'positive' : 'negative') : 'neutral',
    },
    {
      label: 'Unique Models',
      value: modelStats.length,
      unit: 'models',
      icon: '🏍️',
      status: 'neutral',
    },
    {
      label: 'Working Hours',
      value: params.workingHoursPerDay,
      unit: 'hrs/day',
      icon: '⏱️',
      status: 'neutral',
    },
  ];

  return (
    <div className="analytics-page">
      <Sidebar />

      <main className="analytics-content animate-fade-in">
        <TopHeader 
          title="MHF Executive Analytics Dashboard" 
          subtitle="MHF Asset Management & Performance Overview" 
        />

        <div className="analytics-sub-bar no-print">
          <span className="sub-bar__info">📊 Real-time MHF KPI Overview & Statistics</span>
          <button className="btn btn--accent btn-export" onClick={() => setShowExport(true)}>
            📥 Export Reports
          </button>
        </div>

        {/* ── KPI Grid ── */}
        <div className="kpi-grid stagger-children">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className={`kpi-card ${kpi.accent ? 'kpi-card--accent' : ''} ${
                kpi.status ? `kpi-card--${kpi.status}` : ''
              }`}
            >
              <div className="kpi-card__icon">{kpi.icon}</div>
              <div className="kpi-card__body">
                <span className="kpi-card__label">{kpi.label}</span>
                <span className="kpi-card__value mono">{kpi.value}</span>
                <span className="kpi-card__unit">{kpi.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts Section ── */}
        <div className="charts-grid stagger-children">
          
          {/* Chart 1: Trolleys Required per Model */}
          <div className="chart-card">
            <h3 className="chart-card__title">Trolley Requirements by Model</h3>
            <span className="chart-card__subtitle">Combined front and rear wheel trolley counts</span>
            
            <div className="bar-chart-container">
              {modelStats.map((model) => {
                const pct = (model.totalRequired / maxRequired) * 100;
                return (
                  <div key={model.name} className="bar-chart-row">
                    <span className="bar-label" title={model.name}>{model.name}</span>
                    <div className="bar-wrapper">
                      <div 
                        className="bar-fill" 
                        style={{ width: `${pct}%` }}
                      >
                        <span className="bar-value mono">{model.totalRequired}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Trolley Gap Status */}
          <div className="chart-card donut-card">
            <h3 className="chart-card__title">Assembly Line Gap Distribution</h3>
            <span className="chart-card__subtitle">Percentage of lines experiencing shortages</span>

            <div className="donut-chart-wrapper">
              <div className="donut-svg-container">
                <svg viewBox="0 0 100 100" className="donut-svg">
                  {/* Total Circumference of radius 38 is ~238.76 */}
                  
                  {/* Neutral segment (gray) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="var(--border-strong)"
                    strokeWidth="10"
                    strokeDasharray="238.76"
                    strokeDashoffset="0"
                  />
                  
                  {/* Surplus segment (green) */}
                  {gapSummary.surplusPct > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="var(--status-positive)"
                      strokeWidth="10"
                      strokeDasharray="238.76"
                      strokeDashoffset={238.76 - (238.76 * gapSummary.surplusPct) / 100}
                      transform="rotate(-90 50 50)"
                    />
                  )}

                  {/* Shortage segment (red) - placed at the top */}
                  {gapSummary.shortagePct > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="var(--status-negative)"
                      strokeWidth="10"
                      strokeDasharray="238.76"
                      strokeDashoffset={238.76 - (238.76 * gapSummary.shortagePct) / 100}
                      transform={`rotate(${-90 + (gapSummary.surplusPct * 3.6)} 50 50)`}
                    />
                  )}
                </svg>

                <div className="donut-center-label">
                  <span className="donut-center-val mono">
                    {totals.totalGap != null ? (totals.totalGap >= 0 ? `+${totals.totalGap}` : totals.totalGap) : '—'}
                  </span>
                  <span className="donut-center-lbl">Total Gap</span>
                </div>
              </div>

              {/* Legends */}
              <div className="donut-legends">
                <div 
                  className={`legend-item ${statusFilter === 'surplus' ? 'active-legend' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === 'surplus' ? 'all' : 'surplus')}
                  style={{
                    cursor: 'pointer',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-sm)',
                    background: statusFilter === 'surplus' ? 'var(--status-positive-bg)' : 'transparent',
                    border: statusFilter === 'surplus' ? '1px solid var(--status-positive)' : '1px solid transparent',
                    transition: 'all var(--duration-fast) var(--ease-out)',
                  }}
                  title="Filter to Surplus models"
                >
                  <span className="legend-dot bg-positive"></span>
                  <span className="legend-name">Surplus Lines ({gapSummary.surplus})</span>
                  <span className="legend-val mono">{Math.round(gapSummary.surplusPct)}%</span>
                </div>
                <div 
                  className={`legend-item ${statusFilter === 'shortage' ? 'active-legend' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === 'shortage' ? 'all' : 'shortage')}
                  style={{
                    cursor: 'pointer',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-sm)',
                    background: statusFilter === 'shortage' ? 'var(--status-negative-bg)' : 'transparent',
                    border: statusFilter === 'shortage' ? '1px solid var(--status-negative)' : '1px solid transparent',
                    transition: 'all var(--duration-fast) var(--ease-out)',
                  }}
                  title="Filter to Shortage models"
                >
                  <span className="legend-dot bg-negative"></span>
                  <span className="legend-name">Shortage Lines ({gapSummary.shortage})</span>
                  <span className="legend-val mono">{Math.round(gapSummary.shortagePct)}%</span>
                </div>
                <div 
                  className={`legend-item ${statusFilter === 'neutral' ? 'active-legend' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === 'neutral' ? 'all' : 'neutral')}
                  style={{
                    cursor: 'pointer',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-sm)',
                    background: statusFilter === 'neutral' ? 'var(--border-subtle)' : 'transparent',
                    border: statusFilter === 'neutral' ? '1px solid var(--border-medium)' : '1px solid transparent',
                    transition: 'all var(--duration-fast) var(--ease-out)',
                  }}
                  title="Filter to Unallocated models"
                >
                  <span className="legend-dot bg-neutral"></span>
                  <span className="legend-name">Unallocated ({gapSummary.neutral})</span>
                  <span className="legend-val mono">{Math.round(gapSummary.neutralPct)}%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Summary List Table ── */}
        <div className="summary-list-section">
          <div className="summary-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Models Portfolio Summary</h3>
              {statusFilter !== 'all' && (
                <span className="active-filter-badge" style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-gold)', marginLeft: 'var(--space-3)', fontWeight: 600 }}>
                  Active Filter: {statusFilter === 'neutral' ? 'Unallocated' : statusFilter.toUpperCase()} (Click legend segment again to clear)
                </span>
              )}
            </div>
            <span className="text-secondary text-sm">Click any row to open model aggregate breakdown drawer</span>
          </div>

          <div className="summary-list-wrapper">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Vehicle Model</th>
                  <th className="text-right">Volume / Day</th>
                  <th className="text-right">Off-take Qty</th>
                  <th className="text-right">Combined Required</th>
                  <th className="text-right">Combined Available</th>
                  <th className="text-right">Aggregated Gap</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredModelStats.map((model) => {
                  const status = model.gap == null ? 'neutral' : model.gap >= 0 ? 'surplus' : 'shortage';
                  return (
                    <tr 
                      key={model.name}
                      className={`summary-tr clickable-row ${selectedModel === model.name ? 'row-selected' : ''}`}
                      onClick={() => setSelectedModel(model.name)}
                    >
                      <td className="font-semibold">{model.name}</td>
                      <td className="text-right mono">{model.volumePerDay.toLocaleString()}</td>
                      <td className="text-right mono">x{model.qtyPerVehicle}</td>
                      <td className="text-right mono">{model.totalRequired}</td>
                      <td className="text-right mono">{model.hasAvailable ? model.plantAvailable : '—'}</td>
                      <td className={`text-right mono font-bold text-${gapClass(model.gap)}`}>
                        {model.gap != null ? (model.gap >= 0 ? `+${model.gap}` : model.gap) : '—'}
                      </td>
                      <td>
                        <span className={`badge badge-${status === 'surplus' ? 'positive' : status === 'shortage' ? 'negative' : 'warning'}`}>
                          {status === 'surplus' ? '✓ Surplus' : status === 'shortage' ? '⚠️ Shortage' : 'Unallocated'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="analytics-footer no-print">
          <span className="text-tertiary" style={{ fontSize: 'var(--text-xs)' }}>
            TVS Motor Company — Internal / Confidential &nbsp;·&nbsp; Hosur Plant &nbsp;·&nbsp; Live Charts Engine
          </span>
        </footer>
      </main>

      {/* ── Aggregate Model detail panel (Drawer) ── */}
      {selectedModelDetail && (
        <div className="detail-drawer-backdrop" onClick={() => setSelectedModel(null)}>
          <div className="detail-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="detail-drawer__header">
              <div className="detail-drawer__title-group">
                <span className="detail-drawer__badge">Aggregate Portfolio</span>
                <h3>{selectedModelDetail.name}</h3>
                <span className="detail-drawer__sub">Front & Rear Line Consolidation</span>
              </div>
              <button className="detail-drawer__close" onClick={() => setSelectedModel(null)}>✕</button>
            </div>

            <div className="detail-drawer__content">
              {/* Stat boxes */}
              <div className="drawer-summary-grid">
                <div className="drawer-stat">
                  <span className="drawer-stat__label">Volume/Day</span>
                  <span className="drawer-stat__value">{selectedModelDetail.volumePerDay}</span>
                  <span className="drawer-stat__unit">vehicles</span>
                </div>
                <div className="drawer-stat">
                  <span className="drawer-stat__label">Off-take Qty</span>
                  <span className="drawer-stat__value">x{selectedModelDetail.qtyPerVehicle}</span>
                  <span className="drawer-stat__unit">wheels/vehicle</span>
                </div>
              </div>

              {/* Status block */}
              <div className="drawer-status-box">
                <div className="drawer-status-item">
                  <span className="status-label">Total Required (Combined)</span>
                  <span className="status-value mono">{selectedModelDetail.totalRequired} <span className="unit-label">trolleys</span></span>
                </div>
                <div className="drawer-status-item">
                  <span className="status-label">Plant Available (Combined)</span>
                  <span className="status-value mono">{selectedModelDetail.hasAvailable ? selectedModelDetail.plantAvailable : '—'} <span className="unit-label">trolleys</span></span>
                </div>
                <div className="drawer-status-item border-top">
                  <span className="status-label">Consolidated Gap</span>
                  <span className={`status-value mono text-${gapClass(selectedModelDetail.gap)}`}>
                    {selectedModelDetail.gap != null ? (selectedModelDetail.gap >= 0 ? `+${selectedModelDetail.gap}` : selectedModelDetail.gap) : '—'} 
                    <span className="unit-label">{selectedModelDetail.gap != null ? (selectedModelDetail.gap >= 0 ? ' surplus' : ' shortage') : 'not specified'}</span>
                  </span>
                </div>
              </div>

              {/* Line splits */}
              <div className="drawer-section">
                <h4>Line Breakdown</h4>
                <div className="stage-breakdown-list">
                  {selectedModelDetail.lines.map((line) => (
                    <div key={line.id} className="stage-breakdown-item">
                      <div className="stage-info">
                        <span className="stage-num">{line.wheelLine.includes('Front') ? 'F' : 'R'}</span>
                        <div>
                          <span className="stage-name">{line.wheelLine}</span>
                          <span className="stage-meta">{line.partNumber || 'No Part Number'}</span>
                        </div>
                      </div>
                      <div className="stage-values">
                        <span className="value-pcs">{line.totalRequired} Required</span>
                        <span className={`value-trolleys text-${gapClass(line.gap)}`}>
                          Gap: {line.gap != null ? (line.gap >= 0 ? `+${line.gap}` : line.gap) : '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consolidated remarks */}
              {selectedModelDetail.remarks.length > 0 && (
                <div className="drawer-section">
                  <h4>Consolidated Notes</h4>
                  <div className="stage-breakdown-list">
                    {selectedModelDetail.remarks.map((rem, idx) => (
                      <div key={idx} className="drawer-remarks-box" style={{ marginBottom: 'var(--space-2)' }}>
                        {rem}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="detail-drawer__footer">
              {isEditor ? (
                <a href="/calculate-capacity" className="btn btn--accent edit-shortcut-btn" onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/calculate-capacity';
                }}>
                  ✏️ Edit Capacity
                </a>
              ) : (
                <span className="viewer-role-hint">Viewing with Read-Only Access</span>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedModel(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Reports Modal */}
      <ExportPanel isOpen={showExport} onClose={() => setShowExport(false)} rows={calculatedRows} totals={totals} />

    </div>
  );
}
