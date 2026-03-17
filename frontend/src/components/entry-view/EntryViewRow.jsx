import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

const BLANK_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export default function EntryViewRow({ 
    entry, index, expandedRowId, handleRowClick, onEdit, handleDelete, handleDownloadBackup 
}) {
    return (
        <React.Fragment>
            <Draggable draggableId={String(entry.id)} index={index}>
                {(provided, snapshot) => (
                    <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={snapshot.isDragging ? 'dragging-row' : ''}
                        onClick={() => handleRowClick(entry.id)}
                    >
                        <td className="drag-handle-cell" {...provided.dragHandleProps}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 6v12h-4v-12h4zm-6 0v12h-4v-12h4zm10 0v12h-4v-12h4z" />
                            </svg>
                        </td>
                        <td>{entry.number}</td>
                        <td>{entry.title}</td>
                        <td>{entry.comment}</td>
                        <td>{entry.rank}</td>
                        <td className="actions-cell">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(entry); }}>Edit</button>
                            <button className="delete-button" onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}>Delete</button>
                        </td>
                    </tr>
                )}
            </Draggable>
            {expandedRowId === entry.id && (
                <tr className="details-row">
                    <td colSpan="6">
                        <div className="details-panel">
                            <img src={`data:image/jpeg;base64,${entry.image || BLANK_IMAGE_BASE64}`} className="details-image" alt="Cover" />
                            <div className="details-text">
                                <h3>Description</h3>
                                <p>{entry.description}</p>
                                {entry.backupName && (
                                    <button className="download-button" onClick={() => handleDownloadBackup(entry.id)}>
                                        Download {entry.backupName}
                                    </button>
                                )}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
}