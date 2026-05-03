import React, { useState, useRef, useEffect, useCallback } from 'react';
import HistogramPanel from './HistogramPanel';

function RightPanel({ histogramOriginal, histogramCurrent }) {
  const [panelWidth, setPanelWidth] = useState(300);
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
      if (newWidth >= 250 && newWidth <= 600) {
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
    <div className="right-panel" style={{ width: panelWidth, minWidth: panelWidth, flexShrink: 0 }}>
      <div className="right-panel-resizer" onMouseDown={startResizing} />
      <div className="panel-header">
        Analysis
      </div>
      {/* We will update HistogramPanel later to handle both, for now pass current */}
      <HistogramPanel histogramData={histogramCurrent || histogramOriginal} />
    </div>
  );
}

export default RightPanel;
