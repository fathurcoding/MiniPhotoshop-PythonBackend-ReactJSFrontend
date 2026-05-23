import React, { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

function CanvasPreview({ 
  originalImage, 
  currentImage, 
  globalShift, 
  activeTool, 
  setActiveTool, 
  onAction,
  isLoading,
  enhancementPreview = { brightness: 0, contrast: 0 },
  showEnhancementPreview = false
}) {
  const [imgUrl, setImgUrl] = useState(null);
  const [originalImgUrl, setOriginalImgUrl] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [cropRect, setCropRect] = useState(null);
  const [resizeRect, setResizeRect] = useState(null);
  const [rotateDeg, setRotateDeg] = useState(0);
  const [viewState, setViewState] = useState({ scale: 1 });
  const [baseScale, setBaseScale] = useState(1);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, startTx: 0, startTy: 0, startScrollLeft: 0, startScrollTop: 0, handle: null, startW: 0, startH: 0, startX: 0, startY: 0, startAngle: 0, centerX: 0, centerY: 0, startDist: 0, startDeg: 0 });

  // 10. Seamless Transition Logic: Freeze preview during loading
  const [lastTransform, setLastTransform] = useState(null);
  const lockedTransform = useRef(null);

  useEffect(() => {
    if (activeTool === 'resize' && resizeRect) {
      setLastTransform({
        w: resizeRect.w,
        h: resizeRect.h,
        origW: resizeRect.origW,
        origH: resizeRect.origH,
        txPreview: resizeRect.txPreview,
        tyPreview: resizeRect.tyPreview
      });
    } else if (!isLoading) {
      setLastTransform(null);
    }
  }, [activeTool, resizeRect, isLoading]);

  // Handle Current Image URL
  useEffect(() => {
    if (!currentImage) {
      setImgUrl(null);
      return;
    }
    const url = URL.createObjectURL(currentImage);
    setImgUrl(url);
    
    // Reset interaction state when new image arrives
    setTx(0);
    setTy(0);
    setCropRect(null);
    setResizeRect(null);
    setRotateDeg(0);

    const img = new Image();
    img.onload = () => {
      setImageSize({ w: img.naturalWidth, h: img.naturalHeight });
      // 10. Seamless Transition: Clear loading only after size is known
      setIsProcessing(false);
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [currentImage]);

  // Handle local processing state to match image loading
  const [isProcessing, setIsProcessing] = useState(false);
  useEffect(() => {
    if (isLoading) setIsProcessing(true);
  }, [isLoading]);

  // Handle Original Image URL
  useEffect(() => {
    if (!originalImage) {
      setOriginalImgUrl(null);
      return;
    }
    const url = URL.createObjectURL(originalImage);
    setOriginalImgUrl(url);
    
    // Reset camera (zoom) ONLY when a completely new original image is loaded
    setViewState({ scale: 1 });
    
    const img = new Image();
    img.onload = () => {
      // Calculate base scale so the original image fits nicely in the window
      const container = containerRef.current;
      if (container) {
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const scale = Math.min((cw * 0.9) / img.naturalWidth, (ch * 0.8) / img.naturalHeight, 1);
        setBaseScale(scale);
      }
    };
    img.src = url;
    
    return () => URL.revokeObjectURL(url);
  }, [originalImage]);

  useEffect(() => {
    // Reset tool state but keep viewState (zoom/pan)
    setTx(0);
    setTy(0);
    setCropRect(null);
    setRotateDeg(0);
    
    // 11. Strict Reset: Wait for image loading to finish before initializing tool state
    // 11. Strict Reset: Wait for image loading to finish before initializing tool state
    if ((activeTool === 'resize' || activeTool === 'rotate') && imgUrl && !isProcessing && imageSize.w > 0) {
      setResizeRect({
        w: imageSize.w,
        h: imageSize.h,
        x: globalShift.x,
        y: globalShift.y,
        origW: imageSize.w,
        origH: imageSize.h,
        origX: globalShift.x,
        origY: globalShift.y,
        txPreview: 0,
        tyPreview: 0
      });
    } else {
      setResizeRect(null);
    }
  }, [activeTool, imgUrl, isProcessing, imageSize.w, imageSize.h]);

  // Stable padding for coordinate consistency
  const PAN_PADDING = 1000;
  
  // Refs to track focal point during zoom to avoid rounding errors and sync issues
  const zoomFocalPoint = useRef(null);

  // Wheel Zoom Listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const zoomFactor = 1.1;
        const direction = e.deltaY > 0 ? -1 : 1;
        
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Position relative to the top-left of the SCALED image
        const contentX = container.scrollLeft + mouseX - PAN_PADDING;
        const contentY = container.scrollTop + mouseY - PAN_PADDING;

        setViewState(prev => {
          let newScale = prev.scale * Math.pow(zoomFactor, direction);
          newScale = Math.max(0.1, Math.min(newScale, 15));
          if (newScale === prev.scale) return prev;

          // Store focal point info for useLayoutEffect
          // We store the unscaled position to maintain absolute precision
          zoomFocalPoint.current = {
            unscaledX: contentX / prev.scale,
            unscaledY: contentY / prev.scale,
            mouseX,
            mouseY
          };

          return { scale: newScale };
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Use useLayoutEffect to sync scroll position with scale change BEFORE browser paints
  React.useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !zoomFocalPoint.current) return;

    const { unscaledX, unscaledY, mouseX, mouseY } = zoomFocalPoint.current;
    
    // Calculate new scroll position based on the new scale
    const newScaledX = unscaledX * viewState.scale;
    const newScaledY = unscaledY * viewState.scale;

    container.scrollLeft = newScaledX + PAN_PADDING - mouseX;
    container.scrollTop = newScaledY + PAN_PADDING - mouseY;

    // Reset focal point to prevent unwanted scrolling on other scale changes
    zoomFocalPoint.current = null;
  }, [viewState.scale]);

  // Determine if we need scrollbars
  const getOverflowState = () => {
    if (!containerRef.current || imageSize.w === 0) return { x: 'hidden', y: 'hidden' };
    const scaledW = imageSize.w * baseScale * viewState.scale;
    const scaledH = imageSize.h * baseScale * viewState.scale;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    return {
      x: scaledW > cw ? 'auto' : 'hidden',
      y: scaledH > ch ? 'auto' : 'hidden'
    };
  };

  const overflow = getOverflowState();

  // Handle Centering on Image Load
  useEffect(() => {
    if (imageSize.w > 0 && containerRef.current) {
      const container = containerRef.current;
      const scaledW = imageSize.w * baseScale * viewState.scale;
      const scaledH = imageSize.h * baseScale * viewState.scale;
      
      const shouldCenterHorizontally = scaledW <= container.clientWidth;
      const shouldCenterVertically = scaledH <= container.clientHeight;

      if (shouldCenterHorizontally) {
        container.scrollLeft = PAN_PADDING - (container.clientWidth - scaledW) / 2;
      }
      if (shouldCenterVertically) {
        container.scrollTop = PAN_PADDING - (container.clientHeight - scaledH) / 2;
      }
    }
  }, [imageSize.w, originalImage]);

  const handlePointerDown = (e) => {
    if (activeTool !== 'translate' && activeTool !== 'crop' && activeTool !== 'pan') return;
    e.preventDefault();
    setIsDragging(true);

    if (activeTool === 'translate') {
      dragStart.current = { x: e.clientX, y: e.clientY, startTx: tx, startTy: ty };
    } else if (activeTool === 'pan') {
      dragStart.current = { 
        ...dragStart.current, 
        x: e.clientX, 
        y: e.clientY, 
        startScrollLeft: containerRef.current.scrollLeft, 
        startScrollTop: containerRef.current.scrollTop 
      };
    } else if (activeTool === 'crop') {
      const rect = imgRef.current.getBoundingClientRect();
      const localX = (e.clientX - rect.left) / viewState.scale;
      const localY = (e.clientY - rect.top) / viewState.scale;
      dragStart.current = { ...dragStart.current, x: localX, y: localY };
      setCropRect({ x: localX, y: localY, w: 0, h: 0 });
    }
  };

  const handleResizeDown = (e, handlePos) => {
    if (activeTool !== 'resize') return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = {
      ...dragStart.current,
      x: e.clientX,
      y: e.clientY,
      handle: handlePos,
      startW: resizeRect.w,
      startH: resizeRect.h,
      startX: resizeRect.x,
      startY: resizeRect.y,
      // FIX: Use the actual rendered preview position, not the raw tx/ty state.
      // tx/ty is 0 after resize is applied, but txPreview/tyPreview holds the
      // current visual offset. Using tx/ty causes a jump to 0 at drag start.
      startTx: resizeRect.txPreview !== undefined ? resizeRect.txPreview : tx,
      startTy: resizeRect.tyPreview !== undefined ? resizeRect.tyPreview : ty,
    };
  };

  const handleRotateDown = (e) => {
    if (activeTool !== 'rotate') return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    const rect = imgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    dragStart.current = { ...dragStart.current, handle: 'rotate', centerX, centerY, startAngle: angle, startDeg: rotateDeg };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    
    if (activeTool === 'translate') {
      // Divide by scale so movement feels 1:1 with mouse
      const dx = (e.clientX - dragStart.current.x) / (viewState.scale * baseScale);
      const dy = (e.clientY - dragStart.current.y) / (viewState.scale * baseScale);
      setTx(dragStart.current.startTx + dx);
      setTy(dragStart.current.startTy + dy);
    } else if (activeTool === 'pan') {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      containerRef.current.scrollLeft = dragStart.current.startScrollLeft - dx;
      containerRef.current.scrollTop = dragStart.current.startScrollTop - dy;
    } else if (activeTool === 'crop') {
      const rect = imgRef.current.getBoundingClientRect();
      const localX = Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / (viewState.scale * baseScale);
      const localY = Math.max(0, Math.min(e.clientY - rect.top, rect.height)) / (viewState.scale * baseScale);
      
      const startX = dragStart.current.x;
      const startY = dragStart.current.y;
      
      setCropRect({
        x: Math.min(startX, localX),
        y: Math.min(startY, localY),
        w: Math.abs(localX - startX),
        h: Math.abs(localY - startY)
      });
    } else if (activeTool === 'resize' && dragStart.current.handle) {
      // 1. Get global deltas from start point
      const gDx = (e.clientX - dragStart.current.x) / (viewState.scale * baseScale);
      const gDy = (e.clientY - dragStart.current.y) / (viewState.scale * baseScale);
      
      // 2. Project global deltas into local image space (unrotated)
      const rad = rotateDeg * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const dx = gDx * cos + gDy * sin;
      const dy = -gDx * sin + gDy * cos;
      
      const { startW, startH, startTx, startTy, handle } = dragStart.current;
      
      // 1. Determine handle influence coefficients
      // -1 means the handle moves the MIN edge (Left/Top)
      // +1 means the handle moves the MAX edge (Right/Bottom)
      // 0 means no movement on that edge
      const kX = handle.includes('l') ? -1 : (handle.includes('r') ? 1 : 0);
      const kY = handle.includes('t') ? -1 : (handle.includes('b') ? 1 : 0);

      // 2. Calculate New Dimensions (Fluid and Precise)
      const newW = Math.max(10, startW + kX * dx);
      const newH = Math.max(10, startH + kY * dy);

      // 3. Calculate Center Shift in Local Space
      // The center moves by exactly HALF the amount the width/height changed, 
      // but only in the direction the handle moved.
      const localCenterX = kX * (newW - startW) / 2;
      const localCenterY = kY * (newH - startH) / 2;

      // 4. Absolute Anchor Tracking Logic
      // To keep the opposite side stationary in global workspace coordinates:
      // The shift must exactly compensate for the rotation-expanded growth.
      const dW = (newW - startW) / 2;
      const dH = (newH - startH) / 2;

      // Preview Shift (Center-based for CSS transform)
      const gxShift = (kX * dW) * cos - (kY * dH) * sin;
      const gyShift = (kX * dW) * sin + (kY * dH) * cos;
      
      // Apply Shift (Top-Left based for GlobalShift)
      // shift = CenterShift + (startSize - newSize)/2 projected through rotation
      const localTLShiftX = (kX * dW) + (startW - newW) / 2;
      const localTLShiftY = (kY * dH) + (startH - newH) / 2;

      const txApply = startTx + (localTLShiftX * cos - localTLShiftY * sin);
      const tyApply = startTy + (localTLShiftX * sin + localTLShiftY * cos);

      setResizeRect(prev => ({ 
        ...prev, 
        w: newW, 
        h: newH, 
        txPreview: startTx + gxShift, 
        tyPreview: startTy + gyShift,
        txApply: txApply,
        tyApply: tyApply
      }));
    } else if (activeTool === 'rotate' && dragStart.current.handle === 'rotate') {
      const currentAngle = Math.atan2(e.clientY - dragStart.current.centerY, e.clientX - dragStart.current.centerX) * (180 / Math.PI);
      let delta = currentAngle - dragStart.current.startAngle;
      let newDeg = dragStart.current.startDeg + delta;
      
      if (e.shiftKey) newDeg = Math.round(newDeg / 15) * 15;
      setRotateDeg((newDeg % 360 + 360) % 360);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    dragStart.current.handle = null;
  };

  const applyTranslate = async () => {
    if (tx !== 0 || ty !== 0) {
      const unscaledWidth = imgRef.current.offsetWidth;
      const unscaledHeight = imgRef.current.offsetHeight;
      const sX = imageSize.w / unscaledWidth;
      const sY = imageSize.h / unscaledHeight;
      await onAction('translate', { tx: tx * sX, ty: ty * sY });
    }
  };

  const applyCrop = async () => {
    if (cropRect && cropRect.w > 10 && cropRect.h > 10) {
      const unscaledWidth = imgRef.current.offsetWidth;
      const unscaledHeight = imgRef.current.offsetHeight;
      const sX = imageSize.w / unscaledWidth;
      const sY = imageSize.h / unscaledHeight;
      
      await onAction('crop', { 
        startX: Math.round(cropRect.x * sX), 
        startY: Math.round(cropRect.y * sX), 
        endX: Math.round((cropRect.x + cropRect.w) * sX), 
        endY: Math.round((cropRect.y + cropRect.h) * sY) 
      });
    }
  };

  const applyResize = async () => {
    if (resizeRect && (resizeRect.w !== resizeRect.origW || resizeRect.h !== resizeRect.origH)) {
      const unscaledWidth = imgRef.current.offsetWidth;
      const unscaledHeight = imgRef.current.offsetHeight;
      const sX = imageSize.w / unscaledWidth;
      const sY = imageSize.h / unscaledHeight;

      // 12. Freeze Transform: Store the exact visual state before clearing
      lockedTransform.current = {
        scaleX: resizeRect.origW > 0 ? resizeRect.w / resizeRect.origW : 1,
        scaleY: resizeRect.origH > 0 ? resizeRect.h / resizeRect.origH : 1,
        tx: resizeRect.txPreview,
        ty: resizeRect.tyPreview
      };

      const params = { 
        width: Math.round(resizeRect.w), 
        height: Math.round(resizeRect.h),
        tx: (resizeRect.txApply || 0) * sX,
        ty: (resizeRect.tyApply || 0) * sY
      };
      setResizeRect(null);
      await onAction('resize', params);
    }
  };

  const applyRotate = async () => {
    if (rotateDeg !== 0) {
      await onAction('rotate', { degree: Math.round(-rotateDeg) });
    }
  };

  const cancelAction = () => {
    setTx(0);
    setTy(0);
    setCropRect(null);
    setResizeRect(null);
    setRotateDeg(0);
    setActiveTool('select');
  };

  // --- End of Hooks Section ---  // 11. Instant Zeroing Logic: Detect image change during render to prevent 1-frame jump
  const lastImageRef = useRef(currentImage);
  const imageChangedThisFrame = lastImageRef.current !== currentImage;

  let scaleX = 1;
  let scaleY = 1;
  let currentTx = tx;
  let currentTy = ty;

  // If image just changed, ignore stale local tx/ty/scale for this frame
  if (imageChangedThisFrame) {
    currentTx = 0;
    currentTy = 0;
    scaleX = 1;
    scaleY = 1;
  } 
  // Priority 1: Active Resize Tool
  else if (activeTool === 'resize' && resizeRect && resizeRect.origW !== undefined) {
    const fluidW = resizeRect.w;
    const fluidH = resizeRect.h;
    scaleX = resizeRect.origW > 0 ? fluidW / resizeRect.origW : 1;
    scaleY = resizeRect.origH > 0 ? fluidH / resizeRect.origH : 1;
    currentTx = resizeRect.txPreview !== undefined ? resizeRect.txPreview : tx;
    currentTy = resizeRect.tyPreview !== undefined ? resizeRect.tyPreview : ty;
  } 
  // Priority 2: Frozen Transform during loading (to prevent flicker)
  else if (isLoading && lastTransform && lastTransform.origW !== undefined) {
    const fluidW = lastTransform.w;
    const fluidH = lastTransform.h;
    scaleX = lastTransform.origW > 0 ? fluidW / lastTransform.origW : 1;
    scaleY = lastTransform.origH > 0 ? fluidH / lastTransform.origH : 1;
    currentTx = lastTransform.txPreview !== undefined ? lastTransform.txPreview : tx;
    currentTy = lastTransform.tyPreview !== undefined ? lastTransform.tyPreview : ty;
  }
  // Priority 3: Visual Lock during image load swap (Anti-Jump)
  else if (isProcessing && lockedTransform.current) {
    scaleX = lockedTransform.current.scaleX;
    scaleY = lockedTransform.current.scaleY;
    currentTx = lockedTransform.current.tx;
    currentTy = lockedTransform.current.ty;
  }
  else if (isProcessing) {
    scaleX = 1;
    scaleY = 1;
    currentTx = tx;
    currentTy = ty;
  }

  // Update image ref after logic is determined
  useEffect(() => {
    lastImageRef.current = currentImage;
  }, [currentImage]);

  return (
    <div className="preview-parent" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', backgroundColor: '#1a1a1a', overflow: 'hidden' }}>
      
      {/* Top Action Bar - Fixed */}
      <div style={{
        height: '40px',
        backgroundColor: '#252526',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        zIndex: 10,
        borderBottom: '1px solid #333',
        flexShrink: 0
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', cursor: 'pointer', fontSize: '13px' }}>
          <input 
            type="checkbox" 
            checked={showOriginal} 
            onChange={(e) => setShowOriginal(e.target.checked)}
            disabled={!originalImage}
          />
          Show Original Image (Before)
        </label>
        <span style={{ marginLeft: 'auto', color: '#888', fontSize: '12px' }}>
          {Math.round(viewState.scale * 100)}%
        </span>
      </div>

      {/* Scrollable Container */}
      <div 
        className="preview-container" 
        ref={containerRef}
        style={{
          flex: 1,
          position: 'relative',
          overflowX: overflow.x,
          overflowY: overflow.y,
          display: 'block',
          backgroundColor: '#1a1a1a'
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Panning Layer with fixed stable padding */}
        {originalImage ? (
          <div className="panning-layer" style={{
            padding: `${PAN_PADDING}px`,
            width: 'fit-content',
            height: 'fit-content',
            display: 'block'
          }}>
            {/* Sizer matching the scaled image dimensions */}
            <div className="scaled-sizer" style={{
              width: imageSize.w > 0 ? (imageSize.w * baseScale * viewState.scale) : 0,
              height: imageSize.h > 0 ? (imageSize.h * baseScale * viewState.scale) : 0,
              position: 'relative',
              backgroundColor: '#222',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              {/* Canvas Wrapper - Anchored to 0,0 for perfect math */}
              <div 
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: imageSize.w > 0 ? `${imageSize.w}px` : 'auto',
                  height: imageSize.h > 0 ? `${imageSize.h}px` : 'auto',
                  overflow: 'visible', // Allow handles to be visible outside
                  transform: `scale(${viewState.scale * baseScale})`,
                  transformOrigin: '0 0',
                }}
              >
                {/* Checkerboard Background - Separated to keep it clipped */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: 'linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  zIndex: -1,
                  overflow: 'hidden'
                }} />
            {(showOriginal ? originalImgUrl : imgUrl) && (
              <>
                {/* 1. Clipped Image Layer - Image is invisible outside this box */}
                <div style={{ 
                  position: 'absolute', 
                  top: 0, left: 0, right: 0, bottom: 0, 
                  overflow: 'hidden',
                  zIndex: 2 
                }}>
                  <img 
                    ref={imgRef}
                    src={showOriginal ? originalImgUrl : imgUrl} 
                    alt="Canvas"
                    draggable="false"
                    onPointerDown={handlePointerDown}
                    style={{
                      position: 'absolute',
                      display: 'block',
                      left: showOriginal ? 0 : globalShift.x,
                      top: showOriginal ? 0 : globalShift.y,
                      width: showOriginal ? '100%' : `${imageSize.w}px`,
                      height: showOriginal ? '100%' : `${imageSize.h}px`,
                      transform: `translate(${currentTx}px, ${currentTy}px) rotate(${rotateDeg}deg) scale(${scaleX}, ${scaleY})`,
                      transformOrigin: 'center center',
                      cursor: activeTool === 'translate' ? (isDragging ? 'grabbing' : 'grab') : (activeTool === 'pan' ? (isDragging ? 'grabbing' : 'grab') : (activeTool === 'crop' ? 'crosshair' : 'default')),
                      filter: (showOriginal || !showEnhancementPreview) ? 'none' : `brightness(${100 + Number(enhancementPreview.brightness)}%) contrast(${100 + Number(enhancementPreview.contrast)}%)`,
                    }}
                  />
                </div>

                {/* 2. Tools Layer - Visible outside canvas bounds */}
                <div style={{ 
                  position: 'absolute', 
                  top: 0, left: 0, right: 0, bottom: 0, 
                  overflow: 'visible',
                  pointerEvents: 'none',
                  zIndex: 3,
                  willChange: 'transform', // Fix ghosting
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)'
                }}>
                  {activeTool === 'crop' && cropRect && cropRect.w > 0 && (
                    <div style={{
                      position: 'absolute',
                      left: cropRect.x,
                      top: cropRect.y,
                      width: cropRect.w,
                      height: cropRect.h,
                      border: `${2 / viewState.scale}px dashed #00e5ff`,
                      backgroundColor: 'rgba(0, 229, 255, 0.1)',
                      pointerEvents: 'none'
                    }} />
                  )}

                  {activeTool === 'resize' && resizeRect && (
                    <div style={{
                      position: 'absolute',
                      top: globalShift.y,
                      left: globalShift.x,
                      width: imageSize.w,
                      height: imageSize.h,
                      pointerEvents: 'none',
                      transform: `translate(${currentTx}px, ${currentTy}px) rotate(${rotateDeg}deg) scale(${scaleX}, ${scaleY})`,
                      transformOrigin: 'center center',
                      zIndex: 10
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        border: `${1 / (viewState.scale * baseScale * scaleX)}px solid #00e5ff`,
                      }}>
                        {[
                          {pos: 'tl', style: {top: '-4px', left: '-4px', cursor: 'nwse-resize'}}, 
                          {pos: 't', style: {top: '-4px', left: 'calc(50% - 4px)', cursor: 'ns-resize'}}, 
                          {pos: 'tr', style: {top: '-4px', right: '-4px', cursor: 'nesw-resize'}},
                          {pos: 'l', style: {top: 'calc(50% - 4px)', left: '-4px', cursor: 'ew-resize'}}, 
                          {pos: 'r', style: {top: 'calc(50% - 4px)', right: '-4px', cursor: 'ew-resize'}},
                          {pos: 'bl', style: {bottom: '-4px', left: '-4px', cursor: 'nesw-resize'}}, 
                          {pos: 'b', style: {bottom: '-4px', left: 'calc(50% - 4px)', cursor: 'ns-resize'}}, 
                          {pos: 'br', style: {bottom: '-4px', right: '-4px', cursor: 'nwse-resize'}}
                        ].map((handle, i) => (
                          <div 
                            key={i} 
                            onPointerDown={(e) => handleResizeDown(e, handle.pos)}
                            style={{
                              position: 'absolute',
                              width: '8px', height: '8px',
                              backgroundColor: '#fff', border: '1px solid #00e5ff',
                              pointerEvents: 'auto',
                              transform: `scale(${1 / (viewState.scale * baseScale * (handle.pos.includes('l') || handle.pos.includes('r') ? scaleX : scaleY))})`,
                              ...handle.style
                            }} 
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTool === 'rotate' && resizeRect && (
                    <div style={{
                      position: 'absolute',
                      top: globalShift.y,
                      left: globalShift.x,
                      width: imageSize.w,
                      height: imageSize.h,
                      pointerEvents: 'none',
                      transform: `translate(${currentTx}px, ${currentTy}px) rotate(${rotateDeg}deg) scale(${scaleX}, ${scaleY})`,
                      transformOrigin: 'center center',
                      zIndex: 11
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        border: `${1 / (viewState.scale * baseScale * scaleX)}px solid #ff4444`,
                      }}>
                        {[
                          {pos: 'tl', style: {top: '-6px', left: '-6px', cursor: 'crosshair'}}, 
                          {pos: 'tr', style: {top: '-6px', right: '-6px', cursor: 'crosshair'}},
                          {pos: 'bl', style: {bottom: '-6px', left: '-6px', cursor: 'crosshair'}}, 
                          {pos: 'br', style: {bottom: '-6px', right: '-6px', cursor: 'crosshair'}}
                        ].map((handle, i) => (
                          <div 
                            key={i} 
                            onPointerDown={handleRotateDown}
                            style={{
                              position: 'absolute',
                              width: '12px', height: '12px',
                              backgroundColor: 'rgba(255, 68, 68, 0.3)',
                              border: '1px solid #ff4444',
                              borderRadius: '50%',
                              pointerEvents: 'auto',
                              transform: `scale(${1 / (viewState.scale * baseScale * (handle.pos.includes('l') || handle.pos.includes('r') ? scaleX : scaleY))})`,
                              ...handle.style
                            }} 
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Degree Indicator during rotation */}
                  {activeTool === 'rotate' && isDragging && resizeRect && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) scale(${1 / (viewState.scale * baseScale * scaleX)}) translateZ(0)`,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        zIndex: 20
                      }}>
                        {Math.round(rotateDeg)}°
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
    ) : (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        gap: '1rem',
        textAlign: 'center',
        padding: '2rem'
      }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#252526',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              border: '2px dashed #444'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </div>
            <h2 style={{ color: '#aaa', margin: 0 }}>Empty Workspace</h2>
            <p style={{ maxWidth: '300px', fontSize: '14px', lineHeight: '1.6' }}>
              Select <strong>File &gt; Open Image</strong> or create a new workspace to start editing your digital images.
            </p>
          </div>
        )}
      </div>
      {/* Commit bar for Interactive Tools - Fixed Overlay */}
      {(activeTool === 'translate' && (tx !== 0 || ty !== 0)) || 
       (activeTool === 'crop' && cropRect && cropRect.w > 0) ||
       (activeTool === 'resize' && resizeRect && (resizeRect.w !== resizeRect.origW || resizeRect.h !== resizeRect.origH)) ||
       (activeTool === 'rotate' && rotateDeg !== 0) ? (
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#252526',
          padding: '8px 16px',
          borderRadius: '24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.8)',
          border: '1px solid #333',
          zIndex: 100
        }}>
          <span style={{ color: '#ccc', fontSize: '14px', fontWeight: 500 }}>
            {activeTool === 'translate' ? 'Apply Translation?' : 
             activeTool === 'crop' ? 'Apply Crop?' : 
             activeTool === 'resize' ? 'Apply Resize?' : 'Apply Rotation?'}
          </span>
          <button onClick={cancelAction} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Cancel">
            <X size={20} />
          </button>
          <button onClick={activeTool === 'translate' ? applyTranslate : activeTool === 'crop' ? applyCrop : activeTool === 'resize' ? applyResize : applyRotate} style={{ background: 'transparent', border: 'none', color: '#00e5ff', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Apply">
            <Check size={20} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default CanvasPreview;
