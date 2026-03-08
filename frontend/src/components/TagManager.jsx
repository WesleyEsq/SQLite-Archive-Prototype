import React, { useState, useEffect } from 'react';
import { renderIcon, iconKeys } from '../utils/iconMap';
import { CreateTag, GetAllTags, DeleteTag } from '../../wailsjs/go/backend/App';

export default function TagManager({ onClose }) {
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState({ name: '', description: '', icon: 'tag' });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = () => {
        GetAllTags().then(res => setTags(res || []));
    };

    const handleCreate = () => {
        if (!newTag.name) return;
        CreateTag(newTag.name, newTag.description, newTag.icon)
            .then(() => {
                loadTags();
                setNewTag({ name: '', description: '', icon: 'tag' });
                setIsCreating(false);
            })
            .catch(err => alert(err));
    };

    const handleDelete = (id) => {
        if (confirm("Delete this tag? It will be removed from all entries.")) {
            DeleteTag(id).then(loadTags);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="pro-modal" style={{ width: '600px' }}>
                <div className="pro-modal-header">
                    <h2>Manage Tags</h2>
                    <button className="close-x-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="tag-manager-content">
                    {/* --- Tag List --- */}
                    <div className="tag-list-scroll">
                        {tags.length === 0 && <p className="empty-text">No tags created yet.</p>}
                        {tags.map(tag => (
                            <div key={tag.id} className="tag-row-item">
                                <div className="tag-icon-preview">
                                    {renderIcon(tag.icon, { size: 20, color: 'var(--ui-header)' })}
                                </div>
                                <div className="tag-info">
                                    <span className="tag-name">{tag.name}</span>
                                    <span className="tag-desc">{tag.description}</span>
                                </div>
                                <div className="tag-count-badge">{tag.count} uses</div>
                                <button className="delete-mini-btn" onClick={() => handleDelete(tag.id)}>×</button>
                            </div>
                        ))}
                    </div>

                    {/* --- Creator Form --- */}
                    <div className="tag-creator-section">
                        {!isCreating ? (
                            <button className="add-tag-btn-full" onClick={() => setIsCreating(true)}>
                                + Create New Tag
                            </button>
                        ) : (
                            <div className="tag-form">
                                <h3>New Tag</h3>
                                <input 
                                    className="pro-input" 
                                    placeholder="Tag Name (e.g. 'Fantasy')" 
                                    value={newTag.name}
                                    onChange={e => setNewTag({...newTag, name: e.target.value})}
                                />
                                <input 
                                    className="pro-input" 
                                    placeholder="Short Description" 
                                    value={newTag.description}
                                    onChange={e => setNewTag({...newTag, description: e.target.value})}
                                />
                                
                                <label className="icon-label">Select Icon:</label>
                                <div className="icon-picker-grid">
                                    {iconKeys.map(key => (
                                        <div 
                                            key={key} 
                                            className={`icon-choice ${newTag.icon === key ? 'selected' : ''}`}
                                            onClick={() => setNewTag({...newTag, icon: key})}
                                            title={key}
                                        >
                                            {renderIcon(key, { size: 18 })}
                                        </div>
                                    ))}
                                </div>

                                <div className="form-actions">
                                    <button className="save-btn" onClick={handleCreate}>Create</button>
                                    <button className="cancel-btn" onClick={() => setIsCreating(false)}>Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}