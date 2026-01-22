// src/components/ImageModal.js
import React from 'react';
import ReactDOM from 'react-dom'; // For creating a portal

function ImageModal({ isOpen, src, onClose }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.9)',
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      onClick={onClose}
    >
      <img
        src={src}
        alt="Enlarged"
        style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking image
      />
    </div>,
    document.body // Append to body
  );
}

export default ImageModal;