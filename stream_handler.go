package main

import (
	"bytes"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// StartMediaServer spins up a dedicated HTTP server for streaming
func StartMediaServer(app *App) {
	mux := http.NewServeMux()

	mux.HandleFunc("/stream/", func(w http.ResponseWriter, r *http.Request) {
		// 1. CORS Headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "*")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// 2. Parse ID (ROBUST VERSION)
		// We expect: /stream/123  OR  /stream/123/chapter1.mp4
		path := strings.TrimPrefix(r.URL.Path, "/stream/")

		// Split by slash and take the first part (the ID)
		// This ignores "/filename.epub" at the end
		parts := strings.Split(path, "/")
		idStr := parts[0]

		assetID, err := strconv.Atoi(idStr)
		if err != nil {
			log.Printf("[MediaServer] Invalid ID format: %s", idStr)
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		// 3. Fetch Blob
		fmt.Printf("[MediaServer] Streaming Asset %d\n", assetID)
		data, mimeType, err := app.db.FetchAssetBlob(assetID)
		if err != nil {
			http.Error(w, "Not Found", http.StatusNotFound)
			return
		}

		// 4. Serve Content
		w.Header().Set("Content-Type", mimeType)
		reader := bytes.NewReader(data)
		// We use "file" as a generic name, or you could query the real filename if you wanted perfect "Save As" behavior
		http.ServeContent(w, r, "file", time.Now(), reader)
	})

	addr := "127.0.0.1:40001"
	fmt.Printf("[MediaServer] 🚀 Listening on http://%s\n", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal("[MediaServer] Failed to start:", err)
	}
}
