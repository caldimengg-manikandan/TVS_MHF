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
      return { ...m, gap };
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
    { label: 'TOTAL VOLUME / DAY', value: totals.totalVolumePerDay.toLocaleString(), unit: 'Wheels', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>, color: '#005BAC' },
    { label: 'TROLLEYS REQUIRED', value: totals.totalRequired.toLocaleString(), unit: 'Trolleys', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>, color: '#0ea5e9' },
    { label: 'PLANT AVAILABLE', value: totals.totalPlantAvailable != null ? totals.totalPlantAvailable.toLocaleString() : '—', unit: 'Trolleys', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20"></path><path d="M4 22V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v16"></path><path d="M12 22V10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12"></path></svg>, color: '#22C55E' },
    { label: 'TOTAL GAP', value: totals.totalGap != null ? totals.totalGap : '—', unit: 'Trolleys', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>, color: '#EF4444', isDanger: (totals.totalGap || 0) < 0 },
    { label: 'UNIQUE MODELS', value: modelStats.length, unit: 'Models', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="2" x2="12" y2="12"></line></svg>, color: '#8b5cf6' },
    { label: 'WORKING HOURS / DAY', value: params.workingHoursPerDay, unit: 'Hours', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>, color: '#f59e0b' },
  ];

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content">
        <TopHeader title="Analytics Dashboard" subtitle="Real-time overview of MHF asset management and performance" />

        <main className="analytics-content animate-fade-in">

        {/* ── KPI Grid ── */}
        <div className="enterprise-kpi-grid">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="enterprise-kpi-card" style={{ borderLeftColor: kpi.isDanger ? '#EF4444' : 'transparent' }}>
              <div className="kpi-icon-box" style={{ color: kpi.color, backgroundColor: `${kpi.color}15` }}>{kpi.icon}</div>
              <div className="kpi-content">
                <span className="kpi-title">{kpi.label}</span>
                <div className="kpi-value-group">
                  <span className={`kpi-value ${kpi.isDanger ? 'text-negative' : ''}`}>{kpi.value}</span>
                  <span className="kpi-unit">{kpi.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts Grid ── */}
        <div className="enterprise-charts-grid">
          
          {/* Chart 1: Horizontal Bar */}
          <div className="chart-card">
            <h3 className="chart-card__title">Trolley Requirements by Model</h3>
            <span className="chart-card__subtitle">Front & Rear Wheel Trolley Counts</span>
            <div className="bar-chart-container">
              {modelStats.slice(0, 8).map((model) => {
                const pct = (model.totalRequired / maxRequired) * 100;
                return (
                  <div key={model.name} className="bar-chart-row">
                    <span className="bar-label">{model.name}</span>
                    <div className="bar-wrapper">
                      <div className="bar-fill" style={{ width: `${pct}%`, backgroundColor: 'var(--primary-color)' }}></div>
                    </div>
                    <span className="bar-value mono" style={{ color: 'var(--text-secondary)' }}>{model.totalRequired}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Donut Chart */}
          <div className="chart-card donut-card">
            <h3 className="chart-card__title">Assembly Line Gap Distribution</h3>
            <span className="chart-card__subtitle">Percentage of lines by Gap Status</span>
            <div className="donut-chart-wrapper">
              <div className="donut-svg-container">
                <svg viewBox="0 0 100 100" className="donut-svg">
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="var(--border-subtle)" strokeWidth="10" strokeDasharray="238.76" strokeDashoffset="0" />
                  {gapSummary.surplusPct > 0 && (
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="var(--status-positive)" strokeWidth="10" strokeDasharray="238.76" strokeDashoffset={238.76 - (238.76 * gapSummary.surplusPct) / 100} transform="rotate(-90 50 50)" />
                  )}
                  {gapSummary.shortagePct > 0 && (
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="var(--status-negative)" strokeWidth="10" strokeDasharray="238.76" strokeDashoffset={238.76 - (238.76 * gapSummary.shortagePct) / 100} transform={`rotate(${-90 + (gapSummary.surplusPct * 3.6)} 50 50)`} />
                  )}
                </svg>
                <div className="donut-center-label">
                  <span className={`donut-center-val mono ${totals.totalGap < 0 ? 'text-negative' : 'text-positive'}`}>{totals.totalGap != null ? totals.totalGap : '—'}</span>
                  <span className="donut-center-lbl">TOTAL GAP</span>
                </div>
              </div>
              <div className="donut-legends">
                <div className="legend-item" onClick={() => setStatusFilter(statusFilter === 'surplus' ? 'all' : 'surplus')}>
                  <span className="legend-dot bg-positive"></span>
                  <span className="legend-name">Surplus Lines ({gapSummary.surplus})</span>
                  <span className="legend-val mono">{Math.round(gapSummary.surplusPct)}%</span>
                </div>
                <div className="legend-item" onClick={() => setStatusFilter(statusFilter === 'shortage' ? 'all' : 'shortage')}>
                  <span className="legend-dot bg-negative"></span>
                  <span className="legend-name">Shortage Lines ({gapSummary.shortage})</span>
                  <span className="legend-val mono">{Math.round(gapSummary.shortagePct)}%</span>
                </div>
                <div className="legend-item" onClick={() => setStatusFilter(statusFilter === 'neutral' ? 'all' : 'neutral')}>
                  <span className="legend-dot bg-neutral" style={{ backgroundColor: 'var(--border-strong)' }}></span>
                  <span className="legend-name">Unallocated ({gapSummary.neutral})</span>
                  <span className="legend-val mono">{Math.round(gapSummary.neutralPct)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Table & Right Col Grid ── */}
        <div className="dashboard-bottom-grid">
          {/* Table */}
          <div className="card-elevated" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)' }}>Models Portfolio Summary</h3>
              <span className="text-secondary" style={{ fontSize: 'var(--text-xs)' }}>Aggregate view of model requirements, availability and gap status</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="enterprise-table">
                <thead>
                  <tr>
                    <th>MODEL</th>
                    <th className="text-right">VOLUME / DAY</th>
                    <th className="text-right">OFF-TAKE QTY</th>
                    <th className="text-right">REQUIRED</th>
                    <th className="text-right">AVAILABLE</th>
                    <th className="text-right">GAP</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModelStats.map((model) => {
                    const status = model.gap == null ? 'neutral' : model.gap >= 0 ? 'surplus' : 'shortage';
                    return (
                      <tr key={model.name}>
                        <td className="fw-medium">{model.name}</td>
                        <td className="text-right num-cell">{model.volumePerDay.toLocaleString()}</td>
                        <td className="text-right num-cell">x{model.qtyPerVehicle}</td>
                        <td className="text-right num-cell">{model.totalRequired}</td>
                        <td className="text-right num-cell">{model.hasAvailable ? model.plantAvailable : '—'}</td>
                        <td className={`text-right num-cell text-${gapClass(model.gap)} fw-bold`}>
                          {model.gap != null ? (model.gap >= 0 ? `+${model.gap}` : model.gap) : '—'}
                        </td>
                        <td>
                          <span className={`badge badge-${status === 'surplus' ? 'positive' : status === 'shortage' ? 'negative' : 'warning'}`}>
                            {status === 'surplus' ? 'Surplus' : status === 'shortage' ? 'Shortage' : 'Unallocated'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Gap Trend */}
            <div className="card-elevated" style={{ padding: 'var(--space-5)' }}>
              <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)' }}>Gap Trend (Last 7 Days)</h3>
              <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                <svg viewBox="0 0 400 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="400" y2="20" stroke="var(--border-subtle)" />
                  <line x1="0" y1="50" x2="400" y2="50" stroke="var(--border-subtle)" />
                  <line x1="0" y1="80" x2="400" y2="80" stroke="var(--border-subtle)" />
                  
                  {/* Line Path */}
                  <path d="M 0,60 L 60,55 L 120,58 L 180,62 L 240,60 L 300,70 L 360,85" fill="none" stroke="var(--status-negative)" strokeWidth="3" />
                  
                  {/* Data Points */}
                  <circle cx="0" cy="60" r="4" fill="var(--status-negative)" />
                  <circle cx="60" cy="55" r="4" fill="var(--status-negative)" />
                  <circle cx="120" cy="58" r="4" fill="var(--status-negative)" />
                  <circle cx="180" cy="62" r="4" fill="var(--status-negative)" />
                  <circle cx="240" cy="60" r="4" fill="var(--status-negative)" />
                  <circle cx="300" cy="70" r="4" fill="var(--status-negative)" />
                  <circle cx="360" cy="85" r="5" fill="#fff" stroke="var(--status-negative)" strokeWidth="3" />
                  
                  <text x="375" y="85" fill="var(--status-negative)" fontSize="12" fontWeight="bold" alignmentBaseline="middle">-36</text>
                  
                  {/* X Axis Labels */}
                  <text x="0" y="110" fontSize="10" fill="var(--text-tertiary)" textAnchor="middle">Jun 20</text>
                  <text x="60" y="110" fontSize="10" fill="var(--text-tertiary)" textAnchor="middle">Jun 21</text>
                  <text x="120" y="110" fontSize="10" fill="var(--text-tertiary)" textAnchor="middle">Jun 22</text>
                  <text x="180" y="110" fontSize="10" fill="var(--text-tertiary)" textAnchor="middle">Jun 23</text>
                  <text x="240" y="110" fontSize="10" fill="var(--text-tertiary)" textAnchor="middle">Jun 24</text>
                  <text x="300" y="110" fontSize="10" fill="var(--text-tertiary)" textAnchor="middle">Jun 25</text>
                  <text x="360" y="110" fontSize="10" fill="var(--text-tertiary)" textAnchor="middle">Jun 26</text>
                </svg>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="card-elevated" style={{ padding: 'var(--space-5)', flex: 1 }}>
              <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)' }}>Recent Alerts</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <span style={{ color: 'var(--status-warning)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></span>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>HLX 125 4-speed</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Shortage of 3 trolleys</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-tertiary)' }}>5m ago</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <span style={{ color: 'var(--status-warning)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></span>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>Radeon</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Shortage of 0 trolleys</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-tertiary)' }}>12m ago</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  <span style={{ color: 'var(--primary-color)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg></span>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>Daily Planning</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Plan approval pending</div>
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-tertiary)' }}>1h ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </main>
      </div>

      <ExportPanel isOpen={showExport} onClose={() => setShowExport(false)} rows={calculatedRows} totals={totals} />
    </div>
  );
}
