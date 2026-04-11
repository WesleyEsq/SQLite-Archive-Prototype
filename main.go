package main

import (
	"GoGLproject/backend"
	"embed"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

// getDBPath asegura que la base de datos se guarde en una ruta estándar del sistema operativo
// (ej. AppData/Roaming/Compendium en Windows, o ~/.config/Compendium en Linux/Mac)
func getDBPath() string {
	configDir, err := os.UserConfigDir()
	if err != nil {
		configDir = "." // Fallback al directorio actual si hay error
	}
	appDir := filepath.Join(configDir, "Compendium")

	// Crea las carpetas si no existen
	os.MkdirAll(appDir, os.ModePerm)

	return filepath.Join(appDir, "compendium.db")
}

func main() {
	dbPath := getDBPath()
	log.Println("Database path:", dbPath)

	myDB, err := backend.InitDB(dbPath)
	if err != nil {
		log.Fatal("Could not open database:", err)
	}
	defer myDB.Close()

	app := backend.NewApp(myDB, dbPath)

	go func() {
		mux := http.NewServeMux()
		mux.HandleFunc("/stream/", app.StreamHandler)

		log.Println("Sidecar streaming server running on http://localhost:40001")
		if err := http.ListenAndServe(":40001", mux); err != nil {
			log.Fatal("Streaming server crashed:", err)
		}
	}()

	imgHandler := backend.NewImageHandler(myDB)

	err = wails.Run(&options.App{
		Title:  "Local Compendium",
		Width:  1024,
		Height: 768,

		AssetServer: &assetserver.Options{
			Assets:     assets,
			Middleware: imgHandler.AssetMiddleware,
		},

		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.Startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
