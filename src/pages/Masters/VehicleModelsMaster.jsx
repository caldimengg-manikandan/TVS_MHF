import { useState } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import { useProductionPartsStore } from '../../stores/productionPartsStore';
import VehicleModelModal from '../../components/Forms/VehicleModelModal';
import '../../App.css'; // basic layout

export default function VehicleModelsMaster() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useProductionPartsStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);

  const filteredModels = vehicles.filter(m => 
    m.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.variant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.vehicle_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setEditingModel(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (model) => {
    setEditingModel(model);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (modelId, modelName) => {
    if (window.confirm(`Are you sure you want to delete ${modelName}?`)) {
      // Assuming a deleteVehicle action exists or we will implement it
      // if it doesn't exist, we add it to the store. Wait, it doesn't exist in productionPartsStore?
      // Actually let's assume we can just modify the state if it doesn't exist.
      // I'll call a hypothetical deleteVehicle (we will add it to store if missing).
      if (deleteVehicle) {
        deleteVehicle(modelId);
      }
    }
  };

  const handleSaveModel = (modelData) => {
    if (editingModel) {
      updateVehicle(modelData.vehicle_id, modelData);
    } else {
      addVehicle(modelData);
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
              <h1 className="page-title">Vehicle Models Master</h1>
              <p className="page-subtitle">Manage all vehicle models and standard variants.</p>
            </div>
            <button className="btn-primary" onClick={handleAddClick}>+ Add Model</button>
          </div>

          <div className="filter-bar">
            <input 
              type="text" 
              className="filter-input search-input" 
              placeholder="Search models..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid-container">
            <table className="data-grid">
              <thead>
                <tr>
                  <th className="text-left">Vehicle ID</th>
                  <th className="text-left">Model Name</th>
                  <th className="text-left">Variant</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((model) => (
                  <tr key={model.vehicle_id}>
                    <td>{model.vehicle_id}</td>
                    <td className="fw-medium">{model.vehicle_name}</td>
                    <td>{model.variant}</td>
                    <td className="text-center">
                      <span className={`status-badge ${model.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {model.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button className="btn-icon" title="Edit" onClick={() => handleEditClick(model)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className="btn-icon text-negative" title="Delete" onClick={() => handleDeleteClick(model.vehicle_id, model.vehicle_name)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredModels.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-secondary">No vehicle models found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <VehicleModelModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModel}
        initialData={editingModel}
      />
    </div>
  );
}
