
# Compendium | Storage system prototype with an emphasis on metadata

[Presiona aquí para leer la documentación en español](./spanish_documentation/README.md)

## Welcome!

The purpose of this project is to develop a completely local digital Archive for the automatic preservation and organization of multimedia files.

The project is designed for the personal preservation of both the files and a large amount of metadata about them. It is based on the organization of giants like YouTube, S3, and Google Drive, only completely local and compact.

---

## File Visualization Support

| Medium | Formats that can be visualized | Future additions |
| --- | --- | --- |
| Audio |  | wav, mp3, AIFF, AAC, OGG |
| Images | PNG, JPEG, WebP, GIF, TIFF | SVG |
| Videos | MP4, WebM |  |
| Documents | PDF, Epub | Docx, HTML |
| Ebooks | Epub | Sequences of images |

Any other file format can be stored and downloaded in the system, but support is only provided to visualize these files with the interface.

---

## About Compendium

This project is born from the need to go beyond simple spreadsheets and browser bookmarks. It is a robust desktop application designed to be a "digital sanctuary" for your personal media collection (Books, Artworks, Series, Light Novels, and more).

Built on the power of Go and the flexibility of React, this prototype combines the speed of an embedded database with a modern "streaming-style" interface. It is a living digital bookshelf designed for preservation, portability, and aesthetics.

Multimedia elements and the metadata about them are automatically organized into a hierarchical structure to facilitate their collection and integrity on a large scale.

---

## How to compile the project

It is expected that a flatpak will be developed for this project for its distribution once it is complete. For now, it is possible to compile it manually.
**The following is required:**

1. Install a Go version higher than 1.20
2. Install the Wails library
3. Run the following command inside this repository directory:

* `wails dev`



*note: in case there is an error due to the use of webkit with Wails, you must specify the webkit version installed on the operating system. In the case of Fedora KDE 43, for example, the necessary command is `wails dev -tags webkit2gtk-4.1*`

---

## Goals of this project

It is expected to continue with this prototype by implementing the following goals to allow practical use of the storage it provides.

**The goals are as follows:**

1. Compatibility with Google Drive and OneDrive personal cloud storage.
2. Backup storage via S3.
3. Better operability with the operating system to view media outside the React application using the following tools:
    * Adobe Acrobat
    * VLC

4. Functionality to export all database data into a hierarchical directory just like in the system.
5. Robust backup system.

---

## Project Structure

The project follows the standard **Wails** architecture, clearly separating the backend logic (Go) from the user interface (JavaScript/React). Below is a summary of the key directories:

* **`root /`**: The heart of the backend.
* `main.go`: Entry point. Configures the window, assets, and file server.
* `app.go`: The "Controller". Connects the frontend with the database and exposes methods to JS.
* `database.go`: SQLite connection management, migrations, and general queries.
* `media.go`: Specific logic for handling multimedia files (Hierarchy: Series -> Volumes -> Chapters).
* **`frontend/`**: The user interface (SPA built with Vite + React).
* **`src/components/`**: Modular React components.
* `LibraryGrid.jsx`: The "Netflix-style" gallery view with lazy loading.
* `SeriesDetail.jsx`: The details page, file and metadata management.
* `EntryList.jsx`: The classic table view for quick management and ranking.
* **`src/styles/`**: Modular CSS system.
* Divided into specific files (`layout.css`, `library.css`, `variables.css`) to keep the code clean and maintainable.
* **`wailsjs/`**: Auto-generated bridge between Go and JavaScript. Here reside the promises that connect both worlds.
* **`build/`**: Compilation artifacts and packaging configuration for Windows/Mac/Linux.
* **`compendium.db`**: (Generated) The single file that contains your entire database and saved files.

---

## Purpose and Philosophy of the Project

The purpose of Compendium is to solve the problem of **digital preservation** with a superior user experience.

The project maintains **compactness** as its main goal, providing a highly scalable solution without the need for containers, database servers, pods, or third-party services, making it a secure alternative for a user.

### 1. Local-First Preservation

In the digital age, cloud content is ephemeral. Favorite series can disappear due to licensing or website closures. This project bets on local storage:

* **Database as a File System:** Unlike traditional managers that only save file paths, files (PDF, EPUB, Images) are ingested directly into the SQLite database.
* **Total Portability:** Because everything resides in a single `.db` file, backing up your entire library is as simple as copying one file.

### 2. Aesthetics and Functionality

Spreadsheets are efficient, but boring. The goal is to emulate the experience of modern streaming platforms:

* **Visual Navigation:** Large covers, progressive loading, and a grid layout.
* **Media Hierarchy:** Understands that a work is not a single file. Supports complex structures: *Series → Seasons/Volumes → Episodes/Chapters*.
* **Flexible Organization:** Allows sorting content by ranking (Tier Lists), numerical order, or instant search.

### 3. Privacy and Ethics

This is software strictly for **personal use** to organize local files. It does not connect to any network or share its data with other users. It is a passive tool to organize what the user already owns, acting as a secure and personal digital bookshelf.

Therefore, decisions have been made to guarantee a better local experience on a machine, at the cost of a hostile architecture against streaming data to other devices.

---

## Architecture and Technical Specifications

Compendium is a high-performance hybrid application. This section details the engineering decisions, data schema, and design patterns used to achieve a smooth experience handling heavy multimedia files.

### 1. Technology Stack

The choice of technologies prioritizes three pillars: **Portability** (a single binary), **Performance** (low RAM usage), and **Modernity** (reactive UI).

| Layer | Technology | Justification |
| --- | --- | --- |
| **Core / Backend** | **Go (Golang) 1.21+** | Offers static typing, native concurrency, and compilation to machine code without external dependencies (Static linking). |
| **Frontend** | **React 18 + Vite** | Robust ecosystem for SPAs. Vite provides instant compilation time, and React manages complex UI state. |
| **Bridge** | **Wails v2** | Lightweight alternative to Electron. Uses the OS native rendering engine (WebView2 on Windows, WebKit on Mac), drastically reducing executable size and RAM usage. |
| **Database** | **SQLite (ModernC)** | Version of SQLite transpiled to pure Go (no CGO). Eliminates the need to install C compilers (GCC) on Windows, facilitating cross-compilation. |
| **Styles** | **CSS Modules (Custom)** | Custom design system without heavy frameworks (like Tailwind or Bootstrap) for total visual control. |

---

### 2. Database Design (Schema)

The heart of the project is its **SQLite** database. Unlike traditional applications that save file paths (`C:/Users/...`), Compendium stores the binary files (Images, PDFs, EPUBs) directly inside the database as **BLOBS**.

### "All in One" Strategy

* **Advantage:** Absolute portability. Moving your collection to another PC means copying a single `.db` file.
* **Challenge:** Read performance is inferior to using the file system for storing blobs larger than 100Kb.
* **Solution:** Implementation of a Go sidecar server for reading and fetching multimedia objects in the database. Works very similarly to S3 services.

## 3. Wails and the relationship between Go and React

Communication between Go and JavaScript is asynchronous and secure, managed through `wailsjs`.

* **Method Exporting:** The `App` struct in `app.go` acts as the main controller. Any public method (e.g., `GetEntries()`) is automatically exposed to JavaScript as a Promise.
* **Type Handling:** Wails automatically generates TypeScript definitions (`models.ts`) based on the Go structs, ensuring the frontend knows exactly what data to expect.

**Data Flow:**

> `UI (React)` invokes `SaveMediaAsset()` **➜** `Wails Bridge` serializes JSON **➜** `Go Controller` decodes Base64 **➜** `SQLite` writes BLOB **➜** Response to the UI.

---

## 4. Frontend Modularity

React code demands great specialization in terms of the styles of each component, they are organized according to each reusable element in the project structure. They can share styles with each other or use a global style defined for the whole project. For the purpose of this project, we have the following UI element disposition:

* **Modular CSS:** Styles are divided by responsibility (`layout.css`, `library.css`, `modals.css`).
* **Atomic Components:** `LibraryGrid`, `SeriesDetail`, and `EntryList` work in isolation, receiving data only through *props*, facilitating testing and debugging.

---

This technical documentation requires expansion for future iterations of this prototype.
