// src/controllers/SeriesDetailController.jsx
import React from 'react';
import { useSeriesDetail } from '../hooks/useSeriesDetail';
import SeriesDetail from '../components/SeriesDetail';

export default function SeriesDetailController({ entry, onBack }) {
    // 1. Fetch State & Handlers from the Hook
    const seriesState = useSeriesDetail(entry.id);

    // 2. Pure Logic: Robust File Type Checker (Moved from Component)
    const getAssetType = (asset) => {
        const mime = (asset.mime_type || '').toLowerCase();
        const fname = (asset.filename || '').toLowerCase();
        
        const isVideo = mime.startsWith('video/') || fname.endsWith('.mp4') || fname.endsWith('.webm') || fname.endsWith('.mkv');
        const isPdf = mime.includes('pdf') || fname.endsWith('.pdf');
        const isEpub = mime.includes('epub') || fname.endsWith('.epub');
        
        return { isVideo, isPdf, isEpub, canView: isVideo || isPdf || isEpub };
    };

    // 3. Render the Pure UI Component
    return (
        <SeriesDetail 
            entry={entry} 
            onBack={onBack} 
            getAssetType={getAssetType}
            {...seriesState} // Spreads groups, assets, toggles, view handlers, etc.
        />
    );
}