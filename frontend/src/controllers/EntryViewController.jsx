import React, { useState, useEffect } from 'react';
import { GetEntries, UpdateOrder, DeleteEntry, GetEntryImage, DownloadBackup} from '../../wailsjs/go/backend/App';
import EntryView from '../components/EntryView';

export default function EntryViewController({ onEdit, refreshTrigger }) {
    const [entries, setEntries] = useState([]);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [loadingImage, setLoadingImage] = useState(false);

    useEffect(() => {
        refreshEntries();
    }, [refreshTrigger]);

    const refreshEntries = () => {
        GetEntries().then(res => setEntries(res || [])).catch(console.error);
    };

    const loadEntryImage = async (id) => {
        setLoadingImage(true);
        try {
            const img = await GetEntryImage(id);
            if (img) {
                setEntries(prev => prev.map(e => e.id === id ? { ...e, image: img } : e));
            }
        } finally {
            setLoadingImage(false);
        }
    };

    const handleRowClick = (id) => {
        const isExpanding = expandedRowId !== id;
        setExpandedRowId(isExpanding ? id : null);
        if (isExpanding) {
            const entry = entries.find(e => e.id === id);
            if (entry && !entry.image) loadEntryImage(id);
        }
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(entries);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        const updated = items.map((item, idx) => ({ ...item, number: String(idx + 1) }));
        setEntries(updated);
        UpdateOrder(updated).catch(err => { alert(err); refreshEntries(); });
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this entry?")) {
            DeleteEntry(id).then(refreshEntries);
        }
    };

    // Passed down so the dumb component can trigger it
    const handleDownloadBackup = (id) => {
        DownloadBackup(id);
    };

    return (
        <EntryView 
            entries={entries}
            expandedRowId={expandedRowId}
            handleRowClick={handleRowClick}
            handleDragEnd={handleDragEnd}
            handleDelete={handleDelete}
            handleDownloadBackup={handleDownloadBackup}
            onEdit={onEdit}
        />
    );
}