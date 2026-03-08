package main

import (
	"GoGLproject/backend"
	"embed"
	"log"
	"net/http"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// USE THE BACKEND PACKAGE FOR INIT
	myDB, err := backend.InitDB("./compendium.db")
	if err != nil {
		log.Fatal("Could not open database:", err)
	}

	defer myDB.Close()

	// USE THE BACKEND PACKAGE FOR APP
	app := backend.NewApp(myDB)

	go func() {
		mux := http.NewServeMux()
		// app.StreamHandler still works perfectly!
		mux.HandleFunc("/stream/", app.StreamHandler)

		log.Println("Sidecar streaming server running on http://localhost:40001")
		if err := http.ListenAndServe(":40001", mux); err != nil {
			log.Fatal("Streaming server crashed:", err)
		}
	}()

	// PASS THE WHOLE DB STRUCT, NOT JUST THE CONN
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
		OnStartup:        app.Startup, // Still works!
		Bind: []interface{}{
			app, // Wails will automatically inspect this and bind all the exported backend methods!
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
