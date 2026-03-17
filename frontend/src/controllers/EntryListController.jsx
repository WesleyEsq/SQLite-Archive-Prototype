// frontend/src/controllers/EntryListController.jsx
import React from 'react';
import { ExportLibraryCSV, ImportLegacyCSV, SetCoverImage } from '../../wailsjs/go/backend/App';
import { useEntryList } from '../hooks/useEntryList'; 
import EntryList from '../components/EntryList';

export default function EntryListController({ libraryId, isAddingNew, onAddComplete, refreshTrigger, onAddNew }) {
    // 1. Fetch State & Base Handlers
    const {
        entries, editingId, editForm, expandedRowId, searchQuery, 
        entryTags, tagModalTarget,
        setSearchQuery, setTagModalTarget,
        refreshEntries, handleSearchKeyDown, startEditing, cancelEditing, saveEdit, 
        handleDelete, handleDragEnd, handleRowClick, refreshTags,
        handleChange, handleAlignment
    } = useEntryList(libraryId, isAddingNew, onAddComplete, refreshTrigger);

    // 2. Wails API Interactions (Moved from Component)
    const handleUpdateCover = async (e, entryId) => {
        e.preventDefault();
        if (entryId === 'NEW' || !entryId) {
            return alert("Please save the text metadata first before uploading a cover.");
        }
        try {
            await SetCoverImage(entryId);
            window.location.reload(); 
        } catch (err) {
            console.error("Cover upload failed:", err);
        }
    };

    const handleImportCSV = () => {
        ImportLegacyCSV(libraryId).then(msg => {
            if (msg !== "Cancelled") refreshEntries();
        });
    };

    const handleExportCSV = () => {
        ExportLibraryCSV(libraryId).then(msg => { 
            if(msg !== "Cancelled") alert(msg); 
        });
    };

    // 3. Render the Pure UI Component
    return (
        <EntryList 
            isAddingNew={isAddingNew}
            onAddNew={onAddNew}
            
            // State
            entries={entries}
            editingId={editingId}
            editForm={editForm}
            expandedRowId={expandedRowId}
            searchQuery={searchQuery}
            entryTags={entryTags}
            tagModalTarget={tagModalTarget}
            
            // Setters / Actions
            setSearchQuery={setSearchQuery}
            setTagModalTarget={setTagModalTarget}
            refreshEntries={refreshEntries}
            handleSearchKeyDown={handleSearchKeyDown}
            startEditing={startEditing}
            cancelEditing={cancelEditing}
            saveEdit={saveEdit}
            handleDelete={handleDelete}
            handleDragEnd={handleDragEnd}
            handleRowClick={handleRowClick}
            refreshTags={refreshTags}
            handleChange={handleChange}
            handleAlignment={handleAlignment}
            
            // Wails Actions
            handleUpdateCover={handleUpdateCover}
            handleImportCSV={handleImportCSV}
            handleExportCSV={handleExportCSV}
        />
    );
}