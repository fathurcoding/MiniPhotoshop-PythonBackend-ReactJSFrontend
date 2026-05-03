import React, { useState, useEffect } from 'react';
import { X, Download, Image as ImageIcon, FileText, Info, CheckCircle2 } from 'lucide-react';

function ExportModal({ image, onClose }) {
  const [quality, setQuality] = useState(90);
  const [format, setFormat] = useState('image/jpeg');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageDetails, setImageDetails] = useState({ w: 0, h: 0, size: 0 });
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!image) return;
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setImageDetails({
        w: img.naturalWidth,
        h: img.naturalHeight,
        size: image.size
      });
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleDownload = () => {
    setIsExporting(true);
    // Add a slight delay to show "Exporting..." state
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
          const ext = format === 'image/png' ? 'png' : 'jpg';
          a.href = url;
          a.download = `minips_export_${timestamp}.${ext}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setIsExporting(false);
          onClose();
        }, format, format === 'image/jpeg' ? quality / 100 : 1);
      };
      img.src = previewUrl;
    }, 600);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="modal-content export-modal" style={{ 
        maxWidth: '850px', 
        width: '95%', 
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
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>Export Image</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>Configure your output settings</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: '#333', 
              border: 'none', 
              color: '#fff', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none',
              padding: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#e74c3c'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#333'}
          >
            {/* Manual SVG X to ensure it always renders */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(350px, 1.2fr) 1fr', 
          gap: '0', 
          padding: '0' 
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
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}>
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
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              background: '#252526',
              padding: '1.25rem',
              borderRadius: '16px',
              border: '1px solid #333'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Resolution</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{imageDetails.w} × {imageDetails.h}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#888', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>Est. Size</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#00d2ff' }}>{formatSize(imageDetails.size)}</div>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#ccc', marginBottom: '0.75rem', display: 'block' }}>Export Format</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['image/jpeg', 'image/png'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFormat(f)}
                    style={{ 
                      flex: 1,
                      padding: '1rem', 
                      borderRadius: '12px', 
                      backgroundColor: format === f ? 'rgba(0, 210, 255, 0.1)' : '#222',
                      border: `1px solid ${format === f ? '#00d2ff' : '#333'}`,
                      color: format === f ? '#00d2ff' : '#aaa',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {f === 'image/jpeg' ? <ImageIcon size={18} /> : <FileText size={18} />}
                    {f === 'image/jpeg' ? 'JPEG' : 'PNG'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider */}
            {format === 'image/jpeg' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#ccc' }}>Compression Quality</label>
                  <span style={{ 
                    backgroundColor: 'rgba(0, 210, 255, 0.2)', 
                    color: '#00d2ff', 
                    padding: '2px 8px', 
                    borderRadius: '6px', 
                    fontSize: '12px', 
                    fontWeight: '700' 
                  }}>{quality}%</span>
                </div>
                <input 
                  type="range" 
                  className="range-slider" 
                  min="1" max="100" 
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#00d2ff' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '10px', color: '#555', fontWeight: '600' }}>
                  <span>SMALL FILE</span>
                  <span>HIGH QUALITY</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ marginTop: 'auto' }}>
              <button 
                className="primary" 
                onClick={handleDownload}
                disabled={isExporting}
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
                  gap: '0.5rem'
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
        .export-modal .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(0, 210, 255, 0.5);
        }
        .export-modal .primary-btn:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}

export default ExportModal;
