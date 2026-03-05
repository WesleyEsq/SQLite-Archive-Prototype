package main

import (
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
	// 1. Initialize DB
	myDB, err := InitDB("./compendium.db")
	if err != nil {
		log.Fatal("Could not open database:", err)
	}
	defer myDB.conn.Close()

	app := NewApp(myDB)

	// 2. Start the Sidecar Streaming Server
	go func() {
		// This uses the StreamHandler we defined above
		mux := http.NewServeMux()
		mux.HandleFunc("/stream/", app.StreamHandler)

		log.Println("Sidecar streaming server running on http://localhost:40001")
		if err := http.ListenAndServe(":40001", mux); err != nil {
			log.Fatal("Streaming server crashed:", err)
		}
	}()

	imgHandler := NewImageHandler(myDB.conn)

	// 3. RUN WAILS
	err = wails.Run(&options.App{
		Title:  "GoGL Compendium",
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
