import { useState, useEffect } from 'react';
import { 
    GetMediaGroups, GetMediaAssets, SaveMediaGroup, SaveMediaAsset, 
    DeleteMediaGroup, DeleteMediaAsset, ExportMediaAsset, UpdateAssetOrder 
} from '../../wailsjs/go/main/App';

// Helper: Promisified File Reader
const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const base64 = result.split(',')[1]; 
            resolve(base64);
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

export function useSeriesDetail(entryId) {
    const [groups, setGroups] = useState([]);
    const [expandedGroupId, setExpandedGroupId] = useState(null);
    const [assets, setAssets] = useState({}); 
    const [uploadingGroupId, setUploadingGroupId] = useState(null);
    const [uploadProgress, setUploadProgress] = useState("");
    
    // Unified Viewer Context (Video, PDF, Epub)
    const [viewerContext, setViewerContext] = useState(null);

    useEffect(() => {
        if (entryId) loadGroups();
    }, [entryId]);

    const loadGroups = () => {
        GetMediaGroups(entryId).then(res => setGroups(res || []));
    };

    const toggleGroup = (groupId) => {
        if (expandedGroupId === groupId) {
            setExpandedGroupId(null);
        } else {
            setExpandedGroupId(groupId);
            loadAssets(groupId);
        }
    };

    const loadAssets = (groupId) => {
        return GetMediaAssets(groupId).then(res => {
            const sorted = (res || []).sort((a, b) => a.sort_order - b.sort_order);
            setAssets(prev => ({ ...prev, [groupId]: sorted }));
        });
    };

    const handleCreateGroup = () => {
        const title = prompt("New Collection Title (e.g., 'Season 1', 'Volume 1'):");
        if (!title) return;
        const sortOrder = groups.length + 1;
        SaveMediaGroup({ entry_id: entryId, title, category: 'volume', sort_order: sortOrder })
            .then(loadGroups);
    };

    const handleDeleteGroup = (id) => {
        if (confirm("Delete this collection and all its files?")) {
            DeleteMediaGroup(id).then(loadGroups);
        }
    };

    const handleFileUpload = async (e, groupId) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingGroupId(groupId);
        setUploadProgress(`Preparing ${files.length} files...`);
        let currentSortOrder = (assets[groupId] || []).length;

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setUploadProgress(`Importing ${i + 1}/${files.length}: ${file.name}`);
                const base64 = await readFileAsBase64(file);
                currentSortOrder++;
                const assetPayload = {
                    group_id: groupId,
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    filename: file.name,
                    mime_type: file.type,
                    sort_order: currentSortOrder
                };
                await SaveMediaAsset(assetPayload, base64);
            }
            await loadAssets(groupId);
        } catch (err) {
            console.error(err);
            alert("Batch upload stopped due to error:\n" + err);
        } finally {
            setUploadingGroupId(null);
            setUploadProgress("");
            e.target.value = null;
        }
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination } = result;
        const groupId = parseInt(result.type.split('-')[1]);
        
        const currentAssets = [...assets[groupId]];
        const [movedItem] = currentAssets.splice(source.index, 1);
        currentAssets.splice(destination.index, 0, movedItem);

        const updatedAssets = currentAssets.map((asset, index) => ({
            ...asset,
            sort_order: index + 1
        }));

        setAssets(prev => ({ ...prev, [groupId]: updatedAssets }));
        UpdateAssetOrder(updatedAssets).catch(() => loadAssets(groupId));
    };

    const handleDownload = (asset) => {
        ExportMediaAsset(asset.id, asset.filename)
            .then(() => alert("Download Complete!"))
            .catch((err) => alert("Error: " + err));
    };

    const handleDeleteAsset = (assetId, groupId) => {
        if (confirm("Delete this file?")) {
            DeleteMediaAsset(assetId).then(() => loadAssets(groupId));
        }
    };

    // Unified Viewer Logic
    const handleView = (asset, groupAssets, index) => {
        const mime = asset.mime_type;
        if (mime.startsWith('video/')) {
            setViewerContext({ type: 'video', playlist: groupAssets, startIndex: index });
        } else if (mime === 'application/pdf') {
            setViewerContext({ type: 'pdf', asset: asset });
        } else if (mime === 'application/epub+zip') {
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