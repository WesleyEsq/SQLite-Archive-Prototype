// src/utils/FileValidator.js

// 1. Supported MIME Types (The Allowlist)
const SUPPORTED_VIEWABLE = {
    'video/mp4': 'video',
    'video/webm': 'video',
    'application/pdf': 'pdf',
    'application/epub+zip': 'epub',
    'image/jpeg': 'image', // Bonus: Image viewer support
    'image/png': 'image'
};

// 2. Main Validator Class
export const FileAuth = {
    /**
     * Checks if we can open this file inside the app.
     * @param {string} mimeType 
     * @returns {string|null} - 'video', 'pdf', 'epub', or null
     */
    getViewType: (mimeType) => {
        return SUPPORTED_VIEWABLE[mimeType] || null;
    },

    /**
     * Returns a human-friendly icon for the file list
     */
    getIcon: (mimeType) => {
        if (mimeType.startsWith('video/')) return '🎬';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('epub')) return '📚';
        if (mimeType.startsWith('image/')) return '🖼️';
        return '📁';
    },

    /**
     * Sanitizes filenames to remove dangerous characters
     */
    sanitizeName: (name) => {
        return name.replace(/[^a-zA-Z0-9._-]/g, "_");
    }
};