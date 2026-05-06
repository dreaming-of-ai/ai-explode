# Implementation Plan

## 1. Title

Splashscreen With Start Game Button Implementation Plan

## 2. Summary

Implement a frontend-only splashscreen that appears before the current AI Explode game view. The splashscreen displays the provided image and a prominent "Start Game" button that reveals the existing game shell.

## 3. Source Specification

`papers/in-progress/2026-05-05_SPEC_splashscreen-start-game.md`

## 4. Planning Goals

- Keep the change limited to the frontend shell.
- Preserve the existing game view and game behavior.
- Avoid adding routing, backend calls, or dependencies.
- Keep responsive behavior compatible with the existing `100dvh` layout.

## 5. Scope of This Plan

- Add local splashscreen visibility state.
- Add splashscreen markup to the top-level Vue app.
- Reference the provided AI Explode image as a frontend asset.
- Add scoped styles for the splashscreen layout, image, and primary button.
- Validate with frontend build and relevant tests where available.

## 6. Out of Scope

- Backend implementation.
- API changes.
- Persistent local-storage preference.
- New routes.
- Game logic or setup flow changes.
- Broad visual redesign of the existing board screen.

## 7. Affected Areas

- Frontend application shell.
- Frontend static asset handling.
- Responsive CSS for the new splash view.
- Frontend validation commands.

## 8. Workstreams

### Frontend Shell

Purpose: Introduce a first-view splashscreen while preserving the existing game shell.

Responsibilities:
- Add a boolean local UI state to control whether the splashscreen is active.
- Render either the splashscreen or the existing app shell.
- Ensure modals and existing shell controls are only active after the splashscreen is dismissed.

Dependencies:
- Existing `App.vue` shell structure.

Risks:
- Incorrect `inert` or hidden state could interfere with existing modals if mixed with the splashscreen. Keep the splashscreen as a separate top-level branch.

### Splashscreen UI

Purpose: Present the provided image and a clear start action.

Responsibilities:
- Display the image with preserved aspect ratio.
- Add an accessible primary button labeled "Start Game".
- Keep the button below the image and visually prominent.

Dependencies:
- Provided image asset available in the frontend.

Risks:
- Very short viewports may need internal splash content scrolling or compact spacing.

### Validation

Purpose: Confirm the frontend remains functional.

Responsibilities:
- Run frontend build.
- Run existing frontend tests if practical.
- Inspect git diff to confirm scope.

Dependencies:
- Existing frontend scripts and installed dependencies.

Risks:
- Existing unrelated worktree changes must not be reverted.

## 9. Phased Execution Plan

### Phase 1: Asset Preparation

Objective: Make the provided image consumable by the frontend.

Key tasks:
- Add or reference the splash image in a frontend asset/public location.
- Use a stable filename.

Entry criteria:
- Specification exists.

Exit criteria:
- Frontend code can reference the splash image without adding dependencies.

### Phase 2: Shell State and Rendering

Objective: Show splashscreen before the current game screen.

Key tasks:
- Add local splash visibility state.
- Add a start handler that dismisses the splashscreen.
- Wrap the existing shell in a branch shown after dismissal.

Entry criteria:
- Asset path is established.

Exit criteria:
- Initial render shows splashscreen; start action reveals the existing shell.

### Phase 3: Splash Styling

Objective: Match the existing dark game theme and maintain responsive behavior.

Key tasks:
- Add scoped CSS for the splash layout.
- Ensure image scales within viewport constraints.
- Ensure button is prominent, focusable, and touch-friendly.
- Add responsive overrides for phone and short-height viewports without disturbing the existing desktop base layout.

Entry criteria:
- Splash markup exists.

Exit criteria:
- Splashscreen is usable across expected viewport tiers.

### Phase 4: Validation and Review

Objective: Verify correctness and review the uncommitted changes.

Key tasks:
- Run frontend build.
- Run frontend tests if available.
- Inspect diff and perform review of current uncommitted changes relevant to the feature.

Entry criteria:
- Implementation complete.

Exit criteria:
- Validation results and any risks are documented.

## 10. Task Breakdown

- Add splash image asset or stable asset reference.
- Update `frontend/src/App.vue` with splashscreen state, markup, and styles.
- Keep existing game shell markup and modal behavior unchanged after dismissal.
- Validate with `npm run build` from `frontend`.
- Run `npm run test` from `frontend` if feasible.
- Review current uncommitted changes before final response.

## 11. Testing / Validation Plan

- Build: `npm run build`
- Tests: `npm run test`
- Manual reasoning checks:
  - Initial state shows splashscreen.
  - Button label is exactly "Start Game".
  - Button click reveals existing game view.
  - Image uses preserved aspect ratio.
  - Button remains reachable on narrow and short viewports.

## 12. Rollout Plan

No special rollout is required. The feature ships as a frontend-only change with no data migration and no backend dependency.

## 13. Risks / Assumptions

- Assumption: first invocation means first view per page load, not persistent browser history.
- Assumption: the image is accepted as a static frontend asset.
- Risk: if the exact provided image bytes are not available in the workspace, the implementation must still use a stable asset path so the provided image can be placed there.

## 14. Completion Criteria

- Active specification and implementation plan exist in `papers/in-progress`.
- The app initially renders the splashscreen.
- "Start Game" transitions to the existing game view.
- Frontend validation has been run or limitations are stated.
- Uncommitted changes have been reviewed.
