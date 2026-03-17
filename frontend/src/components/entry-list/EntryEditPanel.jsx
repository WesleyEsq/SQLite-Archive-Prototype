import React from 'react';

export default function EntryEditPanel({ editForm, handleUpdateCover, handleAlignment, handleChange }) {
    return (
        <div className="details-panel edit-mode">
            <div className="edit-image-section">
                <img 
                    src={`/images/${editForm.id}?t=${Date.now()}`} 
                    className="details-image" 
                    alt="Cover" 
                    onError={(e) => { e.target.src = '/default-cover.png'; }}
                />
                <button className="file-upload-btn" onClick={(e) => handleUpdateCover(e, editForm.id)}>
                    Change Cover (OS)
                </button>
            </div>
            <div className="edit-text-section">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <label style={{fontWeight:'bold', color:'var(--ui-header)'}}>Description (Markdown)</label>
                    <div className="alignment-controls">
                        {['left', 'center', 'right', 'justify'].map(align => (
                            <button key={align} className={`align-btn ${editForm.textAlignment === align ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleAlignment(align); }}>
                                {align === 'justify' ? '≡' : align === 'left' ? '⇤' : align === 'right' ? '⇥' : '↔'}
                            </button>
                        ))}
                    </div>
                </div>
                <textarea name="description" value={editForm.description || ''} onChange={handleChange} rows="8" placeholder="Markdown supported..." style={{fontFamily: 'monospace'}}/>
            </div>
        </div>
    );
}