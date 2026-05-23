import React, { useState, useRef, useEffect } from 'react';
import TopMenu from './components/TopMenu';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import CanvasPreview from './components/CanvasPreview';
import RightPanel from './components/RightPanel';
import ActionModal from './components/ActionModal';
import ConfirmModal from './components/ConfirmModal';
import ExportModal from './components/ExportModal';
import * as api from './services/api';
import './styles/layout.css';

function App() {
  // Advanced State Management
  const [originalImage, setOriginalImage] = useState(null); // The untouched source
  const [currentImage, setCurrentImage] = useState(null); // The currently active processed blob
  const [history, setHistory] = useState([]); // Array of Blobs
  const [redoHistory, setRedoHistory] = useState([]); // Array of Blobs for Redo functionality
  
  const [histogramOriginal, setHistogramOriginal] = useState(null);
  const [histogramCurrent, setHistogramCurrent] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Tool & View State
  const [activeTool, setActiveTool] = useState('select');
  const [globalShift, setGlobalShift] = useState({ x: 0, y: 0 });
  const [activeModal, setActiveModal] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false, type: null });

  const abortControllerRef = useRef(null);

  const handleImageUpload = async (file) => {
    setOriginalImage(file);
    setCurrentImage(file);
    setHistory([]);
    setRedoHistory([]);
    setHistogramOriginal(null);
    setHistogramCurrent(null);
    setGlobalShift({ x: 0, y: 0 }); // reset shift on new image
    
    // Auto-fetch original histogram
    try {
      const blob = await api.getHistogram(file);
      const url = URL.createObjectURL(blob);
      setHistogramOriginal(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setHistogramCurrent(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      console.error("Failed to load histogram", err);
    }
  };

  const fetchHistogram = async (blob) => {
    try {
      const histBlob = await api.getHistogram(blob);
      const url = URL.createObjectURL(histBlob);
      setHistogramCurrent(prev => {
        if (prev && prev !== histogramOriginal) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousState = newHistory.pop();
      
      // Push current state to redo history
      setRedoHistory(prev => [{ blob: currentImage, shift: globalShift }, ...prev].slice(0, 20));
      
      setHistory(newHistory);
      setCurrentImage(previousState.blob || previousState);
      setGlobalShift(previousState.shift || { x: 0, y: 0 });
      fetchHistogram(previousState.blob || previousState);
    }
  };

  const handleRedo = () => {
    if (redoHistory.length > 0) {
      const newRedoHistory = [...redoHistory];
      const nextState = newRedoHistory.shift();
      
      // Push current state to history
      pushToHistory(currentImage, globalShift);
      
      setRedoHistory(newRedoHistory);
      setCurrentImage(nextState.blob || nextState);
      setGlobalShift(nextState.shift || { x: 0, y: 0 });
      fetchHistogram(nextState.blob || nextState);
    }
  };
  
  const [enhancementPreview, setEnhancementPreview] = useState({ brightness: 0, contrast: 0 });
  const [showEnhancementPreview, setShowEnhancementPreview] = useState(false);

  const handleReset = () => {
    if (originalImage && currentImage !== originalImage) {
      setConfirmState({ isOpen: true, type: 'reset_original' });
    }
  };

  const confirmResetOriginal = () => {
    if (originalImage && currentImage !== originalImage) {
      pushToHistory(currentImage, globalShift);
      setCurrentImage(originalImage);
      setGlobalShift({ x: 0, y: 0 });
      setEnhancementPreview({ brightness: 0, contrast: 0 });
      setShowEnhancementPreview(false);
      setHistogramCurrent(histogramOriginal);
      setConfirmState({ isOpen: false, type: null });
    }
  };

  const pushToHistory = (blob, shift = { x: 0, y: 0 }) => {
    setHistory(prev => {
      const newHist = [...prev, { blob, shift }];
      if (newHist.length > 20) newHist.shift(); // Max 20 states
      return newHist;
    });
  };

  const handleOpenModal = (id, title) => {
    if (!currentImage) return;
    
    if (id === 'resize') {
      const url = URL.createObjectURL(currentImage);
      const img = new Image();
      img.onload = () => {
        setActiveModal({ id, title, currentWidth: img.width, currentHeight: img.height });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else {
      setActiveModal({ id, title });
    }
  };

  const performReset = () => {
    setOriginalImage(null);
    setCurrentImage(null);
    setHistory([]);
    setRedoHistory([]);
    setHistogramOriginal(null);
    setHistogramCurrent(null);
    setGlobalShift({ x: 0, y: 0 });
    setActiveTool('select');
    setConfirmState({ isOpen: false, type: null });
  };

  const handleAction = async (actionType, params = {}) => {
    if (actionType === 'tool') {
      setActiveTool(params.id);
      return;
    }

    if (actionType === 'new_workspace' || actionType === 'close') {
      if (currentImage) {
        setConfirmState({ isOpen: true, type: actionType });
        return;
      }
      performReset();
      return;
    }

    if (!currentImage) return;
    
    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let resultBlob;
      let shiftX = 0, shiftY = 0;
      
      switch (actionType) {
        // --- 2. Image Enhancement ---
        case 'brightness': 
          resultBlob = await api.applyBrightness(currentImage, params.value !== undefined ? params.value : params); 
          break;
        case 'contrast': 
          resultBlob = await api.applyContrast(currentImage, params.value !== undefined ? params.value : params); 
          break;
        case 'hist_eq': 
          resultBlob = await api.applyHistogramEq(currentImage); 
          break;
        case 'sharpen': 
          resultBlob = await api.applySharpen(currentImage); 
          break;
        case 'smoothing': 
          // Disesuaikan agar membaca params.kernelSize dari Sidebar baru
          const smoothK = params.kernelSize !== undefined ? params.kernelSize : (params.kernel_size !== undefined ? params.kernel_size : params);
          resultBlob = await api.applySmoothing(currentImage, smoothK); 
          break;
        case 'apply_enhancements':
          let tempBlob = currentImage;
          if (params.brightness !== 0) {
            tempBlob = await api.applyBrightness(tempBlob, params.brightness);
          }
          if (params.contrast !== 0) {
            tempBlob = await api.applyContrast(tempBlob, params.contrast);
          }
          resultBlob = tempBlob;
          break;
        case 'threshold': 
          resultBlob = await api.applyThreshold(currentImage, params); 
          break;

        // --- 4. Image Restoration (Filtering) ---
        case 'gaussian_blur': 
          // Disesuaikan dengan penamaan objek kernelSize di Sidebar baru
          const gKSize = params.kernelSize || params.kernel_size || 5;
          resultBlob = await api.applyGaussianBlur(currentImage, gKSize, params.sigma || 1.0); 
          break;
        case 'median_filter': 
          // Disesuaikan dengan penamaan objek kernelSize di Sidebar baru
          const mKSize = params.kernelSize || params.kernel_size || 5;
          resultBlob = await api.applyMedianFilter(currentImage, mKSize); 
          break;
        case 'noise_removal': 
          resultBlob = await api.applyNoiseRemoval(currentImage); 
          break;

        // --- 5. Edge & Morphology ---
        case 'edge': resultBlob = await api.applyEdge(currentImage, params); break;
        case 'erosion': resultBlob = await api.applyErosion(currentImage, params); break;
        case 'dilation': resultBlob = await api.applyDilation(currentImage, params); break;

        // --- 6. Color Processing & Analysis ---
        case 'grayscale': 
          resultBlob = await api.applyGrayscale(currentImage); 
          break;
        case 'channel': 
        case 'channel_split': 
          const targetChannel = params.c || params.channel || 'R';
          resultBlob = await api.applyChannelSplit(currentImage, targetChannel.toUpperCase()); 
          break;
        case 'color_adjust':
        case 'color_adjustment': 
          const hShift = params.hue !== undefined ? params.hue : (params.hue_shift || 0);
          const sScale = params.saturation !== undefined ? params.saturation : (params.saturation_scale || 1.0);
          resultBlob = await api.applyColorAdjustment(currentImage, hShift, sScale); 
          break;

        // --- 7. Segmentation ---
        case 'segment_threshold': resultBlob = await api.applySegmentThreshold(currentImage); break;
        case 'segment_edge': resultBlob = await api.applySegmentEdge(currentImage); break;
        case 'segment_region': resultBlob = await api.applySegmentRegion(currentImage, params); break;
        
        // --- 3. Geometric Transform ---
        case 'resize': 
          const resizeRes = await api.applyResize(currentImage, params); 
          resultBlob = resizeRes.blob; 
          shiftX = -globalShift.x; shiftY = -globalShift.y;
          break;
        case 'rotate': 
          const rotRes = await api.applyRotate(currentImage, params); 
          resultBlob = rotRes.blob; 
          shiftX = -globalShift.x; shiftY = -globalShift.y;
          break;
        case 'flip': resultBlob = await api.applyFlip(currentImage, params); break;
        case 'crop': 
          const cropRes = await api.applyCrop(currentImage, params);
          resultBlob = cropRes.blob; 
          shiftX = -globalShift.x; shiftY = -globalShift.y;
          break;
        case 'translate': 
          const transRes = await api.applyTranslate(currentImage, params);
          resultBlob = transRes.blob; shiftX = transRes.shiftX; shiftY = transRes.shiftY;
          break;
        default: break;
      }
      
      if (abortController.signal.aborted) return; // Ignore if aborted
      
      if (resultBlob) {
        pushToHistory(currentImage, globalShift);
        setRedoHistory([]); // Clear redo history on new action
        setCurrentImage(resultBlob);
        setGlobalShift(prev => ({ x: prev.x + shiftX, y: prev.y + shiftY }));
        fetchHistogram(resultBlob);
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error(`Error applying ${actionType}:`, err);
      setError(`API Error: ${err.message}`);
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
        setActiveModal(null); // Close modal on success
      }
    }
  };

  const handleExport = () => {
    if (!currentImage) return;
    setIsExportModalOpen(true);
  };

  return (
    <div className={`app-container ${isLoading || activeModal ? 'loading-lock' : ''}`}>
      <TopMenu 
        onUndo={handleUndo} 
        canUndo={history.length > 0} 
        onRedo={handleRedo}
        canRedo={redoHistory.length > 0}
        onOpenModal={handleOpenModal}
        onAction={handleAction}
        onExport={handleExport}
        hasImage={!!currentImage}
        onImageUpload={handleImageUpload}
      />
      <div className="workspace">
        <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
        <Sidebar 
          onAction={handleAction} 
          onReset={handleReset}
          onExport={handleExport}
          hasImage={!!currentImage}
          onPreviewEnhancement={(p) => setEnhancementPreview(p)}
          enhancementPreview={enhancementPreview}
          showEnhancementPreview={showEnhancementPreview}
          onTogglePreview={() => setShowEnhancementPreview(!showEnhancementPreview)}
        />
        <CanvasPreview 
          originalImage={originalImage}
          currentImage={currentImage} 
          globalShift={globalShift}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onAction={handleAction}
          enhancementPreview={enhancementPreview}
          showEnhancementPreview={showEnhancementPreview}
          isLoading={isLoading}
        />
        {/* Sesuai dengan instruksi, RightPanel sekarang fokus murni pada Analisis Histogram */}
        <RightPanel 
          histogramOriginal={histogramOriginal}
          histogramCurrent={histogramCurrent} 
        />
      </div>
      
      {/* Modal / Overlays */}
      {activeModal && (
        <ActionModal 
          modalConfig={activeModal} 
          onApply={handleAction} 
          onCancel={() => setActiveModal(null)} 
          isLoading={isLoading} 
        />
      )}

      {isExportModalOpen && (
        <ExportModal 
          image={currentImage} 
          onClose={() => setIsExportModalOpen(false)} 
        />
      )}
      
      <ConfirmModal 
        isOpen={confirmState.isOpen}
        title={
          confirmState.type === 'reset_original' ? 'Reset to Original' : 
          (confirmState.type === 'new_workspace' ? 'New Workspace' : 'Close Workspace')
        }
        message={
          confirmState.type === 'reset_original' 
            ? 'Are you sure you want to revert all changes? This will restore the image to its original state.'
            : 'Are you sure? This will clear your current progress and history.'
        }
        confirmText={confirmState.type === 'reset_original' ? 'Reset Image' : 'Clear All'}
        onConfirm={confirmState.type === 'reset_original' ? confirmResetOriginal : performReset}
        onCancel={() => setConfirmState({ isOpen: false, type: null })}
      />
      
      {error && (
        <div className="error-toast" onClick={() => setError(null)}>
          {error} (Click to dismiss)
        </div>
      )}
      
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <span>Processing...</span>
        </div>
      )}
    </div>
  );
}

export default App;