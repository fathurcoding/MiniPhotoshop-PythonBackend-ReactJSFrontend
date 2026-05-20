import React, { useState, useEffect, useRef } from 'react';
import { Download, Image as ImageIcon, FileText, CheckCircle2, Zap, Settings2 } from 'lucide-react';
import { applyCompression } from '../services/api';

function ExportModal({ image, onClose }) {
  const [mode, setMode] = useState('standard'); // 'standard' or 'advanced'
  
  // Standard Mode State
  const format = 'image/png';
  
  // Advanced Mode State
  const [advMethod, setAdvMethod] = useState('jpeg'); // 'huffman', 'rle', 'lzw', 'arithmetic', 'jpeg'
  const [advQuality, setAdvQuality] = useState(50);
  
  // Common State
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageDetails, setImageDetails] = useState({ w: 0, h: 0, size: 0 });
  const [stats, setStats] = useState({ originalSize: 0, compressedSize: 0, compressionRatio: 0 });
  const [isExporting, setIsExporting] = useState(false);
  const [isProcessingPreview, setIsProcessingPreview] = useState(false);
  
  const processingTimer = useRef(null);
  const currentBlobRef = useRef(image);

  // Initialize preview with original image
  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    currentBlobRef.current = image;

    const img = new Image();
    img.onload = () => {
      setImageDetails({
        w: img.naturalWidth,
        h: img.naturalHeight,
        size: image.size
      });
      setStats({
        originalSize: image.size,
        compressedSize: image.size,
        compressionRatio: 1
      });
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [image]);

  // Handle Advanced Mode Preview Updates
  useEffect(() => {
    if (mode !== 'advanced') {
      // Revert to original
      if (image) {
        const url = URL.createObjectURL(image);
        setPreviewUrl(url);
        currentBlobRef.current = image;
        setStats({
          originalSize: image.size,
          compressedSize: image.size,
          compressionRatio: 1
        });
      }
      return;
    }

    if (processingTimer.current) {
      clearTimeout(processingTimer.current);
    }

    // Debounce compression API call
    processingTimer.current = setTimeout(async () => {
      setIsProcessingPreview(true);
      try {
        const result = await applyCompression(image, {
          method: advMethod,
          quality: advMethod === 'jpeg' ? advQuality : undefined
        });
        
        const url = URL.createObjectURL(result.blob);
        setPreviewUrl(url);
        currentBlobRef.current = result.blob;
        setStats({
          originalSize: result.originalSize || image.size,
          compressedSize: result.compressedSize || image.size,
          compressionRatio: result.compressionRatio || 1
        });
      } catch (error) {
        console.error("Compression failed:", error);
      } finally {
        setIsProcessingPreview(false);
      }
    }, 500);

    return () => {
      if (processingTimer.current) clearTimeout(processingTimer.current);
    };
  }, [mode, advMethod, advQuality, image]);

  const handleDownload = () => {
    setIsExporting(true);
    
    if (mode === 'standard') {
      // Standard Canvas Export
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.onload = () => {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().getTime();
            const ext = 'png';
            a.href = url;
            a.download = `minips_export_${timestamp}.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setIsExporting(false);
            onClose();
          }, 'image/png', 1);
        };
        img.src = previewUrl;
      }, 300);
    } else {
      // Advanced Mode: Download the exact blob from backend
      setTimeout(() => {
        const url = URL.createObjectURL(currentBlobRef.current);
        const a = document.createElement('a');
        const timestamp = new Date().getTime();
        // The backend encodes everything as PNG so we don't lose the exact pixel state it calculated
        // Exception: JPEG sim might look like JPEG but we save the raw bytes returned.
        const ext = 'png'; 
        a.href = url;
        a.download = `minips_${advMethod}_${timestamp}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExporting(false);
        onClose();
      }, 300);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0 || !bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="modal-content export-modal" style={{ 
        maxWidth: '900px', 
        width: '95%', 
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#1a1a1a',
        border: '1px solid #333',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        borderRadius: '24px',
        overflow: 'hidden',
        animation: 'modalShow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <div className="modal-header" style={{ 
          padding: '1.5rem 2rem', 
          borderBottom: '1px solid #333', 
          background: '#222',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="modal-icon" style={{ 
              backgroundColor: 'rgba(0, 210, 255, 0.15)', 
              width: '48px', 
              height: '48px', 
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Download size={24} color="#00d2ff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>Export & Compress</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>Configure output settings and algorithms</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: '#333', border: 'none', color: '#fff', width: '32px', height: '32px', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s', outline: 'none', padding: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e74c3c'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#333'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', borderBottom: '1px solid #333', background: '#1c1c1c' }}>
          <button
            onClick={() => setMode('standard')}
            style={{
              flex: 1, padding: '1rem', background: 'transparent', border: 'none',
              color: mode === 'standard' ? '#00d2ff' : '#666', fontWeight: '600',
              borderBottom: `2px solid ${mode === 'standard' ? '#00d2ff' : 'transparent'}`,
              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', gap: '8px'
            }}
          >
            <Settings2 size={18} /> Standard Export
          </button>
          <button
            onClick={() => setMode('advanced')}
            style={{
              flex: 1, padding: '1rem', background: 'transparent', border: 'none',
              color: mode === 'advanced' ? '#a855f7' : '#666', fontWeight: '600',
              borderBottom: `2px solid ${mode === 'advanced' ? '#a855f7' : 'transparent'}`,
              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', gap: '8px'
            }}
          >
            <Zap size={18} /> Advanced Compression (Algorithms)
          </button>
        </div>

        <div className="modal-body" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(400px, 1.2fr) 1fr', 
          gap: '0', 
          padding: '0',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Left: Preview Panel */}
          <div style={{ 
            background: '#111', 
            padding: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid #333',
            position: 'relative'
          }}>
            <div style={{
              width: '100%',
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
              backgroundImage: 'linear-gradient(45deg, #181818 25%, transparent 25%), linear-gradient(-45deg, #181818 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #181818 75%), linear-gradient(-45deg, transparent 75%, #181818 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              position: 'relative'
            }}>
              {isProcessingPreview && (
                <div style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, color: '#00d2ff'
                }}>
                  <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(0,210,255,0.3)', borderTopColor: '#00d2ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              )}
              {previewUrl && (
                <img 
                  src={previewUrl} 
                  alt="Export Preview" 
                  style={{ 
                    maxWidth: '90%', 
                    maxHeight: '90%', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))',
                    borderRadius: '4px',
                    transition: 'transform 0.3s'
                  }} 
                />
              )}
            </div>
            <div style={{ 
              marginTop: '1.5rem', 
              display: 'flex', 
              gap: '1.5rem', 
              color: '#666',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={14} color="#4caf50" /> Ready to Save</span>
              <span>•</span>
              <span>{imageDetails.w} x {imageDetails.h}</span>
            </div>
          </div>

          {/* Right: Controls Panel */}
          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Stats Card */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: mode === 'advanced' ? '1fr 1fr 1fr' : '1fr 1fr', 
              gap: '1rem',
              background: '#252526',
              padding: '1.25rem',
              borderRadius: '16px',
              border: '1px solid #333'
            }}>
              {mode === 'standard' ? (
                <>
                  <div>
                    <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Resolution</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{imageDetails.w} × {imageDetails.h}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Original Size</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00d2ff' }}>{formatSize(imageDetails.size)}</div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div style={{ fontSize: '10px', color: '#888', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Original</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{formatSize(stats.originalSize)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#888', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Compressed</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a855f7' }}>{formatSize(stats.compressedSize)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#888', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Ratio</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4caf50' }}>{stats.compressionRatio.toFixed(2)}x</div>
                  </div>
                </>
              )}
            </div>

            {/* Standard Mode Controls */}
            {mode === 'standard' && (
              <>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#ccc', marginBottom: '0.75rem', display: 'block' }}>Export Format</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div 
                      style={{ 
                        flex: 1, padding: '1rem', borderRadius: '12px', 
                        backgroundColor: 'rgba(0, 210, 255, 0.1)',
                        border: '1px solid #00d2ff',
                        color: '#00d2ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '600'
                      }}
                    >
                      <FileText size={18} />
                      PNG (Lossless Quality)
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '1rem', lineHeight: '1.5' }}>
                    Standard Export saves the image exactly as shown on the canvas with maximum quality. If you want to compress the image into a JPEG, please use the Advanced Compression tab.
                  </p>
                </div>
              </>
            )}

            {/* Advanced Mode Controls */}
            {mode === 'advanced' && (
              <>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#ccc', marginBottom: '0.75rem', display: 'block' }}>Compression Algorithm</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      { id: 'jpeg', name: 'JPEG Simulation (Lossy)' },
                      { id: 'huffman', name: 'Huffman Coding (Lossless)' },
                      { id: 'rle', name: 'Run-Length Encoding (Lossless)' },
                      { id: 'lzw', name: 'LZW Compression (Lossless)' },
                      { id: 'arithmetic', name: 'Arithmetic Coding (Lossless)' },
                    ].map(method => (
                      <button 
                        key={method.id}
                        onClick={() => setAdvMethod(method.id)}
                        style={{ 
                          padding: '0.8rem 1rem', borderRadius: '8px', textAlign: 'left',
                          backgroundColor: advMethod === method.id ? 'rgba(168, 85, 247, 0.1)' : '#222',
                          border: `1px solid ${advMethod === method.id ? '#a855f7' : '#333'}`,
                          color: advMethod === method.id ? '#a855f7' : '#aaa',
                          cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', fontSize: '13px'
                        }}
                      >
                        {method.name}
                      </button>
                    ))}
                  </div>
                </div>

                {advMethod === 'jpeg' && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#ccc' }}>Quantization Quality</label>
                      <span style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>{advQuality}%</span>
                    </div>
                    <input 
                      type="range" className="range-slider" 
                      min="1" max="100" value={advQuality}
                      onChange={(e) => setAdvQuality(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: '#a855f7' }}
                    />
                    <div style={{ fontSize: '11px', color: '#888', marginTop: '0.5rem' }}>Lower quality reveals 8x8 DCT blocks.</div>
                  </div>
                )}
                
                {advMethod !== 'jpeg' && (
                  <div style={{ padding: '1rem', backgroundColor: '#222', borderRadius: '8px', border: '1px dashed #444', marginTop: 'auto' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#aaa', lineHeight: '1.5' }}>
                      Lossless algorithms preserve the image perfectly. The preview will not change, but you can see the theoretical size reduction in the stats panel above.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Actions */}
            <div style={{ marginTop: 'auto' }}>
              <button 
                className="primary" 
                onClick={handleDownload}
                disabled={isExporting || isProcessingPreview}
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  fontSize: '14px',
                  fontWeight: '600',
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: mode === 'advanced' ? '#a855f7' : '#00d2ff',
                  boxShadow: mode === 'advanced' ? '0 4px 15px rgba(168, 85, 247, 0.3)' : '0 4px 15px rgba(0, 210, 255, 0.3)'
                }}
              >
                {isExporting ? (
                  <>Processing...</>
                ) : (
                  <><Download size={18} /> Export Image</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modalShow {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .export-modal .primary:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .export-modal .primary:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

export default ExportModal;
