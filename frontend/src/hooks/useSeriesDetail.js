import { useState, useEffect } from 'react';
import { backend } from '../services/controller';

export function useSeriesDetail(entryId) {
    const [groups, setGroups] = useState([]);
    const [expandedGroupId, setExpandedGroupId] = useState(null);
    const [assets, setAssets] = useState({}); 
    const [uploadingGroupId, setUploadingGroupId] = useState(null);
    const [uploadProgress, setUploadProgress] = useState("");
    const [viewerContext, setViewerContext] = useState(null);

    useEffect(() => {
        if (entryId) loadGroups();
    }, [entryId]);

    const loadGroups = () => {
        backend.groupSets.getAll(entryId).then(res => setGroups(res || []));
    };

    const loadAssets = (groupId) => {
        backend.files.getAll(groupId).then(res => {
            setAssets(prev => ({ ...prev, [groupId]: res || [] }));
        });
    };

    const toggleGroup = (groupId) => {
        if (expandedGroupId === groupId) {
            setExpandedGroupId(null);
        } else {
            setExpandedGroupId(groupId);
            if (!assets[groupId]) {
                loadAssets(groupId);
            }
        }
    };

    const handleCreateGroup = () => {
        const title = prompt("Enter new collection name (e.g., 'Season 1', 'Volume 1'):");
        if (title) {
            backend.groupSets.create(entryId, title, "collection")
                .then(() => loadGroups())
                .catch(err => alert("Error creating collection: " + err));
        }
    };

    const handleDeleteGroup = (groupId) => {
        if (confirm("Delete this entire collection and ALL its files? This cannot be undone.")) {
            backend.groupSets.delete(groupId)
                .then(() => {
                    loadGroups();
                    setExpandedGroupId(null);
                })
                .catch(err => alert("Error deleting collection: " + err));
        }
    };

    const handleFileUpload = async (groupId) => {
        setUploadingGroupId(groupId);
        setUploadProgress("Waiting for OS File Picker...");
        
        try {
            await backend.files.import(groupId); 
            loadAssets(groupId); 
        } catch (err) {
            alert("Upload failed: " + err);
        } finally {
            setUploadingGroupId(null);
            setUploadProgress("");
        }
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const groupId = parseInt(result.source.droppableId.split('-')[1]);
        const groupAssets = Array.from(assets[groupId]);
        const [moved] = groupAssets.splice(result.source.index, 1);
        groupAssets.splice(result.destination.index, 0, moved);

        const updatedAssets = groupAssets.map((asset, index) => ({
            ...asset,
            sort_order: index + 1
        }));

        setAssets(prev => ({ ...prev, [groupId]: updatedAssets }));
        backend.files.updateOrder(updatedAssets).catch(() => loadAssets(groupId));
    };

    const handleDownload = (asset) => {
        backend.files.export(asset.id, asset.filename)
            .then(() => alert("Download Complete!"))
            .catch((err) => alert("Error: " + err));
    };

    const handleDeleteAsset = (assetId, groupId) => {
        if (confirm(`Delete this file?`)) {
            backend.files.delete(assetId, groupId).then(() => loadAssets(groupId));
        }
    };

    const handleView = (asset, groupAssets, index) => {
        const mime = (asset.mime_type || '').toLowerCase();
        const fname = (asset.filename || '').toLowerCase();
        
        if (mime.startsWith('video/') || fname.endsWith('.mp4') || fname.endsWith('.mkv') || fname.endsWith('.webm')) {
            setViewerContext({ type: 'video', playlist: groupAssets, startIndex: index });
        } else if (mime.includes('pdf') || fname.endsWith('.pdf')) {
            setViewerContext({ type: 'pdf', asset: asset });
        } else if (mime.includes('epub') || fname.endsWith('.epub')) {
            setViewerContext({ type: 'epub', asset: asset });
        } else {
            alert("No viewer available for this file type.");
        }
    };

    const closeViewer = () => setViewerContext(null);

    return {
        groups, assets, expandedGroupId, uploadingGroupId, uploadProgress, viewerContext,
        toggleGroup, handleCreateGroup, handleDeleteGroup, handleFileUpload, 
        handleDragEnd, handleDownload, handleDeleteAsset, handleView, closeViewer
    };
}