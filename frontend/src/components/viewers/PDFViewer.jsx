import React from 'react';

export default function PDFViewer({ asset, onClose }) {
    // Point to the Sidecar Server
    const streamUrl = `http://localhost:40001/stream/${asset.id}/${encodeURIComponent(asset.filename)}`;

    return (
        <div className="modal-overlay cinema-mode white-mode">
            {/* Minimalist "Get out of there" button */}
            <button className="minimal-close-btn" onClick={onClose}>×</button>
            
            <iframe 
                src={streamUrl} 
                className="full-screen-frame" 
                title="PDF Reader"
            />
        </div>
    );
}