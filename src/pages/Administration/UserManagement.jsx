import { useState } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import { useAuthStore } from '../../state/authStore';
import UserModal from '../../components/Forms/UserModal';
import '../../App.css';

export default function UserManagement() {
  const { systemUsers, addUser, updateUser, deleteUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const filteredUsers = systemUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user ${userName}?`)) {
      deleteUser(userId);
    }
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      updateUser(userData.id, userData);
    } else {
      addUser(userData);
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
              <h1 className="page-title">User Management</h1>
              <p className="page-subtitle">Manage system users, roles, and access controls.</p>
            </div>
            <button className="btn-primary" onClick={handleAddClick}>+ Add User</button>
          </div>

          <div className="filter-bar">
            <input 
              type="text" 
              className="filter-input search-input" 
              placeholder="Search by name, email, or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid-container">
            <table className="data-grid">
              <thead>
                <tr>
                  <th className="text-left">Name</th>
                  <th className="text-left">Email</th>
                  <th className="text-left">Role</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="fw-medium">{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className="pill pill-blue">{user.role}</span>
                    </td>
                    <td className="text-center">
                      <span className={`status-badge ${user.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button className="btn-icon" title="Edit" onClick={() => handleEditClick(user)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className="btn-icon text-negative" title="Delete" onClick={() => handleDeleteClick(user.id, user.name)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-secondary">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <UserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        initialData={editingUser}
      />
    </div>
  );
}
