import React, { useState, useEffect } from 'react';
import { GetLibrary, UpdateLibrary, SetLibraryCover } from '../../wailsjs/go/backend/App';
import { Pencil } from 'lucide-react'; // <-- Add this import

export default function CompendiumView({ libraryId }) {
    const [data, setData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (libraryId) refreshData();
    }, [libraryId]);

    const refreshData = () => {
        GetLibrary(libraryId).then(result => {
            setData(result);
            setFormData(result);
        }).catch(console.error);
    };

    const handleSave = () => {
        UpdateLibrary(formData).then(() => {
            refreshData();
            setIsEditing(false);
        }).catch(err => alert("Failed to save: " + err));
    };

    const handleUpdateCover = async () => {
        try {
            await SetLibraryCover(libraryId);
            setFormData(prev => ({ ...prev, _t: Date.now() })); 
        } catch (err) {
            console.error("Failed to update cover:", err);
        }
    };

    if (!data) return <div className="loading-state">Loading...</div>;

    const coverUrl = `/images/library/${libraryId}?t=${formData._t || Date.now()}`;

    return (
        <div className="about-container custom-scrollbar">
            
            {/* 1. THE DYNAMIC CRIMSON BANNER */}
            <div className="about-hero-banner">
                <div className="about-hero-backdrop" style={{ backgroundImage: `url(${coverUrl})` }} />
                <div className="about-hero-overlay" />
            </div>

            {/* 2. THE CENTERPIECE (Pulled up via negative margin) */}
            <div className="about-content-wrapper">
                <img 
                    src={coverUrl} 
                    alt={data.name} 
                    className="about-cover-image" 
                    onError={(e) => { e.target.src = '/default-cover.png'; }}
                />

                {/* 3. GRAND TYPOGRAPHY */}
                <div className="about-header-text">
                    <h1>{data.name}</h1>
                    <h3>Curated by {data.author || "Unknown"}</h3>
                    
                    <button className="about-edit-btn" onClick={() => setIsEditing(true)} title="Edit Library Details">
                        <Pencil size={20} />
                    </button>
                </div>

                {/* 4. THE PREFACE */}
                <div className="about-description-area">
                    {data.description ? (
                        data.description.split('\n').map((paragraph, index) => (
                            <p key={index} style={{ marginBottom: '1.2em' }}>{paragraph}</p>
                        ))
                    ) : (
                        <p style={{ fontStyle: 'italic', color: '#999', textAlign: 'center' }}>
                            Welcome to your digital library. Click the edit button above to add a description.
                        </p>
                    )}
                </div>
            </div>

            {/* --- PROFESSIONAL EDIT MODAL (Unchanged) --- */}
            {isEditing && (
                <div className="modal-overlay">
                    <div className="modal-content pro-modal">
                        <div className="pro-modal-header">
                            <h2>Edit Compendium Details</h2>
                            <button className="close-x-btn" onClick={() => setIsEditing(false)}>×</button>
                        </div>
                        
                        <div className="pro-modal-body">
                            {/* LEFT COLUMN: IMAGE */}
                            <div className="pro-modal-image-col">
                                <label>Cover Art</label>
                                <div className="image-preview-wrapper">
                                    <img 
                                        src={coverUrl} 
                                        alt="Preview" 
                                        onError={(e) => { e.target.src = '/default-cover.png'; }}
                                    />
                                    <div className="image-overlay-actions">
                                        <button className="upload-btn" onClick={handleUpdateCover} style={{cursor: 'pointer'}}>
                                            Change Image (OS)
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: FORM */}
                            <div className="pro-modal-form-col">
                                <div className="form-group">
                                    <label>Library Name</label>
                                    <input 
                                        value={formData.name || ""} 
                                        onChange={e => setFormData({...formData, name: e.target.value})} 
                                        className="pro-input large"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Author / Curator</label>
                                    <input 
                                        value={formData.author || ""} 
                                        onChange={e => setFormData({...formData, author: e.target.value})} 
                                        className="pro-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea 
                                        value={formData.description || ""} 
                                        onChange={e => setFormData({...formData, description: e.target.value})} 
                                        className="pro-input"
                                        rows="8"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pro-modal-footer">
                            <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button className="save-btn" onClick={handleSave}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}