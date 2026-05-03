import React from 'react';

function HistogramPanel({ histogramData }) {
  return (
    <div className="panel-content">
      {!histogramData ? (
        <div className="placeholder-text">
          No histogram data generated. <br/>
          Click "Show Histogram" to analyze.
        </div>
      ) : (
        <div className="histogram-data">
          <pre>{JSON.stringify(histogramData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default HistogramPanel;
