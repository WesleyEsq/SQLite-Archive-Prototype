import React, { useState, useEffect } from 'react';
import { backend } from '../services/controller'; 
import TagManager from '../components/TagManager';

export default function TagManagerController({ onClose }) {
    const [tags, setTags] = useState([]);
    
    // Unified state for both Create and Edit
    const [formData, setFormData] = useState({ name: '', description: '', icon: 'tag', isCategory: false });
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = () => {
        backend.tags.getAll().then(res => setTags(res || [])).catch(console.error);
    };

    const handleOpenCreate = () => {
        setFormData({ name: '', description: '', icon: 'tag', isCategory: false });
        setEditingId(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (tag) => {
        // Load the selected tag's data into the form
        setFormData({ 
            name: tag.name, 
            description: tag.description, 
            icon: tag.icon, 
            isCategory: tag.isCategory || false 
        });
        setEditingId(tag.id);
        setIsFormOpen(true);
    };

    const handleSave = () => {
        if (!formData.name) return;

        if (editingId) {
            // EDIT MODE
            backend.tags.update(editingId, formData.name, formData.description, formData.icon, formData.isCategory)
                .then(() => {
                    loadTags();
                    setIsFormOpen(false);
                    setEditingId(null);
                })
                .catch(err => alert(err));
        } else {
            // CREATE MODE
            backend.tags.create(formData.name, formData.description, formData.icon, formData.isCategory)
                .then(() => {
                    loadTags();
                    setIsFormOpen(false);
                })
                .catch(err => alert(err));
        }
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingId(null);
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this tag? It will be removed from all entries.")) {
            backend.tags.delete(id).then(loadTags);
        }
    };

    return (
        <TagManager 
            tags={tags}
            formData={formData}
            setFormData={setFormData}
            isFormOpen={isFormOpen}
            editingId={editingId}
            handleOpenCreate={handleOpenCreate}
            handleOpenEdit={handleOpenEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
            handleDelete={handleDelete}
            onClose={onClose}
        />
    );
}