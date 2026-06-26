import { useState } from 'react';
import { useProductionPartsStore } from '../../stores/productionPartsStore';
import { calculateMhfRow } from '../../engine/calculator';
import './Wizard.css'; // Optional: We can define some styles or use inline

export default function AddProductionPartWizard({ onClose }) {
  const { addVehicle, addPartWithParams } = useProductionPartsStore();
  const [step, setStep] = useState(1);

  // Form State
  const [basic, setBasic] = useState({
    plant: 'Hosur',
    productionArea: '',
    assemblyLine: '',
    vehicleModel: '',
    variant: 'Standard',
  });

  const [part, setPart] = useState({
    partName: '',
    partNumber: '',
    category: '',
    description: '',
    drawingNumber: '',
    revision: '',
  });

  const [params, setParams] = useState({
    volumePerDay: 500,
    supplierHours: 4,
    transitHours: 1.5,
    openingHours: 2,
    pocHours: 0.5,
    trolleyCapacity: 20,
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSave = () => {
    // Generate IDs (mocking UUID or simple increment)
    const vId = `V_${Date.now()}`;
    const pId = `P_${Date.now()}`;

    // 1. Vehicle Master Entity
    const newVehicle = {
      vehicle_id: vId,
      vehicle_name: basic.vehicleModel,
      variant: basic.variant,
      status: 'Active',
    };
    addVehicle(newVehicle);

    // 2. Production Part Entity
    const newPart = {
      part_id: pId,
      vehicle_id: vId,
      part_name: part.partName,
      part_number: part.partNumber,
      assembly_line: basic.assemblyLine,
      plant: basic.plant,
      capacity: params.trolleyCapacity,
      status: 'Active',
    };

    // 3. MHF Params Entity
    const newMhfParams = {
      part_id: pId,
      daily_volume: Number(params.volumePerDay),
      working_hours: 16, // Default assumption
      supplier_hours: Number(params.supplierHours),
      transit_hours: Number(params.transitHours),
      opening_hours: Number(params.openingHours),
      poc_hours: Number(params.pocHours),
      plant_available: null,
      remarks: '',
    };

    addPartWithParams(newPart, newMhfParams);
    onClose();
  };

  // Preview Calculation
  const mockPart = { capacity: params.trolleyCapacity };
  const mockParams = {
    daily_volume: params.volumePerDay,
    working_hours: 16,
    supplier_hours: params.supplierHours,
    transit_hours: params.transitHours,
    opening_hours: params.openingHours,
    poc_hours: params.pocHours,
  };
  const preview = calculateMhfRow(mockPart, mockParams, null);

  return (
    <div className="wizard-overlay">
      <div className="wizard-modal">
        <div className="wizard-header">
          <h2>Add Production Part</h2>
          <button className="btn-icon" onClick={onClose}>×</button>
        </div>
        
        <div className="wizard-stepper">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Basic</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Part</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Parameters</div>
          <div className={`step ${step >= 4 ? 'active' : ''}`}>4. Preview</div>
        </div>

        <div className="wizard-body">
          {step === 1 && (
            <div className="wizard-form">
              <label>Plant <input value={basic.plant} onChange={e => setBasic({...basic, plant: e.target.value})} /></label>
              <label>Production Area <input value={basic.productionArea} onChange={e => setBasic({...basic, productionArea: e.target.value})} /></label>
              <label>Assembly Line <input value={basic.assemblyLine} onChange={e => setBasic({...basic, assemblyLine: e.target.value})} /></label>
              <label>Vehicle Model <input value={basic.vehicleModel} onChange={e => setBasic({...basic, vehicleModel: e.target.value})} /></label>
              <label>Variant <input value={basic.variant} onChange={e => setBasic({...basic, variant: e.target.value})} /></label>
            </div>
          )}

          {step === 2 && (
            <div className="wizard-form">
              <label>Part Name <input value={part.partName} onChange={e => setPart({...part, partName: e.target.value})} /></label>
              <label>Part Number <input value={part.partNumber} onChange={e => setPart({...part, partNumber: e.target.value})} /></label>
              <label>Category <input value={part.category} onChange={e => setPart({...part, category: e.target.value})} /></label>
              <label>Description <input value={part.description} onChange={e => setPart({...part, description: e.target.value})} /></label>
              <label>Drawing Number <input value={part.drawingNumber} onChange={e => setPart({...part, drawingNumber: e.target.value})} /></label>
              <label>Revision <input value={part.revision} onChange={e => setPart({...part, revision: e.target.value})} /></label>
            </div>
          )}

          {step === 3 && (
            <div className="wizard-form">
              <label>Volume / Day <input type="number" value={params.volumePerDay} onChange={e => setParams({...params, volumePerDay: e.target.value})} /></label>
              <label>Supplier Inv Hours <input type="number" step="0.1" value={params.supplierHours} onChange={e => setParams({...params, supplierHours: e.target.value})} /></label>
              <label>Transit Hours <input type="number" step="0.1" value={params.transitHours} onChange={e => setParams({...params, transitHours: e.target.value})} /></label>
              <label>Opening Inv Hours <input type="number" step="0.1" value={params.openingHours} onChange={e => setParams({...params, openingHours: e.target.value})} /></label>
              <label>Vehicle Assy POC <input type="number" step="0.1" value={params.pocHours} onChange={e => setParams({...params, pocHours: e.target.value})} /></label>
              <label>Trolley Capacity <input type="number" value={params.trolleyCapacity} onChange={e => setParams({...params, trolleyCapacity: e.target.value})} /></label>
            </div>
          )}

          {step === 4 && (
            <div className="wizard-preview">
              <h3>Calculated Requirements</h3>
              <div className="preview-grid">
                <div className="preview-item"><span>Volume/Hr:</span> <strong>{preview.volPerHour}</strong></div>
                <div className="preview-item"><span>Supplier Qty:</span> <strong>{preview.supplierPieces}</strong></div>
                <div className="preview-item"><span>Transit Qty:</span> <strong>{preview.transitPieces}</strong></div>
                <div className="preview-item"><span>Opening Qty:</span> <strong>{preview.openingPieces}</strong></div>
                <div className="preview-item"><span>POC Qty:</span> <strong>{preview.pocPieces}</strong></div>
                <div className="preview-item highlight"><span>Required Trolleys:</span> <strong>{preview.totalRequired}</strong></div>
              </div>
            </div>
          )}
        </div>

        <div className="wizard-footer">
          {step > 1 && <button className="btn-secondary" onClick={prevStep}>Back</button>}
          <div style={{ flex: 1 }}></div>
          {step < 4 ? (
            <button className="btn-primary" onClick={nextStep}>Next</button>
          ) : (
            <button className="btn-primary" onClick={handleSave}>Save</button>
          )}
        </div>
      </div>
    </div>
  );
}
