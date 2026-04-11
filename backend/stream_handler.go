// backend/stream_handler.go
package backend

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
)

func (a *App) StreamHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Headers CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Range, Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// 2. Parsear URL
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

	filename := "file"
	if len(parts) > 1 {
		filename = parts[1]
	}

	// 3. Enviar el archivo directamente desde el sistema de archivos
	mediaDir := filepath.Join(filepath.Dir(a.dbPath), "media", "vault")
	physicalPath := filepath.Join(mediaDir, fmt.Sprintf("%d_%s", fileID, filename))

	// Rangos y streaming directamente desde el disco
	http.ServeFile(w, r, physicalPath)
}
