import { useState, useMemo } from 'react';
import { useProductionPartsStore } from '../../stores/productionPartsStore';
import { calculateMhfRow } from '../../engine/calculator';
import './AddProductionPartDrawer.css';

export default function AddProductionPartDrawer({ onClose }) {
  const { addVehicle, addPartWithParams } = useProductionPartsStore();

  // Form State initialized to the examples provided
  const [formData, setFormData] = useState({
    // Section 1 - Vehicle Information
    vehicleModel: 'HLX 100',
    variant: 'Standard',
    productionStatus: 'Active',
    effectiveDate: new Date().toISOString().split('T')[0],

    // Section 2 - Production Part
    partName: 'Front Wheel Assy',
    partNumber: 'PN-HLX100-F',
    partCategory: 'Wheel Assembly',
    description: 'Complete front wheel assembly',

    // Section 3 - Plant Information
    plant: 'Hosur',
    productionArea: 'Wheel Assembly',
    assemblyLine: 'Front Wheel Line',
    productionCell: 'Cell A',

    // Section 4 - Production Quantity
    qty: 1,
    volumePerDay: 800,
    workingHours: 16,

    // Section 5 - Inventory Parameters
    supplierHours: 4,
    transitHours: 1.5,
    openingHours: 2,
    pocHours: 0.5,

    // Section 6 - Trolley
    trolleyType: 'Standard Wheel Trolley',
    capacity: 20,

    // Section 7 - Availability
    plantAvailable: 0,
    currentStock: 0,
    safetyStock: 0,
    remarks: ''
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSave = () => {
    const vId = `V_${Date.now()}`;
    const pId = `P_${Date.now()}`;

    // 1. Vehicle Master Entity
    const newVehicle = {
      vehicle_id: vId,
      vehicle_name: formData.vehicleModel,
      variant: formData.variant,
      status: formData.productionStatus,
      effective_date: formData.effectiveDate
    };
    addVehicle(newVehicle);

    // 2. Production Part Entity
    const newPart = {
      part_id: pId,
      vehicle_id: vId,
      part_name: formData.partName,
      part_number: formData.partNumber,
      category: formData.partCategory,
      description: formData.description,
      assembly_line: formData.assemblyLine,
      plant: formData.plant,
      production_area: formData.productionArea,
      production_cell: formData.productionCell,
      capacity: formData.capacity,
      qty_per_vehicle: formData.qty,
      trolley_type: formData.trolleyType,
      status: 'Active',
    };

    // 3. MHF Params Entity
    const newMhfParams = {
      part_id: pId,
      daily_volume: formData.volumePerDay,
      working_hours: formData.workingHours,
      supplier_hours: formData.supplierHours,
      transit_hours: formData.transitHours,
      opening_hours: formData.openingHours,
      poc_hours: formData.pocHours,
      plant_available: formData.plantAvailable || null,
      current_stock: formData.currentStock,
      safety_stock: formData.safetyStock,
      remarks: formData.remarks,
    };

    addPartWithParams(newPart, newMhfParams);
    onClose();
  };

  // Preview Calculation
  const preview = useMemo(() => {
    const mockPart = { capacity: formData.capacity };
    const mockParams = {
      daily_volume: formData.volumePerDay,
      working_hours: formData.workingHours,
      supplier_hours: formData.supplierHours,
      transit_hours: formData.transitHours,
      opening_hours: formData.openingHours,
      poc_hours: formData.pocHours,
    };
    return calculateMhfRow(mockPart, mockParams, null) || {
      volPerHour: 0,
      supplierPieces: 0,
      transitPieces: 0,
      openingPieces: 0,
      pocPieces: 0,
      totalRequired: 0
    };
  }, [formData]);

  return (
    <div className="add-part-drawer-overlay">
      <div className="add-part-drawer">
        <div className="add-part-drawer__header">
          <h2>Add Production Part</h2>
          <button className="add-part-drawer__close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="add-part-drawer__content">
          <div className="add-part-drawer__form">
            
            {/* Section 1 */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__title">Section 1 — Vehicle Information</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Vehicle Model *</label>
                  <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Variant</label>
                  <input type="text" name="variant" value={formData.variant} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Production Status</label>
                  <select name="productionStatus" value={formData.productionStatus} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Effective Date</label>
                  <input type="date" name="effectiveDate" value={formData.effectiveDate} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__title">Section 2 — Production Part</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Part Name *</label>
                  <input type="text" name="partName" value={formData.partName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Part Number *</label>
                  <input type="text" name="partNumber" value={formData.partNumber} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Part Category</label>
                  <select name="partCategory" value={formData.partCategory} onChange={handleChange}>
                    <option value="Wheel Assembly">Wheel Assembly</option>
                    <option value="Engine Assembly">Engine Assembly</option>
                    <option value="Fuel Tank">Fuel Tank</option>
                    <option value="Seat">Seat</option>
                    <option value="Battery">Battery</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plastic">Plastic</option>
                    <option value="Frame">Frame</option>
                    <option value="Swing Arm">Swing Arm</option>
                    <option value="Handle Bar">Handle Bar</option>
                    <option value="Exhaust">Exhaust</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input type="text" name="description" value={formData.description} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__title">Section 3 — Plant Information</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Plant</label>
                  <input type="text" name="plant" value={formData.plant} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Production Area</label>
                  <input type="text" name="productionArea" value={formData.productionArea} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Assembly Line</label>
                  <input type="text" name="assemblyLine" value={formData.assemblyLine} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Production Cell</label>
                  <input type="text" name="productionCell" value={formData.productionCell} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__title">Section 4 — Production Quantity</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Qty</label>
                  <input type="number" name="qty" value={formData.qty} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Volume / Day</label>
                  <input type="number" name="volumePerDay" value={formData.volumePerDay} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Working Hours</label>
                  <input type="number" name="workingHours" value={formData.workingHours} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__title">Section 5 — Inventory Parameters</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Supplier Inventory Hours</label>
                  <input type="number" step="0.1" name="supplierHours" value={formData.supplierHours} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Transit Hours</label>
                  <input type="number" step="0.1" name="transitHours" value={formData.transitHours} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Opening Inventory Hours</label>
                  <input type="number" step="0.1" name="openingHours" value={formData.openingHours} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Vehicle Assy POC Hours</label>
                  <input type="number" step="0.1" name="pocHours" value={formData.pocHours} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Section 6 */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__title">Section 6 — Trolley</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Trolley Type</label>
                  <input type="text" name="trolleyType" value={formData.trolleyType} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Capacity of Trolley</label>
                  <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Section 7 */}
            <div className="form-section">
              <div className="form-section__header">
                <span className="form-section__title">Section 7 — Availability</span>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Plant Available (Trolleys)</label>
                  <input type="number" name="plantAvailable" value={formData.plantAvailable} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Current Stock</label>
                  <input type="number" name="currentStock" value={formData.currentStock} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Safety Stock</label>
                  <input type="number" name="safetyStock" value={formData.safetyStock} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '8px' }}>
                <label>Remarks</label>
                <input type="text" name="remarks" value={formData.remarks} onChange={handleChange} />
              </div>
            </div>

          </div>
          
          <div className="add-part-drawer__preview">
            <div className="preview-sticky">
              <div className="preview-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                Live Calculation
              </div>
              <div className="preview-cards">
                <div className="preview-card">
                  <span className="preview-label">Volume / Hr</span>
                  <span className="preview-value">{preview.volPerHour}</span>
                </div>
                <div className="preview-card">
                  <span className="preview-label">Supplier Qty</span>
                  <span className="preview-value">{preview.supplierPieces}</span>
                </div>
                <div className="preview-card">
                  <span className="preview-label">Transit Qty</span>
                  <span className="preview-value">{preview.transitPieces}</span>
                </div>
                <div className="preview-card">
                  <span className="preview-label">Opening Qty</span>
                  <span className="preview-value">{preview.openingPieces}</span>
                </div>
                <div className="preview-card">
                  <span className="preview-label">Vehicle Assy POC</span>
                  <span className="preview-value">{preview.pocPieces}</span>
                </div>
                <div className="preview-card highlight">
                  <span className="preview-label">Required Trolleys</span>
                  <span className="preview-value">{preview.totalRequired}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="add-part-drawer__footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <div className="footer-actions">
            <button className="btn btn-secondary">Save Draft</button>
            <button className="btn btn-primary" onClick={handleSave}>Save & Calculate</button>
          </div>
        </div>
      </div>
    </div>
  );
}
