package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	app := NewApp()

	// --- CHANGE START ---
	// 1. Initialize the DB manually here so we can pass it to the media server immediately
	// (Alternatively, you can keep InitDB in app.Startup, but we need it for the server)
	// For safety, let's rely on app.Startup to init the DB, but launch the server
	// inside the Startup hook or simply handle the nil pointer safely.

	// Better approach: Let Wails init the App, and inside App.Startup, we launch the server.
	// But to keep it simple as requested:

	// Let's stick to the standard Wails flow but launch the server inside app.Startup
	// (See Step 2.5 below)
	// --- CHANGE END ---

	err := wails.Run(&options.App{
		Title:  "GoGL Compendium",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
			// Handler: streamHandler, <--- DELETE THIS LINE (Clean up the mess)
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.Startup, // <--- We will hook into this
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
