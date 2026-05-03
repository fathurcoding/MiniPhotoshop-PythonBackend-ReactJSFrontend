import React from 'react';
import { MousePointer2, Hand, Crop, Move, Maximize, RotateCw } from 'lucide-react';
import '../styles/ToolbarSVG.css';

function Toolbar({ activeTool, setActiveTool }) {
  return (
    <div className="toolbar">
      <button
        className={`tool-button ${activeTool === 'select' ? 'active' : ''}`}
        onClick={() => setActiveTool('select')}
        title="Select"
      >
        <MousePointer2 size={20} />
      </button>
      <button
        className={`tool-button ${activeTool === 'pan' ? 'active' : ''}`}
        onClick={() => setActiveTool('pan')}
        title="Pan (Hand)"
      >
        <Hand size={20} />
      </button>
      <button
        className={`tool-button ${activeTool === 'crop' ? 'active' : ''}`}
        onClick={() => setActiveTool('crop')}
        title="Crop"
      >
        <Crop size={20} />
      </button>
      <button
        className={`tool-button ${activeTool === 'translate' ? 'active' : ''}`}
        onClick={() => setActiveTool('translate')}
        title="Translate (Move)"
      >
        <Move size={20} />
      </button>
      <button
        className={`tool-button ${activeTool === 'resize' ? 'active' : ''}`}
        onClick={() => setActiveTool('resize')}
        title="Resize"
      >
        <Maximize size={20} />
      </button>
      <button
        className={`tool-button ${activeTool === 'rotate' ? 'active' : ''}`}
        onClick={() => setActiveTool('rotate')}
        title="Rotate"
      >
        <RotateCw size={20} />
      </button>
    </div>
  );
}

export default Toolbar;
