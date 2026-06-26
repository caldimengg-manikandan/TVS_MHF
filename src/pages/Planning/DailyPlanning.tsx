import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import { PlanningService } from '../../services/planningService';
import { DailyPlan } from '../../types/planning';
import { useAuthStore } from '../../state/authStore';
import '../../App.css';

export default function DailyPlanning() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  const location = useLocation();
  const [targetDate, setTargetDate] = useState<string>(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('date') || new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    loadPlansForDate(targetDate);
  }, [targetDate]);

  const loadPlansForDate = async (date: string) => {
    const fetched = await PlanningService.getPlansByDate(date);
    setPlans(fetched);
    if (fetched.length > 0) {
      setSelectedPlanId(fetched[0].id);
    } else {
      setSelectedPlanId(null);
    }
  };

  const handleGeneratePlan = async () => {
    const newPlan = await PlanningService.createPlan(targetDate, user?.name || 'System');
    setPlans([...plans, newPlan]);
    setSelectedPlanId(newPlan.id);
  };

  const handleUpdateStatus = async (status: DailyPlan['status']) => {
    if (!selectedPlanId) return;
    await PlanningService.updatePlanStatus(selectedPlanId, status, user?.name);
    loadPlansForDate(targetDate);
  };

  const handleDuplicatePlan = async () => {
    if (!selectedPlanId) return;
    const newPlan = await PlanningService.duplicatePlan(selectedPlanId, user?.name || 'System');
    loadPlansForDate(targetDate);
    setSelectedPlanId(newPlan.id);
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  // Compute summary cards
  const summary = useMemo(() => {
    if (!selectedPlan) return null;
    let totalVol = 0;
    let required = 0;
    let available = 0;
    let gap = 0;
    const models = new Set();
    let hours = 0;

    selectedPlan.rows.forEach(r => {
      totalVol += r.volume;
      required += r.required;
      available += r.available;
      gap += r.gap;
      models.add(r.model);
      hours = Math.max(hours, r.hours); // using max hours as proxy
    });

    return { totalVol, required, available, gap, modelsCount: models.size, hours };
  }, [selectedPlan]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" style={{ backgroundColor: 'var(--bg-body)' }}>
        <TopHeader title="Daily Planning" subtitle="Manage and approve daily MHF requirements" />
        
        <main style={{ padding: 'var(--space-6) var(--space-8)' }}>
          {/* Header & Controls */}
          <div className="card-elevated" style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>Target Date</label>
                <input 
                  type="date" 
                  className="input"
                  style={{ width: '150px', padding: '4px 8px' }}
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
              
              {plans.length > 0 && (
                <div>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>Select Plan</label>
                  <select 
                    className="input"
                    style={{ width: '200px', padding: '4px 8px' }}
                    value={selectedPlanId || ''} 
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.id} (v{p.version})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              {plans.length === 0 && (
                <button className="btn-primary" onClick={handleGeneratePlan}>
                  + Generate New Plan
                </button>
              )}
              {selectedPlan && (
                <>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn-secondary" onClick={handleDuplicatePlan} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Duplicate
                  </button>
                  <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Print
                  </button>
                  <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Export
                  </button>
                </div>
                </>
              )}
            </div>
          </div>

          {selectedPlan ? (
            <>
              {/* Plan Metadata Header */}
              <div className="card-elevated" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{selectedPlan.id}</h2>
                    <span className={`badge badge-${selectedPlan.status === 'Approved' ? 'positive' : selectedPlan.status === 'Locked' ? 'warning' : 'neutral'}`}>
                      {selectedPlan.status.toUpperCase()}
                    </span>
                    <span className="badge badge-neutral">VERSION {selectedPlan.version}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                    <span><strong>Created By:</strong> {selectedPlan.createdBy} ({new Date(selectedPlan.createdOn).toLocaleDateString()})</span>
                    {selectedPlan.approvedBy && (
                      <span><strong>Approved By:</strong> {selectedPlan.approvedBy} ({new Date(selectedPlan.approvedOn!).toLocaleDateString()})</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  {selectedPlan.status === 'Draft' && (
                    <>
                      <button className="btn-secondary">Save Draft</button>
                      <button className="btn-primary" onClick={() => handleUpdateStatus('Submitted')}>Submit for Approval</button>
                    </>
                  )}
                  {selectedPlan.status === 'Submitted' && (
                    <button className="btn-primary" onClick={() => handleUpdateStatus('Approved')}>Approve Plan</button>
                  )}
                  {selectedPlan.status === 'Approved' && (
                    <button className="btn-secondary" style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b', color: '#b45309' }} onClick={() => handleUpdateStatus('Locked')}>
                      🔒 Lock Plan
                    </button>
                  )}
                </div>
              </div>

              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                <div className="card-elevated" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '4px' }}>TOTAL VOLUME</div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary?.totalVol}</div>
                </div>
                <div className="card-elevated" style={{ padding: 'var(--space-4)', borderTop: '3px solid #0ea5e9' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '4px' }}>REQUIRED</div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary?.required}</div>
                </div>
                <div className="card-elevated" style={{ padding: 'var(--space-4)', borderTop: '3px solid #22c55e' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '4px' }}>AVAILABLE</div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary?.available}</div>
                </div>
                <div className="card-elevated" style={{ padding: 'var(--space-4)', borderTop: `3px solid ${summary?.gap < 0 ? '#ef4444' : '#22c55e'}` }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '4px' }}>NET GAP</div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: summary?.gap < 0 ? 'var(--status-negative)' : 'var(--status-positive)' }}>
                    {summary?.gap > 0 ? '+' : ''}{summary?.gap}
                  </div>
                </div>
                <div className="card-elevated" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '4px' }}>MODELS PLANNED</div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary?.modelsCount}</div>
                </div>
                <div className="card-elevated" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '4px' }}>WORKING HOURS</div>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary?.hours}h</div>
                </div>
              </div>

              {/* Professional Editable Grid */}
              <div className="card-elevated" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
                  <table className="enterprise-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>VEHICLE MODEL</th>
                        <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right' }}>VOLUME</th>
                        <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right' }}>HOURS</th>
                        <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right' }}>REQUIRED</th>
                        <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right' }}>AVAILABLE</th>
                        <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right' }}>GAP</th>
                        <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>REMARKS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPlan.rows.map((row) => (
                        <tr key={row.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{row.model}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            <input className="input-inline" defaultValue={row.volume} style={{ width: '80px', textAlign: 'right' }} disabled={selectedPlan.status === 'Locked' || selectedPlan.status === 'Approved'} />
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{row.hours}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{row.required}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            <input className="input-inline" defaultValue={row.available} style={{ width: '80px', textAlign: 'right' }} disabled={selectedPlan.status === 'Locked' || selectedPlan.status === 'Approved'} />
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: row.gap < 0 ? 'var(--status-negative)' : 'var(--status-positive)' }}>
                            {row.gap > 0 ? '+' : ''}{row.gap}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <input className="input-inline" defaultValue={row.remarks || ''} style={{ width: '100%', textAlign: 'left' }} placeholder="Add note..." disabled={selectedPlan.status === 'Locked' || selectedPlan.status === 'Approved'} />
                          </td>
                        </tr>
                      ))}
                      {selectedPlan.rows.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No rows generated.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="card-elevated" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <h3>No Plan Exists</h3>
              <p>There is no daily plan generated for {targetDate}. Click "Generate New Plan" to begin.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
