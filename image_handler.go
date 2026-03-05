package main

import (
	"crypto/md5"
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
)

type ImageHandler struct {
	db *sql.DB
}

func NewImageHandler(db *sql.DB) *ImageHandler {
	return &ImageHandler{db: db}
}

// AssetMiddleware intercepts requests to /images/ and serves them from SQLite
func (h *ImageHandler) AssetMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// Helper function to handle ETag caching logic cleanly
		serveWithETag := func(imgData []byte) {
			// 1. Generate a quick MD5 hash of the image bytes
			hash := md5.Sum(imgData)
			etag := fmt.Sprintf(`"%x"`, hash)

			// 2. Set headers
			w.Header().Set("ETag", etag)
			// 'no-cache' forces the browser to revalidate the ETag every single time
			w.Header().Set("Cache-Control", "no-cache")
			w.Header().Set("Content-Type", "image/jpeg")

			// 3. Check if the browser already has this exact image version
			if match := r.Header.Get("If-None-Match"); match == etag {
				// The image hasn't changed! Send a 0-byte response to save memory/bandwidth
				w.WriteHeader(http.StatusNotModified)
				return
			}

			// 4. The image is new (or not cached yet). Send the full bytes.
			w.Write(imgData)
		}

		// --- 1. Handle Library Covers ---
		if strings.HasPrefix(r.URL.Path, "/images/library/") {
			idStr := strings.TrimPrefix(r.URL.Path, "/images/library/")
			idStr = strings.Split(idStr, "?")[0] // Strip any legacy frontend cache-busters
			libID, _ := strconv.Atoi(idStr)

			var imgData []byte
			err := h.db.QueryRow("SELECT cover_image FROM libraries WHERE id = ?", libID).Scan(&imgData)
			if err == nil && len(imgData) > 0 {
				serveWithETag(imgData)
				return
			}
			http.NotFound(w, r)
			return
		}

		// --- 2. Handle Entry Covers ---
		if strings.HasPrefix(r.URL.Path, "/images/") {
			idStr := strings.TrimPrefix(r.URL.Path, "/images/")
			idStr = strings.Split(idStr, "?")[0] // Strip any legacy frontend cache-busters
			entryID, err := strconv.Atoi(idStr)

			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			var imgData []byte
			err = h.db.QueryRow("SELECT image_data FROM entry_covers WHERE entry_id = ?", entryID).Scan(&imgData)
			if err == nil && len(imgData) > 0 {
				serveWithETag(imgData)
				return
			}

			http.NotFound(w, r)
			return
		}

		// Not an image request, pass it back to Wails
		next.ServeHTTP(w, r)
	})
}
