import { useState, useEffect } from 'react';
import './Modal.css';

export default function UserModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    role: 'Viewer',
    status: 'Active',
    password: '', // Only for new users
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: '', // Don't show password for existing users
      });
    } else {
      setFormData({
        id: '',
        name: '',
        email: '',
        role: 'Viewer',
        status: 'Active',
        password: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Name and Email are required.');
      return;
    }
    if (!initialData && !formData.password) {
      alert('Password is required for new users.');
      return;
    }
    
    // Create payload
    const payload = { ...formData };
    if (initialData && !payload.password) {
      delete payload.password; // Don't overwrite if left blank on edit
    }
    
    onSave(payload);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="modal-content form-modal" onClick={e => e.stopPropagation()} style={{
        backgroundColor: 'white', padding: '24px', borderRadius: '8px',
        width: '450px', maxWidth: '90%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 className="modal-title" style={{ margin: 0, fontSize: '1.25rem' }}>{initialData ? 'Edit User' : 'Add User'}</h2>
          <button className="modal-close" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Full Name <span className="text-negative">*</span></label>
            <input 
              type="text" 
              className="form-input" 
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Email <span className="text-negative">*</span></label>
            <input 
              type="email" 
              className="form-input" 
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          {!initialData && (
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Temporary Password <span className="text-negative">*</span></label>
              <input 
                type="password" 
                className="form-input" 
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required={!initialData}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Role</label>
              <select 
                className="form-input"
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="Admin">Admin</option>
                <option value="Planner">Planner</option>
                <option value="Production Engineer">Production Engineer</option>
                <option value="Plant Manager">Plant Manager</option>
                <option value="Stores">Stores</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
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
          </div>

          <div className="form-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save User</button>
          </div>
        </form>
      </div>
    </div>
  );
}
