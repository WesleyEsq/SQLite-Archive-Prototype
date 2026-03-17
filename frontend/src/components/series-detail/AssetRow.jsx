import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { FileText, Film, File, PlayCircle, Eye, Download, Trash2, GripVertical } from 'lucide-react';

export default function AssetRow({ asset, index, groupAssets, groupId, getAssetType, handleView, handleDownload, handleDeleteAsset }) {
    const typeInfo = getAssetType(asset);

    return (
        <Draggable draggableId={String(asset.id)} index={index}>
            {(provided, snapshot) => (
                <div 
                    className={`asset-track-row ${snapshot.isDragging ? 'dragging' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={provided.draggableProps.style}
                >
                    <div className="track-drag-handle" {...provided.dragHandleProps} title="Reorder">
                        <GripVertical size={16} color="#ccc" />
                    </div>

                    <div className="track-index">{index + 1}</div>

                    <div className="track-icon">
                        {typeInfo.isPdf ? <FileText size={18} color="#e74c3c"/> : 
                         typeInfo.isVideo ? <Film size={18} color="#3498db"/> : 
                         <File size={18} color="#95a5a6"/>}
                    </div>

                    <div className="track-info">
                        <div className="track-title">{asset.title || asset.filename}</div>
                        <div className="track-filename">{asset.filename}</div>
                    </div>
                    
                    <div className="track-actions">
                        {typeInfo.canView && (
                            <button 
                                className="track-action-btn play" 
                                onClick={() => handleView(asset, groupAssets, index)}
                                title={typeInfo.isVideo ? "Play" : "Read"}
                            >
                                {typeInfo.isVideo ? <PlayCircle size={18}/> : <Eye size={18}/>}
                                <span>{typeInfo.isVideo ? "Play" : "View"}</span>
                            </button>
                        )}

                        <button className="track-action-btn download" onClick={() => handleDownload(asset)} title="Download">
                            <Download size={18} />
                        </button>
                        
                        <button className="track-action-btn delete" onClick={() => handleDeleteAsset(asset.id, groupId)} title="Delete File">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            )}
        </Draggable>
    );
}