# Implementation Plan: Mobile Shell Support for Board Visibility and Primary Actions

## 1. Title

Mobile Shell Support for Board Visibility and Primary Actions - Implementation Plan

## 2. Summary

This plan covers the frontend-only refinement needed to make the existing
board-first shell work reliably on supported phone viewports in both portrait
and landscape orientation. The implementation must keep the full 8x8 board
visible, keep the primary `New Game` action visible and tappable, prevent the
board from collapsing into an impractically small surface on short landscape
screens, and preserve current game and modal state across viewport changes.

The work builds on the existing responsive shell in `frontend/src/App.vue`,
the shared viewport sizing in `frontend/src/styles.css`, the board sizing in
`frontend/src/components/GameBoard.vue`, the sidebar/action composition in
`frontend/src/components/PlayerSidebar.vue`, the shared modal container in
`frontend/src/components/ShellModal.vue`, and shell-level state in
`frontend/src/composables/useGameShell.ts`. It aligns with the board-first
product direction from `papers/game-overview.md` while intentionally
superseding the older non-priority portrait-phone guidance in
`papers/screen-layout.md`.

## 3. Source Specification

- Feature title: `Mobile Shell Support for Board Visibility and Primary Actions`
- Date: `2026-03-30`
- Status: `In progress`
- Reference: `papers/in-progress/2026-03-30_SPEC_mobile-shell-support.md`

## 4. Planning Goals

- Define a realistic execution path for bringing the current shell down to the
  supported mobile viewport floor of `360x640` portrait and `640x360`
  landscape.
- Make the mobile priority order explicit: board first, primary action second,
  active-turn context third, and secondary information last.
- Separate layout, compact secondary-content behavior, modal fit, and
  validation so the implementation can be reviewed incrementally.
- Surface the key product decisions left open by the specification without
  inventing hidden requirements.
- Prepare a validation matrix that proves mobile support through measurable
  viewport and touch-target checks rather than visual intuition alone.

## 5. Scope of This Plan

This plan covers:

- frontend-only changes within `frontend`
- mobile-aware shell layout and viewport budgeting
- mobile placement of the primary `New Game` action
- compact or collapsible mobile presentation of scoreboard and overview content
- orientation-change and dynamic-viewport reflow behavior
- safe-area-aware spacing for shell chrome and overlays
- modal fit refinements for setup, restart warning, move result, and header
  popups on supported mobile viewports
- automated and manual validation needed to ship the refinement safely

## 6. Out of Scope

This plan does not cover:

- PHP backend or API changes
- gameplay rule changes or board-size changes
- a separate mobile-only gameplay flow
- player setup redesign beyond viewport fit and responsive presentation
- new gameplay features unrelated to shell responsiveness
- broad desktop or tablet restyling beyond what is needed to keep one coherent
  responsive shell
- manual updates to `papers/screen-layout.md`, which remains a canonical
  manually maintained reference outside agent-authored implementation work

## 7. Affected Areas

- top-level shell composition in `frontend/src/App.vue`
- global viewport and shell spacing rules in `frontend/src/styles.css`
- board sizing and internal spacing in `frontend/src/components/GameBoard.vue`
- sidebar, scoreboard, and `New Game` presentation in
  `frontend/src/components/PlayerSidebar.vue`
- footer spacing and safe-area treatment in
  `frontend/src/components/LegalFooter.vue`
- shared modal sizing and internal scrolling behavior in
  `frontend/src/components/ShellModal.vue`
- modal content density in `frontend/src/components/PlayerSetup.vue`
- modal content density in `frontend/src/components/RestartWarningDialog.vue`
- modal content density in `frontend/src/components/MoveResultDialog.vue`
- header popup content fit in `frontend/src/components/HeaderPopupContent.vue`
- mobile-only presentation state or derived layout helpers in
  `frontend/src/composables/useGameShell.ts`
- shared UI state types in `frontend/src/types/game.ts` if additional shell UI
  state is required
- frontend automated tests, primarily
  `frontend/src/composables/useGameShell.spec.ts`
- follow-up manual documentation alignment notes for the now-outdated mobile
  guidance in `papers/screen-layout.md`

## 8. Workstreams

### Workstream 1: Mobile shell layout and board sizing

Purpose:
Rebalance the shell so the board stays fully visible and visually dominant on
supported phone viewports without relying on document scrolling.

Main responsibilities:

- define mobile viewport budgeting for header, main shell, and footer
- introduce height-aware board sizing rules that preserve the `32x32` minimum
  cell size requirement
- compact shell chrome before the board gives up critical space
- preserve desktop and tablet behavior while adding mobile-specific rules

Dependencies:

- agreement on the mobile action placement and compact secondary-content pattern
- supported viewport sign-off matrix

Major risks:

- short landscape viewports may not leave enough space if chrome compaction is
  too conservative
- a width-only breakpoint strategy can still fail on small-height devices

### Workstream 2: Primary action and secondary-content mobile behavior

Purpose:
Keep the `New Game` action discoverable and reachable while allowing scoreboard
and overview content to stay available without consuming permanent desktop-side
rail space on phones.

Main responsibilities:

- choose and implement a mobile-primary action region
- convert secondary sidebar content into a compact mobile pattern
- preserve active-turn context while letting lower-priority content condense
- maintain keyboard and screen-reader access for compact mobile controls

Dependencies:

- shell layout foundation from Workstream 1
- product choice for the compact mobile information pattern

Major risks:

- placing the action inside the wrong region can recreate the current
  off-screen problem once the layout stacks
- mobile compact behavior can leak into gameplay state if UI-only state is
  modeled in the wrong place

### Workstream 3: Orientation, viewport, and safe-area resilience

Purpose:
Keep the shell stable as the effective viewport changes because of device
rotation, browser chrome changes, and safe-area constraints.

Main responsibilities:

- define orientation reflow behavior for idle, active, and concluded matches
- keep modal and game state intact across viewport changes
- decide where reactive viewport state is actually needed versus where CSS
  alone is sufficient
- apply safe-area spacing to mobile shell chrome and overlays

Dependencies:

- mobile layout strategy from Workstreams 1 and 2

Major risks:

- unnecessary JavaScript viewport state can make the shell more fragile than a
  CSS-first approach
- incomplete safe-area handling can leave footer links or actions partially
  clipped on some devices

### Workstream 4: Mobile modal fit and overlay hardening

Purpose:
Ensure the existing modal system remains usable on supported mobile viewports,
especially on short landscape screens where action reachability is most at
risk.

Main responsibilities:

- tighten modal outer sizing and padding on small viewports
- preserve internal scrolling so modal actions remain reachable
- compact high-content modal sections without changing core workflows
- verify header popups stay usable under the same mobile constraints

Dependencies:

- viewport budgeting and safe-area strategy from Workstreams 1 and 3

Major risks:

- modal chrome plus dense content can crowd out primary buttons on landscape
  phones
- inconsistent mobile fixes across dialog bodies can create uneven usability

### Workstream 5: Validation, regression control, and release readiness

Purpose:
Demonstrate that the mobile shell refinement works on the target viewport
matrix without regressing the existing desktop/tablet shell.

Main responsibilities:

- define automated coverage for any added mobile presentation state
- define manual viewport, rotation, safe-area, and modal checks
- confirm touch-target and board-cell minimums at the supported floor sizes
- document any manual follow-up needed because `papers/screen-layout.md` is a
  separately maintained reference

Dependencies:

- completion of the preceding workstreams

Major risks:

- layout regressions can hide on desktop-only verification
- mobile fit can look correct on one browser but fail when browser chrome
  expands or collapses

## 9. Phased Execution Plan

### Phase 1: Clarification and mobile UX framing

Objective:
Resolve the remaining implementation-shaping choices before layout work begins.

Key tasks:

- choose the mobile compact pattern for scoreboard and overview content
- choose the mobile placement strategy for the primary `New Game` action
- define the mobile viewport matrix used for sign-off
- document whether any mobile disclosure state should be shell-local or live in
  the composable

Dependencies:

- source specification
- current shell behavior

Entry criteria:

- the source specification is accepted as the planning baseline

Exit criteria:

- the key mobile interaction choices and viewport targets are documented

### Phase 2: Shell layout foundation and board-space budgeting

Objective:
Refactor the shell structure and spacing rules so the board has a reliable
mobile footprint in portrait and landscape.

Key tasks:

- rework top-level shell spacing, stacking, and CSS variables for phone sizes
- define board size limits that satisfy the `32x32` minimum cell-size floor
- compact header and footer chrome where necessary on smaller viewports
- keep the full 8x8 board inside the viewport without document scrolling

Dependencies:

- Phase 1 decisions

Entry criteria:

- mobile action and secondary-content strategy are decided

Exit criteria:

- the shell can render a mobile layout where board visibility is structurally
  achievable

### Phase 3: Mobile action and compact information behavior

Objective:
Move `New Game` and secondary information into a mobile presentation that
protects board usability while keeping supporting context available.

Key tasks:

- place the primary action in a mobile-safe region
- replace the permanently visible desktop-style mobile sidebar with a compact
  pattern
- preserve current-turn context under constrained space
- keep desktop and tablet sidebar behavior coherent with the new mobile logic

Dependencies:

- Phase 2 shell layout foundation

Entry criteria:

- mobile shell structure and viewport budgeting are in place

Exit criteria:

- the `New Game` action is continuously reachable and lower-priority content no
  longer forces the board off-screen on supported mobile viewports

### Phase 4: Orientation, safe-area, and modal hardening

Objective:
Stabilize the shell against rotate events, dynamic viewport changes, and
mobile modal pressure.

Key tasks:

- ensure orientation changes preserve live game and modal state
- apply safe-area-aware spacing to shell edges and overlay padding
- tighten modal dimensions and internal scrolling for short landscape screens
- verify header popups and other existing modal flows remain reachable

Dependencies:

- Phases 2 and 3

Entry criteria:

- the main mobile shell behavior is functional

Exit criteria:

- the supported rotate and modal-fit acceptance criteria can be demonstrated

### Phase 5: Validation, regression checks, and delivery preparation

Objective:
Prove the feature against the specification and prepare it for implementation
review and later release.

Key tasks:

- add or update automated tests for any mobile-only shell behavior placed in
  the composable
- run targeted type-check, lint, build, and manual viewport checks
- verify touch-target and cell-size minimums at the supported viewport floors
- record any manual documentation follow-up needed for the legacy
  `papers/screen-layout.md` guidance

Dependencies:

- Phases 2 through 4

Entry criteria:

- mobile shell, orientation, and modal behavior are implemented

Exit criteria:

- validation evidence exists for the supported mobile viewport matrix and no
  major desktop/tablet regressions remain open

## 10. Task Breakdown

### T1. Define the mobile shell interaction model

Description:
Decide the compact secondary-content pattern and the mobile placement of the
primary `New Game` action before implementation starts.

Purpose:
Resolve the two open specification questions that directly shape the shell
composition.

Dependencies:

- source specification

Affected area:

- shell interaction model
- `frontend/src/App.vue`
- `frontend/src/components/PlayerSidebar.vue`

Notes or risks:

- Delaying these choices will cause layout work to be redone once the compact
  pattern is finalized.

### T1.1. Define the supported viewport sign-off matrix

Description:
Turn the specification floors into a small explicit matrix of portrait and
landscape checks used during implementation and validation.

Purpose:
Keep mobile acceptance objective and repeatable.

Dependencies:

- T1

Affected area:

- validation planning

Notes or risks:

- The matrix should include both fresh-load and rotated states.

### T1.2. Choose the compact mobile information pattern

Description:
Select the pattern that keeps scoreboard and overview content available on
phones without leaving the full desktop sidebar permanently open.

Purpose:
Deliver FR-5 and FR-9 without inventing a second gameplay flow.

Dependencies:

- T1

Affected area:

- `frontend/src/components/PlayerSidebar.vue`
- possible shell UI state

Notes or risks:

- The chosen pattern must stay keyboard-accessible and screen-reader
  understandable.

### T2. Refactor the shell for mobile-aware layout modes

Description:
Rework the top-level shell structure and responsive CSS variables so phone
portrait and landscape layouts can be expressed explicitly.

Purpose:
Deliver FR-1 through FR-4, FR-6, and FR-7.

Dependencies:

- T1

Affected area:

- `frontend/src/App.vue`
- `frontend/src/styles.css`

Notes or risks:

- Mobile behavior should extend the current shell rather than fork it into a
  separate layout flow.

### T2.1. Introduce height-aware board sizing rules

Description:
Define the board-size calculations and shell compaction rules needed to keep
the full 8x8 board visible while preserving the `32x32` minimum cell size.

Purpose:
Protect board usability on short landscape screens.

Dependencies:

- T2

Affected area:

- `frontend/src/App.vue`
- `frontend/src/components/GameBoard.vue`
- `frontend/src/styles.css`

Notes or risks:

- The board-size floor may force more aggressive compaction of surrounding
  chrome than the current layout uses.

### T2.2. Compact header and footer chrome on phones

Description:
Reduce mobile shell overhead in the header and footer so they support the board
instead of competing with it for vertical space.

Purpose:
Preserve the board-first product direction from `papers/game-overview.md`.

Dependencies:

- T2

Affected area:

- `frontend/src/App.vue`
- `frontend/src/components/LegalFooter.vue`
- `frontend/src/styles.css`

Notes or risks:

- Footer and header compaction must not make legal navigation or header actions
  harder to reach.

### T3. Rework `New Game` and secondary-content behavior for mobile

Description:
Separate the primary action from the desktop sidebar assumptions and introduce
the selected compact mobile information pattern.

Purpose:
Deliver FR-3, FR-5, FR-8, and FR-9 while keeping the board and action visible
at all times.

Dependencies:

- T1.2
- T2

Affected area:

- `frontend/src/App.vue`
- `frontend/src/components/PlayerSidebar.vue`

Notes or risks:

- If the mobile action remains coupled to the stacked sidebar, the current
  off-screen reachability issue will persist.

### T3.1. Introduce any required mobile-only presentation state

Description:
Add the minimal UI-only state needed for compact mobile disclosure behavior,
expanded sections, or orientation-sensitive presentation defaults.

Purpose:
Keep mobile interaction coherent without polluting authoritative game state.

Dependencies:

- T3

Affected area:

- `frontend/src/composables/useGameShell.ts`
- `frontend/src/types/game.ts`

Notes or risks:

- Any new state should remain shell-level UI state, not part of `GameState`.

### T3.2. Preserve desktop and tablet sidebar behavior

Description:
Keep the current richer right-rail presentation available on non-phone
viewports while aligning it with the new mobile structure.

Purpose:
Avoid regressions outside the target feature slice.

Dependencies:

- T3

Affected area:

- `frontend/src/components/PlayerSidebar.vue`
- `frontend/src/App.vue`

Notes or risks:

- The implementation should avoid duplicating the same status content in two
  competing regions.

### T4. Harden orientation and dynamic viewport behavior

Description:
Ensure the shell reflows cleanly when the device rotates or when browser chrome
changes the effective viewport height.

Purpose:
Deliver FR-8, FR-11, FR-12, and NFR-3.

Dependencies:

- T2
- T3

Affected area:

- `frontend/src/App.vue`
- `frontend/src/styles.css`
- `frontend/src/composables/useGameShell.ts`

Notes or risks:

- A CSS-first solution is preferable, with JavaScript viewport state added only
  where behavior cannot be expressed reliably in layout alone.

### T4.1. Apply safe-area-aware spacing

Description:
Integrate safe-area insets into the mobile shell and overlay spacing so actions
and footer content remain reachable near device edges.

Purpose:
Prevent clipping around notches, rounded corners, and home indicators.

Dependencies:

- T4

Affected area:

- `frontend/src/styles.css`
- `frontend/src/App.vue`
- `frontend/src/components/LegalFooter.vue`
- `frontend/src/components/ShellModal.vue`

Notes or risks:

- Applying safe-area compensation inconsistently can shift elements without
  actually solving clipping at the edges.

### T5. Tighten shared modal fit for supported mobile viewports

Description:
Refine the shared modal container and existing dialog bodies so actions remain
reachable even on short landscape phone screens.

Purpose:
Deliver FR-10 and support the state-preserving rotation flow from FR-8.

Dependencies:

- T2
- T4

Affected area:

- `frontend/src/components/ShellModal.vue`
- `frontend/src/components/PlayerSetup.vue`
- `frontend/src/components/RestartWarningDialog.vue`
- `frontend/src/components/MoveResultDialog.vue`
- `frontend/src/components/HeaderPopupContent.vue`

Notes or risks:

- Modal internals should scroll before primary actions become unreachable.

### T5.1. Preserve modal state through rotate and resize events

Description:
Confirm that mobile modal refinements do not dismiss open dialogs or reset
their surrounding match state during orientation changes.

Purpose:
Protect FR-8 and FR-12.

Dependencies:

- T4
- T5

Affected area:

- shell modal orchestration
- `frontend/src/composables/useGameShell.ts`

Notes or risks:

- Any responsive remounting strategy that swaps component trees can violate the
  state-preservation requirement.

### T6. Expand validation coverage for mobile shell behavior

Description:
Add or update automated checks for any new shell-state logic and define the
manual responsive test pass needed for layout and touch-target verification.

Purpose:
Reduce regression risk in a layout-heavy frontend refinement.

Dependencies:

- T2 through T5

Affected area:

- `frontend/src/composables/useGameShell.spec.ts`
- manual browser validation workflow

Notes or risks:

- Responsive layout success cannot be proven by unit tests alone.

## 11. Dependency Map

- The mobile interaction model must be chosen before the shell is deeply
  refactored, because action placement and compact content behavior shape the
  layout structure.
- Mobile-aware shell layout must exist before secondary content is compacted,
  otherwise the compact pattern will be tuned against the wrong viewport
  budget.
- Height-aware board sizing and chrome compaction must be solved before modal
  hardening is finalized, because the remaining viewport height directly
  affects overlay fit.
- Any new mobile disclosure state should be defined before automated test work
  begins so coverage targets reflect the actual shell behavior.
- Safe-area handling should be applied before final sign-off, because it can
  shift both action placement and modal padding on real devices.
- Validation should follow implementation, but the viewport matrix and minimum
  target sizes should be agreed early so implementation does not optimize only
  for desktop inspection.

## 12. Technical Decision Points

### Decision 1: Mobile primary-action placement

Why it matters:
The current `New Game` button lives inside the sidebar, which is precisely the
structure that becomes unreliable once the shell stacks on phones.

Options at a high level:

- move `New Game` into a dedicated mobile action bar within the shell chrome
- keep the action near the compact secondary-content region but outside the
  permanently stacked sidebar flow
- duplicate the action between desktop sidebar and mobile-specific placement
  while preserving one underlying event path

Impact of delaying the decision:
The main shell composition and responsive spacing cannot be settled cleanly
until the action has a stable mobile home.

### Decision 2: Compact mobile information pattern

Why it matters:
The specification intentionally allows multiple patterns as long as secondary
content stays available without displacing the board or action.

Options at a high level:

- collapsible inline section below or beside the primary action region
- compact disclosure panel or drawer that expands on demand
- segmented or tabbed presentation that swaps between active-turn and score
  views

Impact of delaying the decision:
`PlayerSidebar.vue` and any mobile-only shell state cannot be decomposed
cleanly until the compact pattern is chosen.

### Decision 3: CSS-first versus reactive viewport-state handling

Why it matters:
Orientation and browser-chrome changes can often be handled with CSS viewport
units and responsive variables, but some disclosure defaults or mode labels may
still tempt a JavaScript-driven approach.

Options at a high level:

- CSS-first layout with minimal or no reactive viewport state
- hybrid approach where CSS handles sizing and composable state handles only
  disclosure defaults
- broader reactive viewport mode stored in the shell composable

Impact of delaying the decision:
Unclear ownership between CSS and composable logic increases the chance of
fragile resize behavior and unnecessary state complexity.

### Decision 4: Safe-area integration strategy

Why it matters:
The spec requires actions, footer content, and modal controls to remain
reachable near device edges.

Options at a high level:

- integrate safe-area spacing centrally in global shell variables
- patch individual shell regions and overlays locally where needed
- combine global shell padding with targeted component overrides for modals

Impact of delaying the decision:
Late safe-area fixes often create inconsistent spacing between the shell and
the overlay system.

## 13. Risks and Complexity Drivers

- The `640x360` landscape floor leaves very little vertical room once header,
  footer, modal padding, and action regions are included.
- The current stacked-sidebar fallback already demonstrates that width-only
  responsive behavior is insufficient for phones.
- Mobile improvements must not reintroduce document scrolling as the primary
  way to reach the board or `New Game`.
- Compact secondary-content behavior adds UI complexity and can become
  inaccessible if disclosure controls are not clearly labeled and keyboard-safe.
- Safe-area and dynamic viewport behavior can vary across browsers even when
  CSS appears correct on desktop emulation alone.
- Modal bodies with variable content, especially four-player setup and warning
  summaries, are vulnerable to clipped actions on short screens.
- Desktop and tablet behavior must remain coherent so the feature does not
  solve phones by regressing the existing shell.

Mitigation ideas at planning level:

- treat height constraints as first-class from the start
- prefer CSS-first layout changes before adding reactive viewport state
- centralize any new mobile-only UI state outside `GameState`
- validate against an explicit viewport matrix that includes rotation and open
  modal scenarios

## 14. Assumptions

- This feature remains frontend-only.
- The default board stays 8x8.
- The current board, sidebar, and modal components remain the base structure
  rather than being replaced wholesale.
- Internal scrolling inside compact secondary-content regions or modal bodies
  is acceptable, but document-level scrolling is not the main solution for
  board or action reachability.
- If mobile-only presentation state is required, it belongs in shell UI state,
  not in authoritative gameplay state.
- Existing frontend validation tooling can cover composable logic, while final
  layout acceptance still requires manual browser verification.

## 15. Open Questions / Blockers

- Open question: Which compact mobile pattern should be used for scoreboard and
  overview content?
- Open question: Where should the mobile `New Game` action live so it remains
  visible without competing with the board?
- Nice to clarify: Should compact mobile content default to collapsed in both
  portrait and landscape, or vary by available height?
- Nice to clarify: Should the mobile shell expose a persistent active-turn
  summary outside the compact score region, or should that context live inside
  the compact pattern itself?
- No hard blocker is visible for planning. These choices affect UX polish and
  implementation shape, but the plan can proceed with them called out
  explicitly.

## 16. Testing and Validation Plan

- Add or update focused automated tests for any new shell-level mobile
  presentation state in `frontend/src/composables/useGameShell.spec.ts`.
- Run frontend type-checking, linting, and production build validation after
  implementation.
- Manually verify the shell at the supported viewport floors of `360x640`
  portrait and `640x360` landscape, plus at least one rotate transition
  between them.
- Manually verify that the full board remains visible and that each cell stays
  at or above `32x32` CSS pixels on the supported floor sizes.
- Manually verify that the primary `New Game` action remains visible, tappable,
  and at or above a `44x44` CSS-pixel touch target on supported mobile
  viewports.
- Manually verify setup, restart warning, move result, and header popup modals
  on supported mobile sizes, including an open-modal rotate scenario.
- Manually verify safe-area-sensitive edges and browser-chrome changes where
  possible, especially footer reachability and bottom-edge action placement.
- Run a desktop/tablet regression pass to confirm the feature did not damage
  the existing larger-screen shell.

## 17. Rollout / Release Considerations

- No backend migration, API rollout, or feature flag is expected for this work.
- Release confidence should depend on the viewport matrix and modal-fit checks,
  not only on desktop screenshots.
- Because `papers/screen-layout.md` is a manually maintained canonical
  reference, implementation completion should include a note that its mobile
  priority guidance has been superseded by the accepted feature spec, even if
  the document itself is not updated in agent-authored work.
- If the first mobile pass meets the board/action requirements but leaves the
  compact information pattern visually rough, that polish can be treated as a
  follow-up only if it does not compromise accessibility or reachability.

## 18. Documentation Impact

- The active implementation pair for this feature lives in `papers/in-progress`
  until execution is complete.
- Manual maintainers should eventually reconcile the mobile guidance in
  `papers/screen-layout.md` with the implemented behavior.
- If the final implementation introduces a named mobile disclosure pattern or a
  specific action-region convention, that convention should be reflected in
  future shell-facing documentation and screenshots.
- Updated screenshots for the completed feature should be captured under
  `papers/done/screenshots` after implementation.

## 19. Suggested Delivery Slices

- Slice 1: Mobile shell foundation.
  Covers mobile-aware shell structure, board-size budgeting, and guaranteed
  visibility of the primary `New Game` action at supported floor sizes.
- Slice 2: Compact mobile information behavior.
  Covers the chosen mobile pattern for scoreboard and overview content plus any
  required shell UI state.
- Slice 3: Orientation, safe-area, and modal hardening.
  Covers rotate resilience, dynamic viewport behavior, modal fit, and final
  manual validation.

## 20. Implementation Readiness Checklist

- The source specification is accepted.
- The mobile primary-action placement is chosen.
- The compact mobile information pattern is chosen.
- The supported viewport sign-off matrix is documented.
- Affected frontend areas and ownership boundaries are clear.
- Any needed shell UI state is distinguished from authoritative game state.
- Validation expectations include automated checks and manual mobile viewport
  checks.
- Manual follow-up for the outdated `papers/screen-layout.md` guidance is
  understood.

## 21. Definition of Done for Planning

This implementation plan is complete when:

- the mobile shell workstreams are identified
- execution phases are sequenced clearly
- the task breakdown is concrete enough to hand off for implementation
- dependencies and decision points are visible
- risks and assumptions are documented
- validation and rollout expectations are outlined
- open questions are explicit without blocking the planning artifact itself
