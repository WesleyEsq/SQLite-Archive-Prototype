import React, { useState, useEffect } from 'react';
// IMPORTANTE: Asegúrate de importar CreateLibrary
import { GetLibrary, UpdateLibrary, SetLibraryCover, CreateLibrary } from '../../wailsjs/go/backend/App';
import { Pencil, BookOpen } from 'lucide-react';

export default function CompendiumView({ libraryId }) {
    const [data, setData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    
    // Nuevos estados para manejar la carga inicial y bases de datos vacías
    const [isLoading, setIsLoading] = useState(true);
    const [isNewSetup, setIsNewSetup] = useState(false);

    useEffect(() => {
        if (libraryId) refreshData();
    }, [libraryId]);

    const refreshData = () => {
        setIsLoading(true);
        GetLibrary(libraryId).then(result => {
            if (result && result.id) {
                setData(result);
                setFormData(result);
                setIsNewSetup(false);
            } else {
                setIsNewSetup(true);
            }
        }).catch(err => {
            console.warn("Library not found or DB empty, triggering setup.");
            setIsNewSetup(true);
        }).finally(() => {
            setIsLoading(false);
        });
    };

    // Función para manejar la creación de la primera librería
    const handleCreateFirstLibrary = () => {
        if (!formData.name) return alert("Please provide a Library Name");
        
        // Creamos la librería. Al ser la primera, tomará automáticamente el ID 1 en SQLite
        CreateLibrary(formData.name, "Main")
            .then(() => {
                // Si también escribió autor o descripción, hacemos un update rápido
                if (formData.author || formData.description) {
                    return UpdateLibrary({ id: 1, name: formData.name, author: formData.author, description: formData.description, type: "Main" });
                }
            })
            .then(() => {
                refreshData(); // Recargamos para quitar la pantalla de setup
            })
            .catch(err => alert("Failed to initialize system: " + err));
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

    if (isLoading) return <div className="loading-state">Loading Compendium...</div>;

    // --- PANTALLA DE CONFIGURACIÓN INICIAL (FIRST-TIME SETUP) ---
    if (isNewSetup) {
        return (
            <div className="about-container custom-scrollbar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px' }}>
                <div className="pro-modal" style={{ width: '600px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                    <div className="pro-modal-header" style={{ justifyContent: 'center' }}>
                        <h2><BookOpen size={24} style={{ marginRight: '10px', verticalAlign: 'middle' }}/> Initialize Your Compendium</h2>
                    </div>
                    <div className="pro-modal-body" style={{ flexDirection: 'column' }}>
                        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                            Welcome! It looks like this is your first time here or the database is completely empty. Let's set up your primary library workspace.
                        </p>
                        
                        <div className="form-group">
                            <label>Library Name (Required)</label>
                            <input 
                                placeholder="e.g., My Digital Vault"
                                value={formData.name || ""} 
                                onChange={e => setFormData({...formData, name: e.target.value})} 
                                className="pro-input large"
                            />
                        </div>
                        <div className="form-group">
                            <label>Author / Curator (Optional)</label>
                            <input 
                                placeholder="Your Name"
                                value={formData.author || ""} 
                                onChange={e => setFormData({...formData, author: e.target.value})} 
                                className="pro-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Description (Optional)</label>
                            <textarea 
                                placeholder="A brief description of what this collection holds..."
                                value={formData.description || ""} 
                                onChange={e => setFormData({...formData, description: e.target.value})} 
                                className="pro-input"
                                rows="4"
                            />
                        </div>
                        
                        <button 
                            className="action-rect-btn" 
                            style={{ alignSelf: 'center', marginTop: '20px', width: '100%', justifyContent: 'center', padding: '15px' }}
                            onClick={handleCreateFirstLibrary}
                        >
                            Create Workspace
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- PANTALLA NORMAL DEL COMPENDIUM (El código que ya tenías) ---
    const coverUrl = `/images/library/${libraryId}?t=${formData._t || Date.now()}`;

    return (
        <div className="about-container custom-scrollbar">
            {/* ... Todo el resto de tu código original para el banner, imagen, texto y modal de edición ... */}
            
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

            {/* --- PROFESSIONAL EDIT MODAL --- */}
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