package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// 1. Initialize DB
	myDB, err := InitDB("./compendium.db")
	if err != nil {
		log.Fatal("Could not open database:", err)
	}
	defer myDB.conn.Close()

	app := NewApp(myDB)
	imgHandler := NewImageHandler(myDB.conn)

	// 2. RUN WAILS (Fixed Configuration)
	err = wails.Run(&options.App{
		Title:  "GoGL Compendium",
		Width:  1024,
		Height: 768,

		// --- THE FIX IS HERE ---
		AssetServer: &assetserver.Options{
			Assets: assets,
			// We plug our handler in as "Middleware" so it can
			// coexist with your frontend files.
			Middleware: imgHandler.AssetMiddleware,
		},
		// REMOVED: AssetsHandler: imgHandler (This was causing the panic)

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
