// backend/vault.go
package backend

// GetAllVaultFiles fetches every file in the system regardless of what entry it is attached to.
func (db *DB) GetAllVaultFiles() ([]File, error) {
	query := `
		SELECT id, filename, mime_type, size_bytes, COALESCE(virtual_path, '/') 
		FROM files 
		ORDER BY filename ASC
	`
	rows, err := db.conn.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var files []File
	for rows.Next() {
		var f File
		if err := rows.Scan(&f.ID, &f.Filename, &f.MimeType, &f.SizeBytes, &f.VirtualPath); err != nil {
			return nil, err
		}
		files = append(files, f)
	}
	return files, nil
}

// UploadVaultFile directly uploads a file to the vault without attaching it to an entry.
func (db *DB) UploadVaultFile(filename, mimeType string, sizeBytes int64, virtualPath string) (int, error) {
	res, err := db.conn.Exec("INSERT INTO files (filename, mime_type, size_bytes, virtual_path) VALUES (?, ?, ?, ?)", filename, mimeType, sizeBytes, virtualPath)
	if err != nil {
		return 0, err
	}

	fileID, _ := res.LastInsertId()
	return int(fileID), nil
}

// MoveVaultFile changes the virtual directory of a file.
func (db *DB) MoveVaultFile(fileID int, newPath string) error {
	_, err := db.conn.Exec("UPDATE files SET virtual_path = ? WHERE id = ?", newPath, fileID)
	return err
}

// RenameVaultFile changes the actual filename.
func (db *DB) RenameVaultFile(fileID int, newName string) error {
	_, err := db.conn.Exec("UPDATE files SET filename = ? WHERE id = ?", newName, fileID)
	return err
}

// DeleteVaultFile completely removes a file from the system (and cascading removes its BLOB and Entry links).
func (db *DB) DeleteVaultFile(fileID int) error {
	_, err := db.conn.Exec("DELETE FROM files WHERE id = ?", fileID)
	return err
}

// RenameVaultFolder finds all files in the old virtual path and updates their path prefix.
func (db *DB) RenameVaultFolder(oldPath, newPath string) error {
	// Pure SQL magic: If oldPath is '/art/' and newPath is '/covers/',
	// a file at '/art/char/1.png' becomes '/covers/char/1.png'
	query := `
		UPDATE files 
		SET virtual_path = ? || SUBSTR(virtual_path, LENGTH(?) + 1) 
		WHERE virtual_path LIKE ? || '%'
	`
	_, err := db.conn.Exec(query, newPath, oldPath, oldPath)
	return err
}

// DeleteVaultFolder completely removes a virtual path and ALL files inside it.
func (db *DB) DeleteVaultFolder(path string) error {
	_, err := db.conn.Exec("DELETE FROM files WHERE virtual_path LIKE ? || '%'", path)
	return err
}
