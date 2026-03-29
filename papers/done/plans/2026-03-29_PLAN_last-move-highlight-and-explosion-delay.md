# Implementation Plan: Last-Move Highlight And Configurable Explosion Delay

## 1. Title

Last-Move Highlight And Configurable Explosion Delay - Implementation Plan

## 2. Summary

This plan covers a frontend-only usability increment that adds the last-move
indicator described in `papers/screen-layout.md` and populates the existing
`Settings` popup with one session-scoped `Explosion Delay` control.

The implementation should build on the current frontend architecture in
`frontend/src/composables/useGameShell.ts`, where gameplay rules, move
resolution, turn advancement, computer-turn orchestration, and modal-aware
shell state already live. The key planning challenge is to preserve the
canonical gameplay behavior from `papers/game-overview.md` while introducing
delayed explosion playback as presentation pacing only. That means the plan
must keep deterministic rule resolution, last-move presentation state, and
downstream post-move UI timing clearly separated.

## 3. Source Specification

- Feature title: `Last-Move Highlight And Configurable Explosion Delay`
- Date: `2026-03-29`
- Status: `In progress`
- Reference:
  `papers/in-progress/2026-03-29_SPEC_last-move-highlight-and-explosion-delay.md`
- Canonical product context: `papers/game-overview.md`
- Layout reference: `papers/screen-layout.md`

## 4. Planning Goals

- Add the deliberate last-move indicator without changing gameplay legality or
  explosion rules.
- Introduce configurable explosion playback pacing without changing canonical
  explosion order, stable end state, or winner/erasure logic.
- Keep session-level usability state out of backend scope and avoid inventing
  persistence or API changes that the specification does not require.
- Make the asynchronous move lifecycle explicit before implementation begins,
  especially around turn advancement, result popups, and computer-turn timing.
- Keep the implementation centered in the established frontend shell rather
  than spreading move-resolution behavior across multiple components.
- Define validation strong enough to catch timing regressions, last-move reset
  mistakes, and ordering drift.

## 5. Scope of This Plan

This plan covers:

- frontend-only changes inside `frontend`
- last-move state that tracks the originally played cell, not merely the most
  recently changed cell
- a brief entrance animation plus a persistent highlight ring in the acting
  player's color
- clearing and replacement rules for the indicator across valid moves, invalid
  interactions, concluded games, and fresh matches
- one `Explosion Delay` control in the existing `Settings` popup
- exactly four preset delay levels with centralized millisecond constants
- capturing the effective delay for a move before explosion playback starts
- paced playback of explosion-driven cell updates only
- preserving the current architectural boundary where post-move outcomes happen
  after board resolution is conceptually complete
- automated and manual validation for timing-sensitive frontend behavior

## 6. Out of Scope

This plan does not cover:

- PHP backend, APIs, persistence services, or database changes
- local-storage or cross-reload persistence for the setting
- new settings beyond `Explosion Delay`
- arbitrary/custom delay values outside the four required presets
- replay controls, pause/resume tools, frame stepping, or explosion scrubbers
- sound effects, haptics, or other unrelated presentation changes
- changes to move legality, explosion thresholds, sweep order, ownership
  transfer, elimination rules, or winner rules from `papers/game-overview.md`
- redesigning the existing header/modal shell patterns beyond the minimum
  needed to surface the new setting
- adding new frontend dependencies unless the current stack proves truly
  insufficient during implementation

## 7. Affected Areas

- `papers/in-progress`
  for the active implementation plan document
- `frontend/src/composables/useGameShell.ts`
  for session-scoped delay preset state, last-move state, move-resolution
  sequencing, downstream outcome gating, and computer-turn coordination
- `frontend/src/types/game.ts`
  only if small supporting types improve readability for delay presets,
  last-move presentation state, or resolution metadata without broadening the
  authoritative game-state contract unnecessarily
- `frontend/src/App.vue`
  for passing new board props and wiring the populated `Settings` popup flow
- `frontend/src/components/GameBoard.vue`
  for the last-move entrance animation, persistent highlight ring, and related
  board-cell rendering changes
- `frontend/src/components/HeaderPopupContent.vue`
  for replacing the current empty `Settings` branch with the new control
- `frontend/src/data/headerPopups.ts`
  only if the settings presentation or copy needs a small structured data
  source to stay consistent with the current popup-content pattern
- a small new settings-specific frontend component or data module under
  `frontend/src/components` or `frontend/src/data`
  if implementation needs a cleaner home for the popup control than
  `HeaderPopupContent.vue` alone
- `frontend/src/composables/useGameShell.spec.ts`
  for regression coverage around timing, reset behavior, delayed sequencing,
  and autoplay coordination
- `LEARNINGS.md`
  if implementation reveals durable guidance about asynchronous move playback,
  UI-only game-session state, or board-indicator rendering

## 8. Workstreams

### Workstream 1: Session UI state and delay-setting model

Purpose:
Introduce the non-authoritative session state needed for the last-move
indicator and explosion-delay preference without polluting canonical gameplay
state.

Main responsibilities:

- define where the selected delay preset lives for the current session
- define centralized preset-to-millisecond constants and default selection
- model the current last-move cell and the acting player's visual identity
- define reset and replacement rules for new games, valid moves, invalid
  interactions, and concluded matches
- capture the effective delay value for an in-flight move before playback
  begins

Dependencies:

- source specification
- existing shell-state ownership in `frontend/src/composables/useGameShell.ts`
- current header-popup shell pattern

Major risks:

- storing UI-only presentation state inside authoritative `GameState`
- letting a setting change affect a move already in progress
- forgetting to clear the prior match's indicator on `startGame`

### Workstream 2: Ordered explosion playback and move lifecycle

Purpose:
Add paced explosion playback while preserving deterministic rule execution,
canonical order, and the existing post-move outcome boundary.

Main responsibilities:

- define what counts as one visible explosion-driven cell update
- expose a planning-level shape for ordered playback data that remains faithful
  to sweep order, neighbor order, and repeated sweeps
- preserve the existing single-owner short-circuit behavior that prevents
  endless resolution loops after victory conditions are effectively met
- keep downstream turn advancement, score-derived UI, erasure handling, and
  move-result popup behavior waiting until playback completes
- keep board interactivity and computer-turn scheduling aligned with the new
  resolving-move lifecycle

Dependencies:

- Workstream 1 state modeling
- current `resolveBoardAfterMove`, `playMoveWithOutcome`, and
  `finalizeResolvedMove` flow in `frontend/src/composables/useGameShell.ts`
- `papers/game-overview.md`

Major risks:

- changing canonical explosion order while trying to derive visible steps
- allowing result popups or next-turn scheduling to happen against an
  intermediate board state
- weakening or bypassing the current winner short-circuit and reintroducing
  cyclic resolution behavior

### Workstream 3: Board and settings popup UI integration

Purpose:
Render the board indicator and settings control in a way that matches the
screen-layout intent and remains readable during rapid board changes.

Main responsibilities:

- pass the necessary last-move and pacing state into the board and popup UI
- add the brief entrance animation without causing repeated replays during
  later reactive board updates
- keep the persistent ring distinguishable from ownership fills and load text
- replace the empty `Settings` popup body with one focused control surface
- present the four presets clearly enough that players can compare them at a
  glance

Dependencies:

- Workstream 1 state contract
- Workstream 2 move lifecycle and gating decisions
- `papers/screen-layout.md`

Major risks:

- the highlight ring obscuring the load number or player initials
- the animation re-triggering whenever the board rerenders during chain
  reactions
- coupling the settings control too tightly to placeholder popup code that was
  previously empty

### Workstream 4: Regression coverage and runtime validation

Purpose:
Make the timing-sensitive behavior safe to implement and review by combining
targeted automated coverage with focused manual UX checks.

Main responsibilities:

- expand Vitest coverage around new shell-state transitions and delayed move
  resolution
- verify that invalid interactions do not mutate indicator state
- verify that computer-turn timers wait for delayed playback to finish
- run the actual frontend validation commands
- perform manual checks for board readability, animation behavior, and popup
  clarity

Dependencies:

- Workstreams 1 through 3

Major risks:

- relying only on manual inspection for async sequencing behavior
- relying only on state-level tests and missing the board readability or motion
  regressions that need human judgment

## 9. Phased Execution Plan

### Phase 1: State ownership and resolution-boundary clarification

Objective:
Lock the ownership boundaries for last-move state, delay settings, and
resolving-move state before implementation changes the current synchronous move
flow.

Key tasks:

- review the current `applyMove`, `playMoveWithOutcome`,
  `resolveBoardAfterMove`, and `finalizeResolvedMove` relationship
- decide whether last-move and delay state stay beside `GameState` in the
  shell or partly extend existing shared types
- decide where preset constants and settings labels should live
- confirm how the current empty `Settings` popup path should be populated
- confirm the visual intent from `papers/screen-layout.md` for the entrance
  animation and persistent ring

Dependencies:

- source specification
- `papers/game-overview.md`
- `papers/screen-layout.md`

Entry criteria:

- the specification is accepted as the active scope

Exit criteria:

- state ownership is explicit
- no ambiguity remains around which state is authoritative versus
  presentation-only
- the implementation has a clear destination for delay presets and settings UI

### Phase 2: Ordered playback model and move-lifecycle design

Objective:
Define how one valid move remains in progress until all explosion-driven
updates have been presented in canonical order.

Key tasks:

- choose a planning-level representation for ordered explosion playback
- define how the effective delay is captured per move
- preserve no-leading-delay and no-trailing-delay behavior from the
  specification
- define how result popups, turn advancement, and computer scheduling resume
  only after playback finishes
- account for the current single-owner short-circuit within the playback model

Dependencies:

- Phase 1 decisions

Entry criteria:

- the state-ownership decisions are settled

Exit criteria:

- the move lifecycle is explicit from valid click through final delayed update
- the final-board handoff point is still clear
- the core async sequencing risks are visible before implementation starts

### Phase 3: Settings popup and board presentation integration

Objective:
Wire the new session setting into the shell and feed the resulting presentation
state into board rendering without broadening scope.

Key tasks:

- add the `Explosion Delay` control to the `Settings` popup with the four
  required presets
- pass the selected delay state and last-move presentation state through the
  current app shell
- add the entrance animation trigger and persistent ring to board cells
- preserve the no-indicator-before-first-move and reset-on-new-game behavior
- ensure invalid or blocked interactions remain no-ops for indicator state

Dependencies:

- Phase 1 and Phase 2

Entry criteria:

- the move-lifecycle contract and preset model are clear

Exit criteria:

- the settings and board UI surfaces have a clear integration plan
- no ambiguity remains around indicator anchoring or preset selection flow

### Phase 4: Automated coverage, validation, and review readiness

Objective:
Translate the timing-sensitive rules into regression coverage and leave the
feature ready for later implementation review.

Key tasks:

- add frontend tests for delayed sequencing, reset behavior, and shell gating
- run `npm test` in `frontend`
- run `npm run build` in `frontend`
- perform manual checks for no-explosion, multi-explosion, and concluded-game
  scenarios
- capture any durable findings in `LEARNINGS.md` if warranted

Dependencies:

- Phase 3

Entry criteria:

- the implementation approach for state, playback, and UI is complete

Exit criteria:

- validation expectations are explicit
- any remaining UX caveats or follow-up risks are documented for review

## 10. Task Breakdown

- T1. Confirm shell ownership for presentation-only move state.
  Description: Decide where the selected delay preset, current last-move cell,
  animation trigger, and resolving-move status live relative to `GameState`.
  Purpose: Keep canonical rules separate from session-level presentation state.
  Dependencies: none.
  Affected area: frontend shell state in `frontend/src/composables/useGameShell.ts`.
  Notes/Risks: pushing UI-only state into authoritative game data makes later
  rule work harder to reason about.

- T2. Define the explosion-delay preset contract and constants.
  Description: Establish the four preset identifiers, user-facing labels,
  default selection, and centralized millisecond mapping required by the spec.
  Purpose: Keep settings copy and runtime pacing aligned without duplicated
  literals.
  Dependencies: T1.
  Affected area: `frontend/src/composables/useGameShell.ts`,
  `frontend/src/types/game.ts`, and possibly a small frontend data module.
  Notes/Risks: the implementation must remain session-scoped and avoid
  accidental cross-reload persistence.

- T3. Define the last-move indicator contract and reset behavior.
  Description: Specify what data is stored for the current last move, how the
  acting player's color is retained, and when the indicator is set, replaced,
  preserved, or cleared.
  Purpose: Satisfy the last-move requirements without conflating the indicator
  with generic board changes.
  Dependencies: T1.
  Affected area: `frontend/src/composables/useGameShell.ts`,
  `frontend/src/types/game.ts`, and `frontend/src/components/GameBoard.vue`.
  Notes/Risks: invalid clicks, blocked clicks, and match resets must be true
  no-ops or explicit clears according to the specification.

- T4. Choose the planning-level playback interface for explosion updates.
  Description: Decide how the move-resolution layer exposes ordered
  explosion-driven visible updates while still making the final resolved board
  available for downstream outcome handling.
  Purpose: Make pacing possible without pushing low-level gameplay mechanics
  into UI components.
  Dependencies: T1, T2.
  Affected area: `frontend/src/composables/useGameShell.ts`.
  Notes/Risks: the current resolver returns only a final board, so the new
  shape must stay readable and testable.

- T5. Preserve canonical ordering and the existing winner short-circuit in the
  playback model.
  Description: Define how sweep order, clockwise neighbor order, repeated
  sweeps, and the current single-owner short-circuit are represented in the
  ordered playback flow.
  Purpose: Protect rules fidelity while introducing visible pacing.
  Dependencies: T4.
  Affected area: `frontend/src/composables/useGameShell.ts`.
  Notes/Risks: removing or weakening the short-circuit can reintroduce
  resolution loops after effective victory is already known.

- T6. Introduce an explicit resolving-move lifecycle in the shell.
  Description: Plan the shell state that marks a move as in progress from the
  valid selection through the final delayed update, including capture of the
  effective delay for that move.
  Purpose: Prevent later turns, settings changes, or popups from racing ahead
  of in-flight playback.
  Dependencies: T2, T3, T4, T5.
  Affected area: `frontend/src/composables/useGameShell.ts`.
  Notes/Risks: this lifecycle must work for moves with no explosions as well as
  long multi-sweep reactions.

- T7. Defer downstream outcome handling until playback completion.
  Description: Ensure erasure checks, winner detection, move-result popup
  preparation, turn advancement, and stable-board-driven sidebar updates happen
  only after delayed playback finishes.
  Purpose: Satisfy the move-completion requirements from the specification.
  Dependencies: T5, T6.
  Affected area: `frontend/src/composables/useGameShell.ts`.
  Notes/Risks: if downstream logic sees an intermediate board, the UI may
  announce the wrong next player or show result popups too early.

- T8. Pause board input and computer-turn scheduling during delayed playback.
  Description: Extend the existing interaction guards and autoplay watcher so
  players and computer turns cannot start a new move before the current one has
  fully resolved.
  Purpose: Keep the shell behavior coherent while paced playback is active.
  Dependencies: T6, T7.
  Affected area: `frontend/src/composables/useGameShell.ts` and
  `frontend/src/composables/useGameShell.spec.ts`.
  Notes/Risks: current modal-aware autoplay logic is a strong seam to reuse,
  but delayed resolution introduces a new non-modal pause condition.

- T9. Add the `Explosion Delay` settings control.
  Description: Replace the current empty `Settings` popup body with one focused
  control that exposes `None`, `Low`, `Medium`, and `High` clearly.
  Purpose: Satisfy the settings-popup requirements without broadening scope
  into unrelated preferences.
  Dependencies: T2, T6.
  Affected area: `frontend/src/App.vue`,
  `frontend/src/components/HeaderPopupContent.vue`, and possibly a small new
  settings-specific component or data module.
  Notes/Risks: the control copy and layout should stay readable and intentional
  even though the popup previously had no content.

- T10. Feed last-move presentation state into board rendering.
  Description: Pass the necessary last-move cell identity, player color, and
  animation trigger into the board UI without tying the indicator to generic
  cell updates from explosions.
  Purpose: Keep the indicator anchored to the originally played cell.
  Dependencies: T3, T6.
  Affected area: `frontend/src/App.vue` and `frontend/src/components/GameBoard.vue`.
  Notes/Risks: the board should not need to infer deliberate-move state from
  final board ownership or load changes.

- T11. Implement the board-level animation and persistent ring behavior.
  Description: Plan the rendering treatment for the brief entrance animation,
  ongoing highlight ring, empty-before-first-move state, and clear replacement
  on the next valid move.
  Purpose: Satisfy the last-move visibility and readability requirements.
  Dependencies: T10.
  Affected area: `frontend/src/components/GameBoard.vue`.
  Notes/Risks: the ring must remain legible over owned cells, high loads, and
  later chain-reaction board changes.

- T12. Expand automated coverage for delayed sequencing and state rules.
  Description: Add Vitest coverage for preset selection, invalid-interaction
  no-ops, reset behavior, in-flight delay capture, delayed update ordering,
  downstream gating, and computer-turn pause/resume timing.
  Purpose: Protect the async move lifecycle from silent regressions.
  Dependencies: T7, T8, T9, T10, T11.
  Affected area: `frontend/src/composables/useGameShell.spec.ts` and any small
  supporting data tests if needed.
  Notes/Risks: component-level motion polish will still need manual validation
  even if state-level timing is well covered.

- T13. Run frontend validation and record any durable follow-up notes.
  Description: Execute the real frontend checks and manually verify board
  readability, popup clarity, multi-sweep pacing, concluded-game behavior, and
  computer-turn orchestration.
  Purpose: Leave the implementation ready for review with concrete validation
  evidence.
  Dependencies: T12.
  Affected area: frontend validation and `LEARNINGS.md` if warranted.
  Notes/Risks: any remaining UX caveats should be documented explicitly rather
  than hidden inside later review feedback.

## 11. Dependency Map

- T1 must happen first because the rest of the feature depends on a clear split
  between authoritative gameplay state and presentation-only shell state.
- T2 and T3 both depend on T1 and define the state contracts consumed by later
  playback and UI work.
- T4 depends on T1 and T2 because the playback interface must align with the
  delay-preset model and the shell-state boundary.
- T5 depends on T4 because canonical ordering and short-circuit behavior must
  be expressed inside the chosen playback model.
- T6 depends on T2 through T5 because the shell cannot manage an in-flight move
  until the preset, last-move, and playback contracts are defined.
- T7 and T8 both depend on T6, with T7 focused on downstream outcome timing and
  T8 focused on interaction/autoplay gating during the same move lifecycle.
- T9 depends on T2 and T6 because the UI control must update session state that
  the shell knows how to consume.
- T10 depends on T3 and T6 because the board needs stable last-move data and a
  reliable move-lifecycle trigger.
- T11 depends on T10 because visual treatment should land only after the board
  receives the right presentation contract.
- T12 depends on T7 through T11 so automated coverage reflects the completed
  move lifecycle and UI-state contract rather than temporary intermediate
  behavior.
- T13 depends on T12 so runtime validation and documentation reflect the final
  integrated feature.

## 12. Technical Decision Points

### Decision 1: Ownership of last-move, delay, and resolving-move state

- Decision topic: where the new session-scoped presentation state should live
- Why it matters: the existing `GameState` is the closest thing to
  authoritative gameplay data, while header popups and automation already live
  in shell-only state
- High-level options:
  - keep all new presentation state in `useGameShell.ts` beside `GameState`
  - store last-move state in `GameState` but keep delay and resolving status in
    shell refs
  - introduce a small shared presentation-state type while keeping gameplay
    state separate
- Impact of delaying the decision: implementation can drift into mixed
  ownership that makes later rule changes and testing harder

### Decision 2: Shape of the explosion playback interface

- Decision topic: how ordered explosion-driven visible updates are represented
  between rule resolution and board presentation
- Why it matters: the current resolver exposes only the final board, but the
  new feature needs canonical intermediate steps for pacing
- High-level options:
  - return an ordered list of visible update steps plus the final board
  - expose an iterator/stream-like playback contract consumed by the shell
  - split deterministic resolution from playback preparation in two closely
    related shell helpers
- Impact of delaying the decision: later tasks cannot cleanly define move
  completion timing or test coverage

### Decision 3: How the shell marks a move as still resolving

- Decision topic: how the frontend prevents new turns, popups, or automation
  from outrunning delayed playback
- Why it matters: current move application is synchronous and mostly guarded by
  `modalState`, which is not the same thing as move resolution
- High-level options:
  - add a dedicated resolving-move state beside the existing modal state
  - extend an existing shell-state contract to include move resolution status
  - fold the concept into a broader move-lifecycle abstraction if that keeps
    timing responsibilities clearer
- Impact of delaying the decision: autoplay and board interaction rules are
  likely to regress in subtle ways

### Decision 4: Trigger mechanism for the one-time entrance animation

- Decision topic: how the board knows when to replay the brief last-move
  entrance animation without replaying it on every later board update
- Why it matters: the same highlighted cell may keep changing load during chain
  reactions, and the animation should not restart on those later changes
- High-level options:
  - include a move-scoped animation token/version in presentation state
  - track a transient animation flag that settles into persistent ring state
  - infer animation timing locally in the board from coordinate changes alone
- Impact of delaying the decision: the indicator can become visually noisy or
  fail to animate on replacement

### Decision 5: Settings control presentation

- Decision topic: how the `Explosion Delay` presets should be presented in the
  popup
- Why it matters: the specification requires the four labels and notes that the
  UI may pair labels with millisecond values for clarity
- High-level options:
  - show labels only
  - show labels plus explicit millisecond values
  - use a radio-group style versus a segmented-choice presentation
- Impact of delaying the decision: implementation may churn on copy/layout late
  in the feature even if the underlying state model is already correct

### Decision 6: How the current single-owner short-circuit is reflected in delayed playback

- Decision topic: how to keep the existing anti-loop winner short-circuit while
  still presenting a coherent delayed resolution sequence
- Why it matters: the repo already relies on that behavior to avoid endless
  load-cycling once one player owns every occupied field
- High-level options:
  - preserve the short-circuit exactly and treat that board as the playback
    endpoint
  - preserve the short-circuit but make its effect explicit in tests and review
  - redesign the stop condition only if implementation proves the current
    approach incompatible, which would require careful re-evaluation
- Impact of delaying the decision: delayed playback work could accidentally
  destabilize already-fixed winner behavior

## 13. Risks and Complexity Drivers

- Introducing asynchronous delayed playback into the currently synchronous
  `applyMove` flow is the biggest complexity increase.
  Mitigation: keep one explicit resolving-move lifecycle in the shell and make
  all dependent behaviors consume it.

- Deriving visible intermediate steps risks drifting from canonical sweep order
  or neighbor order.
  Mitigation: keep the playback model anchored to the same deterministic rule
  helpers and lock the order in tests.

- The existing single-owner short-circuit is easy to break while refactoring
  resolution.
  Mitigation: call it out as a first-class decision point and include explicit
  regression coverage.

- Last-move presentation can become visually noisy if the entrance animation
  retriggers during chain reactions.
  Mitigation: treat one-time animation triggering as a separate decision from
  persistent ring rendering.

- The board cell already carries ownership color, initials, and load, so the
  new ring must not reduce readability.
  Mitigation: verify contrast and overlap manually on empty, owned, low-load,
  and high-load cells.

- The current frontend test stack is strong for state and timing but lighter on
  visual motion validation.
  Mitigation: rely on Vitest for sequencing and shell-state guarantees, then
  add focused manual UX checks for animation and popup clarity.

## 14. Assumptions

- The feature remains frontend-only and does not require backend persistence or
  APIs.
- Session-scoped persistence is sufficient; browser-reload persistence is not
  required for this increment.
- The existing `Settings` popup remains the correct host for the new control.
- Board interaction should remain blocked until the current move has fully
  resolved, including any delayed explosion playback.
- No additional explosion animation system is required beyond pacing the
  visible board updates and showing the last-move indicator.
- The current frontend validation commands, `npm test` and `npm run build`, are
  the baseline automated checks for the affected layer.

## 15. Open Questions / Blockers

- Open question: should the `Explosion Delay` control show only the labels
  (`None`, `Low`, `Medium`, `High`) or both the labels and explicit millisecond
  values in the final UI copy?

- Open question: should header popups remain available while delayed explosion
  playback is in progress, or should the shell stay fully interaction-locked
  until the move is complete?

- Nice-to-clarify point: if the settings popup is allowed during delayed
  playback, should it simply preview the future setting change while the
  in-flight move continues with its captured delay value?

- Blocker status: no hard blocker is visible from the current specification and
  codebase context, but the two UI-behavior questions above should be
  acknowledged before implementation to avoid avoidable churn.

## 16. Testing and Validation Plan

- Add Vitest coverage in `frontend/src/composables/useGameShell.spec.ts` for:
  valid-move indicator replacement, invalid-interaction no-ops, new-game reset,
  concluded-game retention, captured per-move delay stability, delayed
  sequencing order, downstream move-completion gating, and computer-turn
  pause/resume behavior.

- Add small supporting tests for settings data or preset mapping if the final
  implementation extracts that information into a dedicated module.

- Run `npm test` in `frontend`.

- Run `npm run build` in `frontend`.

- Perform manual checks for:
  no indicator before the first move, one active indicator at a time, indicator
  anchoring during chain reactions, indicator persistence after a final
  concluded move, new-game reset, settings popup clarity, and relative pacing
  differences between `None`, `Low`, `Medium`, and `High`.

- Perform manual checks for move-lifecycle behavior across:
  no-explosion moves, single-explosion moves, multi-sweep chain reactions,
  computer turns, and move-result popup scenarios.

- Confirm explicitly that `None` matches the current no-deliberate-delay feel
  closely enough that the default setting preserves existing baseline speed.

## 17. Rollout / Release Considerations

- No backend rollout, migration, or contract coordination is required.
- A feature flag is likely unnecessary because the change is frontend-local,
  but the implementation should stay well-contained so rollback is easy if
  delayed playback reveals unexpected UX regressions.
- Because the feature changes move timing, it should be treated as one cohesive
  increment during review rather than landing partial timing changes without
  their regression coverage.
- If implementation produces meaningful UX evidence, capture screenshots for
  `papers/done/screenshots` when the feature is completed.

## 18. Documentation Impact

- Move the completed specification to `papers/done/specs` when implementation is
  finished.
- Move this plan to `papers/done/plans` when implementation is finished.
- Add screenshots of the finished feature under `papers/done/screenshots` after
  implementation and verification.
- `papers/game-overview.md` should not change because the feature does not alter
  gameplay rules.
- `papers/screen-layout.md` should not need changes unless implementation
  uncovers a durable mismatch between the documented last-move intent and the
  accepted final UI.

## 19. Suggested Delivery Slices

- Slice 1: State and contract foundation.
  Includes T1 through T3 and the associated decisions around preset constants,
  last-move state, and state ownership.

- Slice 2: Ordered playback and move-completion lifecycle.
  Includes T4 through T8 and establishes the deterministic sequencing and shell
  gating needed for delayed playback.

- Slice 3: UI integration and hardening.
  Includes T9 through T13 and delivers the populated settings popup, board
  indicator behavior, automated coverage, and runtime validation.

## 20. Implementation Readiness Checklist

- [ ] The source specification is accepted as the active scope.
- [ ] State ownership for delay, last-move, and resolving-move data is chosen.
- [ ] The playback interface between rule resolution and UI pacing is chosen.
- [ ] The short-circuit/winner behavior is confirmed for the delayed path.
- [ ] The settings control presentation choice is recorded or consciously
      assumed.
- [ ] The task breakdown and dependency order have been reviewed.
- [ ] The frontend validation plan (`npm test`, `npm run build`, manual checks)
      is accepted.
- [ ] No hidden backend or persistence dependency has been introduced.

## 21. Definition of Done for Planning

This implementation plan is complete when:

- it references the active specification and canonical product documents
- the frontend-only scope is explicit
- affected areas, workstreams, phases, and tasks are concrete enough to guide
  implementation
- sequencing constraints and decision points are visible
- risks, assumptions, and open questions are documented rather than hidden
- validation expectations are defined
- the plan can be used directly as the handoff into implementation work
