import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  ChevronDown, ChevronRight, RotateCcw, Upload,
  Sun, Contrast, Palette, Grid, Focus, Scissors, Save,
  Check, X, Eye, EyeOff 
} from 'lucide-react';

function Accordion({ title, icon, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {icon} {title}
        </div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </div>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
}

function Sidebar({ 
  onImageUpload, onAction, onReset, onExport, hasImage, 
  onPreviewEnhancement, enhancementPreview, showEnhancementPreview, onTogglePreview 
}) {
  // Sidebar Resize State
  const [panelWidth, setPanelWidth] = useState(260);
  const isResizing = useRef(false);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'ew-resize';
  }, []);

  const stopResizing = useCallback(() => {
    if (isResizing.current) {
      isResizing.current = false;
      document.body.style.cursor = 'default';
    }
  }, []);

  const resize = useCallback((e) => {
    if (isResizing.current) {
      // Toolbar is 48px wide, so the sidebar starts at 48px
      const newWidth = e.clientX - 48;
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

  // Geometric State
  const [resizeW, setResizeW] = useState(800);
  const [resizeH, setResizeH] = useState(500);

  // Enhancement Local State (linked to preview)
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [threshold, setThreshold] = useState(128);
  const [edgeMethod, setEdgeMethod] = useState('sobel');

  // Sync local sliders with preview updates
  const updateBrightness = (val) => {
    setBrightness(val);
    onPreviewEnhancement({ ...enhancementPreview, brightness: val });
  };

  const updateContrast = (val) => {
    setContrast(val);
    onPreviewEnhancement({ ...enhancementPreview, contrast: val });
  };

  const handleApplyEnhancements = () => {
    onAction('apply_enhancements', { brightness, contrast });
    // Reset local
    setBrightness(0);
    setContrast(0);
    onPreviewEnhancement({ brightness: 0, contrast: 0 });
  };

  const handleCancelEnhancements = () => {
    setBrightness(0);
    setContrast(0);
    onPreviewEnhancement({ brightness: 0, contrast: 0 });
  };

  return (
    <div className="sidebar" style={{ width: panelWidth, minWidth: panelWidth, position: 'relative' }}>
      
      {/* Resizer Handle */}
      <div className="sidebar-resizer" onMouseDown={startResizing} />
      
      {/* 1. File Management */}
      <div className="sidebar-section" style={{ paddingBottom: '0.5rem' }}>
        <button onClick={onReset} disabled={!hasImage} style={{ marginTop: '0.5rem', width: '100%' }}>
          <RotateCcw size={14} /> Reset Original
        </button>
      </div>

      {/* 2. Image Enhancement */}
      <Accordion title="Enhancement" icon={<Sun size={14}/>} defaultOpen={true}>
        <div className="control-group">
          <div className="control-label">
            <span>Brightness</span> 
            <input 
              type="number" 
              className="value-input" 
              value={brightness} 
              onChange={e => updateBrightness(e.target.value)}
              disabled={!hasImage}
            />
          </div>
          <input type="range" className="range-slider" min="-100" max="100" value={brightness} 
            onChange={e => updateBrightness(e.target.value)}
            disabled={!hasImage}
          />
        </div>
        <div className="control-group">
          <div className="control-label">
            <span>Contrast</span> 
            <input 
              type="number" 
              className="value-input" 
              value={contrast} 
              onChange={e => updateContrast(e.target.value)}
              disabled={!hasImage}
            />
          </div>
          <input type="range" className="range-slider" min="-100" max="100" value={contrast} 
            onChange={e => updateContrast(e.target.value)}
            disabled={!hasImage}
          />
        </div>

        {(brightness !== 0 || contrast !== 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', animation: 'fadeIn 0.2s' }}>
            <button 
              className={showEnhancementPreview ? 'primary' : ''}
              style={{ width: '100%', height: '32px', border: showEnhancementPreview ? '1px solid var(--accent)' : '1px solid var(--border-color)' }}
              onClick={onTogglePreview}
            >
              {showEnhancementPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showEnhancementPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            
            <div className="button-group-row">
              <button 
                className="primary" 
                style={{ flex: 1, height: '32px' }}
                onClick={handleApplyEnhancements}
              >
                <Check size={14} /> Apply
              </button>
              <button 
                style={{ flex: 1, height: '32px' }}
                onClick={handleCancelEnhancements}
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={() => onAction('hist_eq')} 
          disabled={!hasImage}
          style={{ marginTop: (brightness !== 0 || contrast !== 0) ? '0.5rem' : '0' }}
        >
          Hist. Equalization
        </button>
      </Accordion>

      {/* 5. Binary & Edge */}
      <Accordion title="Edge & Binary" icon={<Contrast size={14}/>}>
        <div className="control-group">
          <div className="control-label">
            <span>Threshold</span> 
            <input 
              type="number" 
              className="value-input" 
              value={threshold} 
              onChange={e => setThreshold(e.target.value)}
              onBlur={() => onAction('threshold', { value: threshold })}
              onKeyDown={e => e.key === 'Enter' && onAction('threshold', { value: threshold })}
              disabled={!hasImage}
            />
          </div>
          <input type="range" className="range-slider" min="0" max="255" value={threshold} 
            onChange={e => setThreshold(e.target.value)}
            onMouseUp={() => onAction('threshold', { value: threshold })}
            disabled={!hasImage}
          />
        </div>
        <div className="control-group" style={{ marginTop: '0.5rem' }}>
          <select className="select-input" value={edgeMethod} onChange={e => setEdgeMethod(e.target.value)}>
            <option value="sobel">Sobel Edge</option>
            <option value="canny">Canny Edge</option>
            <option value="prewitt">Prewitt Edge</option>
            <option value="robert">Robert Edge</option>
            <option value="laplacian">Laplacian</option>
            <option value="log">Laplacian of Gaussian</option>
          </select>
          <button onClick={() => onAction('edge', { method: edgeMethod })} disabled={!hasImage}>Apply Edge Detection</button>
        </div>
        <div className="button-group-row" style={{ marginTop: '0.5rem' }}>
          <button onClick={() => onAction('erosion')} disabled={!hasImage}>Erosion</button>
          <button onClick={() => onAction('dilation')} disabled={!hasImage}>Dilation</button>
        </div>
      </Accordion>

      {/* 6. Color Processing */}
      <Accordion title="Color" icon={<Palette size={14}/>}>
        <button onClick={() => onAction('grayscale')} disabled={!hasImage}>To Grayscale</button>
        <div className="button-group-row">
          <button onClick={() => onAction('channel', { c: 'r' })} disabled={!hasImage}>Red</button>
          <button onClick={() => onAction('channel', { c: 'g' })} disabled={!hasImage}>Green</button>
          <button onClick={() => onAction('channel', { c: 'b' })} disabled={!hasImage}>Blue</button>
        </div>
      </Accordion>

      {/* 7. Segmentation */}
      <Accordion title="Segmentation" icon={<Grid size={14}/>}>
        <button onClick={() => onAction('segment_threshold')} disabled={!hasImage}>Threshold Based</button>
        <button onClick={() => onAction('segment_edge')} disabled={!hasImage}>Edge Based</button>
        <button onClick={() => onAction('segment_region')} disabled={!hasImage}>Region Based</button>
      </Accordion>

      {/* 8. Export & Compression */}
      <Accordion title="Export" icon={<Save size={14}/>}>
        <button className="primary" onClick={onExport} disabled={!hasImage} style={{ marginTop: '0.5rem' }}>
          <Upload size={14} /> Download / Export
        </button>
      </Accordion>

    </div>
  );
}

export default Sidebar;
