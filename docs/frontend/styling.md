
# Styling Architecture & Theme Guidelines

## Overview

The Compendium frontend utilizes a custom, modular Vanilla CSS architecture. It strictly avoids CSS-in-JS libraries (like Styled Components) and utility-first frameworks (like Tailwind) in favor of semantic class names and native CSS Custom Properties (variables). The styling structure is heavily inspired by ITCSS (Inverted Triangle CSS), ensuring a predictable cascade where broad, generic styles are loaded first, and highly specific, contextual styles are loaded last.

## The Cascade Hierarchy

All styling is aggregated through a single entry point: `src/styles/main.css`. This file exclusively contains `@import` statements, strictly enforcing the load order of the four architectural layers.

### 1. Base Layer (`src/styles/1-base/`)

Defines the foundational elements of the application before any classes are applied.

* **`variables.css`**: Defines the global color palette and theming constraints using `:root` CSS variables.
* **`reset.css`**: Strips default browser formatting. Crucially, it freezes the viewport (`width: 100vw; height: 100vh; overflow: hidden;`) to prevent the Wails window from exhibiting native browser scrolling, forcing scrolling to be handled internally by specific container elements. It also registers the local `@font-face` for the primary typeface.

### 2. Utilities Layer (`src/styles/2-utilities/`)

Defines non-semantic, structural primitives.

* **`layout.css`**: Establishes the Flexbox constraints for the primary application scaffolding. It defines `.content-wrapper` and `.main-content`, setting `flex-grow: 1` and `overflow-y: auto` to designate the safe scrolling zones within the frozen viewport.

### 3. Components Layer (`src/styles/3-components/`)

Defines the visual styles for reusable, discrete UI elements. These styles are globally scoped but tied to specific semantic class names.

* **`buttons.css`**: Standardizes interactive triggers (e.g., `.action-rect-btn`, `.load-more-btn`).
* **`forms.css`**: Standardizes inputs, textareas, and generic layout constraints for data entry.
* **`modals.css`**: Defines the `z-index` overlays (`.modal-overlay`), absolute centering, and structural boundaries of the `pro-modal` and full-screen `cinema-mode` viewers.
* **`table.css`**: Formats the high-density list view, including alternating row colors (`nth-child(even)`), sticky headers, and hover states.
* **Other Modules**: Includes isolated styling for `.sidebar`, `.search-bar-wrapper`, `.markdown-content`, and `.tag-manager-content`.

### 4. Views Layer (`src/styles/4-views/`)

Defines page-specific compositions and intentional overrides. Because these are loaded last, they possess the highest specificity in the cascade.

* **`library.css`**: Manages the complex grid alignments and horizontal carousel bounds for the Library View.
* **`series-detail.css` / `about.css`**: Defines the large-scale "Hero" and "Showcase" layouts, manipulating absolute positioning to overlap DOM elements (e.g., negative margins to pull cover art into the banner).
* **`vault.css`**: Implements CSS Grid configurations constrained by `minmax()` to ensure uniform virtual file card scaling.

## Core Visual Paradigms

### The Color Palette

The application utilizes a strict, high-contrast palette anchored by shades of Crimson. These are centralized in `variables.css`:

* `--header-bg`: `#800F2F` (Deep Ruby) - Used for primary heavy backgrounds.
* `--ui-header`: `#C9184A` (Vivid Raspberry) - Used for active states, primary buttons, and accent borders.
* `--button-bg`: `#CF3460` (Rose Red) - Used for secondary interactive elements.
* `--bg-color`: `#FFFFFF` - Base application background.
* `--text-color`: `#333333` - Base font color ensuring high legibility.
* `--row-color-1` / `--row-color-2`: `#FFFFFF` / `#FFF9FA` - Used for alternating table row striping.

### Glassmorphism

The application heavily utilizes a design pattern internally referred to as "Crimson Glass" for display views in the pages.

* **Implementation:** This is achieved by stacking a dynamically generated, heavily blurred background image (`filter: blur(40px)`) beneath a translucent linear gradient overlay (`background: linear-gradient(135deg, rgba(128, 15, 47, 0.95) 0%, rgba(201, 24, 74, 0.75) 100%)`).
* **Foreground Elements:** Text panels situated above this background utilize `backdrop-filter: blur(15px)` and semi-transparent white backgrounds (`rgba(255, 255, 255, 0.1)`) to create a frosted glass effect.

### Custom Scrollbars

To maintain cross-OS visual consistency and prevent native scrollbars from breaking the custom UI aesthetics, standard webkit scrollbar pseudos are overridden.

* Implemented via the `.custom-scrollbar` class.
* Modifies `::-webkit-scrollbar`, `::-webkit-scrollbar-track`, and `::-webkit-scrollbar-thumb` to use border-radius, theme-matched colors, and custom widths.

### Hardware Acceleration and Transitions

UI state changes (hover, active, expanding accordions) rely on native CSS transitions.

* **Transformations:** Interactive elements (buttons, library cards) utilize `transform: translateY(-Xpx)` or `transform: scale(X)` paired with `transition: all 0.2s ease` to provide spatial feedback.
* **Shadows:** Drop shadows (`box-shadow`) are frequently animated alongside transforms to simulate elevation depth.
* **Rendering Optimization:** High-frequency animations or large moving elements (like the scaled poster cards) utilize `transform` and `opacity` exclusively to ensure the browser composites them on the GPU, avoiding costly layout recalculations.

## Typography

* **Primary Typeface:** Nunito (`nunito-v16-latin-regular.woff2`).
* **Implementation:** Loaded locally via `@font-face` to ensure zero latency and offline availability, matching the requirements of a local desktop application.
* **Markdown Formatting:** Text parsed from the database via `react-markdown` is scoped under the `.markdown-content` class, which normalizes header margins, enforces `line-height: 1.6` for readability, and applies specific theming to `<strong>` and `<h>` tags independent of the global reset.
