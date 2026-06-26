import { useState } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import { useMasterStore } from '../../state/masterStore';
import '../../App.css';

export default function PlantMaster() {
  const { plants } = useMasterStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlants = plants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopHeader />
        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Plant Master</h1>
              <p className="page-subtitle">Manage plant locations, standard working hours, and capacity.</p>
            </div>
            <button className="btn-primary" onClick={() => alert('Add Plant Modal TBD')}>+ Add Plant</button>
          </div>

          <div className="filter-bar">
            <input 
              type="text" 
              className="filter-input search-input" 
              placeholder="Search plants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid-container">
            <table className="data-grid">
              <thead>
                <tr>
                  <th className="text-left">Code</th>
                  <th className="text-left">Plant Name</th>
                  <th className="text-left">Location</th>
                  <th className="text-right">Working Hours</th>
                  <th className="text-right">Def. Capacity</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlants.map((plant) => (
                  <tr key={plant.id}>
                    <td>{plant.code}</td>
                    <td className="fw-medium">{plant.name}</td>
                    <td>{plant.location}</td>
                    <td className="text-right num-cell">{plant.workingHours}</td>
                    <td className="text-right num-cell">{plant.defaultCapacity}</td>
                    <td className="text-center">
                      <span className={`status-badge ${plant.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {plant.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <button className="btn-icon" title="Edit" onClick={() => alert('Edit Plant TBD')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPlants.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-secondary">No plants found</td>
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
