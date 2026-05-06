# Specification

## 1. Title

Game GUI Splash Look & Feel Alignment

## 2. Summary

Update the actual AI Explode game GUI so it visually reflects the splashscreen look and feel as much as practical using HTML and CSS. The change should restyle the existing game shell, board, sidebar, mobile controls, header actions, and modal chrome without changing gameplay behavior or backend/API contracts.

## 3. Background / Problem Statement

The new splashscreen presents AI Explode with a high-energy neon space aesthetic: bright cyan, orange, and magenta accents, glowing game-board cells, dark starfield depth, angular science-fiction paneling, and explosion-like visual energy.

The current game screen is functional and dark-themed, but it is calmer and less visually connected to the splashscreen. After pressing "Start Game", the user should feel that they have entered the same product world shown on the splashscreen, not a separate interface.

This feature aligns with `papers/game-overview.md` by emphasizing the tactical chain-reaction fantasy visually while preserving the existing gameplay rules.

## 4. Goal

Make the playable game GUI feel like a direct continuation of the splashscreen while keeping the current game layout, responsiveness, accessibility, and mechanics intact.

## 5. Scope

- Restyle the actual game view using HTML/CSS and existing Vue components.
- Bring splashscreen-inspired neon colors, glow effects, panel borders, board-cell treatments, and space-game atmosphere into the game GUI.
- Update the board presentation, cell styling, player marks, last-move indicator, explosion effect, sidebar cards, mobile shell bar, header icon bar, modal chrome, setup controls, and footer treatment where relevant.
- Preserve the existing screen layout structure documented in `papers/screen-layout.md`.
- Preserve responsive behavior across desktop, tablet, phone, and short-height viewports.
- Preserve all existing game rules, game state behavior, setup flow, legal pages, and popup interactions.

## 6. Out of Scope

- Backend changes.
- API changes.
- Gameplay logic changes.
- New game modes or mechanics.
- New dependencies.
- Replacing Vue components with another framework.
- Persistent visual theme settings.
- Editing `papers/game-overview.md`, `papers/technical-overview.md`, or `papers/screen-layout.md`.

## 7. Stakeholders / Users Affected

- Players using the game UI after dismissing the splashscreen.
- Future frontend maintainers working on game-shell styling.

## 8. Functional Requirements

- FR-1: The playable game view must remain reachable from the splashscreen and continue to work as before.
- FR-2: The game board must remain the dominant visual element.
- FR-3: Board cells must keep their existing playable, owned, last-move, and exploding states while adopting a splashscreen-inspired neon treatment.
- FR-4: Sidebar and mobile action surfaces must remain usable and visually align with the splashscreen.
- FR-5: Header actions, modal chrome, setup controls, and footer must retain their existing functions.
- FR-6: The implementation must not require backend data or network calls.

## 9. Non-Functional Requirements

- The implementation must remain frontend-only.
- Use existing Vue 3 and scoped/global CSS conventions.
- Prefer CSS custom properties and existing component structure over broad rewrites.
- Maintain keyboard focus visibility and touch target sizes.
- Avoid page-level scrolling regressions in the core game shell.
- Keep text readable against glow and background effects.
- Do not introduce browser-default-looking controls in restyled areas.

## 10. User Flow / Process Description

1. User opens the app and sees the splashscreen.
2. User activates "Start Game".
3. The current game GUI appears.
4. The GUI visually continues the splashscreen mood: neon board, sci-fi panels, space background, and high-contrast action styling.
5. User can configure players, start a match, play cells, open popups, view legal pages, and use mobile controls as before.

## 11. Data / Domain Impact

No data or domain impact. This feature changes visual presentation only.

## 12. API / Interface Impact

No API impact. No backend interface changes.

## 13. UI / UX Considerations

- Visual thesis: a neon tactical command board in deep space, with cyan grid energy, orange explosion energy, and magenta edge highlights.
- Content plan: keep the existing app structure and utility copy; strengthen visual continuity instead of adding marketing text.
- Interaction thesis: use restrained glow, hover/focus lift, active-cell energy, and explosion pulses to make the UI feel alive without obscuring gameplay.
- The board should feel closer to the splashscreen board, with bright grid edges and layered cell depth.
- Player-owned cells should remain distinguishable by player color.
- The active player and primary actions should be more prominent.
- Modals and setup controls should match the same glass/neon panel language.
- Responsive CSS changes must be additive at tablet and phone breakpoints where they affect layout.

## 14. Edge Cases

- Short-height desktop or phone landscape viewports must still keep header, board, and footer usable.
- Glow effects must not make text or player numbers unreadable.
- Empty board state must still look clearly playable.
- Exploding cells must remain visually distinct from normal active/owned cells.
- Users with reduced-motion preferences should not be forced into strong animation.

## 15. Risks / Constraints / Dependencies

- The existing app shell is tightly constrained by `100dvh`, so additional borders, padding, or shadows must not create clipping.
- Heavy glow effects can reduce readability or performance if overused.
- CSS-only visual changes must work with existing component state classes and inline player color variables.
- Existing unrelated worktree changes must not be reverted.

## 16. Assumptions

- "No update" is interpreted as "Now update".
- "Actual game GUI" means the post-splash playable game shell and its directly related UI surfaces.
- "Using HTML and CSS" means the work should primarily be markup/style changes and must not alter game logic.
- The splashscreen PNG at `frontend/public/splash-ai-explode.png` is the visual reference.

## 17. Open Questions

- None blocking.

## 18. Acceptance Criteria

- Given the splashscreen is dismissed, when the game GUI appears, then it uses a visibly similar neon space aesthetic.
- Given the board is displayed, then cells show brighter splashscreen-like grid, glow, and depth treatments while preserving current state behavior.
- Given the sidebar or mobile shell bar is displayed, then primary controls and status surfaces match the new neon/glass visual language.
- Given setup or header popups open, then modal chrome and form controls are visually aligned with the game GUI.
- Given desktop, tablet, and phone viewports, then the board remains usable and no page-level layout overflow is introduced.
- Given frontend validation is run, then the build passes or any unrelated failures are clearly reported.
