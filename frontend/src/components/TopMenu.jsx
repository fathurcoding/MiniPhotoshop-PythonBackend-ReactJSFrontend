import React, { useState, useRef, useEffect } from 'react';
import { Undo2, Redo2 } from 'lucide-react';

function TopMenu({ onUndo, canUndo, onRedo, canRedo, onOpenModal, onAction, onExport, hasImage, onImageUpload }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageUpload(file);
      event.target.value = '';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  const handleMenuClick = (actionFn) => {
    setActiveDropdown(null); // Close dropdown
    actionFn(); // Execute action
  };

  return (
    <div className="top-menu" style={{ display: 'flex', justifyContent: 'space-between' }} ref={menuRef}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold', marginRight: '2rem', color: 'var(--accent)' }}>MiniPS</div>
        
        {/* Hidden File Input (Always Mounted) */}
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          ref={fileInputRef}
        />
        
        {/* File Dropdown */}
        <div className="dropdown-container">
          <div className="menu-item" onClick={() => toggleDropdown('File')}>File</div>
          {activeDropdown === 'File' && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => handleMenuClick(() => fileInputRef.current.click())}>Open Image...</div>
              <div className="dropdown-item" onClick={() => handleMenuClick(() => hasImage && onExport())} style={{ opacity: hasImage ? 1 : 0.5 }}>Export Image...</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item" onClick={() => handleMenuClick(() => onAction('new_workspace'))}>New Workspace</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item" onClick={() => handleMenuClick(() => onAction('close'))}>Close</div>
            </div>
          )}
        </div>

        {/* Edit Dropdown */}
        <div className="dropdown-container">
          <div className="menu-item" onClick={() => toggleDropdown('Edit')}>Edit</div>
          {activeDropdown === 'Edit' && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => handleMenuClick(() => canUndo && onUndo())} style={{ opacity: canUndo ? 1 : 0.5 }}>Undo</div>
              <div className="dropdown-item" onClick={() => handleMenuClick(() => canRedo && onRedo())} style={{ opacity: canRedo ? 1 : 0.5 }}>Redo</div>
            </div>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="dropdown-container">
          <div className="menu-item" onClick={() => toggleDropdown('Filter')}>Filter</div>
          {activeDropdown === 'Filter' && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => handleMenuClick(() => onOpenModal('gaussian_blur', 'Gaussian Blur'))}>Gaussian Blur...</div>
              <div className="dropdown-item" onClick={() => handleMenuClick(() => onOpenModal('median_filter', 'Median Filter'))}>Median Filter...</div>
              <div className="dropdown-item" onClick={() => handleMenuClick(() => onOpenModal('noise_removal', 'Noise Removal'))}>Noise Removal...</div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item" onClick={() => handleMenuClick(() => onAction('sharpen'))}>Sharpen</div>
              <div className="dropdown-item" onClick={() => handleMenuClick(() => onAction('smooth'))}>Smooth</div>
            </div>
          )}
        </div>

        {/* Transform Dropdown */}
        <div className="dropdown-container">
          <div className="menu-item" onClick={() => toggleDropdown('Transform')}>Transform</div>
          {activeDropdown === 'Transform' && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={() => handleMenuClick(() => onAction('flip', { dir: 'h' }))}>Flip Horizontal</div>
              <div className="dropdown-item" onClick={() => handleMenuClick(() => onAction('flip', { dir: 'v' }))}>Flip Vertical</div>
            </div>
          )}
        </div>

      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button 
          className="menu-item" 
          onClick={onUndo} 
          disabled={!canUndo}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: canUndo ? 'var(--text-main)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <Undo2 size={16} /> Undo
        </button>
        <button 
          className="menu-item" 
          onClick={onRedo} 
          disabled={!canRedo}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: canRedo ? 'var(--text-main)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <Redo2 size={16} /> Redo
        </button>
      </div>
    </div>
  );
}

export default TopMenu;
