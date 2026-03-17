import React, { useState, useEffect } from 'react';
import { renderIcon, iconKeys } from '../../utils/iconMap';
import { backend } from '../../services/controller'; // <-- Updated to use the Services Layer
import { Pencil } from 'lucide-react'; 

export default function TagSettings() {
    const [tags, setTags] = useState([]);
    
    // 1. ADDED: isCategory to the default form state
    const [formData, setFormData] = useState({ name: '', description: '', icon: 'tag', isCategory: false });
    
    // UI State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null); 

    useEffect(() => { loadTags(); }, []);

    const loadTags = () => {
        backend.tags.getAll().then(res => setTags(res || []));
    };

    // --- HANDLERS ---

    const handleEditClick = (tag) => {
        setFormData({ 
            name: tag.name, 
            description: tag.description, 
            icon: tag.icon,
            isCategory: tag.isCategory || false // 2. Load existing state
        });
        setEditingId(tag.id);
        setIsFormOpen(true);
    };

    const handleCancel = () => {
        // 3. Reset state
        setFormData({ name: '', description: '', icon: 'tag', isCategory: false });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleSubmit = () => {
        if (!formData.name) return;

        if (editingId) {
            // 4. Pass isCategory to Update
            backend.tags.update(editingId, formData.name, formData.description, formData.icon, formData.isCategory)
                .then(() => {
                    loadTags();
                    handleCancel();
                })
                .catch(err => alert("Update failed: " + err));
        } else {
            // 5. Pass isCategory to Create
            backend.tags.create(formData.name, formData.description, formData.icon, formData.isCategory)
                .then(() => {
                    loadTags();
                    handleCancel();
                })
                .catch(err => alert("Create failed: " + err));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this tag? It will be removed from all entries.")) {
            backend.tags.delete(id).then(loadTags);
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

                        {/* 6. THE NEW CHECKBOX UI */}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--ui-header)' }}>
                            <input 
                                type="checkbox" 
                                checked={formData.isCategory}
                                onChange={e => setFormData({...formData, isCategory: e.target.checked})}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            Display as a Library Category Row
                        </label>

                        <div className="form-actions" style={{ marginTop: '20px' }}>
                            <button className="save-btn" onClick={handleSubmit}>
                                {editingId ? "Update Tag" : "Create Tag"}
                            </button>
                            <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>

            {/* 2. TAG LIST */}
            <div className="tag-list-scroll" style={{ height: '400px', border: '1px solid #eee', borderRadius: '8px', overflowY: 'auto' }}>
                {tags.length === 0 && <p className="empty-text" style={{padding: '20px', textAlign:'center', color:'#999'}}>No tags found.</p>}
                
                {tags.map(tag => (
                    <div key={tag.id} className="tag-row-item">
                        <div className="tag-icon-preview">
                            {renderIcon(tag.icon, { size: 20, color: 'var(--ui-header)' })}
                        </div>
                        
                        <div className="tag-info">
                            {/* 7. VISUAL BADGE FOR CATEGORIES */}
                            <span className="tag-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {tag.name}
                                {tag.isCategory && <span style={{ fontSize: '0.7em', background: 'var(--ui-header)', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>Category</span>}
                            </span>
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