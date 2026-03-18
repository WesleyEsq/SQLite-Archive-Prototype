import React from 'react';
import ReactMarkdown from 'react-markdown'; 
import { ArrowLeft, Tv, BookOpen } from 'lucide-react';

export default function SeriesHero({ entry, groups, onBack }) {
    const coverUrl = `/images/${entry.id}?t=${Date.now()}`;
    const isShow = groups.some(g => g.title.toLowerCase().includes('season'));

    return (
        <div className="series-hero">
            
            {/* --- DYNAMIC BLURRED BACKDROP --- */}
            <div 
                className="hero-backdrop" 
                style={{ backgroundImage: `url(${coverUrl})` }}
            />
            <div className="hero-backdrop-overlay" />

            {/* --- CONTENT --- */}
            <button className="back-button-floating" onClick={onBack}>
                <ArrowLeft size={20} /> Back
            </button>
            
            <div className="hero-content">
                <img 
                    src={coverUrl} 
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
                        {entry.rank && (
                            <span className={`rank-badge rank-${entry.rank.charAt(0)}`} style={{ fontSize: '1rem', padding: '6px 12px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                                {entry.rank}
                            </span>
                        )}
                        <span className="meta-pill">#{entry.number}</span>
                        <span className="meta-pill">
                            {isShow ? <Tv size={16}/> : <BookOpen size={16}/>}
                            {isShow ? 'Show' : 'Book'}
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