import React, { useState, useEffect } from 'react';
import { SaveEntry, SetCoverImage } from '../../wailsjs/go/backend/App';
import EntryForm from '../components/EntryForm';

export default function EntryFormController({ entryToEdit, nextNumber, onSave, onCancel }) {
    // 1. State
    const [formData, setFormData] = useState({
        id: 0, 
        number: nextNumber, 
        title: '', 
        comment: '', 
        rank: '', 
        description: ''
    });

    // 2. Lifecycle
    useEffect(() => {
        if (entryToEdit) {
            const { image, backup, backupName, ...cleanData } = entryToEdit;
            setFormData(cleanData);
        }
    }, [entryToEdit]);

    // 3. Logic & Handlers
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleUpdateCover = async () => {
        if (formData.id) {
            try {
                await SetCoverImage(formData.id);
                // Trigger a re-render of the image by adding a timestamp query
                setFormData({ ...formData, _t: Date.now() }); 
            } catch (err) {
                console.error("Failed to update cover:", err);
            }
        }
    };

    const handleSubmit = () => {
        if (!formData.title) return alert("Title required");
        
        // Pass only the lightweight text data to Go
        SaveEntry(formData)
            .then(() => onSave())
            .catch(err => alert("Error saving entry: " + err));
    };

    // 4. Render purely visual component
    return (
        <EntryForm 
            entryToEdit={entryToEdit}
            formData={formData}
            handleChange={handleChange}
            handleUpdateCover={handleUpdateCover}
            handleSubmit={handleSubmit}
            onCancel={onCancel}
        />
    );
}