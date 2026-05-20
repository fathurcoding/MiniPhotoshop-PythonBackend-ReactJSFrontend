import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  ChevronDown, ChevronRight, RotateCcw, Upload,
  Sun, Contrast, Palette, Grid, Focus, Scissors, Save,
  Check, X, Eye, EyeOff, ShieldAlert
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

  // --- STATE LOKAL INTEGRASI FITUR BARU ---
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [blurKernel, setBlurKernel] = useState(5);
  const [gaussKernel, setGaussKernel] = useState(5);
  const [gaussSigma, setGaussSigma] = useState(1.0);
  const [medianKernel, setMedianKernel] = useState(5);
  const [hueShift, setHueShift] = useState(0);
  const [saturationScale, setSaturationScale] = useState(1.0);

  // Enhancement State bawaan
  const [threshold, setThreshold] = useState(128);
  const [isOtsu, setIsOtsu] = useState(false);
  const [edgeMethod, setEdgeMethod] = useState('sobel');
  const [edgeThreshold1, setEdgeThreshold1] = useState(100);
  const [edgeThreshold2, setEdgeThreshold2] = useState(200);
  const [edgeKSize, setEdgeKSize] = useState(3);
  const [edgeSigma, setEdgeSigma] = useState(1.0);

  // Morphology State
  const [morphSize, setMorphSize] = useState(3);
  const [morphShape, setMorphShape] = useState('rect');
  const [morphIterations, setMorphIterations] = useState(1);

  // Segmentation State
  const [segmentK, setSegmentK] = useState(3);

  // Sync local sliders dengan preview updates
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

      {/* 2. Image Enhancement (Terintegrasi) */}
      <Accordion title="Enhancement" icon={<Sun size={14}/>} defaultOpen={true}>
        <div className="control-group">
          <div className="control-label">
            <span>Brightness</span> 
            <input 
              type="number" className="value-input" value={brightness} 
              onChange={e => updateBrightness(Number(e.target.value))} disabled={!hasImage}
            />
          </div>
          <input type="range" className="range-slider" min="-100" max="100" value={brightness} 
            onChange={e => updateBrightness(Number(e.target.value))} disabled={!hasImage}
          />
        </div>
        
        <div className="control-group">
          <div className="control-label">
            <span>Contrast</span> 
            <input 
              type="number" className="value-input" value={contrast} 
              onChange={e => updateContrast(Number(e.target.value))} disabled={!hasImage}
            />
          </div>
          <input type="range" className="range-slider" min="-100" max="100" value={contrast} 
            onChange={e => updateContrast(Number(e.target.value))} disabled={!hasImage}
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
              <button className="primary" style={{ flex: 1, height: '32px' }} onClick={handleApplyEnhancements}>
                <Check size={14} /> Apply
              </button>
              <button style={{ flex: 1, height: '32px' }} onClick={handleCancelEnhancements}>
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={() => onAction('hist_eq')} disabled={!hasImage}
          style={{ marginTop: (brightness !== 0 || contrast !== 0) ? '0.5rem' : '0', width: '100%' }}
        >
          Hist. Equalization
        </button>

        {/* FITUR BARU KALIAN: SHARPENING & SMOOTHING */}
        <button 
          onClick={() => onAction('sharpen')} disabled={!hasImage}
          style={{ marginTop: '0.5rem', width: '100%' }}
        >
          Sharpening Image
        </button>

        <div className="control-group" style={{ marginTop: '0.75rem' }}>
          <div className="control-label">
            <span>Smoothing</span>
            <span style={{ fontSize: '11px', color: 'var(--accent)' }}>{blurKernel}x{blurKernel}</span>
          </div>
          <input 
            type="range" className="range-slider" min="3" max="15" step="2" value={blurKernel} 
            onChange={e => setBlurKernel(Number(e.target.value))} disabled={!hasImage}
          />
          <button 
            className="primary-sm" style={{ width: '100%', marginTop: '0.25rem' }}
            onClick={() => onAction('smoothing', { kernelSize: blurKernel })} disabled={!hasImage}
          >
            Apply Smoothing
          </button>
        </div>
      </Accordion>

      {/* 3. Edge & Binary */}
      <Accordion title="Edge & Binary" icon={<Contrast size={14}/>}>
        {/* Thresholding */}
        <div className="control-group" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
          <div className="control-label">
            <span>Thresholding</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <input type="checkbox" checked={isOtsu} onChange={e => setIsOtsu(e.target.checked)} />
                Otsu
              </label>
              {!isOtsu && (
                <input type="number" className="value-input" value={threshold} onChange={e => setThreshold(e.target.value)} disabled={!hasImage} />
              )}
            </div>
          </div>
          {!isOtsu && (
            <input type="range" className="range-slider" min="0" max="255" value={threshold} onChange={e => setThreshold(e.target.value)} disabled={!hasImage} />
          )}
          <button className="primary-sm" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => onAction('threshold', { value: threshold, method: isOtsu ? 'otsu' : 'manual' })} disabled={!hasImage}>
            Apply Threshold
          </button>
        </div>

        {/* Edge Detection */}
        <div className="control-group" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
          <div className="control-label">
            <span>Edge Method</span>
            <select className="select-input" value={edgeMethod} onChange={e => setEdgeMethod(e.target.value)} style={{ width: '120px' }}>
              <option value="sobel">Sobel</option>
              <option value="canny">Canny</option>
              <option value="prewitt">Prewitt</option>
              <option value="robert">Robert</option>
              <option value="laplacian">Laplacian</option>
              <option value="log">LoG</option>
            </select>
          </div>

          {edgeMethod === 'canny' && (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="control-label">
                <span style={{ fontSize: '11px' }}>T1</span>
                <input type="number" className="value-input" value={edgeThreshold1} onChange={e => setEdgeThreshold1(e.target.value)} />
              </div>
              <input type="range" className="range-slider" min="0" max="500" value={edgeThreshold1} onChange={e => setEdgeThreshold1(e.target.value)} />
              <div className="control-label">
                <span style={{ fontSize: '11px' }}>T2</span>
                <input type="number" className="value-input" value={edgeThreshold2} onChange={e => setEdgeThreshold2(e.target.value)} />
              </div>
              <input type="range" className="range-slider" min="0" max="500" value={edgeThreshold2} onChange={e => setEdgeThreshold2(e.target.value)} />
            </div>
          )}

          {(edgeMethod === 'sobel' || edgeMethod === 'laplacian' || edgeMethod === 'log') && (
            <div className="control-label" style={{ marginTop: '0.5rem' }}>
              <span style={{ fontSize: '11px' }}>Kernel Size</span>
              <select className="select-input" value={edgeKSize} onChange={e => setEdgeKSize(e.target.value)} style={{ width: '60px' }}>
                <option value="1">1</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="7">7</option>
              </select>
            </div>
          )}

          {edgeMethod === 'log' && (
            <div style={{ marginTop: '0.5rem' }}>
              <div className="control-label">
                <span style={{ fontSize: '11px' }}>Sigma</span>
                <input type="number" step="0.1" className="value-input" value={edgeSigma} onChange={e => setEdgeSigma(e.target.value)} />
              </div>
              <input type="range" className="range-slider" min="0.1" max="5" step="0.1" value={edgeSigma} onChange={e => setEdgeSigma(e.target.value)} />
            </div>
          )}

          <button 
            className="primary-sm" style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={() => onAction('edge', { method: edgeMethod, threshold1: edgeThreshold1, threshold2: edgeThreshold2, ksize: edgeKSize, sigma: edgeSigma })} disabled={!hasImage}
          >
            Apply Edge Detection
          </button>
        </div>

        {/* Morphology */}
        <div className="control-group">
          <div className="control-label">
            <span>Morphology</span>
            <select className="select-input" value={morphShape} onChange={e => setMorphShape(e.target.value)} style={{ width: '90px' }}>
              <option value="rect">Rect</option>
              <option value="cross">Cross</option>
              <option value="ellipse">Ellipse</option>
            </select>
          </div>
          
          <div className="control-label" style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '11px' }}>Size</span>
            <input type="number" className="value-input" value={morphSize} onChange={e => setMorphSize(e.target.value)} />
          </div>
          <input type="range" className="range-slider" min="1" max="21" step="2" value={morphSize} onChange={e => setMorphSize(e.target.value)} />

          <div className="control-label" style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '11px' }}>Iterations</span>
            <input type="number" className="value-input" value={morphIterations} onChange={e => setMorphIterations(e.target.value)} />
          </div>
          <input type="range" className="range-slider" min="1" max="10" value={morphIterations} onChange={e => setMorphIterations(e.target.value)} />

          <div className="button-group-row" style={{ marginTop: '0.5rem' }}>
            <button style={{ flex: 1 }} onClick={() => onAction('erosion', { kernelSize: morphSize, shape: morphShape, iterations: morphIterations })} disabled={!hasImage}>Erosion</button>
            <button style={{ flex: 1 }} onClick={() => onAction('dilation', { kernelSize: morphSize, shape: morphShape, iterations: morphIterations })} disabled={!hasImage}>Dilation</button>
          </div>
        </div>
      </Accordion>

      {/* 4. FITUR BARU KALIAN: IMAGE RESTORATION (MENU AKORDION BARU) */}
      <Accordion title="Restoration" icon={<Focus size={14}/>}>
        {/* Gaussian Blur */}
        <div className="control-group" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
          <div className="control-label">
            <span>Gaussian Blur</span>
            <span style={{ fontSize: '11px', color: 'var(--accent)' }}>{gaussKernel}x{gaussKernel}</span>
          </div>
          <input 
            type="range" className="range-slider" min="3" max="15" step="2" value={gaussKernel} 
            onChange={e => setGaussKernel(Number(e.target.value))} disabled={!hasImage}
          />
          <div className="control-label" style={{ marginTop: '0.25rem' }}>
            <span>Sigma Blur</span>
            <span style={{ fontSize: '11px', color: 'var(--accent)' }}>{gaussSigma.toFixed(1)}</span>
          </div>
          <input 
            type="range" className="range-slider" min="0.5" max="5.0" step="0.5" value={gaussSigma} 
            onChange={e => setGaussSigma(Number(e.target.value))} disabled={!hasImage}
          />
          <button 
            className="primary-sm" style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={() => onAction('gaussian_blur', { kernelSize: gaussKernel, sigma: gaussSigma })} disabled={!hasImage}
          >
            Apply Gaussian Blur
          </button>
        </div>

        {/* Median Filter */}
        <div className="control-group" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
          <div className="control-label">
            <span>Median Filter</span>
            <span style={{ fontSize: '11px', color: 'var(--accent)' }}>{medianKernel}x{medianKernel}</span>
          </div>
          <input 
            type="range" className="range-slider" min="3" max="15" step="2" value={medianKernel} 
            onChange={e => setMedianKernel(Number(e.target.value))} disabled={!hasImage}
          />
          <button 
            className="primary-sm" style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={() => onAction('median_filter', { kernelSize: medianKernel })} disabled={!hasImage}
          >
            Apply Median Filter
          </button>
        </div>

        {/* Remove Salt & Pepper */}
        <button 
          style={{ width: '100%', backgroundColor: '#a82c2c', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          onClick={() => onAction('noise_removal')} disabled={!hasImage}
        >
          Remove Salt & Pepper
        </button>
      </Accordion>

      {/* 5. Color Processing */}
      <Accordion title="Color" icon={<Palette size={14}/>}>
        <button onClick={() => onAction('grayscale')} disabled={!hasImage} style={{ width: '100%' }}>To Grayscale</button>
        <div className="button-group-row" style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          <button onClick={() => onAction('channel', { c: 'r' })} disabled={!hasImage} style={{ backgroundColor: '#b71c1c', color: '#fff', border: 'none' }}>Red</button>
          <button onClick={() => onAction('channel', { c: 'g' })} disabled={!hasImage} style={{ backgroundColor: '#1b5e20', color: '#fff', border: 'none' }}>Green</button>
          <button onClick={() => onAction('channel', { c: 'b' })} disabled={!hasImage} style={{ backgroundColor: '#0d47a1', color: '#fff', border: 'none' }}>Blue</button>
        </div>

        {/* FITUR BARU KALIAN: HUE & SATURATION */}
        <div className="control-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
          <div className="control-label">
            <span>Hue Shift</span>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{hueShift}°</span>
          </div>
          <input 
            type="range" className="range-slider" min="-90" max="90" value={hueShift} 
            onChange={e => setHueShift(Number(e.target.value))}
            onMouseUp={() => onAction('color_adjust', { hue: hueShift, saturation: saturationScale })} disabled={!hasImage}
          />
        </div>

        <div className="control-group">
          <div className="control-label">
            <span>Saturation</span>
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{saturationScale}x</span>
          </div>
          <input 
            type="range" className="range-slider" min="0" max="3" step="0.2" value={saturationScale} 
            onChange={e => setSaturationScale(Number(e.target.value))}
            onMouseUp={() => onAction('color_adjust', { hue: hueShift, saturation: saturationScale })} disabled={!hasImage}
          />
        </div>
      </Accordion>

      {/* 6. Segmentation */}
      <Accordion title="Segmentation" icon={<Grid size={14}/>}>
        <div className="control-group" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
          <button className="primary-sm" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={() => onAction('segment_threshold')} disabled={!hasImage}>
            Threshold Based (Otsu Masking)
          </button>
          <button className="primary-sm" style={{ width: '100%' }} onClick={() => onAction('segment_edge')} disabled={!hasImage}>
            Edge Based (Canny Contour)
          </button>
        </div>

        <div className="control-group">
          <div className="control-label">
            <span>Region Based (Clustering)</span>
            <input 
              type="number" className="value-input" value={segmentK} 
              onChange={e => setSegmentK(e.target.value)} disabled={!hasImage}
            />
          </div>
          <div className="control-label" style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '11px' }}>K (Clusters)</span>
          </div>
          <input 
            type="range" className="range-slider" min="2" max="16" value={segmentK} 
            onChange={e => setSegmentK(e.target.value)} disabled={!hasImage}
          />
          <button className="primary-sm" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => onAction('segment_region', { k: segmentK })} disabled={!hasImage}>
            Apply Region Segmentation
          </button>
        </div>
      </Accordion>

      {/* 7. Export & Compression */}
      <Accordion title="Export" icon={<Save size={14}/>}>
        <button className="primary" onClick={onExport} disabled={!hasImage} style={{ marginTop: '0.5rem', width: '100%' }}>
          <Upload size={14} /> Download / Export
        </button>
      </Accordion>

    </div>
  );
}

export default Sidebar;