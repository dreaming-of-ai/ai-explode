# AI Explode – Screen Layout & Application Chrome

**Document type:** Design reference
**Date:** 2026-03-28

---

## 1. Purpose

This document describes the screen layout of AI Explode, including the game board, sidebar, legal footer, header icon bar, and the responsive behavior that governs how these elements adapt to different viewport sizes.

---

## 2. Overall Layout Structure

The application uses a dark-themed, single-page layout. All content is arranged within the visible viewport height (`100dvh`) using a vertical stacking model with three fixed layers:

1. **Header** – fixed height, top of the viewport.
2. **Main content** – flexible height, fills the remaining space between header and footer. Contains the board area and sidebar.
3. **Footer** – fixed height, bottom of the viewport.

This structure ensures that no vertical scrolling is required to access any part of the interface, regardless of screen size.

---

## 3. Header

The header spans the full viewport width and is laid out as a flex row with content anchored to both ends.

### 3.1 Left: Title Group

- **Title:** "AI Explode" in large, bold white typography.
- **Subtitle:** "A Tactical Chain-Reaction Game" in a smaller, muted font directly below the title.

### 3.2 Right: Icon Bar

A horizontal row of icons is positioned in the top-right corner, vertically aligned with the title. The icons are evenly spaced with a small gap between them. Each icon uses the same muted white color as the subtitle text, with a hover brightening effect. Clicking an icon opens a centered modal popup displaying the corresponding content.

The icon bar contains the following entries (left to right):

| Icon             | Glyph suggestion     | Popup content                                                                                         |
|------------------|----------------------|-------------------------------------------------------------------------------------------------------|
| **Gaming Rules** | Book or scroll icon  | Displays the game rules: board mechanics, turn structure, explosion and chain-reaction logic, and win conditions. |
| **Information**  | Circle-i (ⓘ) icon   | Displays application information such as version, credits, and links to Impressum and Datenschutz.    |
| **Settings**     | Gear/cog icon        | Displays application settings (content to be defined as features require it).                         |

Each popup is a modal overlay centered on the viewport with a semi-transparent dark backdrop. It includes a close button (×) in the top-right corner and can also be dismissed by clicking the backdrop or pressing Escape. The popup content area is scrollable if the content exceeds the visible height.

---

## 4. Main Content Area

The main content area fills the vertical space between header and footer. It is divided into two zones placed side by side.

### 4.1 Board Area (center-left)

The game board is rendered as an 8×8 grid of square cells inside a rounded container with a subtle border. It is the dominant visual element, occupying roughly two-thirds of the viewport width and the majority of the available vertical space. Individual cells have a dark fill with a slightly lighter inner square, giving a layered depth effect. The board is horizontally centered within its container, with padding on all sides. The board cells scale proportionally with available space rather than maintaining a fixed pixel size.

### 4.2 Sidebar (right)

A vertical column to the right of the board holds action cards and contextual information. Cards use rounded containers with a semi-transparent dark background, consistent with the overall theme. The sidebar has a fixed width and is right-aligned. Currently visible cards include the "New Game" action and contextual information about current game rules.

---

## 5. Footer

A single-line footer is placed at the very bottom of the viewport. It contains two text links separated by a centered dot:

```
Impressum · Datenschutz
```

**Visual treatment:**

- Font size: 12–13px, matching the smallest text tier in the application.
- Color: subdued white, approximately `rgba(255, 255, 255, 0.4)`.
- Hover state: opacity increases to approximately `rgba(255, 255, 255, 0.7)`, with a smooth transition.
- Alignment: centered horizontally within the full viewport width.
- Vertical spacing: a small, fixed padding (8–12px) separates the footer text from both the content above and the bottom edge of the viewport.

The footer is always visible. It does not scroll away, overlay the board, or collapse. The board and sidebar never overlap or obscure the footer — the main content area shrinks to accommodate it.

---

## 6. Responsive Behavior

### 6.1 Board and Footer Coexistence

The board and the legal footer are always visible together within the viewport. The vertical layout guarantees this by assigning fixed heights to header and footer and letting the main content area (including the board) flex into the remaining space.

### 6.2 Sidebar on Narrow Viewports

On viewports too narrow to display the sidebar alongside the board (e.g., tablets in portrait, small laptops), the sidebar collapses below the board or becomes accessible through an alternative interaction such as a slide-in panel. The specific breakpoint and behavior are defined in the implementation spec.

### 6.3 Minimum Supported Viewport

The layout remains functional down to a viewport width of approximately 768px (landscape tablet). Portrait phone layouts are not a priority but are not blocked by the current design.

---

## 7. Visual Theme

The page background is a deep dark blue/charcoal. All chrome elements (header, footer, sidebar cards, icon bar) follow a consistent muted-white-on-dark palette. Interactive elements use subtle hover transitions to signal affordance without disrupting the overall visual calm.

---

## 8. Reference

The file `aiexplodescreenlayout.png` in the project root shows the board and sidebar layout prior to the introduction of the legal footer and header icon bar.