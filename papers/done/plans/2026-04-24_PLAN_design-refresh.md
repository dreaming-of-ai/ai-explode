# Implementation Plan — Design Refresh

**Date:** 2026-04-24
**Spec:** `papers/in-progress/2026-04-24_SPEC_design-refresh.md`
**Layer:** frontend only (Vue 3 + TypeScript + scoped CSS)

---

## Affected files

- `frontend/index.html` — Google Fonts link for Plus Jakarta Sans
- `frontend/src/styles.css` — updated global font-family stack
- `frontend/src/components/GameBoard.vue` — particle dots, new cell styling,
  explosion burst, container-query sizing
- `frontend/src/components/PlayerSidebar.vue` — move New Game action to top
- `frontend/src/components/GameInfoPanel.vue` — drop score header/note during
  play, remove scroll constraint
- `frontend/src/components/PlayerSetup.vue` — compact two-row player card
- `frontend/src/data/explosionDelayPresets.ts` — default explosion delay
  changed to `low` so burst playback is visible by default
- `frontend/src/composables/useGameShell.ts` — origin-cell explosion burst
  marker and final-frame hold

No backend or API contract changes.
No new dependencies, no new npm packages.

## Step-by-step

### Step 1 — Typography

1. In `frontend/index.html`, add `<link rel="preconnect">` tags for Google
   Fonts and a `<link rel="stylesheet">` for
   `Plus+Jakarta+Sans:wght@400;500;600;700;800`.
2. In `frontend/src/styles.css`, prepend `'Plus Jakarta Sans'` to the
   `font-family` stack in `:root`.

### Step 2 — GameBoard

1. In `GameBoard.vue`, add a new `<LoadDots>` subcomponent (inline in the same
   SFC or as a small exported component if reuse is needed — keep inline for
   scope discipline). It takes props:
   - `load: number`
   - `color?: PlayerColor | null`
   The component renders an SVG with `viewBox="0 0 1 1"` and
   `class="load-dots"`, choosing dot positions from a fixed map for
   `load ∈ [1, 8]`. Dot radius scales down as load grows (≤3: 0.085, ≤6:
   0.075, else 0.065).
2. Replace the existing `<span class="cell-initials">` and
   `<span class="cell-load">` markup inside the `board-cell` with a
   conditional `<LoadDots>` rendered only when `cell.load > 0`.
3. Keep the `<span class="last-move-ring">` sibling.
4. Add a conditional `<span class="explosion-burst">` rendered when an
   explosion animation is active. The current Vue shell does not track
   per-cell explosion frames (the animation model is different from the
   prototype), so for this iteration we reuse the existing last-move ring
   and keyframe animation flow: the `.explosion-burst` style is added to CSS
   but only rendered when the cell holds a future `isExploding` flag. If a
   per-cell animation wiring is not yet in place in `useGameShell`, we leave
   the `.explosion-burst` rule defined but unused (no runtime behavior
   regression, forward-compatible with the prototype).
5. Update the `<style scoped>` block:
   - Replace `.board-grid` sizing with `container-type: size` on
     `.board-stage`, and set `width/height: min(100cqw, 100cqh, 46rem)` on
     `.board-grid` plus `grid-auto-rows: 1fr`.
   - Update `.board-grid` background/box-shadow to the deeper gradient from
     the prototype.
   - Update `.board-cell` radius to `0.7rem`, background gradient, hover
     translate/scale rule, owned background (with color-mix glow), and
     disabled style.
   - Update `.last-move-ring` radius to `calc(0.7rem - 0.1rem)`.
   - Add `.explosion-burst` rule + `burst-fade` and `cell-explode`
     keyframes.
   - Add `.load-dots` rule (width 64% / height 64%, z-index 2).
   - Simplify / remove the `tone-corner / tone-edge / tone-interior`
     box-shadow styles since the prototype does not differentiate cell
     tones. Drop the `getCellTone` computation and its class bindings
     (they were decorative only and not referenced anywhere else).
   - Preserve existing responsive overrides (`max-height: 860px`,
     `max-width: 720px`, `max-height: 520px`), updating radii to match new
     `0.7rem` base.
6. Keep `<GameBoard>` props + emit surface unchanged.

### Step 3 — Sidebar reorder & scoreboard simplification

1. In `PlayerSidebar.vue`, remove `order: 1` from `.sidebar-action`. The
   button is already the first child of `.sidebar`, so removing the order
   override places it at the top.
2. In `GameInfoPanel.vue`:
   - When `phase === 'playing'`, hide the `.score-header` block entirely.
     It still renders during the idle overview (with its
     "Game Overview / Chain-Reaction Tactics" content).
   - Remove the `.score-note` paragraph altogether (it was dropping into the
     idle/overview branch too; keep the rule bullets instead via the
     `phase !== 'playing'` branch).
   - On `.score-list`, drop `overflow: auto; min-height: 0` and replace with
     `align-content: start` so 2–4 players stack without a scroll.
   - Slightly tighten `.score-item` padding to match prototype
     (`0.65rem 0.8rem` vs current `0.82rem 0.9rem`) so 4 players fit at
     shorter heights.
   - Adjust the 1023px breakpoint to keep score card contained (remove the
     `.score-header` flex-direction override since the header no longer
     renders during play).

### Step 4 — Compact setup card

1. In `PlayerSetup.vue`:
   - Replace the existing `.player-card` markup with:
     - `player-card__top`: index badge (tinted by selected color) + compact
       controller toggle with Human/Computer icons + optional remove button
       (icon-only ghost button).
     - `player-card__body`: name `<input>` for human or a
       `.generated-name` placeholder reading `Random N` for computer, plus a
       `.color-chips-row` of `.color-dot` circular buttons.
   - Remove the `<select>` for computer-player selection and the
     "Generated Name" field (only one computer player type is currently
     supported; the underlying `computerPlayerId` stays at its default
     `'random'`). Stop emitting `update-computer-player` from this
     component; `App.vue` still listens for it but will receive no events —
     that is acceptable and unused handlers stay in place for future
     re-introduction without churn.
   - Update scoped CSS to match the compact look: player index badge
     styles, `.controller-toggle.compact`, `.controller-button`
     inline-icon layout, `.color-chips-row`, `.color-dot` + `is-selected`
     state, `.remove-btn` icon-sizing.
2. Validation list and primary/secondary action buttons remain unchanged.

### Step 5 — Validation

1. Run `cd frontend && npm run build` (vue-tsc + vite build).
2. Run `cd frontend && npm test` (vitest).
3. If either reports a failure, fix before completion.
4. Manual smoke: dev server + browser check is optional per CLAUDE.md, but
   recommended. If skipped, report that explicitly.

## Risks & notes

- Per-cell explosion animation: `useGameShell.ts` gains an
  `explodingCells: Ref<Set<string>>` state. `BoardResolutionPlaybackUpdate`
  gains an `isOrigin: boolean` flag; `resolveSingleExplosion` marks neighbor
  updates as non-origin and the origin update as origin. In the playback
  loop, the marker is only set on origin updates (so the burst anchors to
  the cell that actually exploded, not to cells that merely absorbed load).
  Each origin marker is cleared and re-set through `nextTick()` so repeated
  bursts can restart CSS animation. The final playback update waits for at
  least the burst animation duration before `finalizeShellMove`, then clears
  the marker in `finally`. `App.vue` passes the Set to `<GameBoard>`, which
  toggles `.is-exploding` and renders `<span class="explosion-burst">`.
- Default explosion delay is `low` instead of `none`, so new sessions show the
  burst animation without a settings change. The `none` preset remains
  available for instant resolution.
- Removing `getCellTone` is safe: the classes `tone-corner / tone-edge /
  tone-interior` are scoped to `GameBoard.vue` and used only for decorative
  shadows.
- Removing the computer-player `<select>` is safe: `COMPUTER_PLAYERS`
  currently contains only `'random'`, and `updateComputerPlayer` is still
  exported from `useGameShell` for future reinstatement without an API
  break.
