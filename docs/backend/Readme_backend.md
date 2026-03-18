
# Backend Architecture Overview

## Introduction

The Compendium backend is written in Go (Golang) and operates within the Wails v2 framework. It is responsible for all OS-level interactions, local database management, file ingestion, and media streaming. The backend exposes its methods to the React frontend via Wails Inter-Process Communication (IPC) bindings and a local HTTP sidecar server.

## Core Technologies

* **Language:** Go (1.18+)
* **Framework:** Wails v2 (Application lifecycle, OS dialogs, IPC bridge)
* **Database:** SQLite3 (Embedded, local storage)
* **Server:** Native Go `net/http` (Media streaming)

## System Architecture

The backend operates on three primary structural pillars:

### 1. Wails IPC Bridge

All data mutations and metadata queries are handled through Wails bindings. Public methods attached to the main `App` struct (in `app.go`) are automatically compiled into Javascript promises accessible to the frontend. This channel is strictly used for lightweight JSON payloads (e.g., fetching entry lists, renaming files, creating tags).

### 2. Local HTTP Sidecar Server

Wails IPC is memory-constrained and inefficient for transferring massive binary files (like video or high-resolution PDFs). To solve this, the backend initializes a concurrent `net/http` server bound to `localhost:40001` on startup.

* **Route:** `/stream/{id}/{filename}`
* **Function:** Queries the database for the requested file ID, retrieves the binary BLOB, and streams it directly to the frontend viewer components using standard HTTP range requests (supporting video scrubbing and pagination).

### 3. Embedded SQLite Storage (BLOBs & Metadata)

Compendium does not rely on the user's standard file system for long-term storage. When a file is imported, the backend reads the file from the OS and inserts it directly into the SQLite database as a binary BLOB.

* **Metadata Separation:** File metadata (filename, mime type, size, virtual path) is stored in a `files` table.
* **Payload Separation:** The actual binary data is stored in an `objects` table, linked by a foreign key. This prevents metadata queries from loading massive media payloads into memory.

## Directory Structure & File Responsibilities

The `backend/` directory isolates functionality by domain. *(Note: File names reflect the logical separation of the Go packages).*

```text
backend/
├── app.go           # Wails application lifecycle (startup/shutdown) and bound IPC methods.
├── database.go      # SQLite connection initialization, schema definitions, and migrations.
├── entries.go       # CRUD operations for Library Entries and Tag junctions.
├── groupsets.go     # Management of Collections (Seasons/Volumes) attached to Entries.
├── files.go         # OS file picker invocation, file ingestion, and BLOB insertion.
├── streaming.go     # Local HTTP server initialization and BLOB streaming logic.
├── system.go        # Legacy CSV import/export parsing routines.
└── vault.go         # Virtual directory logic, string manipulation, and path operations.
```

## Key Backend Mechanisms

### 1. The Database Doctor (Self-Healing Routine)

Because SQLite does not inherently support complex cascading triggers across massive BLOB deletions without locking the database, `database.go` executes a cleanup routine upon every application initialization (`InitDB`).

* **Orphan Purge:** Executes `DELETE` statements on the `objects` and junction tables to remove any binary payloads or links that no longer have a corresponding row in the `files` table.
* **Sequence Repair:** Manually updates the internal `sqlite_sequence` table to match the current `MAX(id)` of the `files` table. This prevents AUTOINCREMENT collisions when IDs are freed up by deleted files.

### 2. The Vault (Virtual Directory Engine)

The backend does not use relational tables to represent folders in the Vault. Folders are virtualized using a `virtual_path` string column on the `files` table.

* **Folder Creation:** Creating a folder (via `CreateVaultFolder`) writes a 0-byte binary file named `.keep` with the MIME type `application/x-directory` to the specified path. This forces the path to exist in queries.
* **Path Manipulation:** Renaming or moving a folder (via `RenameVaultFolder`) executes a SQL `UPDATE` utilizing the `SUBSTR` function to dynamically replace the path prefix on all files that match the target directory string.

### 3. File Ingestion Protocol

When the frontend requests a file upload (via `PromptAndUploadVaultFile` or `ImportFile`):

1. The backend triggers the native OS file picker (`runtime.OpenFileDialog`).
2. If a file is selected, `os.ReadFile` loads the binary into memory.
3. `http.DetectContentType` reads the first 512 bytes to determine the exact MIME type.
4. The metadata and binary payload are separated and inserted into the `files` and `objects` SQLite tables, respectively.
