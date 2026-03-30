# AI Explode – Screen Layout & Application Chrome

**Document type:** Design reference
**Date:** 2026-03-28
**Last updated:** 2026-03-30

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

## Last Move Indicator

After a player places a load, the affected cell receives a brief entrance animation (a subtle scale-up or pop effect) to
draw immediate attention. Once the animation completes, a static highlight ring in the active player's color remains
visible on the cell until the next move is made. This ensures that both the moment of placement and the location of the
last move are clearly communicated, even if a player looked away briefly.
When a chain reaction occurs, the last-move indicator stays on the cell where the player originally placed their
load — not on cells affected by explosions. This keeps it clear which cell was the deliberate action versus the
resulting chain effects.

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

### 6.1 Guiding Principles

The responsive strategy follows three invariants that hold across all viewport sizes:

1. **The board is always the primary visual element.** It receives the maximum available space; all other elements shrink or relocate before the board does.
2. **Header, board, and footer are always simultaneously visible without scrolling.** The layout uses `100dvh` and flex distribution to guarantee this. Vertical scrolling of the page itself never occurs.
3. **No layout change may break another breakpoint.** Responsive rules are additive — they override base styles via media queries, never modify them directly.

### 6.2 Breakpoint Tiers

The layout defines three tiers. Each tier describes the target devices and the structural layout used.

| Tier     | Breakpoint            | Target devices                         | Layout mode                     |
|----------|-----------------------|----------------------------------------|---------------------------------|
| Desktop  | `≥ 1024px` width      | Desktop monitors, landscape laptops    | Board + sidebar side by side    |
| Tablet   | `768px – 1023px` width | Tablets (portrait & landscape), small laptops | Board full width, sidebar below |
| Phone    | `< 768px` width       | Phones (portrait & landscape)          | Board full width, compact chrome |

These breakpoints are implemented as `min-width` / `max-width` media queries. The base (un-media-queried) styles define the **Desktop** layout. Tablet and Phone tiers add overrides progressively.

### 6.3 Desktop Layout (≥ 1024px)

This is the default layout as described in Sections 3–5:

- Header with full title group and icon bar side by side.
- Main content: board area (≈ two-thirds width) with sidebar (fixed width) to the right.
- Footer at the bottom.

No special responsive rules apply at this tier.

### 6.4 Tablet Layout (768px – 1023px)

**Header:** Remains unchanged. Title and icon bar fit comfortably.

**Main content:** The side-by-side layout switches to a stacked layout:

- The board container spans the full available width (minus horizontal padding).
- The sidebar relocates below the board within the same flex container, switching the flex direction from `row` to `column`.
- The sidebar cards reflow into a horizontal row if space permits, or remain stacked vertically.

**Board sizing:** The board continues to size itself based on the available height between header and footer. Because the sidebar now occupies vertical space below the board, the board shrinks vertically to accommodate both. The minimum acceptable board cell size is 36px × 36px. If the board would fall below this threshold, the sidebar content becomes scrollable within a constrained-height container to return space to the board.

**Footer:** Unchanged.

### 6.5 Phone Layout (< 768px)

**Header adjustments:**

- The title font size is reduced (approximately 60–70% of the desktop size).
- The subtitle is hidden (`display: none`) to save vertical space.
- The icon bar remains visible and anchored to the right. Icon tap targets are at least 44px × 44px to meet touch accessibility standards.

**Main content:**

- The board container spans the full viewport width minus minimal horizontal padding (8–12px per side).
- The board sizes itself as a square based on the available width (`min(available-width, available-height)`), clamped so that it does not exceed the vertical space between header and footer.
- The sidebar is **not displayed** in the default view. Instead, its functionality is accessible through the existing icon bar (Settings gear) or a dedicated slide-in panel triggered by a hamburger icon or swipe gesture. The exact trigger mechanism is defined in the implementation spec.

**Board cell sizing:** On small phone screens (≤ 375px width), an 8×8 grid at full width yields cells of approximately 42–44px, which is acceptable for touch interaction. The minimum touch target of 36px × 36px must never be violated. If a custom board size (e.g., 12×12) would push cells below this threshold, the board becomes horizontally scrollable within its container — but the default 8×8 grid must always fit without scrolling.

**Footer:** Font size may reduce to 11px. Padding reduces to 6–8px. The footer remains visible and never overlaps the board.

**Modals:** On phone viewports, modal popups expand to near-full-screen (with small margins), and the close button (×) has a minimum tap target of 44px × 44px. Modal content is always scrollable.

### 6.6 Orientation Handling

**Phone landscape:** When a phone is in landscape orientation, the available height is severely limited. The layout should:

- Hide the subtitle (as in phone portrait).
- Reduce header padding to a minimum.
- Size the board based on available height rather than width, since width is now abundant but height is not.
- The sidebar remains hidden, accessible through the icon bar or slide-in panel.

**Tablet landscape:** Falls into the Desktop tier (typically ≥ 1024px width) and uses the side-by-side layout.

### 6.7 Touch Interaction Considerations

On touch devices (detected via media query `(hover: none) and (pointer: coarse)`):

- All interactive elements (board cells, buttons, icon bar entries) have a minimum tap target of 44px × 44px.
- Hover effects (e.g., footer link brightness, icon bar glow) are suppressed. Active/focus states are used instead.
- Board cell tap feedback uses a brief opacity or scale pulse rather than a hover highlight.

### 6.8 Safe Area Insets

On devices with notches, rounded corners, or system UI overlays (e.g., iOS safe area), the layout respects `env(safe-area-inset-*)` values:

- The footer adds `padding-bottom: env(safe-area-inset-bottom)` to prevent content from being obscured by the home indicator.
- The header adds `padding-top: env(safe-area-inset-top)` if necessary.
- Horizontal padding incorporates `env(safe-area-inset-left)` and `env(safe-area-inset-right)`.

The viewport meta tag must include `viewport-fit=cover` to enable safe area inset support.

### 6.9 Layout Invariants Checklist

After any responsive change, the following conditions must hold at every breakpoint:

- [ ] Header, board, and footer are simultaneously visible without scrolling.
- [ ] The board is square (cells are square, equal width and height).
- [ ] Board cells are ≥ 36px × 36px at the default 8×8 grid size.
- [ ] The footer is not overlapped or obscured.
- [ ] Touch targets are ≥ 44px × 44px on touch devices.
- [ ] No horizontal page-level scroll exists (board-internal scroll for oversized grids is acceptable).
- [ ] Modals are fully usable and dismissible at every viewport size.
- [ ] Safe area insets are respected on notched devices.

---

## 7. Visual Theme

The page background is a deep dark blue/charcoal. All chrome elements (header, footer, sidebar cards, icon bar) follow a consistent muted-white-on-dark palette. Interactive elements use subtle hover transitions to signal affordance without disrupting the overall visual calm.
