import { useState } from 'react';
import { useStore, useCalculatedRows, useActiveTotals } from '../../state/useStore';
import { useAuthStore } from '../../state/authStore';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import ExportPanel from '../../components/Export/ExportPanel';
import FilterBar from '../../components/Filters/FilterBar';
import { TABLE_COLUMNS } from '../../utils/columns';
import './Dashboard.css';

export default function Dashboard() {
  const { params, setRowField, addModelToLine, removeModelFromLine } = useStore();
  const allRows = useCalculatedRows();
  const calculatedRows = allRows;
  const totals = useActiveTotals();
  const { user } = useAuthStore();
  const isEditor = user?.role === 'editor';

  const [selectedRow, setSelectedRow] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [showAddToLineModal, setShowAddToLineModal] = useState(false);
  const [modelNameToAdd, setModelNameToAdd] = useState('');
  const [initialPlantAvail, setInitialPlantAvail] = useState('');

  // Reusable Filter state
  const [filters, setFilters] = useState({
    source: 'all',
    model: 'all',
    wheelLine: 'all',
    gapStatus: 'all',
    lifecycleStatus: 'Active',
    search: '',
  });

  const uniqueModels = Array.from(new Set(calculatedRows.map((r) => r.model)));
  const approvedModels = Array.from(new Set(allRows.filter((r) => r.status === 'Approved').map((r) => r.model)));

  const filteredRows = calculatedRows.filter((row) => {
    if (filters.model !== 'all' && row.model !== filters.model) return false;
    if (filters.wheelLine !== 'all' && row.wheelLine !== filters.wheelLine) return false;
    
    // Gap status filter
    if (filters.gapStatus !== 'all') {
      if (filters.gapStatus === 'shortage' && (row.gap == null || row.gap >= 0)) return false;
      if (filters.gapStatus === 'surplus' && (row.gap == null || row.gap < 0)) return false;
      if (filters.gapStatus === 'unallocated' && row.gap != null) return false;
    }
    
    // Lifecycle status filter
    if (filters.lifecycleStatus !== 'all' && row.status !== filters.lifecycleStatus) return false;
    
    // Search filter (searches model name and part number)
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const modelMatch = row.model.toLowerCase().includes(q);
      const partMatch = row.partNumber && row.partNumber.toLowerCase().includes(q);
      if (!modelMatch && !partMatch) return false;
    }
    
    return true;
  });

  const modelCount = new Set(calculatedRows.map((r) => r.model)).size;

  const gapClass = (gap) => {
    if (gap == null) return 'neutral';
    return gap >= 0 ? 'positive' : 'negative';
  };

  const handleFieldChange = (rowId, field, value) => {
    setRowField(rowId, field, value);
  };

  let prevModel = null;

  const kpis = [
    {
      label: 'Total Volume / Day',
      value: totals.totalVolumePerDay.toLocaleString(),
      unit: 'wheels',
      icon: '⚙️',
      accent: false,
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
      accent: false,
    },
    {
      label: 'Total Gap',
      value: totals.totalGap != null ? (totals.totalGap >= 0 ? `+${totals.totalGap}` : totals.totalGap) : '—',
      unit: totals.totalGap != null ? (totals.totalGap >= 0 ? 'surplus' : 'shortage') : '',
      icon: totals.totalGap != null ? (totals.totalGap >= 0 ? '✓' : '⚠️') : '—',
      accent: false,
      status: totals.totalGap != null ? (totals.totalGap >= 0 ? 'positive' : 'negative') : 'neutral',
    },
    {
      label: 'Unique Models',
      value: modelCount,
      unit: 'models',
      icon: '🏍️',
      accent: false,
    },
    {
      label: 'Working Hours',
      value: params.workingHoursPerDay,
      unit: 'hrs/day',
      icon: '⏱️',
      accent: false,
    },
  ];

  return (
    <div className="dashboard-page">
      <Sidebar />
      
      <main className="dashboard-content animate-fade-in">
        <TopHeader 
          title="MHF Asset Management" 
          subtitle="Detailed MHF calculations by vehicle assembly line" 
        />
        
        <div className="dashboard-sub-bar no-print">
          <span className="sub-bar__info">⚙️ Dynamic Calculations Grid · {filteredRows.length === calculatedRows.length ? `${calculatedRows.length} lines active` : `${filteredRows.length} of ${calculatedRows.length} lines visible`}</span>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {isEditor && (
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowAddToLineModal(true);
                  if (approvedModels.length > 0) {
                    setModelNameToAdd(approvedModels[0]);
                  } else {
                    setModelNameToAdd('');
                  }
                  setInitialPlantAvail('');
                }}
                id="btn-add-to-line"
              >
                ➕ Add Model to Line
              </button>
            )}
            <button 
              className="btn btn--accent btn-export" 
              onClick={() => setShowExport(true)}
              id="dashboard-export-trigger"
            >
              📥 Export & Print
            </button>
          </div>
        </div>

        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          uniqueModels={uniqueModels}
          showSource={false}
          showStatus={true}
          showWheelLine={true}
          showLifecycleStatus={true}
          showSearch={true}
        />

        {/* ── Print header ── */}
        <div className="print-header print-only">
          <h1>TVS — MHF Wheel Trolley Dashboard (Detailed Table)</h1>
          <p>Printed: {new Date().toLocaleDateString('en-IN')}</p>
        </div>

        {/* ── KPI cards ── */}
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

        {/* ── Detailed Table ── */}
        <div className="grid-section">
          <div className="grid-section__header">
            <h3>Wheel Assembly Lines Overview</h3>
            <span className="text-tertiary text-sm">Click any row to open detail KPI drill-down panel</span>
          </div>

          <div className="grid-container">
            <div className="grid-wrapper">
              <table className="data-grid data-grid--read-only" id="dashboard-grid">
                <colgroup>
                  {TABLE_COLUMNS.filter(c => !c.isAction).map((col) => (
                    <col key={col.key} style={{ width: col.width }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th rowSpan="2" className="text-left">Model</th>
                    <th rowSpan="2" className="text-left">Wheel Line</th>
                    <th rowSpan="2" className="text-left">Part Number</th>
                    <th rowSpan="2" className="text-right">Qty</th>
                    <th rowSpan="2" className="text-right">Vol/Day</th>
                    <th rowSpan="2" className="text-right">Vol/Hr</th>
                    <th colSpan="2" className="stage-col text-center">
                      Supplier ({params.supplierHours}h)
                    </th>
                    <th colSpan="2" className="stage-col text-center">
                      Transit ({params.transitHours}h)
                    </th>
                    <th colSpan="2" className="stage-col text-center">
                      Opening ({params.openingHours}h)
                    </th>
                    <th colSpan="2" className="stage-col stage-col-last text-center">
                      POC ({params.pocHours}h)
                    </th>
                    <th rowSpan="2" className="text-left">Trolley Type</th>
                    <th rowSpan="2" className="text-right">Cap</th>
                    <th rowSpan="2" className="col-header-highlight text-right">
                      Required
                    </th>
                    <th rowSpan="2" className="col-header-highlight text-right">
                      Plant Avail
                    </th>
                    <th rowSpan="2" className="col-header-highlight text-right">
                      Gap
                    </th>
                    <th rowSpan="2" className="text-left">Remarks</th>
                  </tr>
                  <tr>
                    <th className="stage-col text-right">Pcs</th>
                    <th className="text-right">Trolleys</th>
                    <th className="stage-col text-right">Pcs</th>
                    <th className="text-right">Trolleys</th>
                    <th className="stage-col text-right">Pcs</th>
                    <th className="text-right">Trolleys</th>
                    <th className="stage-col text-right">Pcs</th>
                    <th className="stage-col-last text-right">Trolleys</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((row) => {
                    const isGroupStart = row.model !== prevModel;
                    prevModel = row.model;
                    return (
                      <tr
                        key={row.id}
                        className={`clickable-row ${isGroupStart ? 'row-group-start' : ''} ${
                          selectedRow?.id === row.id ? 'row-selected' : ''
                        } ${row.status === 'Discontinued' ? 'row-discontinued' : ''}`}
                        onClick={() => setSelectedRow(row)}
                      >
                        <td className="cell-model">
                          {isGroupStart ? row.model : ''}
                        </td>
                        <td className="cell-wheelline">{row.wheelLine}</td>
                        <td className="cell-partnumber mono">{row.partNumber || '—'}</td>
                        <td className="cell-number mono">{row.qtyPerVehicle || 1}</td>
                        <td className="cell-number mono">{row.volumePerDay}</td>
                        <td className="cell-number mono">{row.volPerHour}</td>

                        {/* Supplier */}
                        <td className="cell-pieces stage-col mono">{row.supplierPieces}</td>
                        <td className="cell-trolleys mono">{row.supplierTrolleys}</td>

                        {/* Transit */}
                        <td className="cell-pieces stage-col mono">{row.transitPieces}</td>
                        <td className="cell-trolleys mono">{row.transitTrolleys}</td>

                        {/* Opening */}
                        <td className="cell-pieces stage-col mono">{row.openingPieces}</td>
                        <td className="cell-trolleys mono">{row.openingTrolleys}</td>

                        {/* POC */}
                        <td className="cell-pieces stage-col mono">{row.pocPieces}</td>
                        <td className="cell-trolleys stage-col-last mono">{row.pocTrolleys}</td>

                        {/* Trolley Type */}
                        <td className="cell-trolleytype">{row.trolleyType || 'Standard Wheel Trolley'}</td>

                        {/* Capacity */}
                        <td className="cell-number mono">{row.trolleyCapacity}</td>

                        {/* Required */}
                        <td className="cell-required mono">{row.totalRequired}</td>

                        {/* Plant Available */}
                        {isEditor ? (
                          <td className="cell-number edit-cell">
                            <input
                              type="number"
                              value={row.plantAvailableTrolleys != null ? row.plantAvailableTrolleys : ''}
                              onChange={(e) => handleFieldChange(row.id, 'plantAvailableTrolleys', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                              className="inline-input text-right mono"
                              onClick={() => setSelectedRow(row)}
                              placeholder="—"
                              min="0"
                            />
                          </td>
                        ) : (
                          <td className="cell-number mono">
                            {row.plantAvailableTrolleys != null ? row.plantAvailableTrolleys : '—'}
                          </td>
                        )}

                        {/* Gap */}
                        <td className={`cell-gap ${gapClass(row.gap)} mono`}>
                          {row.gap != null ? (row.gap >= 0 ? `+${row.gap}` : row.gap) : '—'}
                        </td>

                        {/* Remarks */}
                        {isEditor ? (
                          <td className="cell-remarks edit-cell">
                            <input
                              type="text"
                              value={row.remarks || ''}
                              onChange={(e) => handleFieldChange(row.id, 'remarks', e.target.value)}
                              className="inline-input"
                              onClick={() => setSelectedRow(row)}
                              placeholder="Add remark..."
                            />
                          </td>
                        ) : (
                          <td className="cell-remarks">{row.remarks || '—'}</td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr>
                    <td className="footer-label" colSpan="4">
                      Totals
                    </td>
                    {TABLE_COLUMNS.filter(c => !c.isAction).slice(4).map((col) => {
                      if (col.key === 'volumePerDay') {
                        return (
                          <td key={col.key} className="cell-number" style={{ fontWeight: 700 }}>
                            {totals.totalVolumePerDay.toLocaleString()}
                          </td>
                        );
                      }
                      if (col.key === 'totalRequired') {
                        return (
                          <td key={col.key} className="footer-required mono">
                            {totals.totalRequired}
                          </td>
                        );
                      }
                      if (col.key === 'plantAvailableTrolleys') {
                        return (
                          <td key={col.key} className="cell-number mono">
                            {totals.totalPlantAvailable != null ? totals.totalPlantAvailable : '—'}
                          </td>
                        );
                      }
                      if (col.key === 'gap') {
                        return (
                          <td key={col.key} className={`cell-gap footer-gap ${gapClass(totals.totalGap)} mono`}>
                            {totals.totalGap != null ? (totals.totalGap >= 0 ? `+${totals.totalGap}` : totals.totalGap) : '—'}
                          </td>
                        );
                      }
                      return <td key={col.key}></td>;
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="dashboard-footer no-print">
          <span className="text-tertiary" style={{ fontSize: 'var(--text-xs)' }}>
            TVS Motor Company — Internal / Confidential &nbsp;·&nbsp; Hosur Plant &nbsp;·&nbsp; Detailed Grid View
          </span>
        </footer>
      </main>

      {/* ── Detail Panel Drawer (Drill-down) ── */}
      {selectedRow && (
        <div className="detail-drawer-backdrop" onClick={() => setSelectedRow(null)}>
          <div className="detail-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="detail-drawer__header">
              <div className="detail-drawer__title-group">
                <span className="detail-drawer__badge">Line KPI Details</span>
                <h3>{selectedRow.model}</h3>
                <span className="detail-drawer__sub">{selectedRow.wheelLine}</span>
              </div>
              <button className="detail-drawer__close" onClick={() => setSelectedRow(null)}>✕</button>
            </div>

            <div className="detail-drawer__content">
              {/* Summary Section */}
              <div className="drawer-summary-grid">
                <div className="drawer-stat">
                  <span className="drawer-stat__label">Part Number</span>
                  <span className="drawer-stat__value" style={{ fontSize: 'var(--text-lg)' }}>{selectedRow.partNumber || '—'}</span>
                  <span className="drawer-stat__unit">TVS Reference</span>
                </div>
                <div className="drawer-stat">
                  <span className="drawer-stat__label">Qty/Vehicle</span>
                  <span className="drawer-stat__value">x{selectedRow.qtyPerVehicle || 1}</span>
                  <span className="drawer-stat__unit">off-take</span>
                </div>
              </div>

              <div className="drawer-summary-grid">
                <div className="drawer-stat">
                  <span className="drawer-stat__label">Base Vol/Day</span>
                  <span className="drawer-stat__value">{selectedRow.volumePerDay}</span>
                  <span className="drawer-stat__unit">vehicles</span>
                </div>
                <div className="drawer-stat">
                  <span className="drawer-stat__label">Effective Vol/Day</span>
                  <span className="drawer-stat__value">{selectedRow.volumePerDay * (selectedRow.qtyPerVehicle || 1)}</span>
                  <span className="drawer-stat__unit">wheels</span>
                </div>
              </div>

              {/* Status Section */}
              <div className="drawer-status-box">
                <div className="drawer-status-item">
                  <span className="status-label">Trolley Type</span>
                  <span className="status-value">{selectedRow.trolleyType || 'Standard'}</span>
                </div>
                <div className="drawer-status-item">
                  <span className="status-label">Trolley Capacity</span>
                  <span className="status-value mono">{selectedRow.trolleyCapacity} <span className="unit-label">wheels/trolley</span></span>
                </div>
                <div className="drawer-status-item border-top">
                  <span className="status-label">Total Required</span>
                  <span className="status-value mono">{selectedRow.totalRequired} <span className="unit-label">trolleys</span></span>
                </div>
                <div className="drawer-status-item">
                  <span className="status-label">Plant Available</span>
                  <span className="status-value mono">{selectedRow.plantAvailableTrolleys ?? '—'} <span className="unit-label">trolleys</span></span>
                </div>
                <div className="drawer-status-item border-top">
                  <span className="status-label">Current Gap</span>
                  <span className={`status-value mono text-${gapClass(selectedRow.gap)}`}>
                    {selectedRow.gap != null ? (selectedRow.gap >= 0 ? `+${selectedRow.gap}` : selectedRow.gap) : '—'} 
                    <span className="unit-label">{selectedRow.gap != null ? (selectedRow.gap >= 0 ? ' surplus' : ' shortage') : 'not specified'}</span>
                  </span>
                </div>
              </div>

              {isEditor && (
                <div style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
                  <button 
                    className="btn btn-secondary w-full"
                    style={{ justifyContent: 'center' }}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to pause "${selectedRow.model}"? It will be temporarily removed from the line.`)) {
                        removeModelFromLine(selectedRow.model, 'Paused');
                        setSelectedRow(null);
                      }
                    }}
                    id="btn-pause-model"
                  >
                    ⏸️ Pause Model
                  </button>
                  <button 
                    className="btn btn-danger w-full"
                    style={{ justifyContent: 'center' }}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to discontinue "${selectedRow.model}"? This will permanently retire it from the active line.`)) {
                        removeModelFromLine(selectedRow.model, 'Discontinued');
                        setSelectedRow(null);
                      }
                    }}
                    id="btn-remove-from-line"
                  >
                    🗑️ Discontinue
                  </button>
                </div>
              )}

              {/* Stage-wise Breakdown */}
              <div className="drawer-section">
                <h4>Stage-by-Stage Breakdown</h4>
                
                <div className="stage-breakdown-list">
                  {/* Supplier */}
                  <div className="stage-breakdown-item">
                    <div className="stage-info">
                      <span className="stage-num">01</span>
                      <div>
                        <span className="stage-name">Supplier Stage</span>
                        <span className="stage-meta">Duration: {params.supplierHours}h · Cap: {selectedRow.trolleyCapacity}</span>
                      </div>
                    </div>
                    <div className="stage-values">
                      <span className="value-pcs">{selectedRow.supplierPieces} pcs</span>
                      <span className="value-trolleys">{selectedRow.supplierTrolleys} trolleys</span>
                    </div>
                  </div>

                  {/* Transit */}
                  <div className="stage-breakdown-item">
                    <div className="stage-info">
                      <span className="stage-num">02</span>
                      <div>
                        <span className="stage-name">Transit Stage</span>
                        <span className="stage-meta">Duration: {params.transitHours}h · Cap: {selectedRow.trolleyCapacity}</span>
                      </div>
                    </div>
                    <div className="stage-values">
                      <span className="value-pcs">{selectedRow.transitPieces} pcs</span>
                      <span className="value-trolleys">{selectedRow.transitTrolleys} trolleys</span>
                    </div>
                  </div>

                  {/* Opening */}
                  <div className="stage-breakdown-item">
                    <div className="stage-info">
                      <span className="stage-num">03</span>
                      <div>
                        <span className="stage-name">Opening Stage</span>
                        <span className="stage-meta">Duration: {params.openingHours}h · Cap: {selectedRow.trolleyCapacity}</span>
                      </div>
                    </div>
                    <div className="stage-values">
                      <span className="value-pcs">{selectedRow.openingPieces} pcs</span>
                      <span className="value-trolleys">{selectedRow.openingTrolleys} trolleys</span>
                    </div>
                  </div>

                  {/* POC */}
                  <div className="stage-breakdown-item">
                    <div className="stage-info">
                      <span className="stage-num">04</span>
                      <div>
                        <span className="stage-name">POC Stage</span>
                        <span className="stage-meta">Duration: {params.pocHours}h · Cap: {selectedRow.trolleyCapacity}</span>
                      </div>
                    </div>
                    <div className="stage-values">
                      <span className="value-pcs">{selectedRow.pocPieces} pcs</span>
                      <span className="value-trolleys">{selectedRow.pocTrolleys} trolleys</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="drawer-section">
                <h4>Remarks</h4>
                <div className="drawer-remarks-box">
                  {selectedRow.remarks || 'No remarks entered for this line.'}
                </div>
              </div>
            </div>
            
            <div className="detail-drawer__footer">
              {isEditor ? (
                <a href="/calculate-capacity" className="btn btn--accent edit-shortcut-btn" onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/calculate-capacity';
                }}>
                  ✏️ Edit in Grid
                </a>
              ) : (
                <span className="viewer-role-hint">Viewing with Read-Only Access</span>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedRow(null)}>Close Panel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Model to Line Modal ── */}
      {showAddToLineModal && (
        <div className="modal-backdrop" onClick={() => setShowAddToLineModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">➕ Add Model to Line</h2>
              <button className="modal-close" onClick={() => setShowAddToLineModal(false)}>✕</button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (modelNameToAdd) {
                  const val = initialPlantAvail.trim() === '' ? null : parseInt(initialPlantAvail, 10);
                  if (val !== null && (isNaN(val) || val < 0)) {
                    alert('Initial Plant Available must be a non-negative integer.');
                    return;
                  }
                  addModelToLine(modelNameToAdd, val);
                  setShowAddToLineModal(false);
                  setModelNameToAdd('');
                  setInitialPlantAvail('');
                }
              }} 
              className="add-model-form"
            >
              {approvedModels.length > 0 ? (
                <>
                  <div className="form-group">
                    <label htmlFor="select-model-add">Select Model to Add</label>
                    <select
                      id="select-model-add"
                      value={modelNameToAdd}
                      onChange={(e) => setModelNameToAdd(e.target.value)}
                      className="input"
                      required
                    >
                      {approvedModels.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <span className="form-help">Only models with status "Approved" are listed here.</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="initial-plant-avail">Initial Plant Available Trolleys</label>
                    <input
                      id="initial-plant-avail"
                      type="number"
                      placeholder="e.g. 15 (Optional)"
                      value={initialPlantAvail}
                      onChange={(e) => setInitialPlantAvail(e.target.value)}
                      min="0"
                      className="input"
                    />
                    <span className="form-help">Enter starting physical trolley count for this model on the floor.</span>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddToLineModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn--accent">Add to Line</button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    No approved model definitions are available for activation.
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    New models must be created and set to <strong>Approved</strong> status on the <a href="/calculate-capacity" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>Calculate Capacity</a> page first.
                  </p>
                  <div className="modal-footer" style={{ justifyContent: 'center', marginTop: 'var(--space-4)' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddToLineModal(false)}>Close</button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Export Panel Modal */}
      <ExportPanel isOpen={showExport} onClose={() => setShowExport(false)} rows={calculatedRows} totals={totals} />
      
    </div>
  );
}
