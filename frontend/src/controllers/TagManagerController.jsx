import React, { useState, useEffect } from 'react';
import { CreateTag, GetAllTags, DeleteTag } from '../../wailsjs/go/backend/App';
import TagManager from '../components/TagManager';

export default function TagManagerController({ onClose }) {
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState({ name: '', description: '', icon: 'tag' });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = () => {
        GetAllTags().then(res => setTags(res || [])).catch(console.error);
    };

    const handleCreate = () => {
        if (!newTag.name) return;
        CreateTag(newTag.name, newTag.description, newTag.icon)
            .then(() => {
                loadTags();
                setNewTag({ name: '', description: '', icon: 'tag' });
                setIsCreating(false);
            })
            .catch(err => alert(err));
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this tag? It will be removed from all entries.")) {
            DeleteTag(id).then(loadTags);
        }
    };

    return (
        <TagManager 
            tags={tags}
            newTag={newTag}
            setNewTag={setNewTag}
            isCreating={isCreating}
            setIsCreating={setIsCreating}
            handleCreate={handleCreate}
            handleDelete={handleDelete}
            onClose={onClose}
        />
    );
}