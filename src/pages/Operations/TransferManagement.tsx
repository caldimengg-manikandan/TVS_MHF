import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import TopHeader from '../../components/Layout/TopHeader';
import { TransferService } from '../../services/transferService';
import { TransferRecord, TransferStatus } from '../../types/transfer';
import { useAuthStore } from '../../state/authStore';
import '../../App.css';

export default function TransferManagement() {
  const { user } = useAuthStore();
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ model: '', qty: '', source: '', dest: '' });

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    const fetched = await TransferService.getAll();
    setTransfers(fetched);
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(formData.qty || '0', 10);
    if (!formData.model || !qty || !formData.source || !formData.dest) return;

    await TransferService.createTransfer({
      date: new Date().toISOString().split('T')[0],
      model: formData.model,
      quantity: qty,
      source: formData.source,
      destination: formData.dest,
      requestedBy: user?.name || 'Unknown',
      remarks: 'Manual Transfer Request'
    });
    
    setShowModal(false);
    setFormData({ model: '', qty: '', source: '', dest: '' });
    loadTransfers();
  };

  const handleUpdateStatus = async (id: string, status: TransferStatus) => {
    await TransferService.updateStatus(id, status, user?.name);
    loadTransfers();
  };

  const summary = useMemo(() => {
    let total = transfers.length;
    let pending = 0;
    let completed = 0;
    let volume = 0;
    
    transfers.forEach(t => {
      if (t.status === 'Draft' || t.status === 'Approved') pending++;
      if (t.status === 'Completed') completed++;
      volume += t.quantity;
    });

    return { total, pending, completed, volume };
  }, [transfers]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" style={{ backgroundColor: 'var(--bg-body)' }}>
        <TopHeader title="Transfer Management" subtitle="Track and approve trolley movements between plants or assembly lines" />
        <main style={{ padding: 'var(--space-6) var(--space-8)' }}>
          <div className="card-elevated" style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-5)' }}>
              <div style={{ paddingRight: 'var(--space-5)', borderRight: '1px solid var(--border-subtle)' }}>
                <span style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>TOTAL TRANSFERS</span>
                <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary.total}</span>
              </div>
              <div style={{ paddingRight: 'var(--space-5)', borderRight: '1px solid var(--border-subtle)' }}>
                <span style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>PENDING</span>
                <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-warning)' }}>{summary.pending}</span>
              </div>
              <div style={{ paddingRight: 'var(--space-5)', borderRight: '1px solid var(--border-subtle)' }}>
                <span style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>COMPLETED</span>
                <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--status-positive)' }}>{summary.completed}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-tertiary)' }}>TOTAL VOLUME</span>
                <span className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{summary.volume}</span>
              </div>
            </div>
            <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Transfer Request</button>
          </div>

          <div className="card-elevated" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', minHeight: '300px' }}>
              <table className="enterprise-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>TRANSFER ID</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>DATE</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>MODEL</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'right' }}>QTY</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>SOURCE</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>DESTINATION</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'center' }}>STATUS</th>
                    <th style={{ padding: '12px 16px', background: 'var(--bg-hover)', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold', borderBottom: '2px solid var(--border-subtle)', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((trn) => (
                    <tr key={trn.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{trn.id}</td>
                      <td style={{ padding: '12px 16px' }}>{trn.date}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{trn.model}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{trn.quantity}</td>
                      <td style={{ padding: '12px 16px' }}>{trn.source}</td>
                      <td style={{ padding: '12px 16px' }}>{trn.destination}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span className={`badge badge-${trn.status === 'Completed' ? 'positive' : trn.status === 'Approved' ? 'warning' : 'neutral'}`}>
                          {trn.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {trn.status === 'Draft' && (
                            <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleUpdateStatus(trn.id, 'Approved')}>
                              Approve
                            </button>
                          )}
                          {trn.status === 'Approved' && (
                            <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleUpdateStatus(trn.id, 'Completed')}>
                              Complete
                            </button>
                          )}
                          {trn.status === 'Completed' && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 'bold' }}>DONE</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {transfers.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No transfers found.
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
              <h2 className="modal-title">Create New Transfer Request</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateTransfer}>
              <div className="form-group">
                <label className="label">VEHICLE MODEL</label>
                <input required className="input" placeholder="e.g. HLX 100" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="label">QUANTITY TO TRANSFER</label>
                <input required type="number" min="1" className="input" placeholder="0" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">SOURCE PLANT / LINE</label>
                  <input required className="input" placeholder="e.g. Hosur Plant 2" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label">DESTINATION PLANT / LINE</label>
                  <input required className="input" placeholder="e.g. Hosur Plant 1" value={formData.dest} onChange={(e) => setFormData({ ...formData, dest: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
