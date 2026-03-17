// src/components/EntryList.jsx
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactMarkdown from 'react-markdown';

// Icons & Modals
import { Plus, Search, FileDown, Upload, GripVertical } from 'lucide-react';
import TagSelectorModal from './modals/TagSelectorModal';   

// Sub-components
import EntryTagDisplay from './entry-list/EntryTagDisplay';
import EntryEditInputs from './entry-list/EntryEditInputs';
import EntryViewText from './entry-list/EntryViewText';
import EntryEditPanel from './entry-list/EntryEditPanel';

export default function EntryList({ 
    isAddingNew, onAddNew, entries, editingId, editForm, expandedRowId, searchQuery, 
    entryTags, tagModalTarget, setSearchQuery, setTagModalTarget, refreshEntries, 
    handleSearchKeyDown, startEditing, cancelEditing, saveEdit, handleDelete, 
    handleDragEnd, handleRowClick, refreshTags, handleChange, handleAlignment,
    handleUpdateCover, handleImportCSV, handleExportCSV
}) {

    return (
        <div className="main-content">
            <div className="entry-card" style={{ width: '100%' }}>
                
                {/* ACTION BAR */}
                <div className="list-action-bar">
                    <button className="action-rect-btn" onClick={onAddNew}>
                        <Plus size={18} />
                        <span>Add Entry</span>
                    </button>

                    <div className="search-bar-wrapper">
                        <input 
                            type="text" 
                            placeholder="Search titles or comments..." 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            onKeyDown={handleSearchKeyDown} 
                        />
                        <button className="search-icon-btn" onClick={refreshEntries} title="Search">
                            <Search size={18} />
                        </button>
                    </div>
                </div>

                {/* TABLE */}
                {(entries.length > 0 || isAddingNew) ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <table className="compendium-table">
                            <thead>
                                <tr>
                                    <th style={{width: '40px'}}></th>
                                    <th style={{width: '60px', textAlign: 'center'}}>#</th>
                                    <th>Title & Tags</th>
                                    <th style={{textAlign: 'center'}}>Comment</th>
                                    <th style={{width: '80px', textAlign: 'center'}}>Rank</th>
                                    <th style={{width: '100px', textAlign: 'center'}}>Actions</th>
                                </tr>
                            </thead>
                            <Droppable droppableId="entries">
                                {(provided) => (
                                    <tbody {...provided.droppableProps} ref={provided.innerRef}>
                                        
                                        {/* ADD NEW ROW */}
                                        {isAddingNew && editingId === 'NEW' && (
                                            <>
                                                <tr className="editing-row">
                                                    <td className="drag-handle-cell"><GripVertical size={16} /></td>
                                                    <EntryEditInputs editForm={editForm} handleChange={handleChange} saveEdit={saveEdit} cancelEditing={cancelEditing} />
                                                </tr>
                                                <tr className="details-row editing-details">
                                                    <td colSpan="6">
                                                        <EntryEditPanel editForm={editForm} handleUpdateCover={handleUpdateCover} handleAlignment={handleAlignment} handleChange={handleChange} />
                                                    </td>
                                                </tr>
                                            </>
                                        )}

                                        {/* LIST ROWS */}
                                        {entries.map((entry, index) => (
                                            <React.Fragment key={entry.id}>
                                                <Draggable draggableId={String(entry.id)} index={index} isDragDisabled={!!editingId || searchQuery !== ""}>
                                                    {(provided, snapshot) => (
                                                        <tr ref={provided.innerRef} {...provided.draggableProps} className={`${snapshot.isDragging ? 'dragging-row' : ''} ${editingId === entry.id ? 'editing-row' : ''}`} onClick={() => handleRowClick(entry.id)}>
                                                            <td className="drag-handle-cell" {...provided.dragHandleProps}>
                                                                {editingId !== entry.id && searchQuery === "" && (
                                                                    <div className="grip-icon"><GripVertical size={16} /></div>
                                                                )}
                                                            </td>
                                                            
                                                            {editingId === entry.id ? (
                                                                <EntryEditInputs editForm={editForm} handleChange={handleChange} saveEdit={saveEdit} cancelEditing={cancelEditing} />
                                                            ) : (
                                                                <EntryViewText entry={entry} startEditing={startEditing} handleDelete={handleDelete} />
                                                            )}
                                                            
                                                        </tr>
                                                    )}
                                                </Draggable>

                                                {/* EXPANDED DETAILS ROW (Edit Mode) */}
                                                {editingId === entry.id && entry.id !== 'NEW' && (
                                                    <tr className="details-row editing-details">
                                                        <td colSpan="6">
                                                            <EntryEditPanel editForm={editForm} handleUpdateCover={handleUpdateCover} handleAlignment={handleAlignment} handleChange={handleChange} />
                                                        </td>
                                                    </tr>
                                                )}
                                                
                                                {/* EXPANDED DETAILS ROW (View Mode) */}
                                                {expandedRowId === entry.id && !editingId && (
                                                    <tr className="expanded-details-row">
                                                        <td colSpan="6">
                                                            <div className="details-panel">
                                                                <img 
                                                                    src={`/images/${entry.id}`} 
                                                                    className="details-image" 
                                                                    alt="Cover"
                                                                    onError={(e) => { e.target.src = '/default-cover.png'; e.target.style.opacity = '0.5'; }}
                                                                />
                                                                <div className="details-text">
                                                                    <EntryTagDisplay entryId={entry.id} entryTags={entryTags} setTagModalTarget={setTagModalTarget} />
                                                                    
                                                                    <h4 style={{ color: 'var(--ui-header)', marginTop: '5px' }}>Description</h4>
                                                                    <div className="markdown-content" style={{ textAlign: entry.textAlignment || 'justify' }}>
                                                                        <ReactMarkdown>{entry.description || "*No description provided.*"}</ReactMarkdown>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        {provided.placeholder}
                                    </tbody>
                                )}
                            </Droppable>
                        </table>
                    </DragDropContext>
                ) : (
                    <div className="empty-db-prompt">
                        {searchQuery ? <h3>No matches found.</h3> : <h3>Compendium is empty.</h3>}
                        {!searchQuery && (
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button className="import-button" onClick={handleImportCSV}>
                                    <Upload size={18} style={{marginRight: '8px'}} /> Import CSV
                                </button>

                                <button 
                                    className="import-button" 
                                    style={{ background: 'transparent', color: 'var(--ui-header)', border: '2px solid var(--ui-header)' }}
                                    onClick={handleExportCSV}
                                >
                                    <FileDown size={18} style={{marginRight: '8px'}} /> Export CSV Backup
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {tagModalTarget && (
                <TagSelectorModal 
                    entryId={tagModalTarget}
                    currentTags={entryTags[tagModalTarget] || []}
                    onClose={() => setTagModalTarget(null)}
                    onSave={() => refreshTags(tagModalTarget)}
                />
            )}
        </div>
    );
}