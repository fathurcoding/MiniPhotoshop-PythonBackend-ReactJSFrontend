import React, { useRef, useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

function GeometricToolsOverlay({ 
  activeTool,
  currentImage, 
  viewState, 
  canvasWidth, 
  canvasHeight, 
  onApply, 
  onCancel 
}) {
  const [imageDims, setImageDims] = useState({ w: 0, h: 0 });
  const [imgUrl, setImgUrl] = useState(null);
  
  // Interaction State
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [cropRect, setCropRect] = useState(null); // { x, y, w, h }

  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
    isCropping: false
  });

  useEffect(() => {
    if (!currentImage) return;
    const url = URL.createObjectURL(currentImage);
    setImgUrl(url);

    const img = new Image();
    img.onload = () => {
      setImageDims({ w: img.width, h: img.height });
      // Reset state when image changes
      setTx(0);
      setTy(0);
      setCropRect(null);
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [currentImage]);

  // Reset internal state when tool changes
  useEffect(() => {
    setTx(0);
    setTy(0);
    setCropRect(null);
  }, [activeTool]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;

    if (activeTool === 'translate') {
      dragRef.current.startTx = tx;
      dragRef.current.startTy = ty;
    } else if (activeTool === 'crop') {
      // Calculate local canvas coordinates
      const boxRect = e.currentTarget.getBoundingClientRect();
      const localX = (e.clientX - boxRect.left) / viewState.scale;
      const localY = (e.clientY - boxRect.top) / viewState.scale;
      
      dragRef.current.isCropping = true;
      dragRef.current.startX = localX;
      dragRef.current.startY = localY;
      setCropRect({ x: localX, y: localY, w: 0, h: 0 });
    }
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return;
    
    if (activeTool === 'translate') {
      const dx = (e.clientX - dragRef.current.startX) / viewState.scale;
      const dy = (e.clientY - dragRef.current.startY) / viewState.scale;
      setTx(dragRef.current.startTx + dx);
      setTy(dragRef.current.startTy + dy);
    } 
    else if (activeTool === 'crop' && dragRef.current.isCropping) {
      const boxRect = e.currentTarget.getBoundingClientRect();
      const localX = (e.clientX - boxRect.left) / viewState.scale;
      const localY = (e.clientY - boxRect.top) / viewState.scale;
      
      const startX = dragRef.current.startX;
      const startY = dragRef.current.startY;
      
      setCropRect({
        x: Math.min(startX, localX),
        y: Math.min(startY, localY),
        w: Math.abs(localX - startX),
        h: Math.abs(localY - startY)
      });
    }
  };

  const handlePointerUp = () => {
    dragRef.current.isDragging = false;
    dragRef.current.isCropping = false;
  };

  const handleApply = () => {
    if (activeTool === 'translate') {
      if (tx === 0 && ty === 0) return onCancel();
      onApply('translate', { tx, ty });
    } else if (activeTool === 'crop') {
      if (!cropRect || cropRect.w < 10 || cropRect.h < 10) return onCancel();
      onApply('crop', { 
        startX: Math.round(cropRect.x), 
        startY: Math.round(cropRect.y), 
        endX: Math.round(cropRect.x + cropRect.w), 
        endY: Math.round(cropRect.y + cropRect.h) 
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') handleApply();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tx, ty, cropRect, activeTool, onCancel]);

  if (!imageDims.w) return null;

  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;
  
  const wrapperStyle = {
    position: 'absolute',
    top: 0, left: 0,
    width: canvasWidth, height: canvasHeight,
    transformOrigin: '0 0',
    transform: `
      translate(${viewState.offsetX}px, ${viewState.offsetY}px)
      translate(${cx}px, ${cy}px)
      scale(${viewState.scale})
      translate(${-cx}px, ${-cy}px)
    `
  };

  const boxStyle = {
    position: 'absolute',
    left: (canvasWidth - imageDims.w) / 2,
    top: (canvasHeight - imageDims.h) / 2,
    width: imageDims.w,
    height: imageDims.h,
    cursor: activeTool === 'translate' ? 'move' : 'crosshair',
    userSelect: 'none'
  };

  return (
    <div className="transform-overlay-container">
      <div style={wrapperStyle}>
        
        {/* Interaction Area */}
        <div 
          style={boxStyle}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Display Translate Preview */}
          {activeTool === 'translate' && (
            <img 
              src={imgUrl} 
              alt="Translate Preview" 
              style={{ 
                width: '100%', 
                height: '100%', 
                pointerEvents: 'none', 
                display: 'block',
                imageRendering: 'pixelated',
                transform: `translate(${tx}px, ${ty}px)`
              }} 
            />
          )}

          {/* Display Crop Overlay */}
          {activeTool === 'crop' && (
             <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <img src={imgUrl} style={{ width: '100%', height: '100%', display: 'block', opacity: 0.5 }} alt="" />
                {cropRect && cropRect.w > 0 && (
                  <div style={{
                    position: 'absolute',
                    left: cropRect.x,
                    top: cropRect.y,
                    width: cropRect.w,
                    height: cropRect.h,
                    border: '2px dashed #00e5ff',
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                  }}>
                    {/* Render actual image un-dimmed inside crop box */}
                    <div style={{
                      position: 'absolute',
                      left: -2, top: -2, right: -2, bottom: -2,
                      overflow: 'hidden'
                    }}>
                      <img src={imgUrl} style={{
                        position: 'absolute',
                        left: -cropRect.x,
                        top: -cropRect.y,
                        width: imageDims.w,
                        height: imageDims.h,
                        display: 'block'
                      }} alt="" />
                    </div>
                  </div>
                )}
             </div>
          )}
        </div>
      </div>

      <div className="transform-commit-bar">
        <span className="commit-text">
          {activeTool === 'translate' ? 'Translate' : 'Crop'}
        </span>
        <div className="commit-actions">
          <button className="commit-btn cancel" onClick={onCancel} title="Cancel (Esc)">
            <X size={16} />
          </button>
          <button className="commit-btn apply" onClick={handleApply} title="Apply (Enter)">
            <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default GeometricToolsOverlay;
