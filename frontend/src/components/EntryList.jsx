import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ReactMarkdown from 'react-markdown';
import { DownloadBackup, ImportLegacyCSV } from '../../wailsjs/go/main/App';
import { useEntryList } from '../hooks/useEntryList'; // <--- The new Hook
import TagSelectorModal from './TagSelectorModal';   // <--- The Modal we made
import { renderIcon } from '../utils/iconMap';       // <--- Icon helper

// Icons
import { Plus, Search, FileDown, Upload, GripVertical, Pencil, Trash2, X, Check } from 'lucide-react';

export default function EntryList({ isAddingNew, onAddComplete, refreshTrigger, onAddNew }) {
    // 1. Initialize Controller
    const {
        entries, editingId, editForm, expandedRowId, searchQuery, 
        entryTags, tagModalTarget, BLANK_IMAGE_BASE64,
        setSearchQuery, setTagModalTarget,
        refreshEntries, handleSearchKeyDown, startEditing, cancelEditing, saveEdit, 
        handleDelete, handleDragEnd, handleRowClick, refreshTags,
        handleChange, handleAlignment, handleImageFile, handleBackupFile
    } = useEntryList(isAddingNew, onAddComplete, refreshTrigger);

    // --- RENDER HELPERS ---

    // 1. Tiny Tag Display (Visible in Expanded Row)
    const renderTagList = (entryId) => {
        const tags = entryTags[entryId] || [];
        const displayLimit = 5;
        const visibleTags = tags.slice(0, displayLimit);
        const remaining = tags.length - displayLimit;

        return (
            <div className="tag-row-display">
                {visibleTags.map(tag => (
                    <span key={tag.id} className="mini-tag-pill" title={tag.description}>
                        {renderIcon(tag.icon, { size: 12, style: {marginRight: 4} })}
                        {tag.name}
                    </span>
                ))}
                
                {remaining > 0 && (
                    <span className="mini-tag-pill more">+{remaining} more</span>
                )}

                <button 
                    className="add-tag-tiny-btn" 
                    onClick={(e) => { e.stopPropagation(); setTagModalTarget(entryId); }}
                >
                    + Tag
                </button>
            </div>
        );
    };

    // 2. Edit Mode Row Inputs
    const renderEditInputs = () => (
        <>
            <td><input name="number" className="inline-input" value={editForm.number} onChange={handleChange} style={{width: '50px'}}/></td>
            <td><input name="title" className="inline-input" value={editForm.title} onChange={handleChange} autoFocus /></td>
            <td><input name="comment" className="inline-input" value={editForm.comment} onChange={handleChange} /></td>
            <td><input name="rank" className="inline-input" value={editForm.rank} onChange={handleChange} style={{width: '60px'}}/></td>
            <td className="actions-cell">
                <button className="icon-action-btn save" onClick={(e) => { e.stopPropagation(); saveEdit(); }} title="Save">
                    <Check size={18} />
                </button>
                <button className="icon-action-btn cancel" onClick={(e) => { e.stopPropagation(); cancelEditing(); }} title="Cancel">
                    <X size={18} />
                </button>
            </td>
        </>
    );

    // 3. View Mode Row Text
    const renderViewText = (entry) => (
        <>
            <td className="rank-col">{entry.number}</td>
            <td className="title-col">{entry.title}</td>
            <td className="comment-col">{entry.comment}</td>
            <td className="rank-text">{entry.rank}</td>
            <td className="actions-cell">
                <button className="icon-action-btn edit" onClick={(e) => { e.stopPropagation(); startEditing(entry); }} title="Edit">
                    <Pencil size={18} />
                </button>
                <button className="icon-action-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} title="Delete">
                    <Trash2 size={18} />
                </button>
            </td>
        </>
    );

    // 4. The Expanded Panel (Edit Mode)
    const renderEditDetailsPanel = () => (
        <div className="details-panel edit-mode">
            <div className="edit-image-section">
                <img src={`data:image/jpeg;base64,${editForm.image || BLANK_IMAGE_BASE64}`} className="details-image" alt="Cover" />
                <label className="file-upload-btn">
                    Change Cover
                    <input type="file" accept="image/*" onChange={handleImageFile} hidden />
                </label>
            </div>
            <div className="edit-text-section">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <label style={{fontWeight:'bold', color:'var(--ui-header)'}}>Description (Markdown)</label>
                    <div className="alignment-controls">
                        {['left', 'center', 'right', 'justify'].map(align => (
                            <button key={align} className={`align-btn ${editForm.textAlignment === align ? 'active' : ''}`} onClick={() => handleAlignment(align)}>
                                {align === 'justify' ? '≡' : align === 'left' ? '⇤' : align === 'right' ? '⇥' : '↔'}
                            </button>
                        ))}
                    </div>
                </div>
                <textarea name="description" value={editForm.description} onChange={handleChange} rows="8" placeholder="Markdown supported..." style={{fontFamily: 'monospace'}}/>
                <div className="edit-backup-section">
                    <label style={{fontWeight:'bold', color:'var(--ui-header)'}}>Backup File: </label>
                    <span className="file-name">{editForm.backupName || "None"}</span>
                    <label className="file-upload-btn small">
                        Upload File
                        <input type="file" onChange={handleBackupFile} hidden />
                    </label>
                </div>
            </div>
        </div>
    );

    return (
        <div className="main-content">
            <div className="entry-card">
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

                {(entries.length > 0 || isAddingNew) ? (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <table className="compendium-table">
                            <thead>
                                <tr>
                                    <th style={{width: '40px'}}></th>
                                    <th style={{width: '60px'}}>#</th>
                                    <th>Title</th>
                                    <th>Comment</th>
                                    <th style={{width: '80px'}}>Rank</th>
                                    <th style={{width: '100px', textAlign: 'right'}}>Actions</th>
                                </tr>
                            </thead>
                            <Droppable droppableId="entries">
                                {(provided) => (
                                    <tbody {...provided.droppableProps} ref={provided.innerRef}>
                                        {isAddingNew && editingId === 'NEW' && (
                                            <>
                                                <tr className="editing-row"><td className="drag-handle-cell">✨</td>{renderEditInputs()}</tr>
                                                <tr className="details-row editing-details"><td colSpan="6">{renderEditDetailsPanel()}</td></tr>
                                            </>
                                        )}
                                        {entries.map((entry, index) => (
                                            <React.Fragment key={entry.id}>
                                                <Draggable draggableId={String(entry.id)} index={index} isDragDisabled={!!editingId || searchQuery !== ""}>
                                                    {(provided, snapshot) => (
                                                        <tr ref={provided.innerRef} {...provided.draggableProps} className={`${snapshot.isDragging ? 'dragging-row' : ''} ${editingId === entry.id ? 'editing-row' : ''}`} onClick={() => handleRowClick(entry.id)}>
                                                            <td className="drag-handle-cell" {...provided.dragHandleProps}>
                                                                {editingId !== entry.id && searchQuery === "" && (
                                                                    <div className="grip-icon"><GripVertical size={20} /></div>
                                                                )}
                                                            </td>
                                                            {editingId === entry.id ? renderEditInputs() : renderViewText(entry)}
                                                        </tr>
                                                    )}
                                                </Draggable>
                                                
                                                {/* EXPANDED DETAILS ROW */}
                                                {expandedRowId === entry.id && (
                                                    <tr className="details-row">
                                                        <td colSpan="6">
                                                            {editingId === entry.id ? renderEditDetailsPanel() : (
                                                                <div className="details-panel">
                                                                    <img src={`data:image/jpeg;base64,${entry.image || BLANK_IMAGE_BASE64}`} className="details-image" alt="Cover" />
                                                                    
                                                                    <div className="details-text">
                                                                        {/* --- TAG DISPLAY --- */}
                                                                        {renderTagList(entry.id)}
                                                                        
                                                                        <div className="markdown-content" style={{ textAlign: entry.textAlignment || 'center', marginTop: '15px' }}>
                                                                            <ReactMarkdown>{entry.description || "No description."}</ReactMarkdown>
                                                                        </div>
                                                                        
                                                                        {entry.backupName && (
                                                                            <button className="download-button" onClick={() => DownloadBackup(entry.id)}>
                                                                                <FileDown size={16} style={{marginRight: '5px'}}/> 
                                                                                Download {entry.backupName}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
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
                            <button className="import-button" onClick={ImportLegacyCSV}>
                                <Upload size={18} style={{marginRight: '8px'}} /> Import CSV
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* --- TAG SELECTOR MODAL --- */}
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