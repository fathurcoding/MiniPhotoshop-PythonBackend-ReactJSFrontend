import React, { useState, useEffect } from 'react';

function ActionModal({ modalConfig, onApply, onCancel, isLoading }) {
  // modalConfig format: { id: 'resize', title: 'Resize Image', currentWidth: 800, currentHeight: 600 }
  
  const [values, setValues] = useState({});

  useEffect(() => {
    // Smart Initialization
    if (modalConfig?.id === 'resize') {
      setValues({ width: modalConfig.currentWidth || 800, height: modalConfig.currentHeight || 500 });
    } else if (modalConfig?.id === 'rotate') {
      setValues({ degree: 0 });
    } else if (['gaussian_blur', 'median_filter', 'smoothing'].includes(modalConfig?.id)) {
      setValues({ kernelSize: 3 });
    }
  }, [modalConfig]);

  useEffect(() => {
    // Keyboard Support
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && !isLoading) {
        handleApply();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [values, isLoading, onCancel]);

  if (!modalConfig) return null;

  const handleApply = () => {
    // Validation
    if (modalConfig.id === 'resize') {
      const w = parseInt(values.width, 10);
      const h = parseInt(values.height, 10);
      if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
        alert("Width and Height must be greater than 0");
        return;
      }
      onApply('resize', { width: w, height: h });
    } else if (modalConfig.id === 'rotate') {
      onApply('rotate', { degree: parseInt(values.degree, 10) });
    } else if (['gaussian_blur', 'median_filter', 'smoothing'].includes(modalConfig.id)) {
      onApply(modalConfig.id, { kernelSize: parseInt(values.kernelSize, 10) });
    } else if (modalConfig.id === 'noise_removal') {
      onApply('noise_removal', {});
    }
  };

  const renderContent = () => {
    switch (modalConfig.id) {
      case 'resize':
        return (
          <>
            <div className="control-group">
              <label className="control-label">Width (px)</label>
              <input type="number" className="text-input" autoFocus
                value={values.width || ''} 
                onChange={(e) => setValues({...values, width: e.target.value})} 
              />
            </div>
            <div className="control-group">
              <label className="control-label">Height (px)</label>
              <input type="number" className="text-input" 
                value={values.height || ''} 
                onChange={(e) => setValues({...values, height: e.target.value})} 
              />
            </div>
          </>
        );
      case 'rotate':
        return (
          <div className="control-group">
            <div className="control-label">
              <span>Degree</span>
              <input 
                type="number" 
                className="value-input" 
                value={values.degree || 0} 
                onChange={(e) => setValues({...values, degree: e.target.value})} 
              />
            </div>
            <input type="range" className="range-slider" min="0" max="360" autoFocus
              value={values.degree || 0} 
              onChange={(e) => setValues({...values, degree: e.target.value})} 
            />
          </div>
        );
      case 'gaussian_blur':
      case 'median_filter':
      case 'smoothing':
        return (
          <div className="control-group">
            <div className="control-label">
              <span>Kernel Size</span>
              <input 
                type="number" 
                className="value-input" 
                value={values.kernelSize || 3} 
                onChange={(e) => setValues({...values, kernelSize: e.target.value})} 
              />
            </div>
            <input type="range" className="range-slider" min="3" max="15" step="2" autoFocus
              value={values.kernelSize || 3} 
              onChange={(e) => setValues({...values, kernelSize: e.target.value})} 
            />
          </div>
        );
      case 'noise_removal':
        return (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            This will apply a noise removal algorithm. Proceed?
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={onCancel}>
      <div className="modal-dialog" onMouseDown={e => e.stopPropagation()}>
        <div className="modal-header">
          {modalConfig.title}
        </div>
        <div className="modal-content">
          {renderContent()}
        </div>
        <div className="modal-footer">
          <button onClick={onCancel} disabled={isLoading}>Cancel</button>
          <button className="primary" onClick={handleApply} disabled={isLoading} style={{ minWidth: 80 }}>
            {isLoading ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActionModal;
