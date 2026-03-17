import { useState, useEffect } from 'react';
import { backend } from '../services/controller'; // <-- NEW IMPORT

export function useEntryList(libraryId, isAddingNew, onAddComplete, refreshTrigger) {
    const [entries, setEntries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [entryTags, setEntryTags] = useState({}); 
    const [tagModalTarget, setTagModalTarget] = useState(null); 

    useEffect(() => { 
        if (libraryId) refreshEntries(); 
    }, [libraryId, refreshTrigger]);

    useEffect(() => {
        if (isAddingNew) {
            const nextNum = entries.length > 0 ? String(entries.length + 1) : "1";
            startEditing({ 
                id: 'NEW', number: nextNum, title: '', comment: '', rank: '', 
                description: '', textAlignment: 'justify' 
            });
        }
    }, [isAddingNew]);

    const refreshEntries = () => {
        backend.entries.getAll(libraryId).then(res => setEntries(res || [])).catch(console.error);
    };

    const handleSearchKeyDown = (e) => { if (e.key === 'Enter') refreshEntries(); };

    const startEditing = async (entry) => {
        let fullEntry = { ...entry };
        if (!fullEntry.textAlignment) fullEntry.textAlignment = 'justify';
        setEditingId(entry.id);
        setEditForm(fullEntry);
        setExpandedRowId(entry.id);
    };

    const cancelEditing = () => {
        setEditingId(null); setEditForm({});
        if (isAddingNew) onAddComplete();
    };

    const saveEdit = () => {
        const payload = { 
            ...editForm, 
            id: editForm.id === 'NEW' ? 0 : parseInt(editForm.id, 10),
            library_id: parseInt(libraryId, 10) 
        };
        
        backend.entries.save(payload).then(() => {
            refreshEntries(); 
            setEditingId(null);
            if (isAddingNew) onAddComplete();
        }).catch(err => alert("Error saving entry: " + err));
    };

    const handleDelete = (id) => { 
        if (window.confirm("Delete this entry?")) backend.entries.delete(id).then(refreshEntries); 
    };

    const handleChange = (e) => setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleAlignment = (align) => setEditForm(prev => ({ ...prev, textAlignment: align }));
    
    const handleDragEnd = (result) => {
        if (!result.destination || editingId || searchQuery !== "") return;
        const items = Array.from(entries);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        const updated = items.map((item, idx) => ({ ...item, number: String(idx + 1) }));
        setEntries(updated);
        backend.entries.updateOrder(updated).catch(alert);
    };

    const handleRowClick = async (id) => {
        if (editingId) return;
        const isExpanding = expandedRowId !== id;
        setExpandedRowId(isExpanding ? id : null);
        
        if (isExpanding) {
            backend.tags.getForEntry(id).then(tags => {
                setEntryTags(prev => ({ ...prev, [id]: tags || [] }));
            });
        }
    };

    const refreshTags = (entryId) => {
        backend.tags.getForEntry(entryId).then(tags => {
            setEntryTags(prev => ({ ...prev, [entryId]: tags || [] }));
        });
    };

    return {
        entries, editingId, editForm, expandedRowId, searchQuery, 
        entryTags, tagModalTarget,
        setSearchQuery, setTagModalTarget, refreshEntries, handleSearchKeyDown, 
        startEditing, cancelEditing, saveEdit, handleDelete, handleDragEnd, 
        handleRowClick, refreshTags, handleChange, handleAlignment
    };
}