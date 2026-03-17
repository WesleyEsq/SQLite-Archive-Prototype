import React from 'react';
import { backend } from '../services/controller'; // <-- NEW IMPORT
import { useEntryList } from '../hooks/useEntryList'; 
import EntryList from '../components/EntryList';

export default function EntryListController({ libraryId, isAddingNew, onAddComplete, refreshTrigger, onAddNew }) {
    const entryListState = useEntryList(libraryId, isAddingNew, onAddComplete, refreshTrigger);

    const handleUpdateCover = async (e, entryId) => {
        e.preventDefault();
        if (entryId === 'NEW' || !entryId) {
            return alert("Please save the text metadata first before uploading a cover.");
        }
        try {
            await backend.entries.setCover(entryId);
            window.location.reload(); 
        } catch (err) {
            console.error("Cover upload failed:", err);
        }
    };

    const handleImportCSV = () => {
        backend.system.importCSV(libraryId).then(msg => {
            if (msg !== "Cancelled") entryListState.refreshEntries();
        });
    };

    const handleExportCSV = () => {
        backend.system.exportCSV(libraryId).then(msg => { 
            if(msg !== "Cancelled") alert(msg); 
        });
    };

    return (
        <EntryList 
            isAddingNew={isAddingNew}
            onAddNew={onAddNew}
            {...entryListState}
            handleUpdateCover={handleUpdateCover}
            handleImportCSV={handleImportCSV}
            handleExportCSV={handleExportCSV}
        />
    );
}