# Compendium, an object storage personal project for a digital library

## Overview

Compendium is a desktop application designed for cataloging, organizing, and consuming local digital media. Built using the Wails framework, it utilizes a Go backend for file system operations and database management, paired with a React frontend for the user interface. The system supports hierarchical media organization, a virtual file management system, and integrated consumption of various file types including video, EPUB, PDF, and image formats.

## Architecture & Tech Stack

* **Application Framework:** Wails (v2)
* **Backend:** Go (Golang)
* **Database:** SQLite (Local storage for metadata, virtual paths, and file blobs)
* **Frontend:** React 18, Vite
* **Styling:** Native CSS with CSS Variables (Custom modular architecture)
* **Key Frontend Libraries:** * `react-virtuoso` (Virtualized list rendering for large libraries)
  * `@hello-pangea/dnd` (Drag-and-drop state management)
  * `react-reader` / `epubjs` (EPUB rendering)
  * `lucide-react` (System iconography)

## Core Features

### 1. Library Management

* **Entries:** The top-level organizational unit. Entries contain metadata including title, comment, rank, description, and cover art.
* **Collections & Assets:** Entries can contain multiple "Collections" (e.g., Seasons, Volumes). Collections act as containers for "Assets" (the actual media files).
* **Tags & Categories:** Entries can be tagged. Specific tags can be designated as "Categories," which dynamically generate horizontally scrollable rows in the main library view.

### 2. The Vault (Virtual File System)

* A dedicated file management interface independent of the Library grid.
* Implements a virtual directory structure using path strings (e.g., `/images/covers/`) rather than strictly relational folder tables.
* Supports standard CRUD operations: Create folders (via `.keep` files), move files via drag-and-drop, rename, delete, and native OS file uploads.

### 3. Integrated Media Viewers

The application streams media directly from the local Go backend to custom frontend wrapper components:

* **Video Player:** Custom HTML5 video wrapper with playlist support, navigation, and resume states.
* **EPUB Reader:** Integrated paginated reading view.
* **PDF Viewer:** Native iframe-based PDF rendering.
* **Image Viewer:** Modal-based high-resolution image viewing.

### 4. History & Progress Tracking

* A centralized `HistoryManager` tracks user interaction with media files.
* Records exact playback timestamps (Video), CFI locations (EPUB), or generic open states (PDF/Image).
* Automatically calculates completion percentages and populates a "Continue Watching/Reading" row in the main library grid.

### 5. Data Portability

* Legacy CSV import support for migrating external databases.
* CSV export support for library metadata backups.

## Project Structure

The documentation is split hierarchically to reflect the separation of concerns within the application.

```text
compendium/
├── README.md                 # System overview (This file)
├── backend/                  # Go backend source code
│   └── README-BACKEND.md     # Backend architecture, DB schema, and API bindings
├── frontend/                 # React frontend source code
│   ├── README-FRONTEND.md    # Frontend architecture, state management, and routing
│   └── src/
│       ├── components/       # UI Components (Documented in Frontend README)
│       ├── controllers/      # Logic and State Controllers
│       ├── hooks/            # Custom React Hooks
│       ├── services/         # Wails API bridge methods
│       ├── styles/           # Modular CSS structure
│       └── utils/            # Helper functions (History, Validators)
├── wails.json                # Wails project configuration
└── go.mod                    # Go dependencies
```

## Getting Started

### Prerequisites

* [Go](https://go.dev/doc/install) (1.18 or later)
* [Node.js](https://nodejs.org/en/) (16 or later)
* [Wails CLI](https://wails.io/docs/gettingstarted/installation)

### Installation & Execution

1. Clone the repository.
2. Navigate to the root directory.
3. To run the application in development mode (with hot-reloading for the frontend):

   ```bash
   wails dev
   ```

4. To build the compiled executable for your target operating system:

   ```bash
   wails build
   ```

## In depth documentation

To see the documentation about the system, it's divided in the docs directory on this repository based on if it's either about the backend or the front end. The system has the following two files to direct the documentation:

* [Visual components on the front-end Desktop Interface](./docs/frontend/readme_frontend.md)
* [Server, database, storage and streaming logic](./docs/backend/Readme_backend.md)

---
