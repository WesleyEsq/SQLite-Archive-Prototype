package main

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"

	lru "github.com/hashicorp/golang-lru/v2"
)

type ImageHandler struct {
	db    *sql.DB
	cache *lru.Cache[int, []byte]
}

func NewImageHandler(db *sql.DB) *ImageHandler {
	cache, _ := lru.New[int, []byte](100)
	return &ImageHandler{
		db:    db,
		cache: cache,
	}
}

// AssetMiddleware intercepts requests to /images/
func (h *ImageHandler) AssetMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/images/") {
			h.ServeHTTP(w, r)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (h *ImageHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// 1. Parse ID
	idStr := strings.TrimPrefix(r.URL.Path, "/images/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	// 2. Check Cache
	if imgBytes, ok := h.cache.Get(id); ok {
		w.Header().Set("Content-Type", "image/jpeg")
		w.Header().Set("Cache-Control", "public, max-age=3600")
		w.Write(imgBytes)
		return
	}

	// 3. Database Lookup (RAW BYTES)
	var imgBytes []byte

	// Note: We scan directly into []byte, NOT string.
	// SQLite passes the raw blob straight to us.
	err = h.db.QueryRow("SELECT image FROM entries WHERE id = ?", id).Scan(&imgBytes)

	if err != nil {
		if err == sql.ErrNoRows {
			// This helps debugging: print to terminal if ID doesn't exist
			println("Image Handler: ID not found:", id)
			http.NotFound(w, r)
		} else {
			// This prints the actual DB error to your VS Code terminal
			println("Image Handler DB Error:", err.Error())
			http.Error(w, "DB Error", http.StatusInternalServerError)
		}
		return
	}

	// 4. (REMOVED BASE64 DECODING) - The bytes are already raw!

	// 5. Update Cache & Serve
	if len(imgBytes) > 0 {
		h.cache.Add(id, imgBytes)
		w.Header().Set("Content-Type", "image/jpeg")
		w.Write(imgBytes)
	} else {
		http.NotFound(w, r)
	}
}
