import * as Wails from '../../wailsjs/go/backend/App';

export const backend = {
    // ==========================================
    // 1. LIBRARIES
    // ==========================================
    libraries: {
        getAll: () => Wails.GetLibraries(),
        get: (id) => Wails.GetLibrary(id),
        create: (name, libType) => Wails.CreateLibrary(name, libType),
        update: (lib) => Wails.UpdateLibrary(lib),
        setCover: (id) => Wails.SetLibraryCover(id),
    },

    // ==========================================
    // 2. ENTRIES
    // ==========================================
    entries: {
        getAll: (libraryId) => Wails.GetEntries(libraryId),
        save: (entry) => Wails.SaveEntry(entry),
        delete: (id) => Wails.DeleteEntry(id),
        updateOrder: (entries) => Wails.UpdateOrder(entries),
        setCover: (id) => Wails.SetCoverImage(id),
        getByTag: (libraryId, tagId) => Wails.GetEntriesByTag(libraryId, tagId),
    },

    // ==========================================
    // 3. GROUP SETS (Seasons, Volumes)
    // ==========================================
    groupSets: {
        getAll: (entryId) => Wails.GetGroupSets(entryId),
        create: (entryId, title, category) => Wails.CreateGroupSet(entryId, title, category),
        delete: (id) => Wails.DeleteGroupSet(id),
    },

    // ==========================================
    // 4. FILES & MEDIA
    // ==========================================
    files: {
        getAll: (groupsetId) => Wails.GetFiles(groupsetId),
        import: (groupsetId) => Wails.ImportFile(groupsetId),
        delete: (fileId, groupsetId) => Wails.DeleteFile(fileId, groupsetId),
        updateOrder: (files) => Wails.UpdateFileOrder(files),
        export: (fileId, filename) => Wails.ExportMediaAsset(fileId, filename),
    },

    // ==========================================
    // 5. TAGS
    // ==========================================
    tags: {
        getAll: () => Wails.GetAllTags(),
        getForEntry: (entryId) => Wails.GetTagsForEntry(entryId),
        create: (name, description, icon, isCategory) => Wails.CreateTag(name, description, icon, isCategory),
        update: (id, name, description, icon, isCategory) => Wails.UpdateTag(id, name, description, icon, isCategory),
        delete: (id) => Wails.DeleteTag(id),
        updateEntryTags: (entryId, tagIds) => Wails.UpdateEntryTags(entryId, tagIds),
    },
    // ==========================================
    // 6. LEGACY CSV (Import/Export)
    // ==========================================
    system: {
        importCSV: (libraryId) => Wails.ImportLegacyCSV(libraryId),
        exportCSV: (libraryId) => Wails.ExportLibraryCSV(libraryId),
    },

    // ==========================================
    // 7. Vault File Management
    // ==========================================
    vault: {
        getAll: () => Wails.GetAllVaultFiles(),
        move: (fileId, newPath) => Wails.MoveVaultFile(fileId, newPath),
        rename: (fileId, newName) => Wails.RenameVaultFile(fileId, newName),
        delete: (fileId) => Wails.DeleteVaultFile(fileId),
        createFolder: (path) => Wails.CreateVaultFolder(path),
        uploadFile: (path) => Wails.PromptAndUploadVaultFile(path),
        renameFolder: (oldPath, newPath) => Wails.RenameVaultFolder(oldPath, newPath),
        deleteFolder: (path) => Wails.DeleteVaultFolder(path),
    },
};

