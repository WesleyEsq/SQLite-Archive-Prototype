import React, { useEffect } from 'react';
import { HistoryManager } from '../../utils/HistoryManager';

export default function PDFViewer({ asset, entry, onClose }) {
    const streamUrl = `http://localhost:40001/stream/${asset.id}/${encodeURIComponent(asset.filename)}`;

    // Log to History Manager on mount
    useEffect(() => {
        HistoryManager.saveProgress(asset, entry, 0, 'pdf', null);
    }, [asset, entry]);

    return (
        <div className="modal-overlay cinema-mode white-mode">
            <button className="minimal-close-btn" onClick={onClose}>×</button>
            
            <iframe 
                src={streamUrl} 
                className="full-screen-frame" 
                title="PDF Reader"
            />
        </div>
    );
}