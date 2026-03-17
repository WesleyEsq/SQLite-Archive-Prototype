import React from 'react';
import { renderIcon, iconKeys } from '../utils/iconMap';

export default function TagManager({ 
    tags, newTag, setNewTag, isCreating, setIsCreating, handleCreate, handleDelete, onClose 
}) {
    return (
        <div className="modal-overlay">
            <div className="pro-modal" style={{ width: '600px' }}>
                <div className="pro-modal-header">
                    <h2>Manage Tags</h2>
                    <button className="close-x-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="pro-modal-body">
                    <div className="tag-list-section">
                        {tags.map(tag => (
                            <div key={tag.id} className="tag-list-item">
                                <div className="tag-info">
                                    <span className="tag-icon">{renderIcon(tag.icon, { size: 16 })}</span>
                                    <div className="tag-text">
                                        <div className="tag-name">{tag.name}</div>
                                        <div className="tag-desc">{tag.description}</div>
                                    </div>
                                </div>
                                <button className="delete-tag-btn" onClick={() => handleDelete(tag.id)}>Delete</button>
                            </div>
                        ))}
                    </div>

                    <div className="tag-create-section">
                        {!isCreating ? (
                            <button className="create-new-tag-btn" onClick={() => setIsCreating(true)}>+ Create New Tag</button>
                        ) : (
                            <div className="tag-form">
                                <input 
                                    placeholder="Tag Name" 
                                    value={newTag.name}
                                    onChange={e => setNewTag({...newTag, name: e.target.value})}
                                    autoFocus
                                />
                                <input 
                                    placeholder="Description (Optional)" 
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