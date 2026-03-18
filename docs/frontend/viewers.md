
# The Media Viewer Ecosystem

## Overview

The Compendium frontend includes an integrated suite of media consumption components located in `src/components/viewers/`. These components overlay the main application UI as full-screen modals, allowing users to consume media without leaving the context of their library or virtual file system.

## Streaming Architecture

To prevent memory exhaustion and UI blocking, media files (especially large video and PDF blobs) are not passed through the asynchronous Wails Javascript bridge. Instead, the frontend utilizes a dedicated local HTTP sidecar server running on the Go backend (defaulting to port `40001`).

All viewers construct their media source URLs using the following pattern:
`http://localhost:40001/stream/${asset.id}/${encodeURIComponent(asset.filename)}`.

## Viewer Components

### 1. Video Player (`MediaPlayer.jsx`)

A custom HTML5 `<video>` wrapper designed for sequential playback of media arrays.

* **Input:** Expects a `playlist` (array of asset objects) and a `startIndex` integer.
* **Controls:** Implements a custom UI overlay with fading controls triggered by mouse movement (`mousemove` event listener with a 2.5-second timeout).
* **Playback Progression:** Handles the `onEnded` event to clear the current file's progress and automatically advance to the next index in the `playlist` array.
* **History Binding:** Listens to `timeupdate` and `loadedmetadata` events to calculate viewing percentage and save the current playback timestamp.

### 2. EPUB Reader (`EpubViewer.jsx`)

A wrapper around the `react-reader` and `epub.js` libraries for paginated document rendering.

* **Input:** Expects a single `asset` object.
* **Configuration:** Enforces `flow: 'paginated'` via `epubOptions` to maintain a standard book-reading interface.
* **History Binding:** Tracks position using the `epubcfi` string format.
* **Percentage Calculation:** Utilizes the `getRendition` hook to trigger a background calculation of total pages (`locations.generate(1600)`), enabling accurate 0-100% completion tracking.

### 3. PDF Viewer (`PDFViewer.jsx`)

A minimalist wrapper utilizing the native browser PDF rendering engine.

* **Input:** Expects a single `asset` object.
* **Configuration:** Renders an `<iframe>` spanning `100vw` and `100vh`, passing the stream URL directly to the `src` attribute.
* **History Binding:** Due to cross-origin and iframe security restrictions preventing reliable scroll tracking, this component statically logs a `0%` progress state to the `HistoryManager` upon mounting to ensure the file appears in the user's "Continue" row.

### 4. Image Viewer (`ImageViewer.jsx`)

A modal component for high-resolution static image viewing.

* **Input:** Expects a single `asset` object.
* **Configuration:** Uses a standard `<img>` tag constrained by `max-width: 90vw` and `max-height: 90vh` with `object-fit: contain` to preserve aspect ratios.
* **History Binding:** Statically logs a `100%` progress state to the `HistoryManager` upon mounting, as image consumption is considered an instantaneous action.

## Invocation and State Management

Viewers are not routed to via standard navigation; they are conditionally rendered based on local state within a Controller or parent Component.

* **Trigger Shape:** The application maps file MIME types and extensions (e.g., `.mp4`, `.pdf`) to determine the appropriate viewer component.
* **Expected Props:** All viewers generally expect:
  * `asset`: `{ id: number, filename: string, title: string, mime_type: string }`
  * `entry`: The parent library entry object (used for fetching cover art in the History row). May be `null` if the file is opened from the Vault.
  * `onClose`: Callback function to unmount the viewer.

## History Integration

All viewer components import the central `HistoryManager` utility to record consumption data.

Data is passed using the following signature:
`HistoryManager.saveProgress(asset, entry, percentage, type, resumeData)`.

* `percentage`: A float between 0 and 100 used to render progress bars in the Library Grid.
* `resumeData`: A string or float (e.g., video timestamp, epubcfi) allowing the viewer to restore state upon reopening.
