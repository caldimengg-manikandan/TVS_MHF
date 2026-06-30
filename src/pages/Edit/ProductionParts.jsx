import { useState } from 'react';
import { useProductionPartsStore, useCalculatedParts, usePartTotals } from '../../stores/productionPartsStore';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import FilterBar from '../../components/Filters/FilterBar';
import './CalculateCapacity.css'; // Reusing existing styles for the grid

export default function ProductionParts() {
  const { updateMhfParams, updatePart, discardChanges, hasUnsavedChanges, save, vehicles } = useProductionPartsStore();
  const calculatedRows = useCalculatedParts('all');
  const totals = usePartTotals('all');

  // Filters state
  const [filters, setFilters] = useState({
    model: 'all',
    wheelLine: 'all',
    gapStatus: 'all',
    search: '',
  });

  // Edit state
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const uniqueModels = Array.from(new Set(calculatedRows.map((r) => r.vehicle_model)));

  const filteredRows = calculatedRows.filter((row) => {
    if (filters.model !== 'all' && row.vehicle_model !== filters.model) return false;
    if (filters.wheelLine !== 'all' && row.part_name !== filters.wheelLine) return false;
    
    if (filters.gapStatus !== 'all') {
      if (filters.gapStatus === 'shortage' && (row.gap == null || row.gap >= 0)) return false;
      if (filters.gapStatus === 'surplus' && (row.gap == null || row.gap < 0)) return false;
      if (filters.gapStatus === 'unallocated' && row.gap != null) return false;
    }
    
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const modelMatch = row.vehicle_model.toLowerCase().includes(q);
      const partMatch = row.part_number && row.part_number.toLowerCase().includes(q);
      if (!modelMatch && !partMatch) return false;
    }
    
    return true;
  });

  const gapClass = (gap) => {
    if (gap == null) return 'neutral';
    return gap >= 0 ? 'positive' : 'negative';
  };

  const startEditing = (row) => {
    setEditingRowId(row.part_id);
    setEditValues({
      daily_volume: row.daily_volume,
      plant_available: row.plant_available,
      remarks: row.remarks || '',
      part_name: row.part_name,
      part_number: row.part_number,
      capacity: row.capacity,
      supplier_hours: row.supplierHours,
      transit_hours: row.transitHours,
      opening_hours: row.openingHours,
      poc_hours: row.pocHours,
    });
  };

  const cancelEditing = () => {
    setEditingRowId(null);
    setEditValues({});
  };

  const saveEditing = (part_id) => {
    updateMhfParams(part_id, {
      daily_volume: parseInt(editValues.daily_volume, 10) || 0,
      plant_available: editValues.plant_available === '' || editValues.plant_available == null ? null : parseInt(editValues.plant_available, 10),
      remarks: editValues.remarks,
      supplier_hours: parseFloat(editValues.supplier_hours) || 0,
      transit_hours: parseFloat(editValues.transit_hours) || 0,
      opening_hours: parseFloat(editValues.opening_hours) || 0,
      poc_hours: parseFloat(editValues.poc_hours) || 0,
    });
    
    updatePart(part_id, {
      part_name: editValues.part_name,
      part_number: editValues.part_number,
      capacity: parseInt(editValues.capacity, 10) || 1,
    });
    
    setEditingRowId(null);
  };

  return (
    <div className="calc-capacity-page">
      <Sidebar />

      <main className="calc-capacity-content animate-fade-in">
        <TopHeader 
          title="MHF Calculation" 
          subtitle="Production Parts MHF Calculations and Gaps" 
        />

        {/* Unsaved changes banner */}
        {hasUnsavedChanges && (
          <div className="unsaved-banner no-print">
            <span className="unsaved-banner__text">
              You have unsaved changes. These will be lost if you refresh or log out.
            </span>
            <div className="unsaved-banner__actions">
              <button className="btn btn-secondary btn-sm" onClick={discardChanges}>Discard</button>
              <button className="btn btn--accent btn-sm" onClick={save}>Save Changes</button>
            </div>
          </div>
        )}

        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          uniqueModels={uniqueModels}
          showSource={false}
          showStatus={false}
          showWheelLine={true}
          showLifecycleStatus={false}
          showSearch={true}
        />

        {/* ── Table Grid ── */}
        <div className="grid-section">
          <div className="grid-container">
            <div className="grid-wrapper">
              <table className="data-grid data-grid--editable">
                <thead>
                  <tr>
                    <th className="text-center">S.No</th>
                    <th className="text-left">Vehicle Model</th>
                    <th className="text-left">Part Name</th>
                    <th className="text-left">Part Number</th>
                    <th className="text-right">PL2 Vol / Day</th>
                    <th className="text-right">Vol / Hr</th>
                    <th className="text-right">Supplier Inventory</th>
                    <th className="text-right">Transit</th>
                    <th className="text-right">Opening Inventory</th>
                    <th className="text-right">Vehicle Assy POC</th>
                    <th className="text-right">Capacity</th>
                    <th className="text-right col-header-highlight">Total MHF Required</th>
                    <th className="text-right col-header-highlight">Plant Available</th>
                    <th className="text-right col-header-highlight">Gap</th>
                    <th className="text-left">Remarks</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((row, index) => {
                    const isEditing = editingRowId === row.part_id;

                    return (
                      <tr key={row.part_id} className={`edit-row ${isEditing ? 'editing-mode' : ''}`}>
                        <td className="text-center">{index + 1}</td>
                        <td className="font-semibold">{row.vehicle_model}</td>
                        
                        {/* Part Name */}
                        <td>
                          {isEditing ? (
                            <input type="text" className="inline-input" style={{ width: '120px' }}
                              value={editValues.part_name} onChange={(e) => setEditValues({...editValues, part_name: e.target.value})} />
                          ) : (
                            row.part_name
                          )}
                        </td>
                        
                        {/* Part Number */}
                        <td className="mono">
                          {isEditing ? (
                            <input type="text" className="inline-input" style={{ width: '120px' }}
                              value={editValues.part_number} onChange={(e) => setEditValues({...editValues, part_number: e.target.value})} />
                          ) : (
                            row.part_number
                          )}
                        </td>
                        
                        {/* PL2 Vol / Day */}
                        <td className="text-right mono">
                          {isEditing ? (
                            <input 
                              type="number"
                              className="inline-input"
                              style={{ width: '80px', textAlign: 'right' }}
                              value={editValues.daily_volume}
                              onChange={(e) => setEditValues({ ...editValues, daily_volume: e.target.value })}
                            />
                          ) : (
                            row.daily_volume
                          )}
                        </td>
                        
                        <td className="text-right mono">{row.volPerHour}</td>
                        
                        {/* Supplier Inventory */}
                        <td className="text-right mono">
                          {isEditing ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                              <input type="number" step="0.1" className="inline-input" style={{ width: '60px', textAlign: 'right' }}
                                value={editValues.supplier_hours} onChange={(e) => setEditValues({...editValues, supplier_hours: e.target.value})} />
                              <span className="text-xs text-secondary">hrs</span>
                            </div>
                          ) : (
                            <>{row.supplierTrolleys} <span className="text-secondary text-xs">({row.supplierPieces}p)</span></>
                          )}
                        </td>
                        
                        {/* Transit */}
                        <td className="text-right mono">
                          {isEditing ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                              <input type="number" step="0.1" className="inline-input" style={{ width: '60px', textAlign: 'right' }}
                                value={editValues.transit_hours} onChange={(e) => setEditValues({...editValues, transit_hours: e.target.value})} />
                              <span className="text-xs text-secondary">hrs</span>
                            </div>
                          ) : (
                            <>{row.transitTrolleys} <span className="text-secondary text-xs">({row.transitPieces}p)</span></>
                          )}
                        </td>
                        
                        {/* Opening Inventory */}
                        <td className="text-right mono">
                          {isEditing ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                              <input type="number" step="0.1" className="inline-input" style={{ width: '60px', textAlign: 'right' }}
                                value={editValues.opening_hours} onChange={(e) => setEditValues({...editValues, opening_hours: e.target.value})} />
                              <span className="text-xs text-secondary">hrs</span>
                            </div>
                          ) : (
                            <>{row.openingTrolleys} <span className="text-secondary text-xs">({row.openingPieces}p)</span></>
                          )}
                        </td>
                        
                        {/* Vehicle Assy POC */}
                        <td className="text-right mono">
                          {isEditing ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                              <input type="number" step="0.1" className="inline-input" style={{ width: '60px', textAlign: 'right' }}
                                value={editValues.poc_hours} onChange={(e) => setEditValues({...editValues, poc_hours: e.target.value})} />
                              <span className="text-xs text-secondary">hrs</span>
                            </div>
                          ) : (
                            <>{row.pocTrolleys} <span className="text-secondary text-xs">({row.pocPieces}p)</span></>
                          )}
                        </td>
                        
                        {/* Capacity */}
                        <td className="text-right mono">
                          {isEditing ? (
                            <input type="number" className="inline-input" style={{ width: '60px', textAlign: 'right' }}
                              value={editValues.capacity} onChange={(e) => setEditValues({...editValues, capacity: e.target.value})} />
                          ) : (
                            row.capacity
                          )}
                        </td>
                        <td className="text-right mono font-bold text-accent">{row.totalRequired}</td>
                        
                        {/* Plant Available */}
                        <td className="text-right mono">
                          {isEditing ? (
                            <input 
                              type="number"
                              className="inline-input"
                              style={{ width: '80px', textAlign: 'right' }}
                              value={editValues.plant_available || ''}
                              onChange={(e) => setEditValues({ ...editValues, plant_available: e.target.value })}
                            />
                          ) : (
                            row.plant_available != null ? row.plant_available : '—'
                          )}
                        </td>
                        
                        <td className={`text-right mono font-bold text-${gapClass(row.gap)}`}>
                          {row.gap != null ? (row.gap >= 0 ? `+${row.gap}` : row.gap) : '—'}
                        </td>
                        
                        {/* Remarks */}
                        <td>
                          {isEditing ? (
                            <input 
                              type="text"
                              className="inline-input"
                              style={{ width: '150px' }}
                              value={editValues.remarks}
                              onChange={(e) => setEditValues({ ...editValues, remarks: e.target.value })}
                            />
                          ) : (
                            row.remarks || '—'
                          )}
                        </td>

                        {/* Actions */}
                        <td className="text-center" style={{ minWidth: '80px' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button className="btn-icon text-positive" onClick={() => saveEditing(row.part_id)} title="Save">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              </button>
                              <button className="btn-icon text-negative" onClick={cancelEditing} title="Cancel">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                              </button>
                            </div>
                          ) : (
                            <button className="btn-icon" onClick={() => startEditing(row)} title="Edit Row">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan="16" className="text-center py-8 text-secondary">No rows match your filters.</td>
                    </tr>
                  )}
                </tbody>

                <tfoot>
                  <tr>
                    <td className="footer-label" colSpan="4">Totals</td>
                    <td className="text-right mono font-bold">{totals.totalVolumePerDay.toLocaleString()}</td>
                    <td colSpan="6"></td>
                    <td className="footer-required mono">{totals.totalRequired}</td>
                    <td className="text-right mono">{totals.totalPlantAvailable != null ? totals.totalPlantAvailable : '—'}</td>
                    <td className={`text-right mono font-bold footer-gap text-${gapClass(totals.totalGap)}`}>
                      {totals.totalGap != null ? (totals.totalGap >= 0 ? `+${totals.totalGap}` : totals.totalGap) : '—'}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
