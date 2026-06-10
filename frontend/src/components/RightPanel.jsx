import React, { useState, useRef, useEffect, useCallback } from 'react';
import HistogramPanel from './HistogramPanel';
import { Info } from 'lucide-react';
import InfoModal from './InfoModal';

function RightPanel({ histogramOriginal, histogramCurrent }) {
  const [panelWidth, setPanelWidth] = useState(300);
  const [infoKey, setInfoKey] = useState(null);
  const isResizing = useRef(false);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'ew-resize';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
  }, []);

  const resize = useCallback((mouseMoveEvent) => {
    if (isResizing.current) {
      const newWidth = window.innerWidth - mouseMoveEvent.clientX;
      if (newWidth >= 200 && newWidth <= 500) {
        setPanelWidth(newWidth);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div className="right-panel" style={{ width: panelWidth, minWidth: panelWidth, flexShrink: 0, backgroundColor: '#1e1e1e', borderLeft: '1px solid #333', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div className="right-panel-resizer" onMouseDown={startResizing} style={{ width: '4px', height: '100%', cursor: 'ew-resize' }} />
      
      <div className="panel-header" style={{ padding: '12px 16px', borderBottom: '1px solid #333', backgroundColor: '#1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '12px', color: '#aaa', letterSpacing: '0.5px' }}>
          Analysis
        </div>
        <button 
          className="icon-btn" 
          style={{ padding: '2px', opacity: 0.7, margin: 0, border: 'none', background: 'transparent', cursor: 'pointer', color: '#aaa' }}
          onClick={(e) => { e.stopPropagation(); setInfoKey('histogram_analysis'); }}
          title={`Info tentang Analysis`}
        >
          <Info size={14} />
        </button>
      </div>
      
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        <HistogramPanel original={histogramOriginal} current={histogramCurrent} />
      </div>

      {infoKey && <InfoModal infoKey={infoKey} onClose={() => setInfoKey(null)} />}
    </div>
  );
}

export default RightPanel;