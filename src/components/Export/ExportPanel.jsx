import { useStore, useCalculatedRows, useTotals } from '../../state/useStore';
import { exportExcel } from '../../utils/exportExcel';
import { exportCSV } from '../../utils/exportCSV';
import { exportPDF } from '../../utils/exportPDF';
import './ExportPanel.css';

export default function ExportPanel({ isOpen, onClose, rows: customRows, totals: customTotals }) {
  const { params } = useStore();
  const defaultRows = useCalculatedRows();
  const defaultTotals = useTotals();

  const calculatedRows = customRows || defaultRows;
  const totals = customTotals || defaultTotals;

  if (!isOpen) return null;

  const handleExport = (format) => {
    switch (format) {
      case 'excel':
        exportExcel(calculatedRows, totals, params);
        break;
      case 'csv':
        exportCSV(calculatedRows, totals, params);
        break;
      case 'pdf':
        exportPDF(calculatedRows, totals, params);
        break;
      case 'print':
        window.print();
        break;
    }
  };

  const exportOptions = [
    {
      format: 'excel',
      icon: '📊',
      label: 'Excel (.xlsx)',
      desc: 'Full dashboard with columns and formatting',
    },
    {
      format: 'csv',
      icon: '📄',
      label: 'CSV (.csv)',
      desc: 'Comma-separated values for data import',
    },
    {
      format: 'pdf',
      icon: '📑',
      label: 'PDF (.pdf)',
      desc: 'Print-ready landscape document with TVS header',
    },
    {
      format: 'print',
      icon: '🖨',
      label: 'Print',
      desc: 'Open browser print dialog',
    },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content export-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">📥 Export Dashboard</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="text-secondary" style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
          Export the current dashboard data ({calculatedRows.length} rows, {totals.totalRequired} trolleys required).
        </p>

        <div className="export-options">
          {exportOptions.map((opt) => (
            <button
              key={opt.format}
              className="export-option"
              id={`export-${opt.format}`}
              onClick={() => handleExport(opt.format)}
            >
              <span className="export-icon">{opt.icon}</span>
              <div className="export-info">
                <span className="export-label">{opt.label}</span>
                <span className="export-desc">{opt.desc}</span>
              </div>
              <span className="export-arrow">→</span>
            </button>
          ))}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
