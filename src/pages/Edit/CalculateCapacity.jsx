import { useState, useEffect } from 'react';
import { useStore, useCalculatedRows, useTotals } from '../../state/useStore';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import FilterBar from '../../components/Filters/FilterBar';
import { TABLE_COLUMNS } from '../../utils/columns';
import './CalculateCapacity.css';

export default function CalculateCapacity() {
  const { params, setRowField, addModel, duplicateModel, deleteRow, discardChanges, hasUnsavedChanges, save } = useStore();
  const calculatedRows = useCalculatedRows();
  const totals = useTotals('all');

  // Sidebar state
  const [selectedRowId, setSelectedRowId] = useState(null);
  
  // Add Model Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [newModelVolume, setNewModelVolume] = useState('');
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newQtyPerVehicle, setNewQtyPerVehicle] = useState(1);
  const [newTrolleyType, setNewTrolleyType] = useState('Standard Wheel Trolley');
  const [newTrolleyCapacity, setNewTrolleyCapacity] = useState(20);
  const [addError, setAddError] = useState('');

  // New model input fields
  const [newModelStatus, setNewModelStatus] = useState('Draft');
  const [newModelCategory, setNewModelCategory] = useState('');
  const [newInitialPlantAvailable, setNewInitialPlantAvailable] = useState('');
  const [newModelNotes, setNewModelNotes] = useState('');

  // Reusable Filter state
  const [filters, setFilters] = useState({
    source: 'all',
    model: 'all',
    wheelLine: 'all',
    gapStatus: 'all',
    lifecycleStatus: 'all',
    search: '',
  });

  const uniqueModels = Array.from(new Set(calculatedRows.map((r) => r.model)));

  const filteredRows = calculatedRows.filter((row) => {
    if (filters.source !== 'all' && row.source !== filters.source) return false;
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

  // Auto-fill part numbers in modal when model name changes
  useEffect(() => {
    const code = newModelName.trim().replace(/[\s\+-]+/g, '');
    if (code) {
      setNewPartNumber(`PN-${code}`);
    } else {
      setNewPartNumber('');
    }
  }, [newModelName]);

  // Row selection for sidebar
  const selectedRow = calculatedRows.find((r) => r.id === selectedRowId);

  const gapClass = (gap) => {
    if (gap == null) return 'neutral';
    return gap >= 0 ? 'positive' : 'negative';
  };

  const handleFieldChange = (rowId, field, value) => {
    setRowField(rowId, field, value);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setAddError('');
    const name = newModelName.trim();
    const vol = parseInt(newModelVolume, 10);
    const qty = parseInt(newQtyPerVehicle, 10);
    const cap = parseInt(newTrolleyCapacity, 10);
    const basePN = newPartNumber.trim();

    if (!name) return setAddError('Model name is required.');
    if (calculatedRows.some((r) => r.model.toLowerCase() === name.toLowerCase())) {
      return setAddError('Model name already exists.');
    }
    if (!basePN) return setAddError('Part Number is required.');
    
    // Construct Front and Rear part numbers automatically
    const frontPN = `${basePN}-F`;
    const rearPN = `${basePN}-R`;

    if (calculatedRows.some((r) => r.partNumber && r.partNumber.toLowerCase() === frontPN.toLowerCase())) {
      return setAddError(`Part Number "${basePN}" (with Front suffix "-F") already exists.`);
    }
    if (calculatedRows.some((r) => r.partNumber && r.partNumber.toLowerCase() === rearPN.toLowerCase())) {
      return setAddError(`Part Number "${basePN}" (with Rear suffix "-R") already exists.`);
    }
    if (isNaN(vol) || vol <= 0) return setAddError('Volume must be a positive number.');
    if (isNaN(qty) || qty <= 0) return setAddError('Qty per vehicle must be at least 1.');
    if (isNaN(cap) || cap <= 0) return setAddError('Trolley capacity must be at least 1.');
    if (cap > 200) return setAddError('Trolley capacity cannot exceed 200.');

    let initPlant = null;
    if (newInitialPlantAvailable.trim() !== '') {
      initPlant = parseInt(newInitialPlantAvailable, 10);
      if (isNaN(initPlant) || initPlant < 0) {
        return setAddError('Initial Plant Available must be a non-negative integer.');
      }
    }

    addModel(
      name, 
      vol, 
      frontPN, 
      rearPN, 
      qty, 
      newTrolleyType, 
      cap,
      initPlant,
      newModelStatus,
      newModelNotes,
      newModelCategory
    );

    // Reset Form
    setNewModelName('');
    setNewModelVolume('');
    setNewPartNumber('');
    setNewQtyPerVehicle(1);
    setNewTrolleyType('Standard Wheel Trolley');
    setNewTrolleyCapacity(20);
    setNewModelStatus('Draft');
    setNewModelCategory('');
    setNewInitialPlantAvailable('');
    setNewModelNotes('');
    setShowAddModal(false);
  };

  let prevModel = null;

  const trolleyTypes = [
    'Standard Wheel Trolley',
    'Heavy-duty Trolley',
    'Platform Tow-Cart',
    'Box Cage Trolley',
    'Special Carrier'
  ];

  return (
    <div className="calc-capacity-page">
      <Sidebar />

      <main className="calc-capacity-content animate-fade-in">
        <TopHeader 
          title="Calculate MHF Capacity" 
          subtitle="MHF model parameters, line additions, and calculations" 
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

        <div className="calc-sub-bar no-print">
          <span className="sub-bar__info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Edit cells inline or use sidebar editor · {filteredRows.length === calculatedRows.length ? `${calculatedRows.length} lines active` : `${filteredRows.length} of ${calculatedRows.length} lines visible`}
          </span>
          <div className="action-bar__buttons">
            <button className="btn btn-secondary" onClick={() => setShowAddModal(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add New Model
            </button>
          </div>
        </div>

        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          uniqueModels={uniqueModels}
          showSource={true}
          showStatus={false}
          showWheelLine={true}
          showLifecycleStatus={true}
          showSearch={true}
        />

        {/* ── Table Grid ── */}
        <div className="grid-section">
          <div className="grid-container">
            <div className="grid-wrapper">
              <table className="data-grid data-grid--editable" id="edit-grid">
                <colgroup>
                  {TABLE_COLUMNS.map((col) => (
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
                    <th rowSpan="2" className="no-print text-center">Actions</th>
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
                        className={`edit-row ${isGroupStart ? 'row-group-start' : ''} ${
                          selectedRowId === row.id ? 'row-selected' : ''
                        } ${row.status === 'Discontinued' ? 'row-discontinued' : ''}`}
                      >
                        {/* Model Inline Edit */}
                        <td className="cell-model edit-cell">
                          <input
                            type="text"
                            value={row.model}
                            onChange={(e) => handleFieldChange(row.id, 'model', e.target.value)}
                            className="inline-input font-semibold"
                            onClick={() => setSelectedRowId(row.id)}
                            placeholder="Model Name"
                          />
                        </td>

                        {/* Part Name Dropdown */}
                        <td className="cell-wheelline edit-cell">
                          <select
                            value={row.wheelLine}
                            onChange={(e) => handleFieldChange(row.id, 'wheelLine', e.target.value)}
                            className="inline-select"
                            onClick={() => setSelectedRowId(row.id)}
                          >
                            <option value="Front wheel Assy">Front wheel Assy</option>
                            <option value="Rear wheel Assy">Rear wheel Assy</option>
                          </select>
                        </td>

                        {/* Part Number Inline Edit */}
                        <td className="cell-partnumber edit-cell">
                          <input
                            type="text"
                            value={row.partNumber || ''}
                            onChange={(e) => handleFieldChange(row.id, 'partNumber', e.target.value)}
                            className="inline-input mono"
                            onClick={() => setSelectedRowId(row.id)}
                            placeholder="PN-XXXX"
                          />
                        </td>

                        {/* Qty per Vehicle (Off-take) Inline Edit */}
                        <td className="cell-number edit-cell">
                          <input
                            type="number"
                            value={row.qtyPerVehicle || 1}
                            onChange={(e) => handleFieldChange(row.id, 'qtyPerVehicle', parseInt(e.target.value, 10) || 1)}
                            className="inline-input text-right mono"
                            onClick={() => setSelectedRowId(row.id)}
                            min="1"
                          />
                        </td>

                        {/* Vol/Day Inline Edit */}
                        <td className="cell-number edit-cell">
                          <input
                            type="number"
                            value={row.volumePerDay}
                            onChange={(e) => handleFieldChange(row.id, 'volumePerDay', parseInt(e.target.value, 10) || 0)}
                            className="inline-input text-right mono"
                            onClick={() => setSelectedRowId(row.id)}
                            min="0"
                          />
                        </td>

                        {/* Vol/Hr Recomputed */}
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

                        {/* Trolley Type Inline Edit */}
                        <td className="cell-trolleytype edit-cell">
                          <select
                            value={row.trolleyType || 'Standard Wheel Trolley'}
                            onChange={(e) => handleFieldChange(row.id, 'trolleyType', e.target.value)}
                            className="inline-select"
                            onClick={() => setSelectedRowId(row.id)}
                          >
                            {trolleyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>

                        {/* Trolley Capacity Inline Edit */}
                        <td className="cell-number edit-cell">
                          <input
                            type="number"
                            value={row.trolleyCapacity != null ? row.trolleyCapacity : ''}
                            onChange={(e) => handleFieldChange(row.id, 'trolleyCapacity', parseInt(e.target.value, 10) || null)}
                            className="inline-input text-right mono"
                            onClick={() => setSelectedRowId(row.id)}
                            placeholder="20"
                            min="1"
                          />
                        </td>

                        {/* Required */}
                        <td className="cell-required mono">{row.totalRequired}</td>

                        {/* Plant Available (Read-Only) */}
                        <td className="cell-number mono">
                          {row.plantAvailableTrolleys != null ? row.plantAvailableTrolleys : '—'}
                        </td>

                        {/* Gap */}
                        <td className={`cell-gap ${gapClass(row.gap)} mono`}>
                          {row.gap != null ? (row.gap >= 0 ? `+${row.gap}` : row.gap) : '—'}
                        </td>

                        {/* Remarks (Read-Only) */}
                        <td className="cell-remarks">
                          {row.remarks || '—'}
                        </td>

                        {/* Action buttons */}
                        <td className="no-print cell-actions">
                          <button
                            className="btn-action-ghost"
                            onClick={() => setSelectedRowId(row.id)}
                            title="Open Sidebar Editor"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </button>
                          <button
                            className="btn-action-ghost"
                            onClick={() => duplicateModel(row.model)}
                            title="Duplicate Model"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          </button>
                          <button
                            className="btn-action-ghost text-danger"
                            onClick={() => deleteRow(row.id)}
                            title="Delete Row"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot>
                  <tr>
                    <td className="footer-label" colSpan="4">
                      Totals
                    </td>
                    {TABLE_COLUMNS.slice(4).map((col) => {
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
                      const extraClass = col.key === 'actions' ? 'no-print' : '';
                      return <td key={col.key} className={extraClass}></td>;
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ── Sidebar Right Drawer for full row edit ── */}
      {selectedRow && (
        <div className="sidebar-drawer-backdrop" onClick={() => setSelectedRowId(null)}>
          <div className="sidebar-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-drawer__header">
              <div className="sidebar-drawer__title-group">
                <span className="sidebar-drawer__badge">Sidebar Editor</span>
                <h3>Edit Row Details</h3>
                <span className="sidebar-drawer__sub">Direct reactive bindings</span>
              </div>
              <button className="sidebar-drawer__close" onClick={() => setSelectedRowId(null)}>✕</button>
            </div>

            <div className="sidebar-drawer__content">
              {/* Model Input */}
              <div className="sidebar-field">
                <label htmlFor="sidebar-model">Model Name</label>
                <input
                  id="sidebar-model"
                  type="text"
                  value={selectedRow.model}
                  onChange={(e) => handleFieldChange(selectedRow.id, 'model', e.target.value)}
                />
              </div>

              {/* Part Name Dropdown */}
              <div className="sidebar-field">
                <label htmlFor="sidebar-wheelline">Part Name</label>
                <select
                  id="sidebar-wheelline"
                  value={selectedRow.wheelLine}
                  onChange={(e) => handleFieldChange(selectedRow.id, 'wheelLine', e.target.value)}
                >
                  <option value="Front wheel Assy">Front wheel Assy</option>
                  <option value="Rear wheel Assy">Rear wheel Assy</option>
                </select>
              </div>

              {/* Part Number */}
              <div className="sidebar-field">
                <label htmlFor="sidebar-partnumber">Part Number</label>
                <input
                  id="sidebar-partnumber"
                  type="text"
                  value={selectedRow.partNumber || ''}
                  onChange={(e) => handleFieldChange(selectedRow.id, 'partNumber', e.target.value)}
                />
              </div>

              {/* Qty per Vehicle */}
              <div className="sidebar-field">
                <label htmlFor="sidebar-qty">Qty per Vehicle (Off-take)</label>
                <input
                  id="sidebar-qty"
                  type="number"
                  value={selectedRow.qtyPerVehicle || 1}
                  onChange={(e) => handleFieldChange(selectedRow.id, 'qtyPerVehicle', parseInt(e.target.value, 10) || 1)}
                  min="1"
                />
              </div>

              {/* Vol/Day Input */}
              <div className="sidebar-field">
                <label htmlFor="sidebar-volday">Volume per Day (vehicles)</label>
                <input
                  id="sidebar-volday"
                  type="number"
                  value={selectedRow.volumePerDay}
                  onChange={(e) => handleFieldChange(selectedRow.id, 'volumePerDay', parseInt(e.target.value, 10) || 0)}
                  min="0"
                />
              </div>

              {/* Trolley Type */}
              <div className="sidebar-field">
                <label htmlFor="sidebar-trolleytype">Trolley Type</label>
                <select
                  id="sidebar-trolleytype"
                  value={selectedRow.trolleyType || 'Standard Wheel Trolley'}
                  onChange={(e) => handleFieldChange(selectedRow.id, 'trolleyType', e.target.value)}
                >
                  {trolleyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Trolley Capacity */}
              <div className="sidebar-field">
                <label htmlFor="sidebar-trolleycap">Trolley Capacity (pieces)</label>
                <input
                  id="sidebar-trolleycap"
                  type="number"
                  value={selectedRow.trolleyCapacity != null ? selectedRow.trolleyCapacity : ''}
                  onChange={(e) => handleFieldChange(selectedRow.id, 'trolleyCapacity', parseInt(e.target.value, 10) || null)}
                  placeholder="20"
                  min="1"
                />
              </div>

              {/* Plant Available Input */}
              <div className="sidebar-field">
                <label htmlFor="sidebar-plantavail">Plant Available (trolleys)</label>
                <input
                  id="sidebar-plantavail"
                  type="number"
                  value={selectedRow.plantAvailableTrolleys != null ? selectedRow.plantAvailableTrolleys : ''}
                  onChange={(e) => handleFieldChange(selectedRow.id, 'plantAvailableTrolleys', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                  placeholder="Not entered (—)"
                  min="0"
                />
              </div>

              {/* Remarks Textarea */}
              <div className="sidebar-field">
                <label htmlFor="sidebar-remarks">Remarks</label>
                <textarea
                  id="sidebar-remarks"
                  value={selectedRow.remarks || ''}
                  onChange={(e) => handleFieldChange(selectedRow.id, 'remarks', e.target.value)}
                  placeholder="e.g. Supplier constraints, buffer adjustments..."
                  rows="3"
                />
              </div>

              {/* Lifecycle Status Dropdown */}
              <div className="sidebar-field">
                <label htmlFor="sidebar-status">Model Status</label>
                <select
                  id="sidebar-status"
                  value={selectedRow.status || 'Active'}
                  onChange={(e) => handleFieldChange(selectedRow.id, 'status', e.target.value)}
                >
                  <option value="Draft">Draft</option>
                  <option value="Approved">Approved</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Discontinued">Discontinued</option>
                </select>
              </div>

              {/* Vehicle Category Dropdown */}
              <div className="sidebar-field">
                <label htmlFor="sidebar-category">Vehicle Category</label>
                <select
                  id="sidebar-category"
                  value={selectedRow.category || ''}
                  onChange={(e) => handleFieldChange(selectedRow.id, 'category', e.target.value)}
                >
                  <option value="">Select Category</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Moped">Moped</option>
                  <option value="EV">EV</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Model Notes */}
              <div className="sidebar-field">
                <label htmlFor="sidebar-notes">Model Notes / Description</label>
                <textarea
                  id="sidebar-notes"
                  value={selectedRow.notes || ''}
                  onChange={(e) => handleFieldChange(selectedRow.id, 'notes', e.target.value)}
                  placeholder="Model-level description..."
                  rows="3"
                />
              </div>

              {/* Audit Trail (read-only) */}
              {selectedRow.source === 'custom' && (
                <div className="sidebar-field audit-trail">
                  <label>Audit Trail</label>
                  <div className="audit-info">
                    <div><strong>Added By:</strong> {selectedRow.addedBy || 'Unknown'}</div>
                    <div><strong>Added At:</strong> {selectedRow.addedAt ? new Date(selectedRow.addedAt).toLocaleString('en-IN') : '—'}</div>
                  </div>
                </div>
              )}

              {/* Live Calculations Section */}
              <div className="sidebar-calc-section">
                <h4>Computed Stage Gaps</h4>
                <div className="sidebar-calc-grid">
                  <div className="calc-row">
                    <span>Effective Vol/Day:</span>
                    <span className="mono">{selectedRow.volumePerDay * (selectedRow.qtyPerVehicle || 1)} wheels</span>
                  </div>
                  <div className="calc-row">
                    <span>Vol/Hour:</span>
                    <span className="mono">{selectedRow.volPerHour} wheels/hr</span>
                  </div>
                  <div className="calc-row">
                    <span>Required:</span>
                    <span className="mono font-bold text-accent">{selectedRow.totalRequired} trolleys</span>
                  </div>
                  <div className="calc-row">
                    <span>Gap:</span>
                    <span className={`mono font-bold text-${gapClass(selectedRow.gap)}`}>
                      {selectedRow.gap != null ? (selectedRow.gap >= 0 ? `+${selectedRow.gap}` : selectedRow.gap) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar-drawer__footer">
              <button className="btn btn-secondary w-full" onClick={() => setSelectedRowId(null)}>Close Editor</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Model Modal ── */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add New Model
              </h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="add-model-form">
              {addError && <div className="form-error">{addError}</div>}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="add-name">Model Name</label>
                  <input
                    id="add-name"
                    type="text"
                    placeholder="e.g. Raider 150"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="add-volume">Volume / Day</label>
                  <input
                    id="add-volume"
                    type="number"
                    placeholder="e.g. 600"
                    value={newModelVolume}
                    onChange={(e) => setNewModelVolume(e.target.value)}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="add-pn">Part Number</label>
                <input
                  id="add-pn"
                  type="text"
                  placeholder="e.g. PN-Raider150"
                  value={newPartNumber}
                  onChange={(e) => setNewPartNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="add-qty">Qty per Vehicle (Off-take)</label>
                  <input
                    id="add-qty"
                    type="number"
                    value={newQtyPerVehicle}
                    onChange={(e) => setNewQtyPerVehicle(e.target.value)}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="add-trolley-capacity">Trolley Capacity</label>
                  <input
                    id="add-trolley-capacity"
                    type="number"
                    value={newTrolleyCapacity}
                    onChange={(e) => setNewTrolleyCapacity(e.target.value)}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="add-trolley-type">Trolley Type</label>
                  <select
                    id="add-trolley-type"
                    value={newTrolleyType}
                    onChange={(e) => setNewTrolleyType(e.target.value)}
                    className="input"
                  >
                    {trolleyTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="add-plant-avail">Initial Plant Available</label>
                  <input
                    id="add-plant-avail"
                    type="number"
                    placeholder="e.g. 15 (Optional)"
                    value={newInitialPlantAvailable}
                    onChange={(e) => setNewInitialPlantAvailable(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="add-status">Lifecycle Status</label>
                  <select
                    id="add-status"
                    value={newModelStatus}
                    onChange={(e) => setNewModelStatus(e.target.value)}
                    className="input"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="add-category">Vehicle Category</label>
                  <select
                    id="add-category"
                    value={newModelCategory}
                    onChange={(e) => setNewModelCategory(e.target.value)}
                    className="input"
                  >
                    <option value="">Select Category</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Moped">Moped</option>
                    <option value="EV">EV</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="add-notes">Model Notes / Description</label>
                <textarea
                  id="add-notes"
                  placeholder="Enter notes, supplier details, or special constraints..."
                  value={newModelNotes}
                  onChange={(e) => setNewModelNotes(e.target.value)}
                  className="input"
                  rows="2"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--accent">Create Model</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
