import React from 'react';
import ReactMarkdown from 'react-markdown'; 
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useSeriesDetail } from '../hooks/useSeriesDetail'; // <--- Import the Controller

import MediaPlayer from './MediaPlayer';
import PDFViewer from './PDFViewer';
import EpubViewer from './EpubViewer';

export default function SeriesDetail({ entry, onBack }) {
    // 1. Initialize the Controller
    const {
        groups, assets, expandedGroupId, uploadingGroupId, uploadProgress, viewerContext,
        toggleGroup, handleCreateGroup, handleDeleteGroup, handleFileUpload, 
        handleDragEnd, handleDownload, handleDeleteAsset, handleView, closeViewer
    } = useSeriesDetail(entry.id);

    return (
        <div className="series-detail-container">
            {/* --- HERO SECTION --- */}
            <div className="series-hero">
                <button className="back-button-floating" onClick={onBack}>← Back</button>
                <div className="hero-content">
                    <img src={`data:image/jpeg;base64,${entry.image}`} className="hero-poster" alt="Poster" />
                    <div className="hero-info">
                        <h1 className="hero-title">{entry.title}</h1>
                        <div className="hero-meta-row">
                            <span className={`rank-badge rank-${entry.rank.charAt(0)}`}>Rank {entry.rank}</span>
                            <span className="meta-pill">Ordered as #{entry.number}</span>
                        </div>
                        <div className="hero-description markdown-content" style={{ textAlign: entry.textAlignment || 'left' }}>
                            <ReactMarkdown>{entry.description || "*No description provided.*"}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>

            <div className="content-separator">
                <h2>Media Collections</h2>
                <button className="add-collection-btn" onClick={handleCreateGroup}>+ New Collection</button>
            </div>

            {/* --- DRAG CONTEXT --- */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="collections-grid">
                    {groups.length === 0 && (
                        <div className="empty-collections-state">
                            <p>No volumes or seasons added yet.</p>
                        </div>
                    )}

                    {groups.map(group => (
                        <div key={group.id} className={`collection-card ${expandedGroupId === group.id ? 'expanded' : ''}`}>
                            <div className="collection-header" onClick={() => toggleGroup(group.id)}>
                                <div className="collection-title-wrapper">
                                    <span className="collection-icon">
                                        {group.title.toLowerCase().includes('season') ? '📺' : '📖'}
                                    </span>
                                    <h3>{group.title}</h3>
                                </div>
                                <div className="collection-controls">
                                    <span className="item-count">
                                        {expandedGroupId === group.id && assets[group.id] ? `${assets[group.id].length} items` : 'Expand'}
                                    </span>
                                    <button 
                                        className="delete-collection-btn"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                                        title="Delete Collection"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {expandedGroupId === group.id && (
                                <Droppable droppableId={`group-${group.id}`} type={`group-${group.id}`}>
                                    {(provided) => (
                                        <div 
                                            className="assets-container"
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                        >
                                            {assets[group.id] && assets[group.id].map((asset, index) => (
                                                <Draggable key={asset.id} draggableId={String(asset.id)} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div 
                                                            className={`asset-track-row ${snapshot.isDragging ? 'dragging' : ''}`}
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            style={provided.draggableProps.style}
                                                        >
                                                            <div 
                                                                className="track-index"
                                                                {...provided.dragHandleProps}
                                                                title="Drag to reorder"
                                                                style={{ cursor: 'grab' }}
                                                            >
                                                                {index + 1}
                                                            </div>

                                                            <div className="track-icon">
                                                                {asset.mime_type.includes('pdf') ? '📄' : asset.mime_type.includes('video') ? '🎬' : '📁'}
                                                            </div>
                                                            <div className="track-info">
                                                                <div className="track-title">{asset.title}</div>
                                                                <div className="track-filename">{asset.filename}</div>
                                                            </div>
                                                            
                                                            <div className="track-actions">
                                                                {/* 1. VIEW/PLAY BUTTON */}
                                                                {(asset.mime_type.startsWith('video/') || 
                                                                  asset.mime_type === 'application/pdf' || 
                                                                  asset.mime_type === 'application/epub+zip') && (
                                                                    <button 
                                                                        className="track-action-btn play" 
                                                                        onClick={() => handleView(asset, assets[group.id], index)}
                                                                    >
                                                                        {asset.mime_type.startsWith('video/') ? '▶ Play' : '👁 View'}
                                                                    </button>
                                                                )}

                                                                {/* 2. DOWNLOAD BUTTON */}
                                                                <button 
                                                                    className="track-action-btn download"
                                                                    onClick={() => handleDownload(asset)}>
                                                                    Download
                                                                </button>
                                                                
                                                                {/* 3. DELETE BUTTON */}
                                                                <button 
                                                                    className="track-action-btn delete"
                                                                    onClick={() => handleDeleteAsset(asset.id, group.id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}

                                            {/* UPLOAD ROW */}
                                            {uploadingGroupId === group.id ? (
                                                <div className="asset-upload-row">
                                                    <div className="upload-loading-container">
                                                        <div className="upload-spinner"></div>
                                                        <span className="upload-text">
                                                            {uploadProgress || "Importing Media..."}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <label className="asset-upload-row">
                                                    <div className="upload-icon">+</div>
                                                    <span>Add Files to {group.title}</span>
                                                    <input type="file" multiple onChange={(e) => handleFileUpload(e, group.id)} hidden />
                                                </label>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            )}
                        </div>
                    ))}
                </div>
            </DragDropContext>

            {/* --- VIEWER MODALS --- */}
            {viewerContext?.type === 'video' && (
                <MediaPlayer 
                    playlist={viewerContext.playlist}
                    startIndex={viewerContext.startIndex}
                    onClose={closeViewer} 
                />
            )}
            {viewerContext?.type === 'pdf' && (
                <PDFViewer 
                    asset={viewerContext.asset} 
                    onClose={closeViewer} 
                />
            )}
            {viewerContext?.type === 'epub' && (
                <EpubViewer 
                    asset={viewerContext.asset} 
                    onClose={closeViewer} 
                />
            )}
        </div>
    );
}