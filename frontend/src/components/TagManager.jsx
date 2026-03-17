import React from 'react';
import { renderIcon, iconKeys } from '../utils/iconMap';

export default function TagManager({ 
    tags, formData, setFormData, isFormOpen, editingId, 
    handleOpenCreate, handleOpenEdit, handleSave, handleCancel, handleDelete, onClose 
}) {
    return (
        <div className="modal-overlay">
            <div className="pro-modal" style={{ width: '600px' }}>
                <div className="pro-modal-header">
                    <h2>Manage Tags</h2>
                    <button className="close-x-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="pro-modal-body">
                    {/* --- TAG LIST --- */}
                    <div className="tag-list-section">
                        {tags.map(tag => (
                            <div key={tag.id} className="tag-list-item">
                                <div className="tag-info">
                                    <span className="tag-icon">{renderIcon(tag.icon, { size: 16 })}</span>
                                    <div className="tag-text">
                                        <div className="tag-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {tag.name}
                                            {tag.isCategory && <span style={{ fontSize: '0.7em', background: 'var(--ui-header)', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>Category</span>}
                                        </div>
                                        <div className="tag-desc">{tag.description}</div>
                                    </div>
                                </div>
                                <div className="tag-actions" style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        className="edit-tag-btn" 
                                        onClick={() => handleOpenEdit(tag)}
                                        style={{ padding: '4px 8px', background: 'transparent', border: '1px solid var(--ui-header)', color: 'var(--ui-header)', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Edit
                                    </button>
                                    <button className="delete-tag-btn" onClick={() => handleDelete(tag.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- UNIFIED FORM (Create & Edit) --- */}
                    <div className="tag-create-section">
                        {!isFormOpen ? (
                            <button className="create-new-tag-btn" onClick={handleOpenCreate}>+ Create New Tag</button>
                        ) : (
                            <div className="tag-form">
                                <h3 style={{ marginTop: 0, color: 'var(--ui-header)' }}>
                                    {editingId ? "Edit Tag" : "Create New Tag"}
                                </h3>
                                
                                <input 
                                    placeholder="Tag Name" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    autoFocus
                                />
                                <input 
                                    placeholder="Description (Optional)" 
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                                
                                <label className="icon-label">Select Icon:</label>
                                <div className="icon-picker-grid">
                                    {iconKeys.map(key => (
                                        <div 
                                            key={key} 
                                            className={`icon-choice ${formData.icon === key ? 'selected' : ''}`}
                                            onClick={() => setFormData({...formData, icon: key})}
                                            title={key}
                                        >
                                            {renderIcon(key, { size: 18 })}
                                        </div>
                                    ))}
                                </div>

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
                                    <button className="save-btn" onClick={handleSave}>
                                        {editingId ? "Update Tag" : "Create"}
                                    </button>
                                    <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}