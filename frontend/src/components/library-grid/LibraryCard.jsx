import React, { useState } from 'react';

export default function LibraryCard({ entry, onSelectSeries, loadedCache }) {
    const [imgSrc, setImgSrc] = useState(`/images/${entry.id}?t=${Date.now()}`);

    return (
        <div className="library-card" onClick={() => onSelectSeries(entry)}>
            
            {/* 1. TINY RED HEADER BADGE */}
            <div className="library-card-top-badge">
                #{entry.number}
            </div>

            {/* 2. MAIN IMAGE */}
            <img 
                src={imgSrc} 
                alt={entry.title} 
                className="library-card-image"
                onError={(e) => {
                    setImgSrc('/default-cover.png');
                }}
            />
            
            {/* 3. SOLID WHITE FOOTER */}
            <div className="library-card-footer">
                <h4 className="library-card-title" title={entry.title}>
                    {entry.title}
                </h4>
                
                <div className="library-card-meta">
                    <span>{entry.rank ? "Rank: " : ""}</span>
                    {entry.rank && (
                        <span className={`rank-badge rank-${entry.rank.charAt(0)}`} style={{ padding: '2px 6px', fontSize: '0.75rem' }}>
                            {entry.rank}
                        </span>
                    )}
                </div>
            </div>
            
        </div>
    );
}