import { useState, useEffect } from 'react';
import './Modal.css';

export default function SupplierModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    id: '',
    code: '',
    name: '',
    contact: '',
    plant: '',
    transitTime: 1,
    defaultInventoryHours: 4,
    status: 'Active',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: '',
        code: '',
        name: '',
        contact: '',
        plant: '',
        transitTime: 1,
        defaultInventoryHours: 4,
        status: 'Active',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      alert('Supplier Code and Name are required.');
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
          <h2 className="modal-title" style={{ margin: 0, fontSize: '1.25rem' }}>{initialData ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button className="modal-close" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Supplier Code <span className="text-negative">*</span></label>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group" style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Supplier Name <span className="text-negative">*</span></label>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Contact Person</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.contact}
                onChange={e => setFormData({...formData, contact: e.target.value})}
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Target Plant</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.plant}
                onChange={e => setFormData({...formData, plant: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Transit Time (h)</label>
              <input 
                type="number" 
                step="0.1"
                className="form-input" 
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.transitTime}
                onChange={e => setFormData({...formData, transitTime: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Def. Inv (h)</label>
              <input 
                type="number" 
                step="0.1"
                className="form-input" 
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.defaultInventoryHours}
                onChange={e => setFormData({...formData, defaultInventoryHours: parseFloat(e.target.value) || 0})}
              />
            </div>
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
            <button type="submit" className="btn btn-primary">Save Supplier</button>
          </div>
        </form>
      </div>
    </div>
  );
}
