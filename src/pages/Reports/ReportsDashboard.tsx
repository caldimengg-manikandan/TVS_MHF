import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import { PlanningService } from '../../services/planningService';
import { ReportService } from '../../services/reportService';
import { downloadExcel } from '../../utils/exportUtils';
import { DailyPlan } from '../../types/planning';
import '../../App.css';

export default function ReportsDashboard() {
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const fetched = await PlanningService.getAllPlans();
    setPlans(fetched);
    if (fetched.length > 0) {
      setSelectedPlanId(fetched[0].id);
    }
  };

  const handleExportPlanExecution = async () => {
    if (!selectedPlanId) return;
    const data = await ReportService.getDailyPlanExecutionReport(selectedPlanId);
    downloadExcel(data, `DailyPlanExecution_${selectedPlanId}`);
  };

  const handleExportTransfers = async () => {
    const data = await ReportService.getTransferHistoryReport();
    downloadExcel(data, `TransferHistoryReport`);
  };

  const handleExportRequests = async () => {
    const data = await ReportService.getRequestHistoryReport();
    downloadExcel(data, `RequestHistoryReport`);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" style={{ backgroundColor: 'var(--bg-body)' }}>
        <TopHeader title="Enterprise Reporting Center" subtitle="Export consolidated MHF data to CSV/Excel for deeper analysis" />
        <main style={{ padding: 'var(--space-6) var(--space-8)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
            
            {/* Daily Plan Execution Report */}
            <div className="card-elevated" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--primary-color-light)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Daily Plan Execution</h2>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Detailed Data Dump</span>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', flex: 1, marginBottom: 'var(--space-5)' }}>
                Generates a flattened CSV containing requirements, availability, assembly line allocations, and gap status for a specific Daily Plan.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', background: 'var(--bg-surface)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>SELECT TARGET PLAN</label>
                <select 
                  className="input"
                  style={{ width: '100%', marginBottom: 'var(--space-2)' }}
                  value={selectedPlanId} 
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                >
                  <option value="">-- Select a Plan --</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.id} ({p.date})</option>
                  ))}
                </select>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                  onClick={handleExportPlanExecution}
                  disabled={!selectedPlanId}
                >
                  Download CSV Extract
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {/* Transfer History Report */}
              <div className="card-elevated" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>Transfer History Report</h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                    Exports all MHF trolley transfer movements across all plants and assembly lines.
                  </p>
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ flexShrink: 0, padding: '10px 16px' }}
                  onClick={handleExportTransfers}
                >
                  Export CSV
                </button>
              </div>

              {/* Request History Report */}
              <div className="card-elevated" style={{ padding: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>Request History Report</h2>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                    Exports all MHF trolley requests placed by Assembly Lines to the Central Stores.
                  </p>
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ flexShrink: 0, padding: '10px 16px' }}
                  onClick={handleExportRequests}
                >
                  Export CSV
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
