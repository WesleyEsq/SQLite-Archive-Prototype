
# Components & UI Hierarchy

## Overview

The `src/components/` directory contains the presentational ("dumb") components of the Compendium application. These components are strictly responsible for rendering the DOM and attaching user interaction events. They do not maintain internal business logic or execute backend calls; all data and mutation handlers are passed down as props from their respective Controllers.

## Root Layout

The root structure of the application is defined in `App.jsx`. It establishes a persistent two-pane layout:

1. **Sidebar Navigation (`<nav className="app-sidebar">`):** A fixed left-hand pane containing primary navigation buttons (List, Library, Vault, About) and the global "Add Entry" trigger.
2. **Main Content Area (`<main className="content-wrapper">`):** A dynamic right-hand pane that renders the active Controller based on the global `view` state.

## Page-Level Components (Views)

### 1. Entry List View

Renders a tabular interface for high-density metadata management.

* **`EntryList.jsx`**: The main container table. Implements `@hello-pangea/dnd` for drag-and-drop row reordering.
  * **`EntryViewText.jsx`**: Renders standard read-only table cells (Number, Title, Comment, Rank).
  * **`EntryEditInputs.jsx`**: Renders inline text inputs when a row is in edit mode.
  * **`EntryEditPanel.jsx`**: An expanded row spanning all columns, providing a Markdown textarea and cover image upload controls.
  * **`EntryTagDisplay.jsx`**: Renders associated tags as pills, with an overflow expansion toggle.

### 2. Library Grid View

Renders a visual catalog of entries using virtualized lists for performance.

* **`LibraryGrid.jsx`**: The primary container. Toggles between a search results grid and categorized rows.
  * **`LibraryToolbar.jsx`**: Contains the search input and sorting dropdown (Default, Rank, Title).
  * **`LibraryCategoryRow.jsx`**: Renders a horizontally scrollable carousel of items belonging to a specific tag/category. Utilizes `react-virtuoso` (`Virtuoso`).
  * **`LibraryCard.jsx`**: The individual item card rendering the cover image, title, and rank badge.

### 3. Series Detail View

Provides a drill-down interface for a single entry, managing its metadata and attached media collections.

* **`SeriesDetail.jsx`**: The main wrapper. Implements `@hello-pangea/dnd` for ordering assets within and across collections.
  * **`SeriesHero.jsx`**: Renders the dynamic top banner using a blurred version of the cover art, alongside the entry title, badges, and Markdown description.
  * **`CollectionCard.jsx`**: Represents a grouping of media (e.g., "Season 1"). It operates as a collapsible accordion and a drop zone for files.
  * **`AssetRow.jsx`**: Represents a single file within a collection. Displays the filename, contextual icons based on MIME type, and action buttons (Play/View, Download, Delete).

### 4. Vault Browser

Provides a virtual file system interface for managing loose files.

* **`VaultBrowser.jsx`**: Renders a breadcrumb navigation bar and a grid of folders and files. Implements native HTML5 Drag and Drop API (`onDragStart`, `onDrop`, `onDragOver`) for moving files between virtual directories.

### 5. Compendium / About View

Serves as the library's landing page and configuration interface.

* **`CompendiumView.jsx`**: Renders a large "Editorial Showcase" hero banner displaying the library's name, curator, and description. Includes an inline edit modal for updating library-level metadata and cover art.

## Modals & Global Overlays

These components are typically rendered via a portal or absolute positioning over the main application layer.

* **`SettingsModal.jsx`**: A multi-tabbed interface for application configuration. Currently routes to `TagSettings`.
  * **`TagSettings.jsx`**: Provides a CRUD interface for global tags. Includes inputs for name, description, icon selection, and a boolean toggle to set the tag as a Library Category Row.
* **`TagManager.jsx`**: A legacy modal for tag creation/editing, functionally superseded by `TagSettings.jsx`.
* **`TagSelectorModal.jsx`**: A grid-based selection interface allowing users to attach or detach existing tags from a specific entry.

## Viewers (Media Consumption)

These components are rendered when a user interacts with a playable/readable asset. They overlay the entire UI.

* **`MediaPlayer.jsx`**: An HTML5 `<video>` wrapper supporting sequential playlist playback, auto-hiding controls, and integration with `HistoryManager` for progress tracking.
* **`EpubViewer.jsx`**: A wrapper around `react-reader`. Enforces a paginated flow (`flow: 'paginated'`) and binds location changes to local storage.
* **`PDFViewer.jsx`**: An `<iframe>` container that points directly to the backend's local streaming endpoint.
* **`ImageViewer.jsx`**: A modal rendering an `<img>` tag pointing to the backend stream, constrained to viewport dimensions using `object-fit: contain`.

## Shared / Utilities

* **`AutoSizer.jsx`**: A utility wrapper utilizing `ResizeObserver` to pass precise width and height dimensions to its children. Used primarily to wrap components that require explicit pixel dimensions for virtualization.
