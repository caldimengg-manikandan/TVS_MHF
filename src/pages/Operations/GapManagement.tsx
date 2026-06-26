import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import { PlanningService } from '../../services/planningService';
import { GapService } from '../../services/gapService';
import { DailyPlan } from '../../types/planning';
import { GapTicket } from '../../types/gap';
import '../../App.css';

export default function GapManagement() {
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [gaps, setGaps] = useState<GapTicket[]>([]);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (selectedPlanId) {
      loadGaps(selectedPlanId);
    } else {
      setGaps([]);
    }
  }, [selectedPlanId]);

  const loadPlans = async () => {
    const fetched = await PlanningService.getAllPlans();
    setPlans(fetched);
    if (fetched.length > 0) {
      setSelectedPlanId(fetched[0].id);
    }
  };

  const loadGaps = async (planId: string) => {
    // Automatically generate gap tickets for this plan if missing
    await GapService.generateFromPlan(planId);
    const allGaps = await GapService.getAll();
    setGaps(allGaps.filter(g => g.planId === planId));
  };

  const handleUpdateField = async (id: string, field: keyof GapTicket, value: string) => {
    await GapService.updateGap(id, { [field]: value });
    loadGaps(selectedPlanId); // refresh
  };

  const gapSummary = useMemo(() => {
    let total = gaps.length;
    let high = 0;
    let open = 0;
    let resolved = 0;
    
    gaps.forEach(g => {
      if (g.priority === 'High') high++;
      if (g.status === 'Open') open++;
      if (g.status === 'Resolved') resolved++;
    });

    return { total, high, open, resolved };
  }, [gaps]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" style={{ backgroundColor: 'var(--bg-body)' }}>
        <TopHeader title="Gap Management" subtitle="Track, assign, and resolve Trolley shortages identified during daily planning" />
        <main style={{ padding: 'var(--space-6) var(--space-8)' }}>
          <div className="card-elevated" style={{ padding: 'var(--space-4)', display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>SELECT PLAN CONTEXT:</label>
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
          </div>

          {selectedPlanId && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              <div className="card-elevated" style={{ padding: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '4px' }}>TOTAL SHORTAGES</div>
                <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{gapSummary.total}</div>
              </div>
              <div className="card-elevated" style={{ padding: 'var(--space-4)', borderTop: '3px solid var(--status-negative)' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '4px' }}>HIGH PRIORITY</div>
                <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-negative)' }}>{gapSummary.high}</div>
              </div>
              <div className="card-elevated" style={{ padding: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '4px' }}>OPEN TICKETS</div>
                <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{gapSummary.open}</div>
              </div>
              <div className="card-elevated" style={{ padding: 'var(--space-4)', borderTop: '3px solid var(--status-positive)' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '4px' }}>RESOLVED</div>
                <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-positive)' }}>{gapSummary.resolved}</div>
              </div>
            </div>
          )}

          <div className="card-elevated" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', minHeight: '300px' }}>
              <table className="enterprise-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>TICKET ID</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>MODEL</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right' }}>GAP QTY</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'center' }}>PRIORITY</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>ACTION REQUIRED</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>OWNER</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'center' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {gaps.map((gap) => (
                    <tr key={gap.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--status-negative)' }}>{gap.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{gap.model}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: 'var(--status-negative)', fontFamily: 'var(--font-mono)' }}>{gap.gapAmount}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <select 
                          className="input-inline" 
                          style={{ padding: '4px', width: 'auto', fontWeight: 'bold', color: gap.priority === 'High' ? 'var(--status-negative)' : gap.priority === 'Medium' ? 'var(--status-warning)' : 'var(--text-secondary)' }}
                          value={gap.priority}
                          onChange={(e) => handleUpdateField(gap.id, 'priority', e.target.value)}
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <input 
                          type="text"
                          className="input-inline"
                          style={{ padding: '6px', width: '100%', textAlign: 'left' }}
                          value={gap.action || ''}
                          placeholder="e.g. Expedite from Vendor"
                          onChange={(e) => handleUpdateField(gap.id, 'action', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <input 
                          type="text"
                          className="input-inline"
                          style={{ padding: '6px', width: '120px', textAlign: 'left' }}
                          value={gap.owner || ''}
                          placeholder="Assignee"
                          onChange={(e) => handleUpdateField(gap.id, 'owner', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <select 
                          className="input" 
                          style={{ 
                            padding: '6px', 
                            width: 'auto', 
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            backgroundColor: gap.status === 'Resolved' ? 'var(--status-positive-bg)' : gap.status === 'In Progress' ? 'var(--status-warning-bg)' : 'transparent',
                            color: gap.status === 'Resolved' ? 'var(--status-positive)' : gap.status === 'In Progress' ? 'var(--status-warning)' : 'var(--text-primary)',
                            borderColor: gap.status === 'Resolved' ? 'var(--status-positive)' : gap.status === 'In Progress' ? 'var(--status-warning)' : 'var(--border-subtle)'
                          }}
                          value={gap.status}
                          onChange={(e) => handleUpdateField(gap.id, 'status', e.target.value)}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {gaps.length === 0 && selectedPlanId && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-secondary">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          No gap shortages identified for this plan! 
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--status-positive)' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!selectedPlanId && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        Select a plan to manage gap tickets.
                      </td>
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
