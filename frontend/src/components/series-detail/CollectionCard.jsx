import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Tv, BookOpen, X, Plus } from 'lucide-react';
import AssetRow from './AssetRow';

export default function CollectionCard({ 
    group, assets, expandedGroupId, toggleGroup, handleDeleteGroup, 
    uploadingGroupId, uploadProgress, handleFileUpload, 
    getAssetType, handleView, handleDownload, handleDeleteAsset 
}) {
    const isExpanded = expandedGroupId === group.id;
    const groupAssets = assets[group.id] || [];

    return (
        <div className={`collection-card ${isExpanded ? 'expanded' : ''}`}>
            <div className="collection-header" onClick={() => toggleGroup(group.id)}>
                <div className="collection-title-wrapper">
                    <span className="collection-icon">
                        {group.title.toLowerCase().includes('season') ? <Tv size={20} /> : <BookOpen size={20} />}
                    </span>
                    <h3>{group.title}</h3>
                </div>
                <div className="collection-controls">
                    <span className="item-count">
                        {isExpanded && assets[group.id] ? `${groupAssets.length} items` : 'Expand'}
                    </span>
                    <button 
                        className="delete-collection-btn"
                        onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                        title="Delete Collection"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <Droppable droppableId={`group-${group.id}`} type={`group-${group.id}`}>
                    {(provided) => (
                        <div className="assets-container" ref={provided.innerRef} {...provided.droppableProps}>
                            {groupAssets.map((asset, index) => (
                                <AssetRow 
                                    key={asset.id} 
                                    asset={asset} 
                                    index={index} 
                                    groupAssets={groupAssets}
                                    groupId={group.id}
                                    getAssetType={getAssetType}
                                    handleView={handleView}
                                    handleDownload={handleDownload}
                                    handleDeleteAsset={handleDeleteAsset}
                                />
                            ))}
                            {provided.placeholder}

                            {uploadingGroupId === group.id ? (
                                <div className="asset-upload-row loading" style={{ display: 'flex', justifyContent: 'center', padding: '15px' }}>
                                    <div className="upload-spinner" style={{ marginRight: '10px' }}></div>
                                    <span className="upload-text">{uploadProgress}</span>
                                </div>
                            ) : (
                                <button 
                                    className="asset-upload-row" 
                                    onClick={() => handleFileUpload(group.id)}
                                    style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}
                                >
                                    <Plus size={20} style={{ marginRight: '8px' }} />
                                    <span>Add File to {group.title} via OS</span>
                                </button>
                            )}
                        </div>
                    )}
                </Droppable>
            )}
        </div>
    );
}