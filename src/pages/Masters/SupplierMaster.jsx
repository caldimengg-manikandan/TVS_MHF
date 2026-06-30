import { useState } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import { useMasterStore } from '../../state/masterStore';
import SupplierModal from '../../components/Forms/SupplierModal';
import '../../App.css';

export default function SupplierMaster() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useMasterStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (supplierId, supplierName) => {
    if (window.confirm(`Are you sure you want to delete ${supplierName}?`)) {
      deleteSupplier(supplierId);
    }
  };

  const handleSaveSupplier = (supplierData) => {
    if (editingSupplier) {
      updateSupplier(supplierData.id, supplierData);
    } else {
      addSupplier(supplierData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopHeader />
        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Supplier Master</h1>
              <p className="page-subtitle">Manage trolley suppliers, contacts, and default transit times.</p>
            </div>
            <button className="btn-primary" onClick={handleAddClick}>+ Add Supplier</button>
          </div>

          <div className="filter-bar">
            <input 
              type="text" 
              className="filter-input search-input" 
              placeholder="Search suppliers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid-container">
            <table className="data-grid">
              <thead>
                <tr>
                  <th className="text-left">Code</th>
                  <th className="text-left">Supplier Name</th>
                  <th className="text-left">Contact</th>
                  <th className="text-left">Target Plant</th>
                  <th className="text-right">Transit Time (h)</th>
                  <th className="text-right">Def. Inv (h)</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((sup) => (
                  <tr key={sup.id}>
                    <td>{sup.code}</td>
                    <td className="fw-medium">{sup.name}</td>
                    <td>{sup.contact}</td>
                    <td>{sup.plant}</td>
                    <td className="text-right num-cell">{sup.transitTime.toFixed(1)}</td>
                    <td className="text-right num-cell">{sup.defaultInventoryHours.toFixed(1)}</td>
                    <td className="text-center">
                      <span className={`status-badge ${sup.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {sup.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button className="btn-icon" title="Edit" onClick={() => handleEditClick(sup)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className="btn-icon text-negative" title="Delete" onClick={() => handleDeleteClick(sup.id, sup.name)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSuppliers.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-secondary">No suppliers found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <SupplierModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSupplier}
        initialData={editingSupplier}
      />
    </div>
  );
}
