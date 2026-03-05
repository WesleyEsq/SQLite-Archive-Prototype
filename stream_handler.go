package main

import (
	"bytes"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// StreamHandler serves media files from SQLite to the React frontend
func (a *App) StreamHandler(w http.ResponseWriter, r *http.Request) {
	// 1. CRITICAL: CORS Headers for PDF.js and Epub.js to allow fetch()
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Range, Content-Type")

	// Pre-flight request for browsers
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Parse the URL: /stream/{id}/{filename}
	parts := strings.Split(strings.TrimPrefix(r.URL.Path, "/stream/"), "/")
	if len(parts) < 1 {
		http.Error(w, "Invalid URL format", http.StatusBadRequest)
		return
	}

	fileID, err := strconv.Atoi(parts[0])
	if err != nil {
		http.Error(w, "Invalid File ID", http.StatusBadRequest)
		return
	}

	// 3. Fetch metadata (mime_type)
	var mimeType string
	err = a.db.conn.QueryRow("SELECT mime_type FROM files WHERE id = ?", fileID).Scan(&mimeType)
	if err != nil {
		http.Error(w, "File metadata not found", http.StatusNotFound)
		return
	}

	// 4. Fetch the raw BLOB data
	var data []byte
	err = a.db.conn.QueryRow("SELECT data FROM objects WHERE file_id = ?", fileID).Scan(&data)
	if err != nil {
		http.Error(w, "File content not found", http.StatusNotFound)
		return
	}

	// 5. Serve the content properly!
	// ServeContent handles "Accept-Ranges" automatically, which is MANDATORY for video scrubbing
	content := bytes.NewReader(data)
	w.Header().Set("Content-Type", mimeType)

	filename := "file"
	if len(parts) > 1 {
		filename = parts[1]
	}

	http.ServeContent(w, r, filename, time.Now(), content)
}
