# Implementation Plan: Post-Move Player Erasure, Winner Detection, and Result Popup

## 1. Title

Post-Move Player Erasure, Winner Detection, and Result Popup - Implementation
Plan

## 2. Summary

This plan covers a frontend-only gameplay increment that evaluates end-of-move
outcomes after a move has fully resolved, marks newly erased players, detects a
winner, shows one combined result popup, and locks the board after victory. The
implementation should build on the current centralized match state in
`frontend/src/composables/useGameShell.ts`, reuse the existing modal shell
pattern in `frontend/src/App.vue` and `frontend/src/components/ShellModal.vue`,
and keep post-move outcome evaluation separate from move-resolution mechanics so
later explosion work can evolve without duplicating elimination or win logic.

## 3. Source Specification

- Feature title: `Post-Move Player Erasure, Winner Detection, and Result Popup`
- Date: `2026-03-28`
- Status: `In progress`
- Reference:
  `papers/in-progress/2026-03-28_SPEC_post-move-erasure-and-win-popup.md`
- Canonical product context: `papers/game-overview.md`

## 4. Planning Goals

- Add a clear post-move outcome stage after move resolution completes.
- Preserve the current frontend-only architecture and avoid backend scope.
- Keep elimination, winner detection, popup messaging, and move locking aligned
  from one shared match-state source of truth.
- Make turn-rotation changes explicit so erased players are skipped cleanly.
- Keep the work decomposed enough that implementation and regression testing can
  proceed without rediscovering hidden dependencies.

## 5. Scope of This Plan

This plan covers:

- frontend state-model changes needed to represent erased players, winner state,
  concluded-match state, and transient move-result popup content
- post-move evaluation logic that runs after the board is fully resolved for the
  current move
- turn-rotation updates so erased players are skipped when the match continues
- UI integration for a single blocking popup that combines erasure and winner
  messages for one move
- board-interaction guards while the popup is open and after a winner exists
- scoreboard/sidebar updates needed to reflect erased and concluded state
- frontend test updates and validation for the new end-of-move flow
- documentation and learnings updates if implementation reveals durable project
  guidance

## 6. Out of Scope

This plan does not cover:

- backend, persistence, or API changes
- reworking explosion rules beyond attaching the new outcome check to the
  existing move-resolution completion boundary
- new celebration effects, sounds, match history, or post-game statistics
- a custom restart flow inside the result popup
- multiplayer/network synchronization
- broad UI redesign outside the minimum shell/sidebar/popup updates needed for
  this feature

## 7. Affected Areas

- `papers/in-progress` for the active plan document
- `frontend/src/types/game.ts` for match-state and UI-state type extensions
- `frontend/src/composables/useGameShell.ts` for post-move evaluation, turn
  rotation, popup state, and move guards
- `frontend/src/composables/useGameShell.spec.ts` for gameplay and shell-flow
  regression coverage
- `frontend/src/App.vue` for wiring the new result popup into the shell
- `frontend/src/components/PlayerSidebar.vue` for erased/winner/concluded-state
  presentation if needed
- `frontend/src/components/ShellModal.vue` plus a dedicated popup-content
  component under `frontend/src/components` if the result dialog gets its own
  surface
- `LEARNINGS.md` if implementation exposes reusable architecture guidance

## 8. Workstreams

### Workstream 1: Match-state and post-move evaluation

Purpose:
Introduce the state and helper flow needed to inspect the final board after a
move resolves, determine newly erased players, and detect a winner.

Main responsibilities:

- extend the match-state model with erased-player and concluded-match concepts
- define how one-move popup payloads are represented
- add a dedicated post-move evaluation step after move resolution completes
- keep ownership counting and end-of-move outcome derivation based on final
  board state

Dependencies:

- `papers/game-overview.md`
- the active feature specification
- current gameplay loop in `frontend/src/composables/useGameShell.ts`

Major risks:

- placing outcome checks before move resolution is actually complete
- duplicating state instead of deriving it from final board ownership
- making the outcome logic too tightly coupled to the current single-explosion
  implementation

### Workstream 2: Turn rotation and move locking

Purpose:
Ensure the game advances only to eligible players and stops accepting moves once
the match has been won.

Main responsibilities:

- remove newly erased players from future turn rotation
- keep round progression coherent when skipped players exist
- stop turn advancement when a winner is found
- block board interactions during popup display and after match conclusion

Dependencies:

- Workstream 1 state and outcome results

Major risks:

- advancing the active player before elimination results are finalized
- off-by-one behavior in round tracking after skipped players are introduced
- allowing later clicks to retrigger announcements after victory

### Workstream 3: Popup and shell presentation

Purpose:
Present all end-of-move consequences in one compact modal flow and keep the
shell visuals consistent with the new match states.

Main responsibilities:

- add one blocking result popup for combined erasure and winner messages
- ensure popup timing starts only after the move has visually settled
- keep the existing setup and restart-warning modal flows intact
- surface erased-player and winner/concluded state in the sidebar or other
  existing shell context as needed

Dependencies:

- Workstream 1 for popup payload data
- Workstream 2 for interaction-lock behavior
- existing `ShellModal` pattern in `frontend/src/App.vue`

Major risks:

- modal-state collisions with the existing setup and restart-warning flows
- UI showing concluded/winner state while interactions are still available
- fragmented messaging if popup copy and scoreboard state derive from different
  sources

### Workstream 4: Validation and regression safety

Purpose:
Verify the new end-of-move flow without regressing existing move-play,
scoreboard, restart-warning, or modal behavior.

Main responsibilities:

- expand unit coverage for first-round gating, elimination, winner detection,
  popup behavior, and turn skipping
- run the real frontend validation commands
- perform a lightweight manual UX pass for popup timing and board-lock behavior

Dependencies:

- Workstreams 1 through 3

Major risks:

- tests covering pure state transitions but missing shell-level modal behavior
- manual checks overlooking round/turn edge cases with three or four players

## 9. Phased Execution Plan

### Phase 1: State-model and flow clarification

Objective:
Define the minimum match-state additions and the exact sequencing of move
resolution, outcome evaluation, popup emission, and turn advancement.

Key tasks:

- review the current `GameState`, `GamePhase`, `ModalState`, scoreboard, and
  restart-summary shapes
- choose how to represent erased players, winner state, concluded state, and
  one-move popup payloads
- decide whether round-two gating should use the pre-advance or post-advance
  turn context, then document that choice in implementation notes/tests

Dependencies:

- source specification
- `papers/game-overview.md`

Entry criteria:

- the specification is accepted as the active scope

Exit criteria:

- the implementation has a clear state model and sequencing approach
- decision points affecting later tasks are recorded

### Phase 2: Core shell logic changes

Objective:
Add post-move outcome evaluation and turn-selection logic inside the centralized
frontend match-flow module.

Key tasks:

- extend match types and helper utilities in the game-shell layer
- add ownership-summary and round-two eligibility helpers
- mark newly erased players once per match
- detect winner status after erasure handling
- stop or continue turn advancement based on the resulting match state

Dependencies:

- Phase 1 decisions

Entry criteria:

- the target state fields and sequencing rules are settled

Exit criteria:

- the game shell can produce consistent erased-player, winner, and concluded
  state after each resolved move
- future turns target only eligible players when the game continues

### Phase 3: Popup and shell integration

Objective:
Wire the result popup into the existing modal shell and reflect the new match
state in the visible UI.

Key tasks:

- add the result-popup surface and connect it to the shell
- prevent additional board interaction while the popup is open
- keep the board disabled after a winning popup is dismissed
- update sidebar or status copy to surface erased and winner state cleanly
- keep the "New Game" flow unchanged as the only restart path after victory

Dependencies:

- Phase 2 outcome payloads and match-state flags
- current `ShellModal` integration path in `frontend/src/App.vue`

Entry criteria:

- core shell logic exposes the data and flags needed by the UI

Exit criteria:

- one popup appears per qualifying move
- popup dismissal returns to play only when no winner exists
- concluded matches remain visibly concluded and non-interactive

### Phase 4: Test, validation, and handoff readiness

Objective:
Verify the feature against the specification and leave implementation-ready
validation notes.

Key tasks:

- extend Vitest coverage for the new state transitions and modal behavior
- run `npm test` in `frontend`
- run `npm run build` in `frontend`
- perform manual checks for popup timing, winner lock, and restart flow
- capture any durable implementation learning in `LEARNINGS.md` if warranted

Dependencies:

- Phases 2 and 3

Entry criteria:

- code changes and UI wiring are complete

Exit criteria:

- automated validation results are recorded
- remaining limitations or follow-up items are explicit

## 10. Task Breakdown

- T1. Confirm the exact post-move hook in the current game loop.
  Description: Identify the single point after `playMove` has finished board
  mutation where outcome evaluation should run.
  Purpose: Prevent elimination and winner checks from leaking into explosion
  mechanics.
  Dependencies: none.
  Affected area: frontend gameplay state.
  Notes/Risks: the current implementation resolves only the present move logic,
  so the hook must stay reusable when later sweep-based explosion work lands.

- T2. Extend the game-domain types for match outcome state.
  Description: Add planning-level support for erased-player tracking, winner or
  concluded state, and transient popup payload structures.
  Purpose: Give later shell logic and UI a consistent contract.
  Dependencies: T1.
  Affected area: frontend types.
  Notes/Risks: avoid mixing durable match state with one-move UI payloads.

- T3. Add helpers for board ownership summaries and round-two eligibility.
  Description: Reuse the final board state to determine per-player ownership and
  whether elimination/win checks are currently allowed.
  Purpose: Keep rule evaluation centralized and testable.
  Dependencies: T2.
  Affected area: frontend gameplay state.
  Notes/Risks: round timing must align with `papers/game-overview.md`.

- T4. Implement newly erased player detection and durable elimination tracking.
  Description: Identify players who now own zero fields and were not already
  erased earlier in the match.
  Purpose: Support one-time announcements and future turn skipping.
  Dependencies: T3.
  Affected area: frontend gameplay state.
  Notes/Risks: multiple players can be erased in one move and must be preserved
  in a stable message order.

- T5. Implement winner detection and concluded-match locking.
  Description: Determine whether exactly one eligible player remains after
  erasure processing and mark the match concluded when that happens.
  Purpose: Stop play at the correct time and keep the winner visible.
  Dependencies: T4.
  Affected area: frontend gameplay state.
  Notes/Risks: ensure later clicks cannot recreate winner announcements.

- T6. Refactor turn advancement to skip erased players.
  Description: Compute the next active player only from the remaining eligible
  roster when the match continues.
  Purpose: Keep rotation correct after eliminations.
  Dependencies: T4, T5.
  Affected area: frontend gameplay state.
  Notes/Risks: round increments may need adjustment once not every configured
  player still participates.

- T7. Introduce one combined result-popup payload per resolved move.
  Description: Build a single UI payload that can carry zero or more erasure
  messages plus an optional winner message, in the required order.
  Purpose: Avoid stacked dialogs, repeated alerts, or historical replay.
  Dependencies: T4, T5.
  Affected area: frontend gameplay state / UI contract.
  Notes/Risks: message generation should use configured player names and only
  newly changed outcomes for the just-finished move.

- T8. Integrate the popup into the shell modal flow.
  Description: Add a dedicated popup surface or dialog content module and wire
  it through `App.vue` and existing modal infrastructure.
  Purpose: Present the result state with minimal shell churn and consistent
  accessibility behavior.
  Dependencies: T7.
  Affected area: frontend UI.
  Notes/Risks: modal-state coordination must not break setup or restart-warning
  flows.

- T9. Update scoreboard and shell status presentation.
  Description: Reflect erased players, winner visibility, and concluded-state
  messaging in the sidebar and restart summary where needed.
  Purpose: Keep the shell state consistent before and after popup dismissal.
  Dependencies: T4, T5, T8.
  Affected area: frontend UI.
  Notes/Risks: scoreboard counts should remain derived from board ownership
  rather than duplicated state.

- T10. Guard board interaction during popup display and after victory.
  Description: Extend the existing click guards so the board cannot accept moves
  while the result popup is open or once the match has concluded.
  Purpose: Enforce the lock-state requirements in UI and shell logic together.
  Dependencies: T5, T8.
  Affected area: frontend gameplay state / UI.
  Notes/Risks: both composable guards and rendered button disabled states must
  stay aligned.

- T11. Expand automated coverage for outcome-flow scenarios.
  Description: Add or update Vitest cases for first-round immunity, multi-player
  erasure, winner detection, popup payload generation, skipped turns, and
  post-victory interaction blocking.
  Purpose: Prevent regressions in the new end-of-move logic.
  Dependencies: T3 through T10.
  Affected area: frontend tests.
  Notes/Risks: use three- and four-player scenarios where two-player tests would
  hide rotation bugs.

- T12. Run validation and capture implementation learnings if needed.
  Description: Execute the relevant frontend checks and document any reusable
  architecture lessons.
  Purpose: leave the feature ready for implementation review and future work.
  Dependencies: T11.
  Affected area: validation/documentation.
  Notes/Risks: if manual verification reveals UI-state timing issues, those
  findings should be reflected in final implementation notes.

## 11. Dependency Map

- The state-model extension in T2 depends on first identifying the correct
  post-move integration point in T1.
- Ownership and round-eligibility helpers in T3 must exist before elimination
  and winner work in T4 and T5.
- Turn-skipping logic in T6 depends on durable elimination state from T4.
- Popup payload generation in T7 depends on the finalized erasure and winner
  outcomes from T4 and T5.
- Shell modal integration in T8 depends on T7 defining a clean one-move result
  payload.
- Sidebar/status updates in T9 depend on the durable state introduced in T4 and
  T5 and the popup coordination introduced in T8.
- Board-lock behavior in T10 depends on both concluded-match state and popup
  state.
- Validation in T11 and T12 should happen after the gameplay and UI flows are
  fully wired, otherwise tests will encode intermediate behavior instead of the
  final specification.

## 12. Technical Decision Points

### Decision 1: Match conclusion representation

- Decision topic: whether to represent a finished game through `GamePhase`, a
  dedicated concluded flag, or both
- Why it matters: move guards, sidebar presentation, and popup dismissal all
  depend on a stable concluded-state signal
- High-level options:
  - keep `phase` as `playing` and add explicit concluded/winner fields
  - extend `phase` to include a concluded variant
  - use a dedicated match-status enum layered over the existing phase
- Impact of delaying the decision: downstream UI wiring and tests will drift if
  different modules infer conclusion differently

### Decision 2: Eliminated-player tracking model

- Decision topic: whether to store eliminated-player identifiers durably or
  derive status fresh from board counts on every render
- Why it matters: one-time announcements and future turn skipping require a
  memory of prior eliminations
- High-level options:
  - track eliminated-player ids in match state
  - track a per-player status field
  - derive current zero-field players from the board but separately store only
    the already-announced eliminations
- Impact of delaying the decision: it becomes easy to re-announce old
  eliminations or compute turn order from a different definition than the popup

### Decision 3: Result-popup state ownership

- Decision topic: whether the new popup should be integrated into the existing
  `modalState` flow or managed through a separate result-dialog state
- Why it matters: the shell already has setup and restart-warning modal flows
  that must remain stable
- High-level options:
  - extend the existing modal union with a result-popup state
  - keep modal shell selection separate from popup payload state
  - model the result popup as a dedicated overlay flag plus payload
- Impact of delaying the decision: UI coordination work in `App.vue` and the
  board inert/disabled behavior will remain ambiguous

### Decision 4: Round-two gating calculation

- Decision topic: how to determine when the match has moved past the first round
- Why it matters: the spec explicitly forbids elimination and winner checks
  before every configured player has completed one turn
- High-level options:
  - continue using the current `round` field with clarified evaluation timing
  - derive eligibility from completed-turn count instead of the displayed round
  - add a dedicated flag such as first-round-complete
- Impact of delaying the decision: the feature may pass simple winner tests but
  still violate the canonical timing rules

### Decision 5: Turn advancement semantics after elimination

- Decision topic: how to calculate the next active player and subsequent round
  value once the full configured roster is no longer participating
- Why it matters: the scoreboard, turn card, and move guards all depend on a
  consistent definition of who plays next
- High-level options:
  - keep players in original order and skip erased ids at selection time
  - compress the active roster after elimination while preserving original order
  - keep a separate active-player order structure derived from the full roster
- Impact of delaying the decision: turn and round behavior can become fragile in
  three- and four-player matches

## 13. Risks and Complexity Drivers

- The current match model only distinguishes `idle` and `playing`, so adding
  elimination and conclusion state changes a core assumption in the shell.
- `frontend/src/composables/useGameShell.ts` currently advances the turn
  immediately after applying the move result. The new post-move check must slot
  into that sequence without creating a transient wrong active player.
- The current sidebar and restart summary derive from the live game state. That
  is a strength, but it also means newly added state must remain aligned with
  the same ownership counts and turn-selection rules.
- Modal coordination already exists for setup and restart-warning dialogs. A new
  result popup increases the chance of UI-state overlap if the ownership of
  modal selection is not made explicit.
- Round tracking becomes more subtle once erased players no longer take turns.
  Two-player cases may appear correct while three- and four-player rotations
  still fail.
- The current implementation does not yet cover later sweep-based explosion
  resolution. The post-move outcome stage should therefore be attached to the
  abstract "move fully resolved" boundary, not to today’s narrow explosion
  branch.

Mitigation ideas:

- keep scoreboard counts derived from final board ownership instead of storing
  parallel score state
- centralize post-move outcome evaluation in one helper path
- treat popup payloads as per-move transient data, separate from durable match
  state
- prioritize multi-player rotation tests over only the simplest two-player flow

## 14. Assumptions

- This increment remains entirely in the frontend layer and does not require
  backend support.
- `papers/game-overview.md` remains the authority for second-round timing,
  elimination, and winner rules.
- The existing `ShellModal` infrastructure can host the new result popup without
  requiring a new modal system.
- The current scoreboard should remain derived from board ownership counts, with
  erased and winner state layered on top.
- The existing "New Game" flow stays unchanged and remains the only path to the
  next match after victory.
- Popup copy can be finalized during implementation without reopening the spec,
  as long as the configured player names and message ordering rules are honored.

## 15. Open Questions / Blockers

- Open question: should concluded-match presentation be modeled as a new
  `GamePhase` value or as additional state layered onto `playing`?
- Open question: should the sidebar show an explicit eliminated/winner badge for
  players, or is concluded-state messaging elsewhere in the shell sufficient for
  this increment?
- Nice-to-clarify point: what exact user-facing sentence style should the popup
  use for erasure and winner messages?
- Nice-to-clarify point: should the restart summary shown by the existing
  warning dialog also surface eliminated-state labels once this feature lands?
- Blockers: none identified from the current specification.

## 16. Testing and Validation Plan

- Add unit coverage around helper logic for ownership counts, round-two
  eligibility, newly erased players, winner detection, and next-player
  selection.
- Expand `frontend/src/composables/useGameShell.spec.ts` to cover:
  - no elimination or winner checks during round one
  - one-player and multi-player erasure from round two onward
  - combined erasure-plus-winner outcomes in one popup payload
  - one-time announcement behavior
  - skipped turns after elimination
  - board lock while the popup is visible
  - board lock persisting after a winning popup is dismissed
  - unchanged restart-warning and new-game behavior
- Run `npm test` in `frontend`.
- Run `npm run build` in `frontend`.
- Perform manual exploratory checks for:
  - popup appearing only after the final move state is visible
  - dismissal resuming play only when no winner exists
  - no further board interaction after victory
  - three- and four-player turn rotation after eliminations

## 17. Rollout / Release Considerations

- No feature flag is expected for this increment because the game remains local
  and frontend-only.
- The safest rollout is to land the state-model and test coverage together with
  the popup integration so the shell never temporarily exposes a winner without
  a lock state.
- Backward compatibility is limited to preserving the current setup and
  restart-warning flows and keeping the "New Game" entry point unchanged.
- If implementation reveals UX confusion around concluded-state visibility, that
  should be treated as a follow-up polish slice rather than expanding the scope
  of this increment.

## 18. Documentation Impact

- The new implementation plan is added under `papers/in-progress`.
- Final implementation should update `LEARNINGS.md` if it reveals a durable
  pattern about centralized match state, modal coordination, or turn rotation
  after eliminations.
- No backend or external API documentation is expected.
- Release notes are optional but could briefly mention that games now announce
  eliminations and lock after a winner is declared.

## 19. Suggested Delivery Slices

- Slice 1: Core state and rules.
  Includes match-state extensions, round-two gating, elimination tracking,
  winner detection, and turn skipping.

- Slice 2: Popup and shell integration.
  Includes the combined result popup, interaction locking, and shell/sidebar
  presentation updates.

- Slice 3: Hardening and validation.
  Includes comprehensive multi-player regression coverage, build/test
  validation, and any durable learning capture.

## 20. Implementation Readiness Checklist

- [x] Source specification exists in `papers/in-progress`.
- [x] Canonical gameplay context has been reviewed in `papers/game-overview.md`.
- [x] Frontend ownership boundaries are clear and backend work is out of scope.
- [x] Primary affected modules have been identified.
- [x] Workstreams and sequencing are defined.
- [x] Validation commands are known for the affected layer.
- [ ] Match-state representation decision is settled before coding starts.
- [ ] Round-two gating approach is confirmed before implementation.
- [ ] Turn-rotation semantics after elimination are confirmed before
  implementation.
- [ ] Popup ownership within the modal flow is confirmed before implementation.

## 21. Definition of Done for Planning

This implementation plan is complete when:

- the work is broken into clear frontend-focused workstreams
- sequencing between state, rotation, popup, and validation work is explicit
- key decision points and risks are visible before coding starts
- the validation plan names the real checks for the affected layer
- implementation can proceed without needing to infer hidden scope from the game
  overview alone
