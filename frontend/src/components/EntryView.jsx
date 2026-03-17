import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import EntryViewRow from './entry-view/EntryViewRow';

export default function EntryView({ 
    entries, expandedRowId, handleRowClick, handleDragEnd, handleDelete, handleDownloadBackup, onEdit 
}) {

    if (entries.length === 0) {
         return (
            <div className="main-content">
                <div className="empty-db-prompt">
                    <h3>Compendium is empty.</h3>
                </div>
            </div>
         );
    }

    return (
        <div className="main-content">
            <DragDropContext onDragEnd={handleDragEnd}>
                <table className="compendium-table">
                    <thead>
                        <tr>
                            <th className="drag-handle-header"></th>
                            <th>#</th>
                            <th>Title</th>
                            <th>Comment</th>
                            <th>Rank</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <Droppable droppableId="entries">
                        {(provided) => (
                            <tbody {...provided.droppableProps} ref={provided.innerRef}>
                                {entries.map((entry, index) => (
                                    <EntryViewRow 
                                        key={entry.id}
                                        entry={entry}
                                        index={index}
                                        expandedRowId={expandedRowId}
                                        handleRowClick={handleRowClick}
                                        onEdit={onEdit}
                                        handleDelete={handleDelete}
                                        handleDownloadBackup={handleDownloadBackup}
                                    />
                                ))}
                                {provided.placeholder}
                            </tbody>
                        )}
                    </Droppable>
                </table>
            </DragDropContext>
        </div>
    );
}