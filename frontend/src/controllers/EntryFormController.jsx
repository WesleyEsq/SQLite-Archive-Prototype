import React, { useState, useEffect } from 'react';
import { backend } from '../services/controller'; // <-- NEW IMPORT
import EntryForm from '../components/EntryForm';

export default function EntryFormController({ entryToEdit, nextNumber, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        id: 0, 
        number: nextNumber, 
        title: '', 
        comment: '', 
        rank: '', 
        description: ''
    });

    useEffect(() => {
        if (entryToEdit) {
            const { image, backup, backupName, ...cleanData } = entryToEdit;
            setFormData(cleanData);
        }
    }, [entryToEdit]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleUpdateCover = async () => {
        if (formData.id) {
            try {
                await backend.entries.setCover(formData.id);
                setFormData({ ...formData, _t: Date.now() }); 
            } catch (err) {
                console.error("Failed to update cover:", err);
            }
        }
    };

    const handleSubmit = () => {
        if (!formData.title) return alert("Title required");
        
        backend.entries.save(formData)
            .then(() => onSave())
            .catch(err => alert("Error saving entry: " + err));
    };

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