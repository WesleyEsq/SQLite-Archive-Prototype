import React from 'react';
import { Folder, FileText, Image as ImageIcon, Film, Trash2, Upload, FolderPlus, ArrowLeft, Edit2 } from 'lucide-react';

export default function VaultBrowser({ 
    currentPath, files, folders, isLoading, navigateTo, navigateUp, 
    handleCreateFolder, handleUploadFile,
    handleDeleteFile, handleRenameFile, handleRenameFolder, handleDeleteFolder // <-- New Props
}) {
    const getFileIcon = (mimeType) => {
        if (!mimeType) return <FileText size={40} color="#888" />;
        if (mimeType.startsWith('image/')) return <ImageIcon size={40} color="#4CAF50" />;
        if (mimeType.startsWith('video/')) return <Film size={40} color="#2196F3" />;
        return <FileText size={40} color="#888" />;
    };

    const pathParts = currentPath.split('/').filter(p => p !== '');

    if (isLoading) return <div className="vault-wrapper" style={{ justifyContent: 'center', alignItems: 'center' }}><h2>Loading Vault...</h2></div>;

    return (
        <div className="vault-wrapper">
            
            {/* ... HEADER CODE REMAINS THE SAME ... */}
            
            <div className="vault-content custom-scrollbar">
                
                {/* Back Button */}
                {currentPath !== '/' && (
                    <div style={{ marginBottom: '20px' }}>
                        <button className="action-rect-btn" onClick={navigateUp} style={{ padding: '6px 12px', background: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}>
                            <ArrowLeft size={16} /> Up a level
                        </button>
                    </div>
                )}

                {/* --- FOLDERS GRID --- */}
                {folders.length > 0 && (
                    <>
                        <div className="vault-section-title">Folders</div>
                        <div className="vault-grid">
                            {folders.map(folder => (
                                <div key={folder} className="vault-item folder" onClick={() => navigateTo(folder)}>
                                    <Folder size={28} color="var(--ui-header)" fill="var(--ui-header)" style={{ opacity: 0.8 }} />
                                    <span className="vault-item-name" style={{ flexGrow: 1 }}>{folder}</span>
                                    
                                    {/* FOLDER HOVER ACTIONS */}
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
                                <div key={file.id} className="vault-item file">
                                    {getFileIcon(file.mime_type)}
                                    
                                    <div style={{ width: '100%' }}>
                                        <div className="vault-item-name" title={file.filename}>{file.filename}</div>
                                        {/* NaN BUG FIX: Changed file.size_bytes to file.file_size */}
                                        <div className="vault-item-meta">{(file.file_size / 1024 / 1024).toFixed(2)} MB</div>
                                    </div>

                                    {/* FILE HOVER ACTIONS */}
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