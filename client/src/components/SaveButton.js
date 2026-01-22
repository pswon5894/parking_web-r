// src/components/SaveButton.js
import React, { useRef } from 'react';

function SaveButton({ onSave }) {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    // onSave will be called with the file from the input
    if (onSave) {
        onSave(fileInputRef.current.files[0]);
    }
  };

  return (
    <div className="save-btn-container" style={{ position: 'absolute', top: '100px', right: '10px', zIndex: 1000 }}>
      <button
        onClick={handleButtonClick}
        style={{ padding: '10px', cursor: 'pointer', display: 'block', marginBottom: '5px' }}
      >
        주차 위치 복사
      </button>
      <input
        type="file"
        id="photoInput"
        accept="image/*"
        capture="environment"
        style={{ marginTop: '5px' }}
        ref={fileInputRef}
      />
    </div>
  );
}

export default SaveButton;