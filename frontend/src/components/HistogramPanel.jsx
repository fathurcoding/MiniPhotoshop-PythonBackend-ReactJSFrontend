import React from 'react';

function HistogramPanel({ original, current }) {
  if (!original) {
    return (
      <div className="panel-content">
        <div className="placeholder-text" style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
          No image loaded. <br/>
          Open an image to view its histogram.
        </div>
      </div>
    );
  }

  return (
    <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="histogram-container">
        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px', fontWeight: 'bold' }}>Original Image</div>
        <img src={original} alt="Original Histogram" style={{ width: '100%', borderRadius: '4px', backgroundColor: '#1e1e1e', border: '1px solid #333' }} />
      </div>
      
      {current && current !== original && (
        <div className="histogram-container">
          <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px', fontWeight: 'bold' }}>Current Image</div>
          <img src={current} alt="Current Histogram" style={{ width: '100%', borderRadius: '4px', backgroundColor: '#1e1e1e', border: '1px solid #333' }} />
        </div>
      )}
    </div>
  );
}

export default HistogramPanel;
