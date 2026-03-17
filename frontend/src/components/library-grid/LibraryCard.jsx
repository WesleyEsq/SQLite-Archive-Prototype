import React, { useState } from 'react';

export default function LibraryCard({ entry, onSelectSeries, loadedCache }) {
    // Check if this image was loaded previously via the ref passed from Controller
    const seenBefore = loadedCache.current.has(entry.id);
    const [isLoaded, setIsLoaded] = useState(seenBefore);

    return (
        <div className="library-card" onClick={() => onSelectSeries(entry)}>
            <div className="library-card-image-wrapper">
                <div className="card-accent-bar"></div>
                <img 
                    src={`/images/${entry.id}`} 
                    alt={entry.title} 
                    loading="lazy"
                    className={`library-cover-img ${isLoaded ? 'loaded' : ''} ${seenBefore ? 'instant' : ''}`}
                    onLoad={(e) => {
                        loadedCache.current.add(entry.id);
                        setIsLoaded(true);
                    }}
                    onError={(e) => {
                        e.target.style.display = 'none'; 
                        e.target.parentNode.classList.add('broken');
                    }}
                />
                <div className="library-card-overlay">
                    <span className={`rank-badge rank-${entry.rank ? entry.rank.charAt(0) : 'U'}`}>{entry.rank}</span>
                </div>
            </div>
            <div className="library-card-title">{entry.title}</div>
        </div>
    );
}