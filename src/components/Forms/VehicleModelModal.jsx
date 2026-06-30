import { useState, useEffect } from 'react';
import './Modal.css';

export default function VehicleModelModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    vehicle_name: '',
    variant: 'Standard',
    status: 'Active',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        vehicle_id: '',
        vehicle_name: '',
        variant: 'Standard',
        status: 'Active',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.vehicle_id || !formData.vehicle_name) {
      alert('Vehicle ID and Name are required.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="modal-content form-modal" onClick={e => e.stopPropagation()} style={{
        backgroundColor: 'white', padding: '24px', borderRadius: '8px',
        width: '400px', maxWidth: '90%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 className="modal-title" style={{ margin: 0, fontSize: '1.25rem' }}>{initialData ? 'Edit Vehicle Model' : 'Add Vehicle Model'}</h2>
          <button className="modal-close" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Vehicle ID <span className="text-negative">*</span></label>
            <input 
              type="text" 
              className="form-input" 
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              value={formData.vehicle_id}
              onChange={e => setFormData({...formData, vehicle_id: e.target.value})}
              disabled={!!initialData} // ID shouldn't be edited if existing
              placeholder="e.g. V5"
              required
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Model Name <span className="text-negative">*</span></label>
            <input 
              type="text" 
              className="form-input" 
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              value={formData.vehicle_name}
              onChange={e => setFormData({...formData, vehicle_name: e.target.value})}
              placeholder="e.g. Apache RTR 160"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Variant</label>
            <input 
              type="text" 
              className="form-input" 
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              value={formData.variant}
              onChange={e => setFormData({...formData, variant: e.target.value})}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Status</label>
            <select 
              className="form-input"
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="form-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Model</button>
          </div>
        </form>
      </div>
    </div>
  );
}
