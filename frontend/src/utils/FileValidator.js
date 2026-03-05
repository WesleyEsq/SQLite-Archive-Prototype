// src/utils/FileValidator.js

export const FileAuth = {
    /**
     * Robust check combining mimeType and filename extension
     * @param {string} mimeType 
     * @param {string} filename
     * @returns {string|null} - 'video', 'pdf', 'epub', 'image' or null
     */
    getViewType: (mimeType, filename = "") => {
        const mime = (mimeType || '').toLowerCase();
        const fname = (filename || '').toLowerCase();
        
        if (mime.startsWith('video/') || fname.endsWith('.mp4') || fname.endsWith('.webm') || fname.endsWith('.mkv')) {
            return 'video';
        }
        if (mime.includes('pdf') || fname.endsWith('.pdf')) {
            return 'pdf';
        }
        if (mime.includes('epub') || fname.endsWith('.epub')) {
            return 'epub';
        }
        if (mime.startsWith('image/') || fname.endsWith('.jpg') || fname.endsWith('.png') || fname.endsWith('.webp')) {
            return 'image';
        }
        
        return null;
    },

    /**
     * Returns a human-friendly icon for the file list
     */
    getIcon: (mimeType, filename = "") => {
        const type = FileAuth.getViewType(mimeType, filename);
        if (type === 'video') return '🎬';
        if (type === 'pdf') return '📄';
        if (type === 'epub') return '📚';
        if (type === 'image') return '🖼️';
        return '📁';
    },

    /**
     * Sanitizes filenames to remove dangerous characters
     */
    sanitizeName: (name) => {
        return name.replace(/[^a-zA-Z0-9._-]/g, "_");
    }
};