import React from 'react';

export default function ImageViewer({ asset, onClose }) {
    const streamUrl = `http://localhost:40001/stream/${asset.id}/${encodeURIComponent(asset.filename)}`;

    return (
        <div className="modal-overlay cinema-mode" onClick={onClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <button className="minimal-close-btn" onClick={onClose}>×</button>
            
            <img 
                src={streamUrl} 
                alt={asset.title} 
                style={{ 
                    maxWidth: '90vw', 
                    maxHeight: '90vh', 
                    objectFit: 'contain',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    borderRadius: '8px'
                }} 
                onClick={(e) => e.stopPropagation()} // Prevents clicking the image from closing the modal
            />
        </div>
    );
}