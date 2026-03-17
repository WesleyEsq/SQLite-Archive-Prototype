import React, { useState, useEffect } from 'react';
import { ReactReader } from 'react-reader';

export default function EpubViewer({ asset, onClose }) {
    // 1. Construct the URL with filename (Critical for epub.js detection)
    const streamUrl = `http://localhost:40001/stream/${asset.id}/${encodeURIComponent(asset.filename)}`;
    
    // 2. Resume Logic (LocalStorage)
    const storageKey = `gogl_epub_loc_${asset.id}`;
    const [location, setLocation] = useState(localStorage.getItem(storageKey) || 0);

    const handleLocationChange = (newLoc) => {
        setLocation(newLoc);
        localStorage.setItem(storageKey, newLoc);
    };

    return (
        <div className="modal-overlay cinema-mode white-mode">
            <button className="minimal-close-btn" onClick={onClose}>×</button>
            
            {/* IMPORTANT: The container MUST have a defined height (100vh) 
               for the paginator to calculate page breaks correctly.
            */}
            <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
                <ReactReader
                    url={streamUrl}
                    title={asset.title}
                    location={location}
                    locationChanged={handleLocationChange}
                    // --- THE FIX IS HERE ---
                    epubOptions={{
                        flow: 'paginated', // Forces page-by-page view
                        manager: 'default', // Default manager handles pagination best
                        width: '100%',
                        height: '100%',
                    }}
                    // Optional: Custom styles for the reader UI itself
                />
            </div>
        </div>
    );
}