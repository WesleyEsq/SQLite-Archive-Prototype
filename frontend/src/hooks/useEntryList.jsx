import { useState, useEffect } from 'react';
import { 
    GetEntries, UpdateOrder, DeleteEntry, SaveEntry, GetEntryImage, 
    GetTagsForEntry // <--- NEW IMPORT
} from '../../wailsjs/go/main/App';

const BLANK_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export function useEntryList(isAddingNew, onAddComplete, refreshTrigger) {
    // --- STATE ---
    const [entries, setEntries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Edit Mode State
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    
    // View Mode State
    const [expandedRowId, setExpandedRowId] = useState(null);
    
    // --- NEW: Tag State ---
    const [entryTags, setEntryTags] = useState({}); // { [id]: [tags...] }
    const [tagModalTarget, setTagModalTarget] = useState(null); // ID of entry being edited

    // --- EFFECTS ---
    useEffect(() => { refreshEntries(); }, [refreshTrigger]);

    useEffect(() => {
        if (isAddingNew) {
            const nextNum = entries.length > 0 ? String(entries.length + 1) : "1";
            startEditing({ 
                id: 'NEW', number: nextNum, title: '', comment: '', rank: '', 
                description: '', image: BLANK_IMAGE_BASE64, textAlignment: 'center' 
            });
        }
    }, [isAddingNew]);

    // --- CORE ACTIONS ---
    const refreshEntries = () => {
        GetEntries(searchQuery).then(res => setEntries(res || [])).catch(console.error);
    };

    const handleSearchKeyDown = (e) => { if (e.key === 'Enter') refreshEntries(); };

    // --- EDITING HANDLERS ---
    const startEditing = async (entry) => {
        let fullEntry = { ...entry };
        if (entry.id !== 'NEW' && (!entry.image || entry.image === BLANK_IMAGE_BASE64)) {
            const img = await GetEntryImage(entry.id);
            if (img) fullEntry.image = img;
        }
        if (!fullEntry.textAlignment) fullEntry.textAlignment = 'center';

        setEditingId(entry.id);
        setEditForm(fullEntry);
        setExpandedRowId(entry.id);
    };

    const cancelEditing = () => {
        setEditingId(null); setEditForm({});
        if (isAddingNew) onAddComplete();
    };

    const saveEdit = () => {
        const payload = { ...editForm, id: editForm.id === 'NEW' ? 0 : editForm.id };
        SaveEntry(payload).then(() => {
            refreshEntries(); setEditingId(null);
            if (isAddingNew) onAddComplete();
        }).catch(err => alert(err));
    };

    const handleDelete = (id) => { 
        if (window.confirm("Delete this entry?")) DeleteEntry(id).then(refreshEntries); 
    };

    // --- FORM FIELD HANDLERS ---
    const handleChange = (e) => setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleAlignment = (align) => setEditForm(prev => ({ ...prev, textAlignment: align }));
    
    const handleImageFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setEditForm(prev => ({ ...prev, image: ev.target.result.split(',')[1] }));
        reader.readAsDataURL(file);
    };

    const handleBackupFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setEditForm(prev => ({ 
            ...prev, backup: ev.target.result.split(',')[1], backupName: file.name 
        }));
        reader.readAsDataURL(file);
    };

    // --- INTERACTION HANDLERS ---
    const handleDragEnd = (result) => {
        if (!result.destination || editingId || searchQuery !== "") return;
        const items = Array.from(entries);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        const updated = items.map((item, idx) => ({ ...item, number: String(idx + 1) }));
        setEntries(updated);
        UpdateOrder(updated).catch(alert);
    };

    const handleRowClick = async (id) => {
        if (editingId) return;
        const isExpanding = expandedRowId !== id;
        setExpandedRowId(isExpanding ? id : null);
        
        if (isExpanding) {
            const entry = entries.find(e => e.id === id);
            
            // 1. Load Image
            if (entry && (!entry.image || entry.image === BLANK_IMAGE_BASE64)) {
                const img = await GetEntryImage(id);
                if (img) setEntries(prev => prev.map(e => e.id === id ? { ...e, image: img } : e));
            }

            // 2. Load Tags (NEW)
            GetTagsForEntry(id).then(tags => {
                setEntryTags(prev => ({ ...prev, [id]: tags || [] }));
            });
        }
    };

    // --- TAG SPECIFIC HELPERS ---
    const refreshTags = (entryId) => {
        GetTagsForEntry(entryId).then(tags => {
            setEntryTags(prev => ({ ...prev, [entryId]: tags || [] }));
        });
    };

    return {
        // State
        entries, editingId, editForm, expandedRowId, searchQuery, 
        entryTags, tagModalTarget, BLANK_IMAGE_BASE64,
        
        // Setters (for search input)
        setSearchQuery, setTagModalTarget,
        
        // Actions
        refreshEntries, handleSearchKeyDown, startEditing, cancelEditing, saveEdit, 
        handleDelete, handleDragEnd, handleRowClick, refreshTags,
        
        // Form Handlers
        handleChange, handleAlignment, handleImageFile, handleBackupFile
    };
}