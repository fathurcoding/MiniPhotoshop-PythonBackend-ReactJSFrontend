import React from 'react';
import { AlertCircle, X } from 'lucide-react';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 3000, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog confirm-modal" style={{ maxWidth: '400px', width: '90%' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={18} color="#ff4444" />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{title || 'Confirmation'}</span>
          </div>
          <button className="icon-button" onClick={onCancel} style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '2rem', lineHeight: '1.5' }}>
            {message}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onCancel} style={{ flex: 1, height: '38px' }}>
              Cancel
            </button>
            <button className="primary" onClick={onConfirm} style={{ flex: 1, height: '38px', backgroundColor: '#ff4444', borderColor: '#ff4444' }}>
              {confirmText || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
