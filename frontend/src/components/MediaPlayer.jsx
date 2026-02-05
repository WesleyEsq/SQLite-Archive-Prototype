import React, { useState, useEffect, useRef } from 'react';

export default function MediaPlayer({ playlist, startIndex, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [showControls, setShowControls] = useState(true);
    
    const videoRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const asset = playlist[currentIndex];

    // 1. Build the Stream URL (Sidecar Server)
    const streamUrl = `http://localhost:40001/stream/${asset.id}/${encodeURIComponent(asset.filename)}`;
    // ...

    // --- EFFECT: Handle Mouse Movement (Fade UI) ---
    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true);
            
            // Clear existing timer
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            
            // Set new timer to hide controls after 2.5 seconds of inactivity
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 2500);
        };

        // Attach listener
        window.addEventListener('mousemove', handleMouseMove);
        
        // Initial timer start
        handleMouseMove();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, []);

    // --- EFFECT: Resume Playback Logic ---
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Key for localStorage: "gogl_progress_{asset_id}"
        const storageKey = `gogl_progress_${asset.id}`;
        
        const loadSavedTime = () => {
            const savedTime = localStorage.getItem(storageKey);
            if (savedTime) {
                video.currentTime = parseFloat(savedTime);
            }
        };

        // When video metadata loads, jump to saved time
        video.addEventListener('loadedmetadata', loadSavedTime);

        // Save time every 5 seconds (or on standard timeupdate)
        const saveTime = () => {
            localStorage.setItem(storageKey, video.currentTime);
        };
        video.addEventListener('timeupdate', saveTime);

        return () => {
            video.removeEventListener('loadedmetadata', loadSavedTime);
            video.removeEventListener('timeupdate', saveTime);
        };
    }, [asset.id]);

    // --- HANDLERS ---
    
    const handleNext = () => {
        if (currentIndex < playlist.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    // Auto-play next video when current ends
    const handleVideoEnd = () => {
        // Clear progress for the finished video so next time it starts at 0
        localStorage.removeItem(`gogl_progress_${asset.id}`);
        
        if (currentIndex < playlist.length - 1) {
            handleNext();
        }
    };

    return (
        <div className="modal-overlay cinema-mode">
            <div className="cinema-wrapper" onClick={(e) => e.stopPropagation()}>
                
                {/* --- FADING HEADER --- */}
                <div className={`cinema-header ${showControls ? 'visible' : 'hidden'}`}>
                    <div className="cinema-title">
                        <h3>{asset.title}</h3>
                        <span className="cinema-subtitle">
                            File {currentIndex + 1} of {playlist.length}
                        </span>
                    </div>
                    <button className="cinema-close-btn" onClick={onClose}>×</button>
                </div>

                {/* --- VIDEO PLAYER --- */}
                <video 
                    ref={videoRef}
                    key={streamUrl} // Force React to re-mount video element on change
                    className="cinema-video"
                    controls 
                    autoPlay 
                    crossOrigin="anonymous"
                    onEnded={handleVideoEnd}
                >
                    <source src={streamUrl} type={asset.mime_type} />
                    Your browser does not support the video tag.
                </video>

                {/* --- PREV/NEXT OVERLAY BUTTONS (Optional, visual cues) --- */}
                <div className={`cinema-controls ${showControls ? 'visible' : 'hidden'}`}>
                    {currentIndex > 0 && (
                        <button className="nav-btn prev" onClick={handlePrev}>‹</button>
                    )}
                    {currentIndex < playlist.length - 1 && (
                        <button className="nav-btn next" onClick={handleNext}>›</button>
                    )}
                </div>
            </div>
        </div>
    );
}