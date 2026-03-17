// src/components/entry-list/EntryTagDisplay.jsx
import React, { useState } from 'react';
import { renderIcon } from '../../utils/iconMap';

export default function EntryTagDisplay({ entryId, entryTags, setTagModalTarget }) {
    // 1. ADD STATE: Track if the user clicked the overflow pill
    const [isExpanded, setIsExpanded] = useState(false); 
    
    const tags = entryTags[entryId] || [];
    
    if (tags.length === 0) return (
        <div className="tag-row-display" style={{ marginBottom: '15px' }}>
            <button className="add-tag-tiny-btn" onClick={(e) => { e.stopPropagation(); setTagModalTarget(entryId); }}>+ Tag</button>
        </div>
    );

    const displayLimit = 5;
    // 2. LOGIC: If expanded, show all tags. If not, slice them.
    const visibleTags = isExpanded ? tags : tags.slice(0, displayLimit);
    const remaining = tags.length - displayLimit;

    return (
        <div className="tag-row-display" style={{ marginBottom: '15px' }}>
            {visibleTags.map(tag => (
                <span key={tag.id} className="mini-tag-pill" title={tag.description}>
                    {renderIcon(tag.icon, { size: 12, style: {marginRight: 4} })}
                    {tag.name}
                </span>
            ))}
            
            {/* 3. OVERFLOW PILL: Add onClick to expand */}
            {!isExpanded && remaining > 0 && (
                <span 
                    className="mini-tag-pill more" 
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                    style={{ cursor: 'pointer' }}
                    title="View all tags"
                >
                    +{remaining}
                </span>
            )}

            {/* 4. COLLAPSE PILL: Let them hide it again if they want! */}
            {isExpanded && remaining > 0 && (
                <span 
                    className="mini-tag-pill more" 
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                    style={{ cursor: 'pointer' }}
                    title="Show fewer tags"
                >
                    - Less
                </span>
            )}
            
            <button className="add-tag-tiny-btn" onClick={(e) => { e.stopPropagation(); setTagModalTarget(entryId); }}>+ Tag</button>
        </div>
    );
}