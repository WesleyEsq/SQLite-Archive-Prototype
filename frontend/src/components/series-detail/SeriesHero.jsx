import React from 'react';
import ReactMarkdown from 'react-markdown'; 
import { ArrowLeft, Tv, BookOpen } from 'lucide-react';

export default function SeriesHero({ entry, groups, onBack }) {
    return (
        <div className="series-hero">
            <button className="back-button-floating" onClick={onBack}>
                <ArrowLeft size={20} /> Back
            </button>
            
            <div className="hero-content">
                <img 
                    src={`/images/${entry.id}?t=${Date.now()}`} 
                    className="hero-poster" 
                    alt={entry.title} 
                    onError={(e) => {
                        e.target.src = '/default-cover.png'; 
                        e.target.style.opacity = '0.5';
                    }} 
                />
                
                <div className="hero-info">
                    <h1 className="hero-title">{entry.title}</h1>
                    
                    <div className="hero-meta-row">
                        <span className={`rank-badge rank-${entry.rank.charAt(0)}`}>
                            {entry.rank}
                        </span>
                        <span className="meta-pill">#{entry.number}</span>
                        <span className="meta-icon">
                            {groups.some(g => g.title.toLowerCase().includes('season')) ? <Tv size={16}/> : <BookOpen size={24}/>}
                        </span>
                    </div>
                    
                    <div className="hero-description markdown-content" style={{ textAlign: entry.textAlignment || 'left' }}>
                        <ReactMarkdown>{entry.description || "*No description provided.*"}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}