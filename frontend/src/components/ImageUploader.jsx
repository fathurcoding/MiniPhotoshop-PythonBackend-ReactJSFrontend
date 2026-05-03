import React, { useRef } from 'react';

function ImageUploader({ onImageUpload }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        ref={fileInputRef}
      />
      <button 
        className="primary" 
        style={{ width: '100%' }}
        onClick={() => fileInputRef.current.click()}
      >
        Open Image...
      </button>
    </div>
  );
}

export default ImageUploader;
