import React, { useState, useEffect } from 'react';
import { renderIcon, iconKeys } from '../../utils/iconMap';
import { CreateTag, UpdateTag, GetAllTags, DeleteTag } from '../../../wailsjs/go/backend/App'; // <--- Import UpdateTag
import '../../styles/tags.css'; 
// Import Pencil icon for the edit button
import { Pencil } from 'lucide-react'; 

export default function TagSettings() {
    const [tags, setTags] = useState([]);
    
    // Form State
    const [formData, setFormData] = useState({ name: '', description: '', icon: 'tag' });
    
    // UI State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null); // null = Creating, Number = Editing

    useEffect(() => { loadTags(); }, []);

    const loadTags = () => {
        GetAllTags().then(res => setTags(res || []));
    };

    // --- HANDLERS ---

    const handleEditClick = (tag) => {
        setFormData({ 
            name: tag.name, 
            description: tag.description, 
            icon: tag.icon 
        });
        setEditingId(tag.id);
        setIsFormOpen(true);
    };

    const handleCancel = () => {
        setFormData({ name: '', description: '', icon: 'tag' });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleSubmit = () => {
        if (!formData.name) return;

        if (editingId) {
            // UPDATE EXISTING
            UpdateTag(editingId, formData.name, formData.description, formData.icon)
                .then(() => {
                    loadTags();
                    handleCancel();
                })
                .catch(err => alert("Update failed: " + err));
        } else {
            // CREATE NEW
            CreateTag(formData.name, formData.description, formData.icon)
                .then(() => {
                    loadTags();
                    handleCancel();
                })
                .catch(err => alert("Create failed: " + err));
        }
    };

    const handleDelete = (id) => {
        if (confirm("Delete this tag? It will be removed from all entries.")) {
            DeleteTag(id).then(loadTags);
        }
    };

    return (
        <div className="tag-settings-container">
            {/* 1. FORM SECTION (Create or Edit) */}
            <div className="setting-section">
                {!isFormOpen ? (
                    <button className="add-tag-btn-full" onClick={() => setIsFormOpen(true)}>
                        + Create New Tag
                    </button>
                ) : (
                    <div className="tag-form">
                        <h3>{editingId ? "Edit Tag" : "Create New Tag"}</h3>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                className="pro-input" 
                                style={{ flex: 1 }}
                                placeholder="Tag Name" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                            <input 
                                className="pro-input" 
                                style={{ flex: 2 }}
                                placeholder="Description" 
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                        
                        <label className="icon-label">Select Icon:</label>
                        <div className="icon-picker-grid">
                            {iconKeys.map(key => (
                                <div 
                                    key={key} 
                                    className={`icon-choice ${formData.icon === key ? 'selected' : ''}`}
                                    onClick={() => setFormData({...formData, icon: key})}
                                >
                                    {renderIcon(key, { size: 18 })}
                                </div>
                            ))}
                        </div>

                        <div className="form-actions">
                            <button className="save-btn" onClick={handleSubmit}>
                                {editingId ? "Update Tag" : "Create Tag"}
                            </button>
                            <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. TAG LIST */}
            <div className="tag-list-scroll" style={{ height: '400px', border: '1px solid #eee', borderRadius: '8px' }}>
                {tags.length === 0 && <p className="empty-text" style={{padding: '20px', textAlign:'center', color:'#999'}}>No tags found.</p>}
                
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
                        
                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button 
                                className="edit-mini-btn" 
                                onClick={() => handleEditClick(tag)}
                                title="Edit"
                            >
                                <Pencil size={16} />
                            </button>
                            <button 
                                className="delete-mini-btn" 
                                onClick={() => handleDelete(tag.id)}
                                title="Delete"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}