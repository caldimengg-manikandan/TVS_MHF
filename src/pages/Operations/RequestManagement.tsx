import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import { RequestService } from '../../services/requestService';
import { MHFRequest, RequestStatus } from '../../types/request';
import { useAuthStore } from '../../state/authStore';
import '../../App.css';

export default function RequestManagement() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<MHFRequest[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ line: '', model: '', qty: '' });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    const fetched = await RequestService.getAll();
    setRequests(fetched);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(formData.qty || '0', 10);
    if (!formData.line || !formData.model || !qty) return;

    await RequestService.createRequest({
      date: new Date().toISOString().split('T')[0],
      assemblyLine: formData.line,
      model: formData.model,
      quantity: qty,
      requestedBy: user?.name || 'Unknown',
      remarks: 'Manual Line Request'
    });
    
    setShowModal(false);
    setFormData({ line: '', model: '', qty: '' });
    loadRequests();
  };

  const handleUpdateStatus = async (id: string, status: RequestStatus) => {
    await RequestService.updateStatus(id, status, user?.name);
    loadRequests();
  };

  const summary = useMemo(() => {
    let total = requests.length;
    let store = 0;
    let issue = 0;
    let closed = 0;
    
    requests.forEach(r => {
      if (r.status === 'Store') store++;
      if (r.status === 'Issue') issue++;
      if (r.status === 'Close') closed++;
    });

    return { total, store, issue, closed };
  }, [requests]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" style={{ backgroundColor: 'var(--bg-body)' }}>
        <TopHeader title="Request Management" subtitle="Track assembly line requests for MHF from Stores to Issue and Closure" />
        <main style={{ padding: 'var(--space-6) var(--space-8)' }}>
          
          <div className="card-elevated" style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-5)' }}>
              <div style={{ paddingRight: 'var(--space-5)', borderRight: '1px solid var(--border-subtle)' }}>
                <span style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>TOTAL REQUESTS</span>
                <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary.total}</span>
              </div>
              <div style={{ paddingRight: 'var(--space-5)', borderRight: '1px solid var(--border-subtle)' }}>
                <span style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>PENDING AT STORE</span>
                <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-warning)' }}>{summary.store}</span>
              </div>
              <div style={{ paddingRight: 'var(--space-5)', borderRight: '1px solid var(--border-subtle)' }}>
                <span style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>PENDING ISSUE</span>
                <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{summary.issue}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>CLOSED</span>
                <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-positive)' }}>{summary.closed}</span>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Line Request</button>
          </div>

          <div className="card-elevated" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', minHeight: '300px' }}>
              <table className="enterprise-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>REQUEST ID</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>DATE</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>ASSEMBLY LINE</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>MODEL</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right' }}>QTY</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>REQUESTER</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'center' }}>STATUS</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--status-negative)' }}>{req.id}</td>
                      <td style={{ padding: '12px 16px' }}>{req.date}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{req.assemblyLine}</td>
                      <td style={{ padding: '12px 16px' }}>{req.model}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{req.quantity}</td>
                      <td style={{ padding: '12px 16px' }}>{req.requestedBy}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span className={`badge badge-${req.status === 'Close' ? 'positive' : req.status === 'Issue' ? 'warning' : req.status === 'Store' ? 'neutral' : 'negative'}`}>
                          {req.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {req.status === 'Assembly' && (
                            <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleUpdateStatus(req.id, 'Store')}>
                              Ack in Store
                            </button>
                          )}
                          {req.status === 'Store' && (
                            <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleUpdateStatus(req.id, 'Issue')}>
                              Issue MHF
                            </button>
                          )}
                          {req.status === 'Issue' && (
                            <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderColor: '#22c55e' }} onClick={() => handleUpdateStatus(req.id, 'Close')}>
                              Close Request
                            </button>
                          )}
                          {req.status === 'Close' && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>CLOSED</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Assembly Line Request</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateRequest}>
              <div className="form-group">
                <label className="label">ASSEMBLY LINE</label>
                <input required className="input" placeholder="e.g. Line 1" value={formData.line} onChange={(e) => setFormData({ ...formData, line: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">VEHICLE MODEL</label>
                <input required className="input" placeholder="e.g. HLX 100" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">QUANTITY NEEDED</label>
                <input required type="number" min="1" className="input" placeholder="0" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
