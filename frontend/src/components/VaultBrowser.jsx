import React, { useState } from 'react';
import { Folder, FileText, Image as ImageIcon, Film, Trash2, Upload, FolderPlus, ArrowLeft, Edit2 } from 'lucide-react';

export default function VaultBrowser({ 
    currentPath, files, folders, isLoading, navigateTo, navigateUp, 
    handleCreateFolder, handleUploadFile,
    handleDeleteFile, handleRenameFile, handleRenameFolder, handleDeleteFolder, 
    handleDropMove, handlePreview
}) {
    const [dragTarget, setDragTarget] = useState(null);

    // Robust Icon Checker
    const getFileIcon = (mimeType, filename) => {
        const mime = (mimeType || '').toLowerCase();
        const fname = (filename || '').toLowerCase();

        if (mime.startsWith('image/') || fname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return <ImageIcon size={40} color="#4CAF50" />;
        }
        if (mime.startsWith('video/') || fname.match(/\.(mp4|webm|mkv|avi)$/)) {
            return <Film size={40} color="#2196F3" />;
        }
        if (mime.includes('pdf') || fname.endsWith('.pdf')) {
            return <FileText size={40} color="#e74c3c" />; // Red for PDFs
        }
        if (mime.includes('epub') || fname.endsWith('.epub')) {
            return <FileText size={40} color="#9b59b6" />; // Purple for Books
        }
        return <FileText size={40} color="#888" />;
    };

    const pathParts = currentPath.split('/').filter(p => p !== '');

    if (isLoading) return <div className="vault-wrapper" style={{ justifyContent: 'center', alignItems: 'center' }}><h2>Loading Vault...</h2></div>;

    return (
        <div className="vault-wrapper">
            
            {/* --- HEADER --- */}
            <div className="vault-header">
                <div className="vault-breadcrumbs">
                    <span 
                        className="breadcrumb-segment" 
                        onClick={() => navigateTo('/', true)} 
                        style={{ color: currentPath === '/' ? 'var(--ui-header)' : 'var(--text-color)' }}
                    >
                        Vault
                    </span>
                    
                    {pathParts.map((part, index) => (
                        <React.Fragment key={index}>
                            <span className="breadcrumb-separator">/</span>
                            <span className="breadcrumb-segment" style={{ color: index === pathParts.length - 1 ? 'var(--ui-header)' : 'var(--text-color)' }}>
                                {part}
                            </span>
                        </React.Fragment>
                    ))}
                </div>

                <div className="vault-actions">
                    <button className="action-rect-btn" onClick={handleCreateFolder} style={{ background: 'white', color: 'var(--text-color)' }}>
                        <FolderPlus size={18} /> New Folder
                    </button>
                    <button className="action-rect-btn" onClick={handleUploadFile}>
                        <Upload size={18} /> Upload File
                    </button>
                </div>
            </div>
            
            <div className="vault-content custom-scrollbar">
                
                {/* --- "UP A LEVEL" BUTTON (DROP ZONE 1) --- */}
                {currentPath !== '/' && (
                    <div style={{ marginBottom: '20px' }}>
                        <button 
                            className="action-rect-btn" 
                            onClick={navigateUp} 
                            onDragOver={(e) => { e.preventDefault(); setDragTarget('UP'); }}
                            onDragLeave={() => setDragTarget(null)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragTarget(null);
                                const fileId = e.dataTransfer.getData('fileId');
                                handleDropMove(fileId, 'UP_ONE_LEVEL');
                            }}
                            style={{ 
                                padding: '6px 12px', 
                                background: dragTarget === 'UP' ? 'var(--ui-header)' : 'transparent', 
                                color: dragTarget === 'UP' ? 'white' : 'var(--text-color)', 
                                border: '1px solid var(--border-color)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <ArrowLeft size={16} /> Up a level
                        </button>
                    </div>
                )}

                {/* --- FOLDERS GRID (DROP ZONE 2) --- */}
                {folders.length > 0 && (
                    <>
                        <div className="vault-section-title">Folders</div>
                        <div className="vault-grid">
                            {folders.map(folder => (
                                <div 
                                    key={folder} 
                                    className="vault-item folder" 
                                    onClick={() => navigateTo(folder)}
                                    onDragOver={(e) => { e.preventDefault(); setDragTarget(folder); }}
                                    onDragLeave={() => setDragTarget(null)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragTarget(null);
                                        const fileId = e.dataTransfer.getData('fileId');
                                        handleDropMove(fileId, folder);
                                    }}
                                    style={{
                                        borderColor: dragTarget === folder ? 'var(--ui-header)' : 'var(--border-color)',
                                        background: dragTarget === folder ? '#fff0f3' : 'white',
                                        transform: dragTarget === folder ? 'scale(1.02)' : 'none'
                                    }}
                                >
                                    <Folder size={28} color="var(--ui-header)" fill="var(--ui-header)" style={{ opacity: 0.8 }} />
                                    <span className="vault-item-name" style={{ flexGrow: 1 }}>{folder}</span>
                                    
                                    <div className="vault-item-actions" onClick={(e) => e.stopPropagation()}>
                                        <button className="vault-action-btn" onClick={() => handleRenameFolder(folder)} title="Rename Folder">
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="vault-action-btn" onClick={() => handleDeleteFolder(folder)} title="Delete Folder & Contents">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* --- FILES GRID --- */}
                {files.length > 0 && (
                    <>
                        <div className="vault-section-title">Files</div>
                        <div className="vault-grid">
                            {files.map(file => (
                                <div 
                                    key={file.id} 
                                    className="vault-item file"
                                    draggable={true}
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('fileId', file.id);
                                        e.dataTransfer.effectAllowed = 'move';
                                    }}
                                    onDoubleClick={() => handlePreview(file)}
                                    style={{ cursor: 'pointer' }} 
                                >
                                    {getFileIcon(file.mime_type, file.filename)}
                                    
                                    <div style={{ width: '100%' }}>
                                        <div className="vault-item-name" title={file.filename}>{file.filename}</div>
                                        <div className="vault-item-meta">{(file.file_size / 1024 / 1024).toFixed(2)} MB</div>
                                    </div>

                                    <div className="vault-item-actions" onClick={(e) => e.stopPropagation()}>
                                        <button className="vault-action-btn" onClick={() => handleRenameFile(file.id, file.filename)} title="Rename File">
                                            <Edit2 size={14} />
                                        </button>
                                        <button className="vault-action-btn" onClick={() => handleDeleteFile(file.id)} title="Delete Permanently">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Empty State */}
                {folders.length === 0 && files.length === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh', color: '#aaa' }}>
                        <Folder size={64} style={{ opacity: 0.2, marginBottom: '20px' }} />
                        <h3>This folder is empty</h3>
                        <p>Drag and drop files here or use the Upload button.</p>
                    </div>
                )}

            </div>
        </div>
    );
}