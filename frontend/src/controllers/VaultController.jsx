import React, { useState, useEffect, useMemo } from 'react';
import { backend } from '../services/controller';
import VaultBrowser from '../components/VaultBrowser';

import MediaPlayer from '../components/viewers/MediaPlayer';
import PDFViewer from '../components/viewers/PDFViewer';
import EpubViewer from '../components/viewers/EpubViewer';
import ImageViewer from '../components/viewers/ImageViewer';

export default function VaultController() {
    const [allFiles, setAllFiles] = useState([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [isLoading, setIsLoading] = useState(true);
    
    // Controls which file is currently being viewed in a modal
    const [previewFile, setPreviewFile] = useState(null);

    const loadFiles = () => {
        setIsLoading(true);
        backend.vault.getAll().then(res => {
            setAllFiles(res || []);
            setIsLoading(false);
        }).catch(err => {
            console.error("Vault Error:", err);
            setIsLoading(false);
        });
    };

    useEffect(() => { loadFiles(); }, []);

    const { files, folders } = useMemo(() => {
        const currentFiles = [];
        const currentFolders = new Set();
        const normalizedCurrent = currentPath.endsWith('/') ? currentPath : currentPath + '/';

        allFiles.forEach(file => {
            const path = file.virtual_path || '/';
            const normalizedPath = path.endsWith('/') ? path : path + '/';

            if (normalizedPath === normalizedCurrent) {
                if (file.filename !== '.keep') {
                    currentFiles.push(file);
                }
            } else if (normalizedPath.startsWith(normalizedCurrent)) {
                const remainder = normalizedPath.substring(normalizedCurrent.length);
                const nextSlashIndex = remainder.indexOf('/');
                const folderName = remainder.substring(0, nextSlashIndex);
                if (folderName) currentFolders.add(folderName);
            }
        });

        return { files: currentFiles, folders: Array.from(currentFolders).sort() };
    }, [allFiles, currentPath]);

    const navigateTo = (folderName, isRoot = false) => {
        if (isRoot) setCurrentPath('/');
        else setCurrentPath(prev => prev + folderName + '/');
    };

    const navigateUp = () => {
        if (currentPath === '/') return;
        const parts = currentPath.split('/').filter(p => p);
        parts.pop();
        setCurrentPath(parts.length === 0 ? '/' : '/' + parts.join('/') + '/');
    };

    // --- Action Handlers ---
    const handleCreateFolder = () => {
        const folderName = window.prompt("Enter new folder name:");
        if (!folderName || folderName.trim() === "") return;
        const safeName = folderName.replace(/\//g, "").trim();
        const newPath = currentPath + safeName + '/';
        backend.vault.createFolder(newPath).then(loadFiles);
    };

    const handleUploadFile = () => {
        backend.vault.uploadFile(currentPath).then(loadFiles);
    };

    const handleRenameFile = (id, currentName) => {
        const newName = window.prompt("Rename file:", currentName);
        if (newName && newName.trim() !== "" && newName !== currentName) {
            backend.vault.rename(id, newName.trim()).then(loadFiles);
        }
    };

    const handleDeleteFile = (id) => {
        if (window.confirm("Delete this file permanently?")) {
            backend.vault.delete(id).then(loadFiles);
        }
    };

    const handleRenameFolder = (folderName) => {
        const newName = window.prompt("Rename folder:", folderName);
        if (!newName || newName.trim() === "" || newName === folderName) return;
        const safeName = newName.replace(/\//g, "").trim();
        const oldPath = currentPath + folderName + '/';
        const newPath = currentPath + safeName + '/';
        backend.vault.renameFolder(oldPath, newPath).then(loadFiles);
    };

    const handleDeleteFolder = (folderName) => {
        if (window.confirm(`Delete folder "${folderName}" AND all files inside it? This cannot be undone.`)) {
            const targetPath = currentPath + folderName + '/';
            backend.vault.deleteFolder(targetPath).then(loadFiles);
        }
    };

    const handleDropMove = (fileId, targetFolder) => {
        if (!fileId) return;
        let newPath;
        if (targetFolder === 'UP_ONE_LEVEL') {
            if (currentPath === '/') return;
            const parts = currentPath.split('/').filter(p => p);
            parts.pop();
            newPath = parts.length === 0 ? '/' : '/' + parts.join('/') + '/';
        } else {
            const safeName = targetFolder.replace(/\//g, "").trim();
            newPath = currentPath + safeName + '/';
        }
        backend.vault.move(parseInt(fileId), newPath).then(loadFiles);
    };

    // --- VIEWER ROUTING LOGIC ---
    const renderViewer = () => {
        if (!previewFile) return null;

        const mime = (previewFile.mime_type || '').toLowerCase();
        const fname = (previewFile.filename || '').toLowerCase();
        
        const asset = {
            id: previewFile.id,
            filename: previewFile.filename,
            title: previewFile.filename,
            mime_type: mime
        };

        const closePreview = () => setPreviewFile(null);

        // Robust check: Looks at both the mime_type AND the file extension
        if (mime.startsWith('video/') || fname.match(/\.(mp4|webm|mkv|avi)$/)) {
            return <MediaPlayer playlist={[asset]} startIndex={0} onClose={closePreview} />;
        }
        if (mime.includes('pdf') || fname.endsWith('.pdf')) {
            return <PDFViewer asset={asset} onClose={closePreview} />;
        }
        if (mime.includes('epub') || fname.endsWith('.epub')) {
            return <EpubViewer asset={asset} onClose={closePreview} />;
        }
        if (mime.startsWith('image/') || fname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return <ImageViewer asset={asset} onClose={closePreview} />;
        }

        alert("No viewer available for this file type: " + previewFile.filename);
        closePreview();
        return null;
    };

    return (
        <>
            <VaultBrowser 
                currentPath={currentPath}
                files={files}
                folders={folders}
                isLoading={isLoading}
                navigateTo={navigateTo}
                navigateUp={navigateUp}
                handleCreateFolder={handleCreateFolder}
                handleUploadFile={handleUploadFile}
                handleDeleteFile={handleDeleteFile}
                handleRenameFile={handleRenameFile}
                handleRenameFolder={handleRenameFolder}
                handleDeleteFolder={handleDeleteFolder}
                handleDropMove={handleDropMove}
                handlePreview={(file) => setPreviewFile(file)}
            />
            
            {/* THIS WAS THE FIX: The Viewer renders ON TOP of the VaultBrowser! */}
            {renderViewer()}
        </>
    );
}