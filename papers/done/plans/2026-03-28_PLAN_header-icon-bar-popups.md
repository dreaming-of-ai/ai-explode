# Implementation Plan: Header Icon Bar Popups

## 1. Title

Header Icon Bar Popups - Implementation Plan

## 2. Summary

This plan covers a frontend-only shell increment that adds the top-right header
icon bar described in `papers/screen-layout.md`, wires all three icons into one
shared centered modal pattern, and makes the `Gaming Rules` entry immediately
useful with a concise in-app rules summary derived from
`papers/game-overview.md`. The implementation should build on the existing
header in `frontend/src/App.vue`, reuse the current `ShellModal` overlay and
modal-state flow in `frontend/src/composables/useGameShell.ts`, and avoid any
backend or persistence scope.

## 3. Source Specification

- Feature title: `Header Icon Bar Popups`
- Date: `2026-03-28`
- Status: `In progress`
- Reference:
  `papers/in-progress/2026-03-28_SPEC_header-icon-bar-popups.md`
- Canonical product context: `papers/game-overview.md`
- Layout reference: `papers/screen-layout.md`

## 4. Planning Goals

- Realize the header icon bar slice from the screen-layout reference without
  expanding the scope into full settings or information features.
- Keep popup behavior consistent with the shell’s existing accessibility and
  interaction-blocking model.
- Ensure the short `Gaming Rules` content stays faithful to the canonical game
  overview while remaining fast to scan in-game.
- Keep the design extensible so later increments can add real information and
  settings content without reworking the header-popup contract.
- Make dependencies around modal state, computer-turn pausing, and responsive
  header layout explicit before implementation begins.

## 5. Scope of This Plan

This plan covers:

- frontend shell-state additions needed to represent which header popup is open
- header UI updates for the three-icon bar in the board-first shell
- shared modal wiring for `Gaming Rules`, `Information`, and `Settings`
- player-facing rules-summary content design and placement for the rules popup
- intentionally empty placeholder popup bodies for `Information` and
  `Settings`
- interaction blocking and automation pause behavior while a header popup is
  open
- responsive and accessibility checks for header layout, modal scrolling, and
  dismissal behavior
- frontend validation and regression coverage updates appropriate to the
  current test/tooling setup

## 6. Out of Scope

This plan does not cover:

- backend, API, persistence, or database changes
- actual settings controls, saved preferences, or user-configurable behavior
- real information content such as version metadata, credits, or legal links
  inside the `Information` popup
- changes to the canonical gameplay rules in `papers/game-overview.md`
- a new tutorial, onboarding flow, or dedicated full-screen rules page
- legal-page navigation changes or footer behavior
- mobile-specific redesign beyond keeping the new header behavior compatible
  with the existing shell direction
- new third-party icon or modal dependencies unless implementation discovers a
  strong blocker in the current stack

## 7. Affected Areas

- `papers/in-progress` for the active implementation plan document
- `frontend/src/App.vue` for header composition, icon-bar placement, and popup
  mounting
- `frontend/src/composables/useGameShell.ts` for header-popup state, open/close
  actions, and modal-aware interaction guards
- `frontend/src/types/game.ts` for new popup identifier or modal-state typing
- `frontend/src/components/ShellModal.vue` for reuse confirmation and any
  minimal shell-level adjustments needed for title-only placeholder dialogs
- a new header-specific component under `frontend/src/components` if extracting
  the icon bar or popup body improves clarity
- a new static content module under `frontend/src/data` for rules-summary and
  header-entry metadata if implementation should keep `App.vue` lean
- `frontend/src/composables/useGameShell.spec.ts` and any related frontend tests
  for modal-state, automation-pause, and shell regression coverage
- `LEARNINGS.md` if implementation reveals durable guidance about header chrome,
  modal reuse, or static rules content architecture

## 8. Workstreams

### Workstream 1: Shell state and modal contract

Purpose:
Extend the current shell-state model so header popups behave like first-class
modal overlays without creating a parallel interaction system.

Main responsibilities:

- decide how the active header popup is represented in shell state
- integrate header popups into the existing modal open/close rules
- keep board clicks, shell actions, and computer-turn scheduling blocked while
  a popup is open
- preserve the exact underlying game and shell state on close

Dependencies:

- current modal flow in `frontend/src/composables/useGameShell.ts`
- existing `ShellModal` component behavior

Major risks:

- introducing popup state outside the existing modal flow and missing one of the
  current interaction guards
- allowing computer autoplay to continue because the new popup does not fully
  participate in modal state
- colliding with setup, restart-warning, or move-result dialogs

### Workstream 2: Header icon bar presentation

Purpose:
Add the right-aligned header icon bar to the board-first shell in a way that
matches the current visual direction and remains responsive.

Main responsibilities:

- render exactly three header actions in the required order
- choose a lightweight icon strategy that does not add unnecessary dependency
  overhead
- keep the icon bar visually secondary to gameplay and aligned with the title
  block
- make hover, focus, and tap targets predictable and accessible

Dependencies:

- Workstream 1 modal open/close contract
- current header layout in `frontend/src/App.vue`
- `papers/screen-layout.md`

Major risks:

- cramped or clipped header layout on narrower viewports
- icon choices that are visually ambiguous or inconsistent
- pushing too much styling responsibility into `App.vue` and making the header
  hard to evolve

### Workstream 3: Rules and placeholder popup content

Purpose:
Define the content model for the three popups so the rules dialog is useful now
and the two placeholder dialogs remain intentionally empty but structurally
ready for later increments.

Main responsibilities:

- create the short-form `Gaming Rules` summary from `papers/game-overview.md`
- organize the rules content into scannable headings or bullet groups
- keep `Information` and `Settings` limited to modal chrome and title
- ensure popup content areas can scroll without changing the outer shell

Dependencies:

- `papers/game-overview.md`
- `papers/in-progress/2026-03-28_SPEC_header-icon-bar-popups.md`
- Workstream 1 modal integration

Major risks:

- drifting from the canonical rules by compressing too aggressively
- encoding the rules summary in a way that is awkward to extend or verify later
- placeholder bodies collapsing so far that they feel broken instead of
  intentionally empty

### Workstream 4: Validation and regression safety

Purpose:
Verify that the new header popup flow does not regress gameplay, modal
behavior, or automated turn orchestration.

Main responsibilities:

- expand the existing frontend test coverage where the current tooling supports
  it
- validate modal-state and autoplay pausing through composable-level tests
- run the real frontend validation commands
- perform manual UX checks for header order, modal dismissal, scroll behavior,
  and state preservation

Dependencies:

- Workstreams 1 through 3

Major risks:

- relying only on visual inspection and missing modal-state edge cases
- current tests covering state flow but not the rendered header order and empty
  placeholder presentation

## 9. Phased Execution Plan

### Phase 1: State and content modeling

Objective:
Define the minimum shell-state additions, popup identifiers, and static content
boundaries before wiring new UI.

Key tasks:

- review the existing `ModalState`, `moveResultPopup`, legal-page state, and
  computer-turn watcher
- choose how header popup identity and open state are represented
- decide where static header-entry metadata and rules-summary content should
  live
- confirm that placeholder dialogs need no body copy for this increment

Dependencies:

- source specification
- `papers/game-overview.md`
- `papers/screen-layout.md`

Entry criteria:

- the specification is accepted as the active scope

Exit criteria:

- the implementation has a clear state and content model
- modal-state ownership and content-source decisions are explicit

### Phase 2: Shell-state and modal integration

Objective:
Wire header popup behavior into the centralized shell logic so open/close flows,
interaction blocking, and automation pause all remain consistent.

Key tasks:

- extend shell types and state for header popup selection
- add open/close actions for the three header entries
- ensure only one shell popup can be open at a time
- keep board interaction, footer actions, and computer-turn scheduling aligned
  with the new modal state

Dependencies:

- Phase 1 decisions

Entry criteria:

- popup identity and state ownership are settled

Exit criteria:

- the shell can open and close the required header popups consistently
- gameplay and automation remain paused whenever a header popup is active

### Phase 3: Header UI and popup content surfaces

Objective:
Add the visible icon bar and render the three popup variants with shared modal
chrome.

Key tasks:

- add the header icon bar to the board shell with the required order and labels
- connect each icon to the new shell-state actions
- render the `Gaming Rules` content in a readable, scroll-capable structure
- render `Information` and `Settings` as title-only placeholder popups
- preserve the current header/title hierarchy and overall dark-shell styling

Dependencies:

- Phase 2 shell-state and modal behavior
- current `ShellModal` integration path in `frontend/src/App.vue`

Entry criteria:

- header popup open/close behavior is available from the shell

Exit criteria:

- all three header entries are visible in the board-first shell
- each entry opens the correct popup with the specified dismissal behavior
- placeholder dialogs feel intentional and rules content remains scannable

### Phase 4: Responsive hardening and validation

Objective:
Stabilize the new header flow across shell states and document validation
results for later implementation review.

Key tasks:

- add or update frontend tests for shell-state and autoplay behavior
- run `npm test` in `frontend`
- run `npm run build` in `frontend`
- perform manual checks for idle, active-game, and post-game board-shell states
- capture any durable implementation learning in `LEARNINGS.md` if warranted

Dependencies:

- Phases 2 and 3

Entry criteria:

- header UI and popup wiring are complete

Exit criteria:

- validation results are recorded
- remaining UX limitations or follow-up polish items are explicit

## 10. Task Breakdown

- T1. Confirm the shell-level owner for header popup state.
  Description: Identify whether the new popup identity should live directly in
  `modalState`, beside it, or as a small paired payload in
  `useGameShell.ts`.
  Purpose: Keep modal coordination with setup, restart-warning, and move-result
  flows predictable.
  Dependencies: none.
  Affected area: frontend shell state.
  Notes/Risks: a split ownership model makes it easy for autoplay or inert
  state to miss the new popup.

- T2. Define a dedicated popup identifier contract.
  Description: Add the minimal type-level representation for `Gaming Rules`,
  `Information`, and `Settings`.
  Purpose: Give `App.vue`, the shell composable, and any new header component a
  shared contract.
  Dependencies: T1.
  Affected area: frontend types.
  Notes/Risks: keep the type small and future-safe without over-modeling later
  settings features.

- T3. Decide the static content boundary for header metadata and rules copy.
  Description: Choose whether icon labels, popup titles, and rules-summary
  blocks live inline in the shell or in a dedicated data module.
  Purpose: Keep the implementation readable and make rules-fidelity review
  easier.
  Dependencies: T1, T2.
  Affected area: frontend shell/data layer.
  Notes/Risks: duplicating strings across components will make later popup
  expansion harder.

- T4. Extend `useGameShell.ts` with header popup open/close actions.
  Description: Add the state transitions that open one header popup at a time
  and close it through explicit dismiss actions.
  Purpose: Centralize shell interaction rules in the same place as the existing
  modal flows.
  Dependencies: T2.
  Affected area: frontend shell state.
  Notes/Risks: opening a header popup must not mutate match state or legal-page
  state.

- T5. Fold header popups into the shell’s blocking rules.
  Description: Ensure board moves, header/legal navigation behind the modal, and
  automated computer turns all stop while a header popup is open.
  Purpose: Satisfy the modal interaction-blocking requirements from the spec.
  Dependencies: T4.
  Affected area: frontend shell state / interaction guards.
  Notes/Risks: the current computer-turn watcher already keys off modal state,
  so the final design should reuse that path rather than layering a second pause
  flag.

- T6. Add the visible header icon bar to the board shell.
  Description: Update the header area so the title block remains on the left and
  the three required icon actions appear on the right.
  Purpose: Realize the shell chrome described in `papers/screen-layout.md`.
  Dependencies: T3, T4.
  Affected area: frontend UI.
  Notes/Risks: the header must stay readable on narrower widths and shorter
  heights without crowding the subtitle.

- T7. Choose and implement the icon-rendering strategy.
  Description: Use inline SVGs or another lightweight approach for the book,
  information, and gear glyphs.
  Purpose: Keep the icon bar visually distinct without introducing unnecessary
  dependency overhead.
  Dependencies: T6.
  Affected area: frontend UI.
  Notes/Risks: the chosen approach should remain easy to restyle and accessible
  in focus/hover states.

- T8. Render the shared popup surface for header entries.
  Description: Reuse `ShellModal` with the correct title, close affordance,
  backdrop dismissal, and `Escape` behavior for the three header popups.
  Purpose: Keep popup interaction consistent across the shell.
  Dependencies: T4, T6.
  Affected area: frontend UI / modal integration.
  Notes/Risks: the existing modal shell must remain compatible with both rich
  rules content and title-only placeholder dialogs.

- T9. Create the `Gaming Rules` popup content structure.
  Description: Translate the canonical rules into short sections or bullet
  groups that cover setup, turns, explosions, sweep resolution, elimination, and
  victory.
  Purpose: Give players a trustworthy quick-reference view during play.
  Dependencies: T3, T8.
  Affected area: frontend data/UI content.
  Notes/Risks: the summary must retain diagonal adjacency and sweep-based chain
  reactions rather than simplifying them away.

- T10. Add intentionally empty `Information` and `Settings` placeholders.
  Description: Render the two placeholder popups with only modal chrome and
  title, while keeping the content area structurally stable.
  Purpose: Complete the header interaction model without overcommitting future
  content.
  Dependencies: T8.
  Affected area: frontend UI.
  Notes/Risks: avoid adding “coming soon” copy unless the implementation team
  explicitly decides the blank body feels too broken during QA.

- T11. Validate responsive and shell-state behavior across match states.
  Description: Check idle, active, and post-game board-shell scenarios for
  header visibility, popup interaction, and exact state preservation.
  Purpose: Catch regressions outside the simple active-game happy path.
  Dependencies: T5, T8, T9, T10.
  Affected area: frontend validation.
  Notes/Risks: the concluded-game state and computer-turn state are the easiest
  places for modal assumptions to drift.

- T12. Expand automated coverage and record outcomes.
  Description: Add the most valuable Vitest cases for shell-state transitions,
  autoplay pausing, and popup visibility contract, then run the real validation
  commands.
  Purpose: Leave the feature implementation-ready with regression safety.
  Dependencies: T5 through T11.
  Affected area: frontend tests / validation.
  Notes/Risks: current tooling may favor composable and data tests over rich
  rendered component assertions, so manual checks should fill the remaining UX
  gaps.

## 11. Dependency Map

- T1 must settle popup-state ownership before T2 through T5 can stay coherent.
- T2 provides the shared identifier contract used by T3, T4, and the later UI
  wiring.
- T3 should happen before T6 through T10 so labels, titles, and rules-summary
  structure are not duplicated during integration.
- T4 is the prerequisite for T5 and T8 because the UI should consume centralized
  open/close actions rather than invent its own state.
- T5 depends on T4 and should be completed before validation in T11 and T12 so
  autoplay and interaction-blocking behavior are tested in final form.
- T6 and T7 together deliver the visible icon bar, while T8 depends on the same
  shell-state contract to attach the modal surfaces.
- T9 and T10 both depend on T8 because content should land only after the shared
  popup container is in place.
- T11 and T12 should happen last so manual and automated checks evaluate the
  completed shell flow instead of temporary intermediate behavior.

## 12. Technical Decision Points

### Decision 1: Header popup state modeling

- Decision topic: whether header popups should extend the existing `ModalState`
  union directly or use a paired popup-id payload alongside it
- Why it matters: the current inert state, move guards, and computer-turn pause
  behavior already key off modal state
- High-level options:
  - add one new modal mode for header popups plus a small active-popup id
  - add three dedicated modal modes, one per header popup
  - keep modal mode generic and store the active header popup in a separate
    ref tied to it
- Impact of delaying the decision: implementation can easily drift into partial
  modal participation and break autoplay pausing

### Decision 2: Rules-summary source format

- Decision topic: how to store the short `Gaming Rules` content so it is easy to
  render, review, and extend
- Why it matters: the rules summary must stay faithful to `papers/game-overview.md`
  while remaining readable in a popup
- High-level options:
  - store structured section and bullet data in a dedicated frontend data module
  - keep the short rules copy inline inside a dedicated popup component
  - derive it from a raw markdown source with lightweight parsing
- Impact of delaying the decision: the rules popup may become a hard-to-review
  block of inline template copy

### Decision 3: Header rendering ownership

- Decision topic: whether to keep the icon bar directly in `App.vue` or extract
  it into a focused component
- Why it matters: `App.vue` already coordinates the board shell, legal view, and
  three modal flows
- High-level options:
  - keep the header bar inline in `App.vue`
  - extract a `HeaderIconBar` component and keep popup mounting in `App.vue`
  - extract both the icon bar and popup body components while preserving shell
    state ownership in the composable
- Impact of delaying the decision: the main app shell can become crowded and
  harder to evolve as more header features arrive

### Decision 4: Icon asset strategy

- Decision topic: how to render the three required glyphs without undermining
  the lightweight frontend stack
- Why it matters: the spec requires recognizable, distinct icons but does not
  prescribe an asset source
- High-level options:
  - inline SVG icons local to the frontend
  - a tiny local icon helper component fed by SVG path data
  - a new icon dependency if a strong implementation blocker appears
- Impact of delaying the decision: header implementation may stall on avoidable
  asset-selection work

### Decision 5: Placeholder popup body treatment

- Decision topic: how visually empty the `Information` and `Settings` bodies
  should be while still feeling intentional
- Why it matters: the spec allows title-only placeholders but asks that they not
  feel broken
- High-level options:
  - truly blank modal content beneath the title
  - preserve a minimum content region with only spacing
  - render a neutral structural wrapper with no explanatory copy
- Impact of delaying the decision: QA feedback may reopen the feature if the
  placeholders collapse awkwardly

## 13. Risks and Complexity Drivers

- The current shell has one centralized modal flow and one separate legal-page
  state. A header popup that does not integrate cleanly with both can leave the
  board interactable or let autoplay continue behind the modal.
- `frontend/src/App.vue` currently has a simple title-only header. Adding icon
  chrome introduces new width pressure near the subtitle and could create
  clipping or wrapping regressions on smaller viewports.
- The rules popup must summarize nuanced mechanics such as diagonal adjacency
  and sweep-based chain reactions. Over-compressing the copy would create a
  product/documentation mismatch.
- The current frontend stack does not include a dedicated icon library or
  component-test setup. Asset choice and validation depth therefore need to stay
  pragmatic.
- Placeholder popups are intentionally empty, which is simple functionally but
  visually easy to misread as an unfinished rendering bug.

Mitigation ideas:

- reuse the existing modal-state path so inert state and computer-turn pausing
  come “for free”
- keep static header entry and rules data centralized instead of scattering copy
  across multiple templates
- validate header layout at the same breakpoints already used by the board-first
  shell
- treat rendered placeholder spacing as part of manual UX verification, not as
  an afterthought

## 14. Assumptions

- This increment remains entirely in the frontend layer and needs no backend
  support.
- `papers/game-overview.md` remains the authority for the rules popup wording
  and meaning.
- The existing `ShellModal` component can host the new header popups without a
  new modal framework.
- The current computer-turn watcher in `useGameShell.ts` should continue to be
  the single place where autoplay pauses for non-gameplay overlays.
- Header popups are available only in the board-first shell, not while a legal
  page is the active view.
- No additional explanatory copy is required in `Information` or `Settings`
  unless implementation or QA finds that a title-only body is visually unstable.

## 15. Open Questions / Blockers

- Open question: should header popups be represented as one generic modal mode
  with a popup id, or as explicit per-popup modal variants?
- Open question: is a dedicated `HeaderIconBar` component preferred now, or is
  the header still simple enough to keep inline in `App.vue`?
- Nice-to-clarify point: what final section labels should the `Gaming Rules`
  popup use for the most scannable reading flow?
- Nice-to-clarify point: should title-only placeholder popups reserve a minimum
  vertical content region so they feel more intentional?
- Blockers: none identified from the current specification and codebase review.

## 16. Testing and Validation Plan

- Add composable-level Vitest coverage around:
  - opening each header popup from the board shell
  - enforcing that only one header popup is open at a time
  - preserving the current game state when a popup opens and closes
  - preventing moves while a header popup is open
  - pausing computer-turn progression while a header popup is open
  - keeping popup availability in idle, active, and concluded board-shell states
- Add data-level tests if the rules summary or header metadata is extracted into
  a dedicated frontend data module.
- Run `npm test` in `frontend`.
- Run `npm run build` in `frontend`.
- Perform manual exploratory checks for:
  - correct icon order and placement in the header
  - hover and focus visibility for each icon
  - backdrop click, close-button click, and `Escape` dismissal
  - rules popup readability and internal scrolling
  - title-only placeholder popup presentation
  - unchanged legal-page behavior and unchanged move-result/restart/setup dialog
    behavior

## 17. Rollout / Release Considerations

- No feature flag is expected because this is a contained frontend-shell
  enhancement.
- The safest rollout is to land shell-state wiring, popup content, and
  validation together so autoplay and interaction blocking are never partially
  implemented.
- Backward compatibility is mostly about preserving the current setup,
  restart-warning, move-result, and legal-page flows.
- If implementation reveals that the placeholder popups feel too empty in real
  use, that should be handled as a small follow-up polish slice rather than by
  expanding this feature into real settings or information content.

## 18. Documentation Impact

- The new implementation plan is added under `papers/in-progress`.
- Final implementation should update `LEARNINGS.md` if it uncovers a reusable
  pattern for shell-level header chrome, popup state modeling, or static
  rules-summary content.
- No backend or external API documentation is expected.
- No change is expected for `papers/game-overview.md` because this feature
  surfaces existing rules rather than changing them.

## 19. Suggested Delivery Slices

- Slice 1: Shell state and contracts.
  Includes popup identifiers, modal-state integration, and autoplay-safe
  blocking rules.

- Slice 2: Header UI and popup surfaces.
  Includes icon-bar rendering, icon assets, shared popup mounting, and the three
  popup variants.

- Slice 3: Hardening and validation.
  Includes rules-copy fidelity checks, responsive polish, regression coverage,
  and build/test verification.

## 20. Implementation Readiness Checklist

- [x] Source specification exists in `papers/in-progress`.
- [x] Canonical gameplay context has been reviewed in `papers/game-overview.md`.
- [x] Screen-layout guidance has been reviewed in `papers/screen-layout.md`.
- [x] Frontend ownership boundaries are clear and backend work is out of scope.
- [x] Primary affected modules and likely extension points have been identified.
- [x] Workstreams, phases, and task dependencies are defined.
- [x] Validation commands are known for the affected layer.
