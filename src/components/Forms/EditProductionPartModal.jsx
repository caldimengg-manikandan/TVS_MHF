import { useState, useEffect } from 'react';
import './Modal.css';

export default function EditProductionPartModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    part_id: '',
    plant: '',
    assembly_line: '',
    part_name: '',
    part_number: '',
    capacity: 20,
    status: 'Active',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.part_name || !formData.part_number) {
      alert('Part Name and Part Number are required.');
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
        width: '500px', maxWidth: '90%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 className="modal-title" style={{ margin: 0, fontSize: '1.25rem' }}>Edit Production Part</h2>
          <button className="modal-close" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Part Name <span className="text-negative">*</span></label>
            <input 
              type="text" 
              className="form-input" 
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              value={formData.part_name || ''}
              onChange={e => setFormData({...formData, part_name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Part Number <span className="text-negative">*</span></label>
            <input 
              type="text" 
              className="form-input" 
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              value={formData.part_number || ''}
              onChange={e => setFormData({...formData, part_number: e.target.value})}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Plant</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.plant || ''}
                onChange={e => setFormData({...formData, plant: e.target.value})}
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Assembly Line</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.assembly_line || ''}
                onChange={e => setFormData({...formData, assembly_line: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Capacity</label>
              <input 
                type="number" 
                className="form-input" 
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.capacity || ''}
                onChange={e => setFormData({...formData, capacity: parseInt(e.target.value, 10)})}
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Status</label>
              <select 
                className="form-input"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.status || 'Active'}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
