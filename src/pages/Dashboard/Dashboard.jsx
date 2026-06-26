import { useState } from 'react';
import { useProductionPartsStore, useCalculatedParts, useActivePartTotals } from '../../stores/productionPartsStore';
import { useAuthStore } from '../../state/authStore';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import ExportPanel from '../../components/Export/ExportPanel';
import FilterBar from '../../components/Filters/FilterBar';
import AddProductionPartDrawer from '../../components/Forms/AddProductionPartDrawer';
import { TABLE_COLUMNS } from '../../utils/columns';
import './Dashboard.css';

export default function Dashboard() {
  const { mhfParams } = useProductionPartsStore();
  const allRows = useCalculatedParts('all');
  const calculatedRows = allRows; // Dashboard shows all active parts
  const totals = useActivePartTotals();
  const { user } = useAuthStore();
  const isEditor = user?.role === 'Admin' || user?.role === 'Planner' || user?.role === 'Production Engineer';

  const [selectedRow, setSelectedRow] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [showAddPartDrawer, setShowAddPartDrawer] = useState(false);

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
      label: 'Total Daily Production',
      value: totals.totalVolumePerDay.toLocaleString(),
      unit: 'Units',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
      accent: false,
    },
    {
      label: 'Trolleys Required',
      value: totals.totalRequired.toLocaleString(),
      unit: 'trolleys',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>,
      accent: true,
    },
    {
      label: 'Plant Available',
      value: totals.totalPlantAvailable != null ? totals.totalPlantAvailable.toLocaleString() : '—',
      unit: totals.totalPlantAvailable != null ? 'trolleys' : 'not entered',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20"></path><path d="M4 22V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v16"></path><path d="M12 22V10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v12"></path></svg>,
      accent: false,
    },
    {
      label: 'Total Gap',
      value: totals.totalGap != null ? (totals.totalGap >= 0 ? `+${totals.totalGap}` : totals.totalGap) : '—',
      unit: totals.totalGap != null ? (totals.totalGap >= 0 ? 'surplus' : 'shortage') : '',
      icon: totals.totalGap != null ? (totals.totalGap >= 0 ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>) : '—',
      accent: false,
      status: totals.totalGap != null ? (totals.totalGap >= 0 ? 'positive' : 'negative') : 'neutral',
    },
    {
      label: 'Unique Models',
      value: modelCount,
      unit: 'models',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="2" x2="12" y2="12"></line></svg>,
      accent: false,
    },
    {
      label: 'Working Hours',
      value: 16, // Static or derived from a central configuration
      unit: 'hrs/day',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
      accent: false,
    },
  ];

  return (
    <div className="app-container">
      <Sidebar />
      
      <div className="main-content">
        <TopHeader 
          title="MHF Asset Management" 
          subtitle="Detailed MHF calculations by vehicle assembly line" 
        />
        
        <main className="dashboard-content animate-fade-in">
        
        <div className="dashboard-sub-bar no-print">
          <span className="sub-bar__info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Dynamic Calculations Grid · {filteredRows.length === calculatedRows.length ? `${calculatedRows.length} lines active` : `${filteredRows.length} of ${calculatedRows.length} lines visible`}
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {isEditor && (
              <button 
                className="btn btn-primary" 
                onClick={() => setShowAddPartDrawer(true)}
                id="btn-add-production-part"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Production Part
              </button>
            )}
            <button 
              className="btn btn--accent btn-export" 
              onClick={() => setShowExport(true)}
              id="dashboard-export-trigger"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export & Print
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
                    <th rowSpan="2" className="text-left">Part Name</th>
                    <th rowSpan="2" className="text-left">Part Number</th>
                    <th rowSpan="2" className="text-right">Qty</th>
                    <th rowSpan="2" className="text-right">Vol/Day</th>
                    <th rowSpan="2" className="text-right">Vol/Hr</th>
                    <th colSpan="2" className="stage-col text-center">
                      Supplier Stage
                    </th>
                    <th colSpan="2" className="stage-col text-center">
                      Transit Stage
                    </th>
                    <th colSpan="2" className="stage-col text-center">
                      Opening Stage
                    </th>
                    <th colSpan="2" className="stage-col stage-col-last text-center">
                      POC Stage
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
                        key={row.part_id}
                        className={`clickable-row ${isGroupStart ? 'row-group-start' : ''} ${
                          selectedRow?.part_id === row.part_id ? 'row-selected' : ''
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
      </div>

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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    Pause Model
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    Discontinue
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
                        <span className="stage-meta">Duration: {selectedRow.supplierHours}h · Cap: {selectedRow.trolleyCapacity}</span>
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
                        <span className="stage-meta">Duration: {selectedRow.transitHours}h · Cap: {selectedRow.trolleyCapacity}</span>
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
                        <span className="stage-meta">Duration: {selectedRow.openingHours}h · Cap: {selectedRow.trolleyCapacity}</span>
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
                        <span className="stage-meta">Duration: {selectedRow.pocHours}h · Cap: {selectedRow.trolleyCapacity}</span>
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
                <a href="/planning/production-parts" className="btn btn--accent edit-shortcut-btn" onClick={(e) => {
                  e.preventDefault();
                  window.location.href = '/planning/production-parts';
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  Edit in Grid
                </a>
              ) : (
                <span className="viewer-role-hint">Viewing with Read-Only Access</span>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedRow(null)}>Close Panel</button>
            </div>
          </div>
        </div>
      )}

      {showAddPartDrawer && (
        <AddProductionPartDrawer onClose={() => setShowAddPartDrawer(false)} />
      )}

      {/* Export Panel Modal */}
      <ExportPanel isOpen={showExport} onClose={() => setShowExport(false)} rows={calculatedRows} totals={totals} />
      
    </div>
  );
}
