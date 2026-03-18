import React, { useState, useEffect, useRef } from 'react';
import { HistoryManager } from '../../utils/HistoryManager'; // <-- The missing import!

export default function MediaPlayer({ playlist, startIndex, entry, onClose }) { // <-- Accept entry prop
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [showControls, setShowControls] = useState(true);
    
    const videoRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const asset = playlist[currentIndex];

    // 1. Build the Stream URL (Sidecar Server)
    const streamUrl = `http://localhost:40001/stream/${asset.id}/${encodeURIComponent(asset.filename)}`;

    // --- EFFECT: Handle Mouse Movement (Fade UI) ---
    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
        };

        window.addEventListener('mousemove', handleMouseMove);
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

        // 1. Load the saved time from the Global History Manager
        const loadSavedTime = () => {
            const history = HistoryManager.getHistory();
            const savedItem = history.find(h => h.fileId === asset.id);
            if (savedItem && savedItem.resumeData) {
                video.currentTime = parseFloat(savedItem.resumeData);
            }
        };

        // 2. Save the time AND calculate the percentage!
        const saveTime = () => {
            if (video.duration) {
                const percentage = (video.currentTime / video.duration) * 100;
                HistoryManager.saveProgress(asset, entry, percentage, 'video', video.currentTime);
            }
        };

        video.addEventListener('loadedmetadata', loadSavedTime);
        video.addEventListener('timeupdate', saveTime);

        return () => {
            video.removeEventListener('loadedmetadata', loadSavedTime);
            video.removeEventListener('timeupdate', saveTime);
        };
    }, [asset.id, entry]); // <-- Added entry to dependency array

    // --- HANDLERS ---
    const handleNext = () => {
        if (currentIndex < playlist.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const handleVideoEnd = () => {
        // Clear progress when finished so it drops off the "Continue" row
        HistoryManager.clearProgress(asset.id);
        if (currentIndex < playlist.length - 1) handleNext();
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

                {/* --- VIDEO PLAYER FIXED --- */}
                <video 
                    ref={videoRef}
                    key={streamUrl} 
                    className="cinema-video"
                    controls 
                    autoPlay 
                    onEnded={handleVideoEnd}
                >
                    <source src={streamUrl} />
                    Your browser does not support the video tag.
                </video>

                {/* --- PREV/NEXT OVERLAY BUTTONS --- */}
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