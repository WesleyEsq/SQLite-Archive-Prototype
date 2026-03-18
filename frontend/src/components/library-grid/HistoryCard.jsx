import React from 'react';
import { PlayCircle, FileText, BookOpen, Image as ImageIcon } from 'lucide-react';

export default function HistoryCard({ historyItem, onResume }) {
    
    const getTypeIcon = () => {
        if (historyItem.type === 'video') return <PlayCircle size={28} />;
        if (historyItem.type === 'pdf') return <FileText size={28} />;
        if (historyItem.type === 'epub') return <BookOpen size={28} />;
        if (historyItem.type === 'image') return <ImageIcon size={28} />; // <-- Added Image support
        return <PlayCircle size={28} />;
    };

    return (
        <div className="history-card-mini" onClick={() => onResume(historyItem)}>
            
            {/* The watermark icon in the top right */}
            <div className="history-card-play-icon-mini">
                {getTypeIcon()}
            </div>
            
            <h4 className="history-card-mini-title" title={historyItem.filename}>
                {historyItem.filename}
            </h4>
            
            <div className="history-card-mini-meta" title={historyItem.entryTitle}>
                {historyItem.entryTitle}
            </div>

            {/* The Percentage & Progress Bar */}
            <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--ui-header)', marginBottom: '5px' }}>
                    <span>Resume</span>
                    <span>{Math.round(historyItem.percentage)}%</span>
                </div>

                <div className="history-progress-mini-bg">
                    <div className="history-progress-mini-fill" style={{ width: `${historyItem.percentage}%` }}></div>
                </div>
            </div>

        </div>
    );
}