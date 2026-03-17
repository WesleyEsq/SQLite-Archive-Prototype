// src/components/SeriesDetail.jsx
import React from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';

// Sub-components
import SeriesHero from './series-detail/SeriesHero';
import CollectionCard from './series-detail/CollectionCard';
import MediaPlayer from './viewers/MediaPlayer';
import PDFViewer from './viewers/PDFViewer';
import EpubViewer from './viewers/EpubViewer';

export default function SeriesDetail({ 
    entry, onBack, groups, assets, expandedGroupId, uploadingGroupId, uploadProgress, 
    viewerContext, toggleGroup, handleCreateGroup, handleDeleteGroup, handleFileUpload, 
    handleDragEnd, handleDownload, handleDeleteAsset, handleView, closeViewer, getAssetType
}) {

    return (
        <div className="series-detail-container">
            {/* HERO SECTION */}
            <SeriesHero entry={entry} groups={groups} onBack={onBack} />

            <div className="content-separator">
                <h2>Media Collections</h2>
                <button className="add-collection-btn" onClick={handleCreateGroup}>
                    <Plus size={18} /> New Collection
                </button>
            </div>

            {/* COLLECTIONS & ASSETS */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="collections-grid">
                    {groups.length === 0 && (
                        <div className="empty-collections-state">
                            <p>No volumes or seasons added yet.</p>
                        </div>
                    )}

                    {groups.map(group => (
                        <CollectionCard 
                            key={group.id}
                            group={group}
                            assets={assets}
                            expandedGroupId={expandedGroupId}
                            toggleGroup={toggleGroup}
                            handleDeleteGroup={handleDeleteGroup}
                            uploadingGroupId={uploadingGroupId}
                            uploadProgress={uploadProgress}
                            handleFileUpload={handleFileUpload}
                            getAssetType={getAssetType}
                            handleView={handleView}
                            handleDownload={handleDownload}
                            handleDeleteAsset={handleDeleteAsset}
                        />
                    ))}
                </div>
            </DragDropContext>

            {/* VIEWER MODALS */}
            {viewerContext?.type === 'video' && <MediaPlayer playlist={viewerContext.playlist} startIndex={viewerContext.startIndex} onClose={closeViewer} />}
            {viewerContext?.type === 'pdf' && <PDFViewer asset={viewerContext.asset} onClose={closeViewer} />}
            {viewerContext?.type === 'epub' && <EpubViewer asset={viewerContext.asset} onClose={closeViewer} />}
        </div>
    );
}