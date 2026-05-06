# Implementation Plan

## 1. Title

Game GUI Splash Look & Feel Alignment Implementation Plan

## 2. Summary

Restyle the existing AI Explode game GUI to visually align with the splashscreen. The implementation stays frontend-only and primarily uses HTML/CSS changes in the existing Vue components.

## 3. Source Specification

`papers/in-progress/2026-05-05_SPEC_game-gui-splash-lookfeel.md`

## 4. Planning Goals

- Preserve the current game behavior and component responsibilities.
- Preserve the screen layout and responsive invariants documented in `papers/screen-layout.md`.
- Apply a shared neon space visual language across the game shell.
- Keep the change focused on visual presentation.
- Validate the frontend after implementation.

## 5. Scope of This Plan

- Update global visual tokens/background styling.
- Update game shell/header splash-aligned styling.
- Update board and cell CSS states.
- Update sidebar, mobile bar, info panels, and buttons.
- Update modal/setup/legal popup chrome where directly visible from the game GUI.
- Add small markup/classes only where needed to support CSS styling.

## 6. Out of Scope

- Backend work.
- API work.
- Game-rule or state changes.
- New dependencies.
- Persistent theme selection.
- Rebuilding the UI from scratch.

## 7. Affected Areas

- `frontend/src/styles.css`
- `frontend/src/App.vue`
- `frontend/src/components/GameBoard.vue`
- `frontend/src/components/PlayerSidebar.vue`
- `frontend/src/components/MobileShellBar.vue`
- `frontend/src/components/HeaderIconBar.vue`
- `frontend/src/components/GameInfoPanel.vue`
- `frontend/src/components/ShellModal.vue`
- `frontend/src/components/PlayerSetup.vue`
- Dialog and popup components if their chrome visibly conflicts with the new theme.

## 8. Workstreams

### Visual Tokens and App Background

Purpose: Establish splashscreen-inspired base colors, glows, borders, and background depth.

Responsibilities:
- Add CSS custom properties for neon cyan, magenta, orange, glass panels, and board surfaces.
- Update the app background to feel closer to the splashscreen's space setting.
- Preserve `100dvh` and safe-area behavior.

Dependencies:
- Existing global stylesheet.

Risks:
- Overly bright backgrounds can reduce readability.

### Board and Cell Treatment

Purpose: Make the board feel like the splashscreen's luminous tactical grid.

Responsibilities:
- Enhance board frame, cells, hover/focus, player-owned states, last-move, and explosion styling.
- Keep cell size/responsiveness unchanged.
- Keep player color differentiation intact through existing CSS variables.

Dependencies:
- Existing `GameBoard.vue` classes and state variables.

Risks:
- Glow effects may obscure cell loads if too strong.

### Shell Panels and Controls

Purpose: Align the sidebar, mobile controls, buttons, and info panels with the same neon glass language.

Responsibilities:
- Restyle panels and buttons without changing their behavior.
- Keep action hierarchy clear, especially "New Game" and mobile info controls.
- Preserve readable score rows and status indicators.

Dependencies:
- Existing component markup and scoped CSS.

Risks:
- Dense sidebars can become visually noisy if every element glows equally.

### Modal and Setup Surfaces

Purpose: Ensure popups do not feel visually disconnected after the game GUI update.

Responsibilities:
- Update modal container, close button, setup controls, and dialog actions to the new theme.
- Preserve focus, keyboard, and scroll behavior.

Dependencies:
- Existing `ShellModal.vue` and setup/dialog components.

Risks:
- Form controls need strong contrast and clear selected states.

### Responsive Validation

Purpose: Confirm visual updates do not break layout at key breakpoints.

Responsibilities:
- Keep base styles as desktop defaults.
- Add tablet/phone overrides only where needed.
- Confirm build and tests where practical.

Dependencies:
- Existing frontend scripts.

Risks:
- Borders/padding may reduce board space on smaller screens.

## 9. Phased Execution Plan

### Phase 1: Inspect Current Styling

Objective: Identify the smallest set of component styles required.

Key tasks:
- Read relevant component styles.
- Identify reusable token patterns and state classes.

Entry criteria:
- Specification exists.

Exit criteria:
- Target files and visual implementation approach are clear.

### Phase 2: Global Tokens and Shell Atmosphere

Objective: Establish the shared look and feel.

Key tasks:
- Update global CSS variables.
- Adjust app background and panel primitives.
- Update top-level shell visual treatment.

Entry criteria:
- Current styles inspected.

Exit criteria:
- App shell has splash-aligned base atmosphere.

### Phase 3: Board and Primary Gameplay UI

Objective: Make the board the strongest visual continuation of the splashscreen.

Key tasks:
- Restyle board frame and cells.
- Enhance owned/load/last-move/explosion states.
- Confirm interactive affordance remains clear.

Entry criteria:
- Global tokens available.

Exit criteria:
- Board reflects the splashscreen visual language while preserving state behavior.

### Phase 4: Supporting Surfaces

Objective: Align sidebars, mobile controls, popups, setup, and dialogs.

Key tasks:
- Restyle sidebar and mobile shell bar.
- Restyle header icons and footer.
- Restyle modal and setup controls enough to match the game GUI.

Entry criteria:
- Board and shell style established.

Exit criteria:
- Core game GUI surfaces feel visually cohesive.

### Phase 5: Validation and Review

Objective: Verify frontend correctness and perform required review.

Key tasks:
- Run frontend build.
- Run frontend tests if feasible.
- Inspect remaining references and changed files.
- Review the current uncommitted changes against the specification and plan.

Entry criteria:
- Implementation complete.

Exit criteria:
- Validation results and review outcome are documented.

## 10. Task Breakdown

- Inspect existing component CSS.
- Update `frontend/src/styles.css` theme variables and background.
- Update `frontend/src/App.vue` shell/header/splash continuity styles where needed.
- Update `GameBoard.vue` board and cell visual states.
- Update `PlayerSidebar.vue`, `MobileShellBar.vue`, `HeaderIconBar.vue`, and `GameInfoPanel.vue`.
- Update modal/setup/dialog styling if needed for cohesion.
- Run `npm run build`.
- Run `npm run test` and report unrelated failures if present.
- Move completed spec/plan to `papers/done` after implementation.
- Update `LEARNINGS.md` if a durable architecture or styling lesson is learned.

## 11. Testing / Validation Plan

- Build: `npm run build`
- Tests: `npm run test`
- Static checks:
  - Confirm no SVG splash reference is reintroduced.
  - Confirm no backend files are changed.
  - Confirm no new dependencies are added.
- Visual reasoning checks:
  - Desktop game shell remains board-first.
  - Tablet stacked layout remains usable.
  - Phone compact shell remains usable.
  - Modals remain scrollable and dismissible.
  - Text remains readable over glows.

## 12. Rollout Plan

No special rollout is required. The feature is a frontend-only visual update.

## 13. Risks / Assumptions

- Assumption: CSS/HTML visual alignment is preferred over additional image generation because the splashscreen PNG is already the accepted visual reference.
- Assumption: Existing game UI structure should remain recognizable.
- Risk: Existing tests may fail for unrelated release-history mismatch; this should be reported separately if still present.

## 14. Completion Criteria

- The playable game GUI visually aligns with the splashscreen.
- Existing gameplay flow remains intact.
- Frontend build passes.
- Tests are run or limitations are reported.
- Review of current uncommitted changes is completed.
