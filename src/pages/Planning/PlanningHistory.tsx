import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import { PlanningService } from '../../services/planningService';
import { DailyPlan } from '../../types/planning';
import { useAuthStore } from '../../state/authStore';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

export default function PlanningHistory() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const fetched = await PlanningService.getAllPlans();
    setPlans(fetched);
  };

  const handleDuplicate = async (id: string) => {
    await PlanningService.duplicatePlan(id, user?.name || 'System');
    loadPlans();
    alert('Plan duplicated successfully as a new Draft.');
  };

  const filteredPlans = plans.filter(p => 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.date.includes(searchTerm)
  );

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" style={{ backgroundColor: 'var(--bg-body)' }}>
        <TopHeader title="Planning History" subtitle="View, search, and clone past daily plans" />
        <main style={{ padding: 'var(--space-6) var(--space-8)' }}>
          <div className="card-elevated" style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <input 
                type="text" 
                className="input" 
                style={{ width: '300px' }}
                placeholder="Search by Plan ID or Date..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={() => navigate('/planning/daily')}>Go to Daily Planning</button>
          </div>

          <div className="card-elevated" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="enterprise-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>PLAN ID</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>TARGET DATE</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'center' }}>VERSION</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>CREATED BY</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'center' }}>STATUS</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan) => (
                    <tr key={plan.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{plan.id}</td>
                      <td style={{ padding: '12px 16px' }}>{plan.date}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>v{plan.version}</td>
                      <td style={{ padding: '12px 16px' }}>{plan.createdBy}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span className={`badge badge-${plan.status === 'Approved' ? 'positive' : plan.status === 'Locked' ? 'warning' : 'neutral'}`}>
                          {plan.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleDuplicate(plan.id)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Clone
                          </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPlans.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No historical plans found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
