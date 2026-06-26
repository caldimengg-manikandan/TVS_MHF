import { useState } from 'react';
import { useProductionPartsStore, useCalculatedParts, usePartTotals } from '../../stores/productionPartsStore';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import FilterBar from '../../components/Filters/FilterBar';
import './CalculateCapacity.css'; // Reusing existing styles for the grid

export default function ProductionParts() {
  const { discardChanges, hasUnsavedChanges, save } = useProductionPartsStore();
  const calculatedRows = useCalculatedParts('all');
  const totals = usePartTotals('all');

  // Filters state
  const [filters, setFilters] = useState({
    model: 'all',
    wheelLine: 'all', // Represents "Part Name"
    gapStatus: 'all',
    search: '',
  });

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
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((row, index) => (
                    <tr key={row.part_id} className="edit-row">
                      <td className="text-center">{index + 1}</td>
                      <td className="font-semibold">{row.vehicle_model}</td>
                      <td>{row.part_name}</td>
                      <td className="mono">{row.part_number}</td>
                      <td className="text-right mono">{row.daily_volume}</td>
                      <td className="text-right mono">{row.volPerHour}</td>
                      
                      <td className="text-right mono">{row.supplierTrolleys} <span className="text-secondary text-xs">({row.supplierPieces}p)</span></td>
                      <td className="text-right mono">{row.transitTrolleys} <span className="text-secondary text-xs">({row.transitPieces}p)</span></td>
                      <td className="text-right mono">{row.openingTrolleys} <span className="text-secondary text-xs">({row.openingPieces}p)</span></td>
                      <td className="text-right mono">{row.pocTrolleys} <span className="text-secondary text-xs">({row.pocPieces}p)</span></td>
                      
                      <td className="text-right mono">{row.capacity}</td>
                      <td className="text-right mono font-bold text-accent">{row.totalRequired}</td>
                      <td className="text-right mono">{row.plant_available != null ? row.plant_available : '—'}</td>
                      <td className={`text-right mono font-bold text-${gapClass(row.gap)}`}>
                        {row.gap != null ? (row.gap >= 0 ? `+${row.gap}` : row.gap) : '—'}
                      </td>
                      <td>{row.remarks || '—'}</td>
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan="15" className="text-center py-8 text-secondary">No rows match your filters.</td>
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
                    <td></td>
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
