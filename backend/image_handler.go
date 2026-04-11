// backend/image_handler.go
package backend

import (
	"crypto/md5"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type ImageHandler struct {
	mediaDir string
}

// Modificamos el constructor para recibir la ruta de la DB y calcular dónde está la carpeta media
func NewImageHandler(dbPath string) *ImageHandler {
	dir := filepath.Join(filepath.Dir(dbPath), "media")
	return &ImageHandler{mediaDir: dir}
}

// AssetMiddleware intercepts requests to /images/ and serves them from the File System
func (h *ImageHandler) AssetMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// Helper function para ETag caching (¡Intacto!)
		serveWithETag := func(imgData []byte) {
			hash := md5.Sum(imgData)
			etag := fmt.Sprintf(`"%x"`, hash)

			w.Header().Set("ETag", etag)
			w.Header().Set("Cache-Control", "no-cache")
			w.Header().Set("Content-Type", "image/jpeg")

			if match := r.Header.Get("If-None-Match"); match == etag {
				w.WriteHeader(http.StatusNotModified)
				return
			}
			w.Write(imgData)
		}

		// --- 1. Handle Library Covers ---
		if strings.HasPrefix(r.URL.Path, "/images/library/") {
			idStr := strings.TrimPrefix(r.URL.Path, "/images/library/")
			idStr = strings.Split(idStr, "?")[0]
			libID, _ := strconv.Atoi(idStr)

			// NUEVO: Leer del File System
			imgPath := filepath.Join(h.mediaDir, "library_covers", fmt.Sprintf("%d.jpg", libID))
			imgData, err := os.ReadFile(imgPath)

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
			idStr = strings.Split(idStr, "?")[0]
			entryID, err := strconv.Atoi(idStr)

			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			// Leer del File System
			imgPath := filepath.Join(h.mediaDir, "entry_covers", fmt.Sprintf("%d.jpg", entryID))
			imgData, readErr := os.ReadFile(imgPath)
			if readErr == nil && len(imgData) > 0 {
				serveWithETag(imgData)
				return
			}
			imgData, err = os.ReadFile(imgPath)

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
