import React, { useState, useEffect } from 'react';
import { GetAllTags, UpdateEntryTags } from '../../wailsjs/go/backend/App';
import { renderIcon } from '../utils/iconMap';
import { X, Check } from 'lucide-react';

export default function TagSelectorModal({ entryId, currentTags, onClose, onSave }) {
    const [allTags, setAllTags] = useState([]);
    // We store just the IDs of the selected tags
    const [selectedIds, setSelectedIds] = useState(new Set(currentTags.map(t => t.id)));

    useEffect(() => {
        GetAllTags().then(res => setAllTags(res || []));
    }, []);

    const toggleTag = (tagId) => {
        const next = new Set(selectedIds);
        if (next.has(tagId)) {
            next.delete(tagId);
        } else {
            next.add(tagId);
        }
        setSelectedIds(next);
    };

    const handleSave = () => {
        // Convert Set to Array for Go
        const tagArray = Array.from(selectedIds);
        UpdateEntryTags(entryId, tagArray)
            .then(() => {
                onSave(); // Trigger refresh in parent
                onClose();
            })
            .catch(err => alert("Failed to save tags: " + err));
    };

    return (
        <div className="modal-overlay">
            <div className="pro-modal" style={{ width: '700px' }}>
                <div className="pro-modal-header">
                    <h2>Manage Tags</h2>
                    <button className="close-x-btn" onClick={onClose}><X size={20}/></button>
                </div>
                
                <div className="tag-selector-grid">
                    {allTags.map(tag => {
                        const isSelected = selectedIds.has(tag.id);
                        return (
                            <div 
                                key={tag.id} 
                                className={`tag-select-card ${isSelected ? 'active' : ''}`}
                                onClick={() => toggleTag(tag.id)}
                            >
                                <div className="tag-icon-circle">
                                    {isSelected ? <Check size={16} /> : renderIcon(tag.icon, { size: 16 })}
                                </div>
                                <span className="tag-name">{tag.name}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="pro-modal-footer">
                    <button className="save-btn" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
}