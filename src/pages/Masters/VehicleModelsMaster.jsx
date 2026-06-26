import { useState } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import { useMasterStore } from '../../state/masterStore';
import '../../App.css'; // basic layout

export default function VehicleModelsMaster() {
  const { vehicleModels } = useMasterStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModels = vehicleModels.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopHeader />
        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Vehicle Models Master</h1>
              <p className="page-subtitle">Manage all vehicle models and standard part requirements.</p>
            </div>
            <button className="btn-primary" onClick={() => alert('Add Model Modal TBD')}>+ Add Model</button>
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
                  <th className="text-left">Code</th>
                  <th className="text-left">Model Name</th>
                  <th className="text-left">Category</th>
                  <th className="text-right">Vol / Day</th>
                  <th className="text-left">Part Name</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((model) => (
                  <tr key={model.id}>
                    <td>{model.code}</td>
                    <td className="fw-medium">{model.name}</td>
                    <td>{model.category}</td>
                    <td className="text-right num-cell">{model.volumePerDay}</td>
                    <td>{model.partName}</td>
                    <td className="text-center">
                      <span className={`status-badge ${model.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {model.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <button className="btn-icon" title="Edit" onClick={() => alert('Edit Model TBD')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredModels.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-secondary">No models found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
