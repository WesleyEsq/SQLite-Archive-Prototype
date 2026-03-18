import React, { useState, useEffect, useRef } from 'react';
import { ReactReader } from 'react-reader';
import { HistoryManager } from '../../utils/HistoryManager'; // <-- Import History Manager

export default function EpubViewer({ asset, entry, onClose }) { // <-- Accept entry prop
    const streamUrl = `http://localhost:40001/stream/${asset.id}/${encodeURIComponent(asset.filename)}`;
    
    const [location, setLocation] = useState(null);
    const renditionRef = useRef(null);

    // 1. Load initial location from Global History Manager
    useEffect(() => {
        const history = HistoryManager.getHistory();
        const savedItem = history.find(h => h.fileId === asset.id);
        if (savedItem && savedItem.resumeData) {
            setLocation(savedItem.resumeData);
        }
    }, [asset.id]);

    // 2. Handle Location Change & Calculate Percentage
    const handleLocationChange = (epubcifi) => {
        setLocation(epubcifi);

        let percentage = 0;
        // If the book has finished calculating its total pages, calculate the exact percentage!
        if (renditionRef.current && renditionRef.current.book.locations.length() > 0) {
            percentage = renditionRef.current.book.locations.percentageFromCfi(epubcifi) * 100;
        }

        HistoryManager.saveProgress(asset, entry, percentage, 'epub', epubcifi);
    };

    // 3. Hook into the Epub.js engine to generate total pages in the background
    const getRendition = (rendition) => {
        renditionRef.current = rendition;
        
        // Generate locations based on 1600 characters per "page"
        rendition.book.locations.generate(1600).then(() => {
            // Once calculation is done, update the history with the accurate percentage
            if (location) {
                const exactPct = rendition.book.locations.percentageFromCfi(location) * 100;
                HistoryManager.saveProgress(asset, entry, exactPct, 'epub', location);
            }
        }).catch(console.error);
    };

    return (
        <div className="modal-overlay cinema-mode white-mode">
            <button className="minimal-close-btn" onClick={onClose}>×</button>
            
            <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
                <ReactReader
                    url={streamUrl}
                    title={asset.title}
                    location={location}
                    locationChanged={handleLocationChange}
                    getRendition={getRendition} // <-- Attach our engine hook
                    epubOptions={{
                        flow: 'paginated',
                        manager: 'default',
                        width: '100%',
                        height: '100%',
                    }}
                />
            </div>
        </div>
    );
}