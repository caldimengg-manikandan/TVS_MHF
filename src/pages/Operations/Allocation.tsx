import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import { PlanningService } from '../../services/planningService';
import { AllocationService } from '../../services/allocationService';
import { DailyPlan } from '../../types/planning';
import { PlanAllocation } from '../../types/allocation';
import '../../App.css';

export default function Allocation() {
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [allocations, setAllocations] = useState<PlanAllocation[]>([]);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (selectedPlanId) {
      loadAllocations(selectedPlanId);
    } else {
      setAllocations([]);
    }
  }, [selectedPlanId]);

  const loadPlans = async () => {
    const fetched = await PlanningService.getAllPlans();
    // Only show Approved or Locked plans for allocation
    const validPlans = fetched.filter(p => p.status === 'Approved' || p.status === 'Locked');
    setPlans(validPlans);
    if (validPlans.length > 0) {
      setSelectedPlanId(validPlans[0].id);
    }
  };

  const loadAllocations = async (planId: string) => {
    const fetched = await AllocationService.getOrCreateForPlan(planId);
    setAllocations(fetched);
  };

  const handleAllocate = async (model: string, lineId: string, val: string) => {
    const num = parseInt(val, 10) || 0;
    await AllocationService.updateLineAllocation(selectedPlanId, model, lineId, num);
    loadAllocations(selectedPlanId); // refresh
  };

  const handleFieldChange = async (model: string, lineId: string, field: string, val: string | number) => {
    await AllocationService.updateLineField(selectedPlanId, model, lineId, field as any, val);
    loadAllocations(selectedPlanId); // refresh
  };

  const handleAddLine = async (model: string) => {
    await AllocationService.addLine(selectedPlanId, model, 'New Line');
    loadAllocations(selectedPlanId); // refresh
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" style={{ backgroundColor: 'var(--bg-body)' }}>
        <TopHeader title="MHF Allocation" subtitle="Distribute available trolleys across assembly lines for Approved Plans" />
        <main style={{ padding: 'var(--space-6) var(--space-8)' }}>
          <div className="card-elevated" style={{ padding: 'var(--space-4)', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>SELECT APPROVED PLAN:</label>
            <select 
              className="input"
              style={{ width: '300px' }}
              value={selectedPlanId} 
              onChange={(e) => setSelectedPlanId(e.target.value)}
            >
              <option value="">-- Select a Plan --</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.id} ({p.date})</option>
              ))}
            </select>
            {selectedPlanId && (
              <span className="badge badge-positive" style={{ marginLeft: 'auto' }}>
                ACTIVE ALLOCATION
              </span>
            )}
          </div>

          {allocations.map(alloc => {
            const shortfall = Math.max(0, alloc.totalRequired - alloc.totalAllocated);
            return (
              <div key={alloc.model} className="card-elevated" style={{ padding: '0', overflow: 'hidden', marginBottom: 'var(--space-6)' }}>
                <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary-color-light)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="2" x2="12" y2="12"></line></svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)' }}>{alloc.model}</h3>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Assembly Line Split</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-5)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>TOTAL REQUIRED</span>
                      <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{alloc.totalRequired}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>TOTAL ALLOCATED</span>
                      <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{alloc.totalAllocated}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>SHORTFALL</span>
                      <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: shortfall > 0 ? 'var(--status-negative)' : 'var(--status-positive)' }}>
                        {shortfall > 0 ? `-${shortfall}` : '0'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table className="enterprise-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>ASSEMBLY LINE</th>
                        <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right' }}>REQUIRED</th>
                        <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right', width: '150px' }}>ALLOCATED</th>
                        <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right' }}>BALANCE</th>
                        <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>REMARKS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alloc.lines.map((line) => (
                        <tr key={line.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                            <input 
                              type="text" 
                              className="input-inline"
                              style={{ width: '100%', textAlign: 'left', fontWeight: 'bold', color: 'var(--text-primary)' }}
                              value={line.assemblyLine}
                              onChange={(e) => handleFieldChange(alloc.model, line.id, 'assemblyLine', e.target.value)}
                            />
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <input 
                              type="number" 
                              min="0"
                              className="input-inline mono text-right"
                              style={{ width: '60px' }}
                              value={line.required}
                              onChange={(e) => handleFieldChange(alloc.model, line.id, 'required', parseInt(e.target.value, 10) || 0)}
                            />
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <input 
                              type="number" 
                              min="0"
                              className="input mono text-right"
                              style={{ width: '80px', padding: '6px 8px', borderColor: line.allocated > 0 ? 'var(--primary-color)' : 'var(--border-subtle)' }}
                              value={line.allocated}
                              onChange={(e) => handleAllocate(alloc.model, line.id, e.target.value)}
                            />
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <span className="mono" style={{ fontWeight: 'bold', color: line.balance > 0 ? 'var(--status-negative)' : 'var(--status-positive)' }}>
                              {line.balance > 0 ? `-${line.balance}` : '0'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <input 
                              type="text" 
                              className="input-inline"
                              style={{ width: '100%', textAlign: 'left' }}
                              placeholder="-"
                              value={line.remarks || ''}
                              onChange={(e) => handleFieldChange(alloc.model, line.id, 'remarks', e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-surface)' }}>
                    <button className="btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => handleAddLine(alloc.model)}>
                      + Add Assembly Line Split
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {!selectedPlanId && (
            <div className="card-elevated" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
              </div>
              <h3>No Plan Selected</h3>
              <p>Please select an approved daily plan from the dropdown to manage allocations.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
