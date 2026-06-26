import { useState } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import AddProductionPartDrawer from '../../components/Forms/AddProductionPartDrawer';
import { useProductionPartsStore } from '../../stores/productionPartsStore';
import '../../App.css'; 

export default function ProductionPartsMaster() {
  const { vehicles, parts } = useProductionPartsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPartDrawer, setShowAddPartDrawer] = useState(false);

  // Join parts with vehicles for display
  const displayParts = parts.map(part => {
    const vehicle = vehicles.find(v => v.vehicle_id === part.vehicle_id);
    return {
      ...part,
      vehicle_name: vehicle?.vehicle_name || 'Unknown',
      variant: vehicle?.variant || ''
    };
  });

  const filteredParts = displayParts.filter(p => 
    p.part_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase())
  ).reverse();

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <TopHeader />
        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Production Parts Master</h1>
              <p className="page-subtitle">Manage all production parts and their default configuration parameters.</p>
            </div>
            <button className="btn-primary" onClick={() => setShowAddPartDrawer(true)}>+ Add Production Part</button>
          </div>

          <div className="filter-bar">
            <input 
              type="text" 
              className="filter-input search-input" 
              placeholder="Search by part name, number, or model..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid-container" style={{ overflowX: 'auto' }}>
            <table className="data-grid" style={{ minWidth: '1200px' }}>
              <thead>
                <tr>
                  <th className="text-left">Plant</th>
                  <th className="text-left">Production Area</th>
                  <th className="text-left">Assembly Line</th>
                  <th className="text-left">Vehicle Model</th>
                  <th className="text-left">Variant</th>
                  <th className="text-left">Part Name</th>
                  <th className="text-left">Part Number</th>
                  <th className="text-left">Trolley Type</th>
                  <th className="text-right">Capacity</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.map((part) => (
                  <tr key={part.part_id}>
                    <td>{part.plant}</td>
                    <td>Assembly</td>
                    <td>{part.assembly_line}</td>
                    <td className="fw-medium">{part.vehicle_name}</td>
                    <td>{part.variant}</td>
                    <td className="fw-medium">{part.part_name}</td>
                    <td>{part.part_number}</td>
                    <td>Standard Trolley</td>
                    <td className="text-right num-cell">{part.capacity}</td>
                    <td className="text-center">
                      <span className={`status-badge ${part.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {part.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <button className="btn-icon" title="Edit" onClick={() => alert('Edit Part TBD')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredParts.length === 0 && (
                  <tr>
                    <td colSpan="11" className="text-center py-8 text-secondary">No production parts found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
      {showAddPartDrawer && <AddProductionPartDrawer onClose={() => setShowAddPartDrawer(false)} />}
    </div>
  );
}
