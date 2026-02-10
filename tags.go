package main

import (
	"database/sql"
	"fmt"
)

// --- Structs ---

type Tag struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Icon        string `json:"icon"`  // Stores a key like "sword", "magic", "slice_of_life"
	Count       int    `json:"count"` // derived field: how many entries use this tag?
}

// --- Database Schema ---

func CreateTagTables(db *sql.DB) error {
	// 1. The Definitions Table
	tagSchema := `
	CREATE TABLE IF NOT EXISTS tags (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL UNIQUE,
		description TEXT,
		icon TEXT
	);`
	if _, err := db.Exec(tagSchema); err != nil {
		return fmt.Errorf("error creating tags table: %w", err)
	}

	// 2. The Relationship Table (Many-to-Many)
	// ON DELETE CASCADE ensures if an Entry or Tag is deleted, the link is gone.
	relationSchema := `
	CREATE TABLE IF NOT EXISTS entry_tags (
		entry_id INTEGER NOT NULL,
		tag_id INTEGER NOT NULL,
		PRIMARY KEY (entry_id, tag_id),
		FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE,
		FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
	);`
	if _, err := db.Exec(relationSchema); err != nil {
		return fmt.Errorf("error creating entry_tags table: %w", err)
	}

	return nil
}

// --- CRUD Operations ---

// CreateTag adds a new tag definition
func (db *DB) CreateTag(name, description, icon string) error {
	_, err := db.conn.Exec("INSERT INTO tags (name, description, icon) VALUES (?, ?, ?)", name, description, icon)
	return err
}

// GetAllTags returns all tags with a count of how many entries use them
func (db *DB) GetAllTags() ([]Tag, error) {
	query := `
		SELECT t.id, t.name, t.description, t.icon, COUNT(et.entry_id) as count
		FROM tags t
		LEFT JOIN entry_tags et ON t.id = et.tag_id
		GROUP BY t.id
		ORDER BY t.name ASC
	`
	rows, err := db.conn.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []Tag
	for rows.Next() {
		var t Tag
		if err := rows.Scan(&t.ID, &t.Name, &t.Description, &t.Icon, &t.Count); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	return tags, nil
}

// GetTagsForEntry returns tags specific to one series
func (db *DB) GetTagsForEntry(entryID int) ([]Tag, error) {
	query := `
		SELECT t.id, t.name, t.description, t.icon
		FROM tags t
		JOIN entry_tags et ON t.id = et.tag_id
		WHERE et.entry_id = ?
		ORDER BY t.name ASC
	`
	rows, err := db.conn.Query(query, entryID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []Tag
	for rows.Next() {
		var t Tag
		if err := rows.Scan(&t.ID, &t.Name, &t.Description, &t.Icon); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	return tags, nil
}

// AddTagToEntry links a tag to an entry
func (db *DB) AddTagToEntry(entryID, tagID int) error {
	// INSERT OR IGNORE avoids errors if the link already exists
	_, err := db.conn.Exec("INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)", entryID, tagID)
	return err
}

// RemoveTagFromEntry removes the link
func (db *DB) RemoveTagFromEntry(entryID, tagID int) error {
	_, err := db.conn.Exec("DELETE FROM entry_tags WHERE entry_id = ? AND tag_id = ?", entryID, tagID)
	return err
}

// DeleteTag completely deletes a tag definition (and all its links via Cascade)
func (db *DB) DeleteTag(tagID int) error {
	_, err := db.conn.Exec("DELETE FROM tags WHERE id = ?", tagID)
	return err
}

// Pretty self explanatory
func (db *DB) UpdateTag(id int, name, description, icon string) error {
	_, err := db.conn.Exec(
		"UPDATE tags SET name = ?, description = ?, icon = ? WHERE id = ?",
		name, description, icon, id,
	)
	return err
}

func (db *DB) UpdateEntryTags(entryID int, tagIDs []int) error {
	tx, err := db.conn.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Clear existing tags for this entry
	// (This does NOT delete the tags themselves, only the links)
	_, err = tx.Exec("DELETE FROM entry_tags WHERE entry_id = ?", entryID)
	if err != nil {
		return err
	}

	// 2. Insert the new set
	query := "INSERT INTO entry_tags (entry_id, tag_id) VALUES (?, ?)"
	for _, tagID := range tagIDs {
		if _, err := tx.Exec(query, entryID, tagID); err != nil {
			return err
		}
	}

	return tx.Commit()
}
