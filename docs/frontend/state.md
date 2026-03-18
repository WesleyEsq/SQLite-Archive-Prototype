
# State Management & Custom Hooks

## Overview

The Compendium frontend employs a decentralized state management architecture. It avoids third-party global state containers (such as Redux or Zustand) in favor of native React paradigms. The overarching principle is that the Go backend's SQLite database is the single source of truth; the frontend maintains localized UI state and synchronizes with the backend via the `services/controller.js` abstraction layer.

## Global State (`App.jsx`)

Global state is strictly limited to application-wide routing and library context. It is managed at the root level within `App.jsx`.

### Key Global Variables

* `activeLibraryId` (Integer): Dictates which database library is currently being queried.
* `view` (String): Functions as the application's internal router. Determines which Controller is rendered in the main content area (e.g., `'list'`, `'library'`, `'vault'`, `'series_detail'`).
* `isAddingNew` (Boolean): A global flag to trigger the "Add Entry" workflow within the List view.
* `selectedSeries` (Object): Holds the metadata of the currently selected entry when navigating from the Library grid to the Series Detail view.
* `showSettings` (Boolean): Toggles the global Settings/Configuration modal.

## Custom Hooks

Complex view logic and localized state variables are abstracted into custom hooks. This isolates business logic from the UI Controllers and ensures components remain focused on rendering.

### 1. `useEntryList`

**Location:** `src/hooks/useEntryList.jsx`

Manages the data fetching, filtering, and row-level interactions for the high-density tabular view.

* **Managed State:**
  * `entries` (Array): The active list of entries for the current library.
  * `searchQuery` (String): The current filter string.
  * `editingId` (Integer | String): Tracks which row is currently in inline-edit mode (or `'NEW'` for uncommitted additions).
  * `editForm` (Object): A controlled state object mapping to the input fields of the active inline-edit row.
  * `expandedRowId` (Integer): Tracks which row has its Markdown description and tag panel expanded.
  * `entryTags` (Object): A cached dictionary mapping entry IDs to their assigned tags.
  * `tagModalTarget` (Integer): The ID of the entry currently being modified in the Tag Selector Modal.
* **Core Handlers:**
  * `handleDragEnd`: Executes the `@hello-pangea/dnd` reordering logic, calculates the new index array, updates local state, and fires the `UpdateOrder` backend mutation.
  * `saveEdit`: Commits the `editForm` state to the backend and resets the `editingId`.

### 2. `useSeriesDetail`

**Location:** `src/hooks/useSeriesDetail.js`

Manages the hierarchical data (Groups/Collections and Assets/Files) associated with a single library entry.

* **Managed State:**
  * `groups` (Array): The list of collections (e.g., Seasons, Volumes) attached to the entry.
  * `expandedGroupId` (Integer): Tracks which collection accordion is currently open.
  * `assets` (Object): A dictionary mapping `groupId` keys to arrays of file objects.
  * `uploadingGroupId` (Integer): Tracks which collection is currently awaiting an OS file picker or actively receiving a file transfer.
  * `uploadProgress` (String): Status text for the current upload operation.
  * `viewerContext` (Object): Holds the playback/reading state (type, playlist array, start index, or active asset) dictating which Media Viewer modal is currently rendered.
* **Core Handlers:**
  * `handleFileUpload`: Triggers the native Wails file picker and polls the backend during the import process.
  * `handleDragEnd`: Manages intra-group file reordering and synchronizes the updated `sort_order` with the backend.
  * `handleView`: Analyzes the selected file's MIME type and constructs the appropriate `viewerContext` payload to launch the video player, PDF reader, or EPUB reader.

## Persistent Client State (`HistoryManager`)

**Location:** `src/utils/HistoryManager.js`

The application utilizes the browser's native `localStorage` exclusively for tracking media consumption progress. This prevents the backend database from being saturated with high-frequency write operations during video playback or document scrolling.

* **Storage Key:** `compendium_recent_history`.
* **Data Structure:** Stores a JSON array of objects capped at a maximum of 20 items (`MAX_HISTORY`).
* **Payload Schema:**

  ```json
  {
      "fileId": 123,
      "filename": "video.mp4",
      "entryId": 45,
      "entryTitle": "Library Item Name",
      "percentage": 45.5, 
      "type": "video",
      "resumeData": 1205.4, 
      "lastUpdated": 1710500000
  }
  ```

* **Operations:**
  * `getHistory()`: Parses and returns the current history array.
  * `saveProgress()`: Upserts a progress record. It removes previous instances of the specific `file.id`, pushes the new record to index `0`, and enforces the array length cap.
  * `clearProgress()`: Removes a specific file from the history array, typically triggered by an `onEnded` event when media consumption reaches 100%.
