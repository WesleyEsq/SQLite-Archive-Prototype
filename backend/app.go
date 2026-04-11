package backend

import (
	"context"
	"encoding/csv"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx    context.Context
	db     *DB
	dbPath string
}

// NewApp creates a new App application struct
func NewApp(db *DB, dbPath string) *App {
	return &App{
		db:     db,
		dbPath: dbPath,
	}
}

// Startup is called when the app starts.
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	// Initialization happens in main.go now, so we just store context here.
}

// ==========================================
// 1. LIBRARIES (The New Top Level)
// ==========================================

func (a *App) GetLibraries() ([]Library, error) {
	// Let's assume you add a simple GetLibraries() to database.go
	return a.db.GetLibraries()
}

func (a *App) CreateLibrary(name, libType string) error {
	return a.db.CreateLibrary(name, libType)
}

// ==========================================
// 2. ENTRIES (Replaces MangaEntry)
// ==========================================

// GetEntries now requires a LibraryID to fetch the correct items
func (a *App) GetEntries(libraryID int) ([]Entry, error) {
	return a.db.GetEntries(libraryID)
}

func (a *App) SaveEntry(entry Entry) error {
	// For the prototype, default to Library 1 if it's missing
	if entry.LibraryID == 0 {
		entry.LibraryID = 1
	}

	if entry.ID == 0 {
		// It's a brand new entry
		return a.db.CreateEntry(entry)
	}

	// It's an existing entry being edited
	return a.db.UpdateEntry(entry)
}

func (a *App) DeleteEntry(id int) error {
	return a.db.DeleteEntry(id)
}

func (a *App) UpdateOrder(entries []Entry) error {
	return a.db.UpdateEntryOrder(entries)
}

// ==========================================
// 3. GROUP SETS (Seasons, Volumes)
// ==========================================

func (a *App) GetGroupSets(entryID int) ([]GroupSet, error) {
	return a.db.GetGroupSets(entryID)
}

func (a *App) CreateGroupSet(entryID int, title, category string) error {
	_, err := a.db.AddGroupSet(entryID, title, category, 0)
	return err
}

// ==========================================
// 4. FILES & OBJECTS (The Heavy Ingestion)
// ==========================================

// ImportFile opens a native OS dialog, reads the file, and stuffs it into SQLite
func (a *App) ImportFile(groupsetID int) error {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{Title: "Select Media File"})
	if err != nil || selection == "" {
		return nil
	}

	// 1. Obtener Info
	fileInfo, err := os.Stat(selection)
	if err != nil {
		return err
	}
	filename := filepath.Base(selection)
	sizeBytes := fileInfo.Size()

	// 2. Abrir archivo origen y detectar MimeType (solo leyendo 512 bytes)
	src, err := os.Open(selection)
	if err != nil {
		return err
	}
	defer src.Close()

	buffer := make([]byte, 512)
	src.Read(buffer)
	mimeType := http.DetectContentType(buffer)
	src.Seek(0, 0) // ¡CRÍTICO! Regresar el puntero al inicio del archivo

	// 3. Guardar metadatos en SQLite para obtener el ID
	fileID, err := a.db.AddFile(groupsetID, filename, mimeType, sizeBytes, 0)
	if err != nil {
		return err
	}

	// 4. Copiar el archivo al disco duro (Streaming directo, sin picos de RAM)
	vaultDir := filepath.Join(filepath.Dir(a.dbPath), "media", "vault")
	os.MkdirAll(vaultDir, os.ModePerm)

	destPath := filepath.Join(vaultDir, fmt.Sprintf("%d_%s", fileID, filename))
	dest, err := os.Create(destPath)
	if err != nil {
		return err
	}
	defer dest.Close()

	_, err = io.Copy(dest, src) // Copia de disco a disco
	return err
}

// SetCoverImage is a special helper to attach a cover to an Entry
func (a *App) SetCoverImage(entryID int) error {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Cover Art",
		Filters: []runtime.FileFilter{
			{DisplayName: "Images", Pattern: "*.jpg;*.jpeg;*.png;*.webp"},
		},
	})
	if err != nil || selection == "" {
		return nil
	}

	data, err := os.ReadFile(selection)
	if err != nil {
		return err
	}

	coversDir := filepath.Join(filepath.Dir(a.dbPath), "media", "entry_covers")
	os.MkdirAll(coversDir, os.ModePerm)

	targetPath := filepath.Join(coversDir, fmt.Sprintf("%d.jpg", entryID))
	return os.WriteFile(targetPath, data, 0644)
}

// ==========================================
// 5. TAGS (Unchanged Frontend API)
// ==========================================

func (a *App) GetAllTags() ([]Tag, error) {
	return a.db.GetAllTags()
}

func (a *App) GetTagsForEntry(entryID int) ([]Tag, error) {
	return a.db.GetTagsForEntry(entryID)
}

func (a *App) UpdateEntryTags(entryID int, tagIDs []int) error {
	return a.db.UpdateEntryTags(entryID, tagIDs)
}

func (a *App) CreateTag(name, description, icon string, isCategory bool) error {
	return a.db.CreateTag(name, description, icon, isCategory)
}

func (a *App) UpdateTag(id int, name, description, icon string, isCategory bool) error {
	return a.db.UpdateTag(id, name, description, icon, isCategory)
}

func (a *App) DeleteTag(id int) error {
	return a.db.DeleteTag(id)
}

// ==========================================
// 6. MEDIA SERVER (New Dedicated Endpoint for Streaming)
// ==========================================

func (a *App) GetFiles(groupsetID int) ([]File, error) {
	return a.db.GetFiles(groupsetID)
}

func (a *App) DeleteGroupSet(id int) error {
	return a.db.DeleteGroupSet(id)
}

func (a *App) DeleteFile(fileID int, groupsetID int) error {
	return a.db.DeleteFile(fileID, groupsetID)
}

func (a *App) UpdateFileOrder(files []File) error {
	return a.db.UpdateFileOrder(files)
}

// Ensure ExportMediaAsset uses the new FetchFileBlob:
// En backend/app.go

// ExportMediaAsset copia un archivo desde el Vault local hacia la ruta que el usuario elija
func (a *App) ExportMediaAsset(fileID int, filename string) error {
	// 1. Preguntar al usuario dónde quiere guardar el archivo
	selection, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Save File",
		DefaultFilename: filename,
	})
	if err != nil || selection == "" {
		return nil // El usuario canceló
	}

	// 2. Abrir el archivo de origen desde nuestro disco duro (El Vault)
	vaultDir := filepath.Join(filepath.Dir(a.dbPath), "media", "vault")
	sourcePath := filepath.Join(vaultDir, fmt.Sprintf("%d_%s", fileID, filename))

	src, err := os.Open(sourcePath)
	if err != nil {
		return fmt.Errorf("no se pudo abrir el archivo original: %w", err)
	}
	defer src.Close()

	// 3. Crear el archivo de destino donde el usuario pidió
	dest, err := os.Create(selection)
	if err != nil {
		return fmt.Errorf("no se pudo crear el archivo de destino: %w", err)
	}
	defer dest.Close()

	// 4. Copiar los datos de disco a disco sin saturar la RAM
	_, err = io.Copy(dest, src)
	return err
}

func (a *App) GetLibrary(id int) (*Library, error) {
	return a.db.GetLibrary(id)
}

func (a *App) UpdateLibrary(lib Library) error {
	return a.db.UpdateLibrary(lib)
}

// SetLibraryCover opens the OS dialog specifically for the Library profile picture
func (a *App) SetLibraryCover(libraryID int) error {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title:   "Select Library Cover Art",
		Filters: []runtime.FileFilter{{DisplayName: "Images", Pattern: "*.jpg;*.jpeg;*.png;*.webp"}},
	})
	if err != nil || selection == "" {
		return nil
	}

	data, err := os.ReadFile(selection)
	if err != nil {
		return err
	}

	coversDir := filepath.Join(filepath.Dir(a.dbPath), "media", "library_covers")
	os.MkdirAll(coversDir, os.ModePerm)

	targetPath := filepath.Join(coversDir, fmt.Sprintf("%d.jpg", libraryID))
	return os.WriteFile(targetPath, data, 0644)
}

// ==========================================
// 7. LEGACY CSV IMPORT/EXPORT (For Mass Entry Management)
// ==========================================
func (a *App) ImportLegacyCSV(libraryID int) (string, error) {
	filePath, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title:   "Select Legacy CSV",
		Filters: []runtime.FileFilter{{DisplayName: "CSV Text", Pattern: "*.csv;*.txt"}},
	})
	if err != nil || filePath == "" {
		return "Cancelled", nil
	}

	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	reader.Comma = '|' // The classic pipe separator!
	reader.LazyQuotes = true
	records, err := reader.ReadAll()
	if err != nil {
		return "", err
	}

	count := 0
	for i, record := range records {
		// Skip header row or any malformed rows with missing columns
		if i == 0 || len(record) < 4 {
			continue
		}

		entry := Entry{
			LibraryID:     libraryID,
			Number:        record[0],
			Title:         record[1],
			Comment:       record[2],
			Rank:          record[3],
			TextAlignment: "justify", // Default formatting
		}

		if err := a.db.CreateEntry(entry); err == nil {
			count++
		}
	}
	return fmt.Sprintf("Successfully imported %d entries.", count), nil
}

// ExportLibraryCSV generates a pipe-separated backup of your entire library list
func (a *App) ExportLibraryCSV(libraryID int) (string, error) {
	// 1. Fetch all lightweight text entries
	entries, err := a.db.GetEntries(libraryID)
	if err != nil {
		return "", err
	}

	// 2. Open Save Dialog
	savePath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Save Library Backup (CSV)",
		DefaultFilename: "compendium_backup.csv",
		Filters:         []runtime.FileFilter{{DisplayName: "CSV", Pattern: "*.csv"}},
	})
	if err != nil || savePath == "" {
		return "Cancelled", nil
	}

	// 3. Create the file
	file, err := os.Create(savePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	// 4. Write data with pipe separator
	writer := csv.NewWriter(file)
	writer.Comma = '|'

	// Write Header
	writer.Write([]string{"Number", "Title", "Comment", "Rank"})

	// Write Data Rows
	for _, e := range entries {
		writer.Write([]string{e.Number, e.Title, e.Comment, e.Rank})
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return "", err
	}

	return fmt.Sprintf("Backup successfully saved to %s", savePath), nil
}

func (a *App) GetEntriesByTag(libraryID int, tagID int) ([]Entry, error) {
	return a.db.GetEntriesByTag(libraryID, tagID)
}

// ==========================================
// 6. VAULT BROWSER
// ==========================================

func (a *App) GetAllVaultFiles() ([]File, error) {
	return a.db.GetAllVaultFiles()
}

func (a *App) MoveVaultFile(fileID int, newPath string) error {
	return a.db.MoveVaultFile(fileID, newPath)
}

func (a *App) RenameVaultFile(fileID int, newName string) error {
	return a.db.RenameVaultFile(fileID, newName)
}

func (a *App) DeleteVaultFile(fileID int) error {
	return a.db.DeleteVaultFile(fileID)
}

// CreateVaultFolder uses the S3 trick: it creates a 0-byte hidden file to force the path to exist.
func (a *App) CreateVaultFolder(virtualPath string) error {
	// 1. Crear el registro en la base de datos
	fileID, err := a.db.UploadVaultFile(".keep", "application/x-directory", 0, virtualPath)
	if err != nil {
		return err
	}

	// 2. Crear un archivo físico vacío (0 bytes) en el disco duro para mantener la consistencia 1:1
	vaultDir := filepath.Join(filepath.Dir(a.dbPath), "media", "vault")
	os.MkdirAll(vaultDir, os.ModePerm)

	destPath := filepath.Join(vaultDir, fmt.Sprintf("%d_.keep", fileID))
	dest, err := os.Create(destPath)
	if err != nil {
		return err
	}
	// Lo cerramos inmediatamente porque no necesitamos escribirle nada adentro
	dest.Close()

	return nil
}

// PromptAndUploadVaultFile opens the native OS file picker and saves the file directly to SQLite.
func (a *App) PromptAndUploadVaultFile(virtualPath string) error {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{Title: "Select File to Upload to Vault"})
	if err != nil || selection == "" {
		return nil
	}

	fileInfo, err := os.Stat(selection)
	if err != nil {
		return err
	}
	filename := filepath.Base(selection)
	sizeBytes := fileInfo.Size()

	src, err := os.Open(selection)
	if err != nil {
		return err
	}
	defer src.Close()

	buffer := make([]byte, 512)
	src.Read(buffer)
	mimeType := http.DetectContentType(buffer)
	src.Seek(0, 0)

	fileID, err := a.db.UploadVaultFile(filename, mimeType, sizeBytes, virtualPath)
	if err != nil {
		return err
	}

	vaultDir := filepath.Join(filepath.Dir(a.dbPath), "media", "vault")
	os.MkdirAll(vaultDir, os.ModePerm)

	destPath := filepath.Join(vaultDir, fmt.Sprintf("%d_%s", fileID, filename))
	dest, err := os.Create(destPath)
	if err != nil {
		return err
	}
	defer dest.Close()

	_, err = io.Copy(dest, src)
	return err
}

// RenameVaultFolder changes the virtual path of all files within that folder, effectively "renaming" it in the vault structure.
func (a *App) RenameVaultFolder(oldPath, newPath string) error {
	return a.db.RenameVaultFolder(oldPath, newPath)
}

// DeleteVaultFolder removes the folder and all its contents from the vault.
func (a *App) DeleteVaultFolder(path string) error {
	return a.db.DeleteVaultFolder(path)
}

func (a *App) GetDatabaseStats() (DBStats, error) {
	return a.db.GetStats(a.dbPath)
}

func (a *App) RunDatabaseMaintenance() error {
	return a.db.Optimize()
}

func (a *App) ExportBackup() (string, error) {
	targetPath, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Export Backup",
		DefaultFilename: "compendium_backup.db",
		Filters:         []runtime.FileFilter{{DisplayName: "SQLite", Pattern: "*.db"}},
	})
	if err != nil || targetPath == "" {
		return "Cancelled", nil
	}

	if err := a.db.BackupLive(targetPath); err != nil {
		return "", err
	}
	return "Backup created successfully!", nil
}
