# Learnings

## 2026-03-26 Responsive Board-First Shell

- The board should win every space trade. Non-essential copy above or around the board quickly causes viewport clipping on shorter screens.
- Avoid duplicating status information in multiple regions. The round/current-player state worked better once it lived only in the right rail instead of both the header and the sidebar.
- Idle-state UI should stay light. Extra explanatory boxes added visual noise and reduced usable board space without helping the core flow.
- Sidebar panels with variable content need their own responsive strategy. Scoreboards should allow internal scrolling and row wrapping so player names, colors, and scores do not get clipped on smaller screens or with more players.
- Modal forms with growing content need a scrollable body and persistent footer actions. Keeping the action buttons visible at the bottom of the setup modal made the flow much more reliable.
- Responsive shell work is easiest to stabilize when height constraints are treated as first-class, not as an afterthought to width-based breakpoints.
- Shared modal infrastructure must handle keyboard containment, not just visual presentation. Focus trapping, focus restoration, and making the background shell inert were necessary to meet the modal accessibility requirement.
- The setup modal copy works best when the outer modal carries the product branding and the inner setup card carries only the task-specific heading. Duplicated titles and explanatory subcopy made the popup feel crowded without improving clarity.
- Small hover translations near the viewport edge need explicit breathing room. Giving the right-rail primary action a few pixels of top margin prevented its hover state from appearing clipped.

## 2026-03-28 Explosion Resolution

- Gameplay rules and score updates are both anchored in `frontend/src/composables/useGameShell.ts`. Keeping the scoreboard derived from final board ownership avoids duplicate score state and keeps board colors and counts synchronized after captures.
- In the sweep-based rules, load distribution can enter a repeating cycle after one player already owns every occupied field. `frontend/src/composables/useGameShell.ts` needs to short-circuit into the existing winner flow at that point, otherwise autoplay matches can freeze waiting for a stable board state that never arrives.

## 2026-03-28 Default Board Size Alignment

- Board rendering should derive its column count from the live board data instead of fixed CSS literals. That keeps presentation aligned with the logical board size and makes later size configurability much cheaper.

## 2026-03-28 Post-Move Outcome Flow

- Match outcome rules belong in a dedicated post-move step after board resolution, not inside the move-resolution mechanics themselves. Keeping permanent outcome state in `frontend/src/composables/useGameShell.ts` and the one-move popup payload as transient shell UI state makes later explosion upgrades cheaper without duplicating elimination, winner, and turn-skip logic.

## 2026-03-28 Sweep Resolution Testability

- Sweep-order rules are easier to lock down when `frontend/src/composables/useGameShell.ts` exposes only small internal resolution metadata, such as sweep counts, while the rest of the shell still consumes just the final resolved board. That keeps ordering regressions testable without leaking intermediate state into the UI flow.

## 2026-03-28 Computer Player Turn Orchestration

- Computer turns fit best as a single modal-aware watcher in `frontend/src/composables/useGameShell.ts` that reacts to the active player and current modal state. Keeping AI scheduling there prevents autoplay from skipping over move-result or restart dialogs and lets future computer-player types reuse the same turn handoff without duplicating timer logic in components.

## 2026-03-28 Legal Shell Views

- Non-game shell views such as legal pages should stay as a narrow sibling UI state in `frontend/src/composables/useGameShell.ts`, not inside `GameState`. That preserves the live match across view switches and gives the existing computer-turn watcher one place to pause automation whenever gameplay is temporarily hidden.

## 2026-03-28 Header Popup Shell State

- Secondary shell popups fit best as another case in the shared `modalState` flow instead of local component state. Reusing the same modal gate in `frontend/src/composables/useGameShell.ts` automatically pauses queued computer turns, keeps the board inert, and prevents popup behavior from drifting away from setup, restart-warning, and move-result dialogs.

## 2026-03-29 Delayed Explosion Playback

- Presentation-paced move playback works best with a separate displayed board in `frontend/src/composables/useGameShell.ts`. Keeping `gameState` authoritative until the move fully resolves lets the board animate intermediate explosion steps without advancing the turn, drifting the scoreboard, or firing result popups against an unstable board.
