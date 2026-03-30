---
name: responsive-layout
description: >
  Safe responsive and mobile layout implementation for Vue 3 / CSS applications.
  Use this skill whenever a task involves responsive design, mobile layout fixes,
  breakpoint changes, viewport adjustments, touch interaction, or any CSS change
  that affects how the application looks at different screen sizes. Also trigger
  when a task mentions "mobile", "phone", "tablet", "responsive", "breakpoint",
  "media query", "viewport", "touch", "safe area", "orientation", or when the
  implementation touches layout-related CSS (flex, grid, width, height, padding,
  margin on layout containers). Even if the task seems desktop-only, trigger this
  skill if the changed CSS properties could affect other viewport sizes.
---

# Responsive Layout Skill

This skill ensures that responsive and mobile layout changes are implemented safely —
without breaking existing layouts at other viewport sizes.

## Core Principle: Additive-Only Changes

The single most important rule for responsive work:

**Never modify base (un-media-queried) CSS to fix a mobile problem.**

Base styles define the Desktop layout. Mobile and tablet adaptations are layered on top
via media queries. If you change a base style, you change Desktop. This is the #1 cause
of "fixed mobile, broke desktop" regressions.

**Correct pattern:**
```css
/* Base: Desktop layout — DO NOT TOUCH for mobile fixes */
.main-content {
  display: flex;
  flex-direction: row;
  height: 100%;
}

/* Tablet override — additive only */
@media (max-width: 1023px) {
  .main-content {
    flex-direction: column;
  }
}

/* Phone override — additive only */
@media (max-width: 767px) {
  .main-content {
    padding: 0 8px;
  }
}
```

**Wrong pattern:**
```css
/* WRONG: Modifying base to fix mobile, then re-overriding for desktop */
.main-content {
  display: flex;
  flex-direction: column; /* Changed from row to fix mobile — BREAKS DESKTOP */
}

@media (min-width: 1024px) {
  .main-content {
    flex-direction: row; /* Now you need this to restore desktop — fragile */
  }
}
```

The wrong pattern inverts the cascade and creates a maintenance trap where every future
desktop change requires checking whether a mobile override also needs updating.

---

## Breakpoint Strategy

Use `max-width` media queries to progressively override the desktop base:

| Tier    | Media query                | Target                          |
|---------|----------------------------|---------------------------------|
| Desktop | (none — base styles)       | ≥ 1024px                        |
| Tablet  | `@media (max-width: 1023px)` | 768px – 1023px                 |
| Phone   | `@media (max-width: 767px)`  | < 768px                        |

Place media queries directly after the base rule they override, not in a separate file
or at the end of the stylesheet. This keeps overrides colocated with the rules they modify.

In Vue Single File Components, use scoped media queries within `<style scoped>`:

```vue
<style scoped>
.board-container {
  width: 66%;
}

@media (max-width: 1023px) {
  .board-container {
    width: 100%;
  }
}
</style>
```

---

## The 100dvh Constraint

This project uses `100dvh` for the overall page height, distributed across header,
main content, and footer via flex. This means:

1. **No element may cause the page to exceed 100dvh.** If content overflows, the
   individual element must scroll internally — the page itself never scrolls.
2. **The main content area is a flex child with `flex: 1`.** It absorbs whatever space
   remains after header and footer take their fixed heights.
3. **The board must fit within the main content area.** Its size is derived from the
   remaining space, not from a fixed pixel value.

When making responsive changes, always verify that the total height of
header + main content + footer = 100dvh at every breakpoint. A common mistake is
adding padding or margin that pushes the total beyond 100dvh, causing hidden overflow
or an invisible scrollbar.

---

## Board Sizing Rules

The game board is a square grid. Its sizing follows this priority:

1. **Width-constrained:** On narrow viewports (phones), the board width = viewport width
   minus padding. The height matches the width to maintain square cells.
2. **Height-constrained:** On short viewports (phone landscape), the board height =
   available vertical space. The width matches the height.
3. **Formula:** `board-size = min(available-width, available-height)`.

Use `aspect-ratio: 1` on the board container and let it size from the constraining
dimension. Do not use fixed `width` and `height` values — they break at other viewports.

**Minimum cell size:** 36px × 36px for an 8×8 grid. If the viewport is so small that
cells would go below this threshold, the board can scroll horizontally within its
container, but this should not happen at 8×8 on any modern phone.

---

## Sidebar Behavior

| Tier    | Sidebar behavior                                      |
|---------|-------------------------------------------------------|
| Desktop | Displayed to the right of the board (flex row)        |
| Tablet  | Displayed below the board (flex column)               |
| Phone   | Hidden — accessible via icon bar or slide-in panel    |

When the sidebar moves below the board (tablet), it competes for vertical space.
The board has priority — if both cannot fit without scrolling, constrain the sidebar
height and make it scroll internally.

When the sidebar is hidden (phone), never use `display: none` on the data — only on
the visual container. If the sidebar holds game state, ensure it remains in the Vue
component tree (use `v-show` not `v-if`, or keep state in a composable/store).

---

## Touch Interaction

Detect touch devices with:
```css
@media (hover: none) and (pointer: coarse) {
  /* Touch-specific overrides */
}
```

Rules for touch targets:
- Minimum 44px × 44px for all interactive elements (board cells, buttons, icons).
- If the visual element is smaller than 44px, extend the tap area with padding or
  `::before`/`::after` pseudo-elements — do not make the visual element larger.
- Remove hover effects (`:hover`) on touch devices. Use `:active` or `:focus-visible`
  instead for interaction feedback.

---

## Safe Area Insets (Notched Devices)

The viewport meta tag must include:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

Apply safe area padding to the outermost layout containers:
```css
.app-footer {
  padding-bottom: max(8px, env(safe-area-inset-bottom));
}
.app-header {
  padding-top: max(8px, env(safe-area-inset-top));
}
.app-shell {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

Use `max()` to ensure a minimum padding even on devices without notches.

---

## Common Pitfalls

### 1. Using `vh` instead of `dvh`
`vh` does not account for mobile browser chrome (address bar, toolbar). Use `dvh`
(dynamic viewport height) which adjusts when the browser chrome appears/disappears.

### 2. Fixed pixel dimensions on layout containers
Never use `width: 600px` or `height: 400px` on the board or main content. Use
relative units (`%`, `fr`, `dvh`) and let flex/grid distribute space.

### 3. Forgetting `box-sizing: border-box`
Padding and border add to element dimensions by default. Ensure `box-sizing: border-box`
is set globally, otherwise padding changes in media queries will unexpectedly change
element sizes.

### 4. Overflow hidden masking layout bugs
`overflow: hidden` on a container hides content that does not fit instead of revealing
the layout issue. Prefer `overflow: auto` or `overflow: clip` during development, and
only use `overflow: hidden` when the clipping is intentional and documented.

### 5. Z-index conflicts with modals on mobile
Mobile layouts often introduce new stacking contexts (e.g., `position: fixed` on a
slide-in sidebar). Modals must have a higher `z-index` than any slide-in panel.
Define z-index tiers:
- Base content: `z-index: 1`
- Slide-in panels: `z-index: 100`
- Modal backdrop: `z-index: 200`
- Modal content: `z-index: 201`

### 6. Not testing phone landscape
Phone landscape is the most constrained viewport: very wide but very short. The board
must size from height, not width. Always test this orientation explicitly.

---

## Mandatory Validation Checklist

After every responsive or layout-related change, verify ALL of the following. Do not
skip any item. If a condition cannot be verified (e.g., no device preview available),
state that explicitly.

### At each breakpoint (Desktop ≥1024px, Tablet 768-1023px, Phone <768px):
- [ ] Header, board, and footer are visible simultaneously without page scroll.
- [ ] Board cells are square (equal width and height).
- [ ] Board cells are ≥ 36px at the default 8×8 grid.
- [ ] Footer is visible and not overlapped by any element.
- [ ] No unintended horizontal scrollbar on the page.
- [ ] Modals open, display content, and can be dismissed.

### Additional checks:
- [ ] Phone landscape: board sizes from height, not width.
- [ ] Touch targets are ≥ 44px on touch devices.
- [ ] No base (un-media-queried) CSS was modified to fix a mobile-only issue.
- [ ] If a base CSS rule was modified, verify Desktop layout is unchanged.

### How to verify in development:
Use browser DevTools responsive mode. Test at these specific widths:
- **Desktop:** 1280px, 1024px
- **Tablet:** 1023px, 768px
- **Phone portrait:** 767px, 430px (iPhone Pro Max), 375px (iPhone SE), 360px (Android)
- **Phone landscape:** 812×375 (iPhone), 915×412 (Android)

---

## Vue-Specific Patterns

### Conditional rendering by viewport
Use a composable to expose the current breakpoint tier:

```typescript
// composables/useBreakpoint.ts
import { ref, onMounted, onUnmounted } from 'vue'

type Tier = 'desktop' | 'tablet' | 'phone'

export function useBreakpoint() {
  const tier = ref<Tier>('desktop')

  function update() {
    const w = window.innerWidth
    tier.value = w < 768 ? 'phone' : w < 1024 ? 'tablet' : 'desktop'
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return { tier }
}
```

Use this for structural changes that CSS alone cannot handle (e.g., moving the sidebar
into a slide-in panel on phone). For visual-only changes, always prefer CSS media queries
over JavaScript-driven rendering.

### Keep layout state out of components
Board dimensions, sidebar visibility, and viewport tier should live in a composable or
Pinia store, not in individual component state. This prevents layout state from being
lost when components unmount during responsive transitions.