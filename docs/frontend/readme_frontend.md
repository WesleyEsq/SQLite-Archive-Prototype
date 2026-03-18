
# Frontend Architecture Overview

## Introduction

The Compendium frontend is a single-page application (SPA) built with React 18 and bundled via Vite. It runs inside the Wails webview. The frontend is entirely decoupled from the database and filesystem, interacting with them exclusively through asynchronous calls to the Go backend via the Wails bridge.

## Directory Structure

The `src/` directory is organized by architectural concern rather than feature:

```text
src/
├── assets/         # Static assets (fonts, universal logos)
├── components/     # Presentational and structural React components
│   ├── entry-list/     # Sub-components for the list view
│   ├── library-grid/   # Sub-components for the grid view
│   ├── modals/         # Overlay components (Tags, Settings)
│   ├── series-detail/  # Sub-components for entry inspection
│   ├── shared/         # Reusable utilities (e.g., AutoSizer)
│   └── viewers/        # Media consumption wrappers (Video, PDF, EPUB, Image)
├── controllers/    # Container components managing logic, state, and data fetching
├── hooks/          # Custom React hooks for encapsulating complex state logic
├── services/       # The abstraction layer for Wails backend bindings
├── styles/         # Modular CSS architecture
└── utils/          # Pure Javascript helper functions (Validators, formatters, History)
```

## Core Design Principles

### 1\. Separation of Concerns (Controllers vs. Components)

The application strictly separates data fetching/state management from UI rendering.

* **Controllers (`src/controllers/`):** Handle all backend communication, format data, and manage local state. They do not contain DOM elements or CSS classes.
* **Components (`src/components/`):** "Dumb" presentational components. They receive data and callback functions as props from their parent Controller and handle all rendering and user interactions.

### 2\. View Management (Routing)

The application does not use a third-party routing library (like React Router). View state is managed globally in `App.jsx` using a simple string identifier (`view`).
Available views include:

* `list`: Tabular data management.
* `library`: Grid-based media browsing.
* `series_detail`: Drill-down inspection of a specific entry.
* `vault`: Virtual file system browser.
* `about`: Library metadata and system landing page.

### 3\. Backend Communication Layer

Direct calls to Wails generated bindings (`wailsjs/go/...`) are prohibited within components. All backend communication is routed through `src/services/controller.js`. This acts as a service abstraction layer, categorizing endpoints (e.g., `backend.entries`, `backend.vault`, `backend.files`) to insulate the UI from backend refactoring.

### 4\. State Management

* **Local State:** Handled via standard React `useState`.
* **Complex Logic:** Extracted into custom hooks (e.g., `useEntryList`, `useSeriesDetail`) to prevent Controller bloat.
* **Global State:** Minimized. The only true global state is the current library context and the active view, managed at the root `App.jsx` level.
* **Persistence:** `localStorage` is utilized strictly by the `HistoryManager` to track media consumption progress across sessions without requiring database writes.

### 5\. Styling Architecture

The application uses native CSS with CSS Variables for theming. Styles are strictly modularized and aggregated in `src/styles/main.css` to enforce a specific cascade order:

1. **Base:** CSS resets and CSS variable declarations.
2. **Utilities:** Layout structures (flex wrappers, grids).
3. **Components:** Styles tied to specific UI elements (buttons, modals, search bars).
4. **Views:** Page-specific overrides.

## Sub-Documentation Index

* [Components & UI Hierarchy](./components.md)
* [State Management & Custom Hooks](./state.md)
* [The Media Viewer Ecosystem](./viewers.md)
* [Styling & Theme Guidelines](./styling.md)
