# Specification — Design Refresh (Claude Design Handoff)

**Date:** 2026-04-24
**Status:** in-progress
**Related:** `papers/game-overview.md`, `papers/screen-layout.md`, `papers/technical-overview.md`

---

## 1. Context

A Claude Design handoff bundle was exported by the user. The bundle contains an
HTML/CSS/JS prototype of AI Explode together with the chat transcript in which
it was iterated on. The prototype is a visual refresh of the existing game
shell, not a functional redesign: game rules, board size, explosion semantics,
computer player behavior, header popups, restart/move-result flows, and
responsive breakpoints remain unchanged.

The purpose of this spec is to port the **visible visual deltas** from the
prototype into the existing Vue 3 / TypeScript frontend while preserving the
current backend/frontend contract and existing functional behavior.

## 2. In scope

The following visible deltas must be implemented:

### 2.1 Board — particle "load dots"

- Replace the current textual display (numeric `cell.load` + player
  `initials`) inside each board cell with an SVG dot layout that renders
  `cell.load` particles (1–8) in fixed positions inspired by atomic
  configurations:
  - 1: center
  - 2: horizontal pair
  - 3: triangle
  - 4: 2x2 grid
  - 5: 2x2 grid + center
  - 6: 2x3 grid
  - 7: radial cluster
  - 8: outer ring of 8
- Dots take the color of the owning player (`color.light` fill,
  `color.primary` glow). For unowned / empty cells (`cell.load === 0`), no
  dots render.
- Cell background uses a deeper owned gradient with a radial highlight plus a
  color-matched outer glow (`box-shadow` based on the player color).
- Hover for playable cells adds a subtle cyan glow and a small
  translate-up + scale (`scale(1.04)`).
- Exploding cells animate through a `cell-explode` keyframe
  (scale 0.88 → 1.1 → 1 with brightness/saturation flash) while a
  `.explosion-burst` radial overlay fades out on top of the cell.
- The default explosion delay preset is `low`, so the burst/keyframe playback
  is visible in a new session without requiring a settings change. Selecting
  `none` remains the instant-resolution option.
- The board grid sizes itself via `container-type: size` on the stage and
  `width/height: min(100cqw, 100cqh, 46rem)` on the grid, replacing the
  current aspect-ratio / min-inline-size approach. Board remains a perfect
  square at every viewport size.
- Last-move ring, idle state, responsive gap/padding tweaks, and
  mobile/landscape adjustments from the current code remain, with radii
  updated to match the new `0.7rem` cell radius.

### 2.2 Sidebar — New Game button at top, simplified scoreboard

- The "New Game" sidebar action button moves from the bottom of the sidebar
  (currently `order: 1`) to the **top** (above the Turn card and the
  Scoreboard).
- During `phase === 'playing'`, the score card no longer renders the
  "Scoreboard / Occupied fields" header block, nor the "Updates after every
  valid move." / "The board is locked until…" secondary note.
- During `phase === 'idle'`, the current overview block ("Game Overview /
  Chain-Reaction Tactics" + 3 rule bullets) remains as-is.
- The `.score-list` no longer scrolls; it grows with the number of players
  (up to 4) and fits without overflow at all supported viewport heights.

### 2.3 Setup modal — compact player card

- Each player card switches from the current multi-row layout (label/headline
  + full-width Controller toggle + full-width Name + full-width Color grid)
  to a two-row compact layout:
  - **Top row:** small color-tinted player index badge (1–4) · Human/Computer
    toggle (with small human and computer icons) · optional remove button.
  - **Body row:** name input (`<input>`) for human, "Random N" placeholder
    for computer · inline row of circular color dots (selectable).
- Color dots replace the label-bearing `color-chip` buttons with small
  gradient circles; the selected dot shows a white border + colored outer
  ring.
- Selecting a color remains constrained to colors not taken by other
  players (existing `getAvailableColors` behavior).
- The computer-player dropdown (`<select>` for `ComputerPlayerId`) is
  **removed** from the compact card. Only `random` is currently supported, so
  removing the selector has no functional impact. The `updateComputerPlayer`
  event handler remains in place but is no longer wired from the setup card.
- The setup modal keeps the existing primary/secondary actions, validation
  list, and `getAvailableColors` contract.

### 2.4 Typography — Plus Jakarta Sans

- Load the Google Font "Plus Jakarta Sans" (weights 400, 500, 600, 700, 800)
  and use it as the first entry of the global `font-family` stack. Fallbacks
  remain: `'Avenir Next', 'Trebuchet MS', 'Segoe UI', sans-serif`.

## 3. Out of scope

- No changes to game logic, `useGameShell.ts`, `game.ts` types (other than
  noted scoreboard-rendering tweaks if any), backend, API contract, tests
  beyond adjustments needed for changed markup.
- No changes to header icons (they already match), info/rules/settings
  modal content, restart dialog, move-result dialog, footer, or legal pages.
- No theme changes beyond those strictly necessary to realize the deltas
  above.
- No introduction of new dependencies.

## 4. Acceptance criteria

1. Board cells render particle dots in player color for loads 1–8 and render
   nothing when `load === 0`.
2. Board remains a square at all supported viewports (desktop up to 1380px,
   tablet down to 768px, mobile down to 360px, landscape <= 520px height).
3. Exploding cells show the burst + keyframe animation during chain
   reactions; last-move ring continues to animate in.
4. "New Game" sidebar button appears as the first item in the sidebar on
   desktop / tablet layouts; existing mobile bar behavior is unchanged.
5. Scoreboard list (during play) fits on screen without scrolling for up to
   4 players at standard heights (>= 860px) and does not introduce layout
   regressions at shorter heights.
6. Setup modal renders each player as a two-row compact card, with remove /
   add / start-game and validation behaviors preserved.
7. Body font renders as Plus Jakarta Sans when the font loads; falls back
   gracefully when offline.
8. `npm run build` (vue-tsc + vite build) and `npm test` (vitest) both pass.
