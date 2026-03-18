// src/utils/HistoryManager.js

const HISTORY_KEY = 'compendium_recent_history';
const MAX_HISTORY = 20; // Keep the top 20 most recent items

export const HistoryManager = {
    // 1. Get the current history array
    getHistory: () => {
        try {
            const data = localStorage.getItem(HISTORY_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to parse history", e);
            return [];
        }
    },

    // 2. Save or Update progress for a specific file
    saveProgress: (file, entry, percentage, type, resumeData) => {
        // FIX: Only require the file. Entry can be null if played from the Vault!
        if (!file) return;

        let history = HistoryManager.getHistory();
        
        // Remove the old record for this exact file so we don't get duplicates
        history = history.filter(h => h.fileId !== file.id);

        // Add the fresh record to the very top (index 0)
        history.unshift({
            fileId: file.id,
            filename: file.filename,
            // Fallbacks for when played directly from the Vault
            entryId: entry ? entry.id : null,
            entryTitle: entry ? entry.title : "Vault File",
            percentage: Math.min(Math.max(percentage, 0), 100) || 0, 
            type: type,
            resumeData: resumeData,
            lastUpdated: Date.now()
        });

        // Cap the array size
        if (history.length > MAX_HISTORY) {
            history = history.slice(0, MAX_HISTORY);
        }

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    },

    // 3. Clear a specific item (for when a user finishes a video)
    clearProgress: (fileId) => {
        let history = HistoryManager.getHistory();
        history = history.filter(h => h.fileId !== fileId);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
};