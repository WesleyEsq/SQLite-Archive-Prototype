import React, { useState, useEffect, useMemo } from 'react';
import { backend } from '../services/controller';
import VaultBrowser from '../components/VaultBrowser';

export default function VaultController() {
    const [allFiles, setAllFiles] = useState([]);
    const [currentPath, setCurrentPath] = useState('/');
    const [isLoading, setIsLoading] = useState(true);

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
                // THE TRICK: Do not render the .keep dummy file as an actual file!
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

    const handleDelete = (id) => {
        if (window.confirm("Delete this file permanently?")) {
            backend.vault.delete(id).then(loadFiles);
        }
    };

    // --- NEW: Action Handlers ---
    const handleCreateFolder = () => {
        const folderName = window.prompt("Enter new folder name:");
        if (!folderName || folderName.trim() === "") return;
        
        // Clean the input so it doesn't break our slash logic
        const safeName = folderName.replace(/\//g, "").trim();
        const newPath = currentPath + safeName + '/';
        
        backend.vault.createFolder(newPath).then(loadFiles);
    };

    const handleUploadFile = () => {
        // We trigger the Go OS picker, then reload when it's done
        backend.vault.uploadFile(currentPath).then(loadFiles);
    };

    // --- File CRUD ---
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

    // --- Folder CRUD ---
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

    return (
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
        />
    );
}