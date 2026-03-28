# Implementation Plan: Sweep-Based Chain Reaction Resolution

## 1. Title

Sweep-Based Chain Reaction Resolution - Implementation Plan

## 2. Summary

This plan covers upgrading the frontend move-resolution path from the current
single-origin explosion limit to the full sweep-based chain-reaction behavior
defined in `papers/game-overview.md` and specified in
`papers/in-progress/2026-03-28_SPEC_sweep-based-chain-reactions.md`.

The implementation should stay centered in
`frontend/src/composables/useGameShell.ts`, replace the current
single-explosion board-resolution step with repeated row-major sweeps, and keep
the existing boundary where the fully resolved board is handed into
`finalizeResolvedMove` for score-derived presentation, erasure checks, winner
detection, and popup behavior. The plan also expands regression coverage so
ordering-sensitive chain reactions are validated explicitly before future
gameplay increments build on this foundation.

## 3. Source Specification

- Feature title: `Sweep-Based Chain Reaction Resolution`
- Date: `2026-03-28`
- Status: `In progress`
- Reference:
  `papers/in-progress/2026-03-28_SPEC_sweep-based-chain-reactions.md`
- Canonical product context: `papers/game-overview.md`

## 4. Planning Goals

- Replace the current one-explosion ceiling with the canonical full-board sweep
  resolver.
- Preserve the current separation between move resolution and the downstream
  post-move outcome stage.
- Make sweep order, neighbor order, and per-sweep checked-once behavior
  explicit implementation targets rather than incidental side effects.
- Keep the change frontend-local and focused on the existing game shell instead
  of spreading rules across components.
- Define validation strong enough to catch ordering regressions, repeated-sweep
  behavior, and final-board handoff mistakes.

## 5. Scope of This Plan

This plan covers:

- frontend-only changes in `frontend`
- replacing the current single-explosion move-resolution path in
  `frontend/src/composables/useGameShell.ts`
- applying the played `+1` load before sweep resolution starts
- row-major full-board sweep traversal from top-left to bottom-right
- canonical clockwise neighbor distribution for each explosion
- per-sweep checked-once behavior
- repeated sweeps until a full pass produces zero explosions
- stable handoff into the existing score, erasure, winner, and popup flow
- automated and manual validation for chain-reaction behavior

## 6. Out of Scope

This plan does not cover:

- PHP backend, persistence, or API changes
- changes to board size, player setup, or shell layout
- new scoring rules beyond the current ownership-derived field counts
- redesigning elimination timing, winner timing, or popup wording beyond
  consuming the final resolved board correctly
- explosion animations, sweep visualizers, replay controls, or delayed
  step-by-step playback
- speculative multiplayer or server-authoritative gameplay architecture
- broad refactors outside the gameplay shell unless needed to keep the change
  coherent

## 7. Affected Areas

- `papers/in-progress`
  for the active implementation plan document
- `frontend/src/composables/useGameShell.ts`
  for the current move-resolution flow, neighbor/liberty helpers, sweep
  traversal, and the handoff into `finalizeResolvedMove`
- `frontend/src/composables/useGameShell.spec.ts`
  for ordering-sensitive chain-reaction coverage and downstream outcome
  regression tests
- `frontend/src/types/game.ts`
  only if a small supporting type improves readability for sweep-resolution
  helpers without broadening the public state contract
- `frontend/src/App.vue`, `frontend/src/components/GameBoard.vue`, and
  `frontend/src/components/PlayerSidebar.vue`
  primarily for regression validation; code changes here should stay minimal
  and happen only if the existing final-board rendering assumptions prove
  inaccurate

## 8. Workstreams

### Workstream 1: Sweep rule foundation

Purpose:
Define the deterministic rule primitives needed for full-board chain-reaction
resolution without mixing them into UI concerns.

Main responsibilities:

- preserve the canonical clockwise neighbor order already used by the gameplay
  shell
- keep liberty and overload evaluation consistent across all board positions
- define one sweep as a row-major top-left to bottom-right traversal
- make the once-per-sweep checking rule explicit

Dependencies:

- source specification
- `papers/game-overview.md`
- current move-resolution helpers in `frontend/src/composables/useGameShell.ts`

Major risks:

- implementing a resolution strategy whose iteration order only appears correct
  on simple boards
- encoding traversal rules in a way that is difficult to verify in tests

### Workstream 2: Stable board-resolution integration

Purpose:
Replace the current single-explosion board mutation path with a stable
multi-sweep resolver while keeping turn progression and post-move outcomes on
the far side of that boundary.

Main responsibilities:

- apply the played load to the selected cell
- run sweep passes until the board stabilizes
- preserve the canonical explosion sequence for every exploding cell
- keep all ownership transfer tied to the original active player for the whole
  turn
- hand only the final stable board into the existing post-move outcome flow

Dependencies:

- Workstream 1
- the current `playMoveWithOutcome` and `finalizeResolvedMove` flow

Major risks:

- evaluating erasure or winner logic against an intermediate sweep state
- allowing a checked cell to explode twice in one sweep
- incorrect stop conditions producing partial resolution or runaway loops

### Workstream 3: Deterministic regression coverage

Purpose:
Lock the ordering-sensitive gameplay rules in tests so later increments cannot
silently drift from the canonical sweep model.

Main responsibilities:

- add explicit tests for row-major sweep order
- add explicit tests for later-unvisited cells exploding in the same sweep
- add explicit tests for already-checked cells waiting until the next sweep
- add explicit tests for repeated sweeps and repeated explosions across one
  turn
- verify the final stable board contains no overloaded cells

Dependencies:

- Workstream 2

Major risks:

- using overly symmetric test boards that would pass despite wrong ordering
- covering only final ownership counts while missing sweep-order regressions

### Workstream 4: Runtime validation and review readiness

Purpose:
Confirm the UI still reflects only the final resolved board and prepare the
increment for review with concrete validation evidence.

Main responsibilities:

- run the real frontend validation commands
- manually verify board ownership, scores, popup timing, and turn flow after
  multi-sweep moves
- document any minimal UI adjustments only if the current shell reveals stale
  assumptions about single-step resolution

Dependencies:

- Workstreams 2 and 3

Major risks:

- automated tests proving domain logic while missing a shell-level timing issue
- presentation layers assuming that only the clicked cell changes per move

## 9. Phased Execution Plan

### Phase 1: Resolution boundary and rule clarification

Objective:
Confirm the exact seam between board resolution and post-move outcomes, and
lock the core ordering rules before implementation starts.

Key tasks:

- review the current `resolveBoardAfterMove`, `playMoveWithOutcome`, and
  `finalizeResolvedMove` relationship
- confirm the sweep traversal contract from the specification and
  `papers/game-overview.md`
- confirm the canonical explosion sequence and active-player ownership rule
- decide whether any small helper/type reshaping is needed for readability

Dependencies:

- source specification
- current frontend gameplay shell

Entry criteria:

- the specification is accepted as the active scope

Exit criteria:

- no ambiguity remains around sweep order, neighbor order, checked-once
  semantics, or the final-board handoff point

### Phase 2: Sweep-resolution engine upgrade

Objective:
Replace the single-explosion board-resolution step with a reusable sweep pass
and repeated-sweep stabilization loop.

Key tasks:

- define the planning-level shape of one sweep pass
- keep row-major traversal explicit
- preserve the canonical per-explosion sequence during each pass
- repeat sweeps until one full pass produces zero explosions

Dependencies:

- Phase 1 decisions

Entry criteria:

- the ordering and boundary rules are clear

Exit criteria:

- one move can resolve through zero, one, or multiple sweeps and end on a
  stable board

### Phase 3: Move lifecycle and downstream handoff

Objective:
Wire the stable board resolver into the existing move flow without changing the
downstream outcome stage conceptually.

Key tasks:

- apply the played load before sweep resolution begins
- ensure the active player remains the ownership source for all explosions in
  the turn
- keep `finalizeResolvedMove` as the consumer of the fully resolved board
- verify turn advancement, score derivation, erasure checks, winner detection,
  and popup behavior all continue to run after resolution completes

Dependencies:

- Phase 2

Entry criteria:

- the sweep resolver can produce a final stable board

Exit criteria:

- `playMoveWithOutcome` still exposes one resolved move result, but the board
  now reflects the full canonical chain reaction

### Phase 4: Test expansion and hardening

Objective:
Encode the new ordering rules and stable-board guarantees in automated
regression coverage.

Key tasks:

- add deterministic board fixtures for same-sweep and next-sweep cases
- cover corner, edge, and interior threshold behavior under sweep resolution
- cover multi-sweep and repeated-explosion scenarios
- cover final-board downstream outcome behavior after chain reactions

Dependencies:

- Phase 3

Entry criteria:

- the move lifecycle uses the new sweep resolver

Exit criteria:

- the key specification rules are represented in the automated suite

### Phase 5: Validation and review preparation

Objective:
Run the real checks, perform focused manual verification, and leave the feature
ready for implementation review.

Key tasks:

- run `npm test` in `frontend`
- run `npm run build` in `frontend`
- manually verify chain-reaction turns, scoreboard updates, modal timing, and
  board interactivity
- capture any residual risks or follow-up notes for review

Dependencies:

- Phase 4

Entry criteria:

- gameplay and automated coverage are complete

Exit criteria:

- validation evidence exists for the affected layer and any remaining
  limitations are explicit

## 10. Task Breakdown

- T1. Confirm the move-resolution handoff point.
  Description: Identify the exact point where board mutation ends today and
  `finalizeResolvedMove` begins, then preserve that same architectural boundary
  for the sweep-based resolver.
  Purpose: Keep explosion mechanics separate from erasure, winner, and turn
  advancement logic.
  Dependencies: none.
  Affected area: `frontend/src/composables/useGameShell.ts`.
  Notes/Risks: if outcome checks slip into sweep execution, later gameplay
  increments become harder to reason about.

- T2. Define reusable liberty and neighbor helper responsibilities.
  Description: Clarify how liberty counts, overload checks, and canonical
  clockwise neighbors are represented for sweep resolution.
  Purpose: Keep the deterministic rule foundation centralized and readable.
  Dependencies: T1.
  Affected area: `frontend/src/composables/useGameShell.ts`.
  Notes/Risks: naming should stay compatible with the terminology in
  `papers/game-overview.md`.

- T3. Define the row-major sweep traversal contract.
  Description: Plan how one sweep scans the board exactly once per cell from
  top-left to bottom-right without revisiting cells that later receive load.
  Purpose: Implement the checked-once semantics from the specification.
  Dependencies: T2.
  Affected area: `frontend/src/composables/useGameShell.ts`.
  Notes/Risks: queue-style or recursive resolution patterns can easily violate
  the required ordering.

- T4. Replace the current single-explosion step with a one-sweep resolver.
  Description: Introduce a sweep-level resolution step that can process every
  overloaded cell encountered during a pass and report whether any explosion
  happened.
  Purpose: Remove the current one-origin explosion ceiling while keeping one
  sweep as an explicit concept.
  Dependencies: T2, T3.
  Affected area: `frontend/src/composables/useGameShell.ts`.
  Notes/Risks: the implementation shape must remain visibly row-major and not
  drift toward creation-order processing.

- T5. Add repeated-sweep stabilization logic.
  Description: Repeat sweep passes until a full pass produces zero explosions.
  Purpose: Guarantee that a move ends only on a stable board.
  Dependencies: T4.
  Affected area: `frontend/src/composables/useGameShell.ts`.
  Notes/Risks: the stop condition must be explicit so the resolver neither
  stops early nor loops indefinitely.

- T6. Preserve the canonical per-explosion sequence and active-player capture
  rule.
  Description: Ensure each explosion still performs distribution, reduction,
  and ownership transfer in the correct conceptual order, using the active
  player who started the turn for every receiving neighbor.
  Purpose: Keep chain reactions aligned with the canonical rules.
  Dependencies: T4, T5.
  Affected area: `frontend/src/composables/useGameShell.ts`.
  Notes/Risks: small ordering mistakes can produce believable but incorrect
  final boards.

- T7. Keep the move entry and post-move outcome flow intact.
  Description: Apply the played `+1` load, resolve the full sweep chain
  reaction, and only then hand the final board into the existing post-move
  outcome logic.
  Purpose: Preserve the current architecture while upgrading rule fidelity.
  Dependencies: T1, T5, T6.
  Affected area: `frontend/src/composables/useGameShell.ts`.
  Notes/Risks: score derivation and popup timing must remain final-board based.

- T8. Decide whether small supporting types are warranted.
  Description: Evaluate whether a small internal result or helper type improves
  sweep-resolution readability without expanding the public game-state surface.
  Purpose: Keep the shell maintainable as gameplay rules grow.
  Dependencies: T1 through T7.
  Affected area: `frontend/src/types/game.ts`,
  `frontend/src/composables/useGameShell.ts`.
  Notes/Risks: this is optional and should avoid speculative type churn.

- T9. Add tests for same-sweep versus next-sweep ordering.
  Description: Cover scenarios where an early explosion overloads a later
  unvisited field in the same sweep and where an already-checked field must
  wait until the next sweep.
  Purpose: Lock the two most ordering-sensitive rules in the spec.
  Dependencies: T7.
  Affected area: `frontend/src/composables/useGameShell.spec.ts`.
  Notes/Risks: intentionally asymmetric board setups are needed so wrong
  ordering fails clearly.

- T10. Add tests for repeated sweeps and stable end-state guarantees.
  Description: Cover scenarios where a move needs multiple sweeps, a field
  explodes again in a later sweep, and the final board ends with no overloaded
  cells.
  Purpose: Validate the stabilization loop and repeated-explosion behavior.
  Dependencies: T7.
  Affected area: `frontend/src/composables/useGameShell.spec.ts`.
  Notes/Risks: include corner, edge, and interior contexts where they sharpen
  the rule coverage.

- T11. Verify downstream score and outcome behavior from the final resolved
  board.
  Description: Update or add tests showing score entries, erasure detection,
  winner detection, and move-result popup behavior all consume the final
  chain-reaction board rather than any intermediate sweep state.
  Purpose: Protect the existing post-move feature set against the new resolver.
  Dependencies: T7, T9, T10.
  Affected area: `frontend/src/composables/useGameShell.spec.ts`.
  Notes/Risks: multi-player cases are important because later sweeps can erase
  players after the first explosion has already resolved.

- T12. Run validation and manual regression checks.
  Description: Execute the frontend checks and manually verify chain reactions,
  board ownership, scoreboard updates, popup timing, and interaction guards.
  Purpose: Leave the increment ready for review.
  Dependencies: T9, T10, T11.
  Affected area: frontend runtime validation.
  Notes/Risks: if the shell reveals stale UI assumptions, those findings should
  be documented explicitly rather than silently worked around.

## 11. Dependency Map

- T1 must happen first because the new resolver should preserve the current
  boundary between board resolution and post-move outcomes.
- T2 and T3 define the rule primitives and traversal contract that T4 depends
  on.
- T4 and T5 establish the sweep engine; T6 depends on both to preserve the
  canonical per-explosion sequence within that engine.
- T7 depends on T1, T5, and T6 because the move lifecycle should not be rewired
  until the stable board-resolution path exists.
- T8 can remain optional, but if used it should be decided before the final
  implementation shape settles.
- T9 and T10 depend on T7 because the automated tests should target the actual
  stable move lifecycle, not an intermediate helper shape.
- T11 depends on T7, T9, and T10 because downstream score and outcome behavior
  should be verified only after the chain-reaction rules are represented in the
  suite.
- T12 depends on T9 through T11 so validation and review reflect the fully
  integrated feature.

## 12. Technical Decision Points

### Decision 1: Where the sweep resolver should live

- Decision topic: whether the sweep-resolution helpers stay inside
  `frontend/src/composables/useGameShell.ts` or move into a nearby dedicated
  gameplay-rules module
- Why it matters: gameplay rules are already centralized in the game shell, but
  the new resolver adds more moving parts than the current single-explosion path
- High-level options:
  - keep the logic in `useGameShell.ts` with helper extraction
  - extract a small local gameplay-rules module if readability demands it
- Impact of delaying the decision: the implementation may either become
  over-coupled or introduce unnecessary module churn mid-change

### Decision 2: How one sweep is represented internally

- Decision topic: whether one sweep is modeled as explicit nested row/column
  traversal or as another ordered coordinate representation
- Why it matters: the checked-once row-major rule is the core correctness
  constraint for this feature
- High-level options:
  - explicit nested traversal over the live board state
  - a precomputed row-major coordinate list consumed in order
- Impact of delaying the decision: it becomes easier to drift into queue-driven
  or recursive resolution that violates the specification

### Decision 3: What the stable-resolution interface should return

- Decision topic: whether the sweep resolver should return only the final board
  or also expose limited internal metadata for readability or testing
- Why it matters: the current post-move flow expects the board to be the main
  resolved output, and the UI does not need intermediate sweep state
- High-level options:
  - return only the final resolved board
  - return the final board plus small internal metadata kept inside the shell
- Impact of delaying the decision: intermediate state may leak into the public
  gameplay flow without a clear reason

### Decision 4: How to structure order-sensitive regression tests

- Decision topic: how explicit the board fixtures should be for proving same
  sweep versus next sweep behavior
- Why it matters: symmetric scenarios can accidentally pass with the wrong
  traversal order
- High-level options:
  - use small asymmetric board fixtures built directly in the test file
  - introduce lightweight helper builders for more complex scenarios
- Impact of delaying the decision: the suite may validate only outcomes that do
  not truly pin down ordering

### Decision 5: Whether any UI-layer changes are necessary at all

- Decision topic: whether the current synchronous `playCell` flow and shell
  rendering can remain unchanged once the move-resolution engine becomes more
  powerful
- Why it matters: the specification wants only the final resolved board to be
  visible, not a new staged animation flow
- High-level options:
  - keep the current synchronous final-board update and change only the shell
    logic beneath it
  - make minimal UI adjustments only if validation reveals stale assumptions
- Impact of delaying the decision: the implementation may take on unnecessary
  UI scope or, conversely, miss a small consumer regression until late review

## 13. Risks and Complexity Drivers

- The dominant complexity driver is deterministic ordering. A resolver that is
  logically close but not truly row-major will produce incorrect boards for
  certain chain reactions.
- The once-per-sweep rule is easy to violate accidentally if explosion
  resolution is implemented recursively or driven by a dynamic queue of
  overloaded cells.
- A field can explode, receive more load later in the same sweep, and stay
  overloaded until a later sweep. That makes repeated-sweep correctness more
  important than simple neighbor distribution.
- The current post-move outcome flow already assumes it receives a resolved
  board. If the new resolver hands off too early, score, erasure, winner, and
  popup behavior will all reflect the wrong state at once.
- Test design is part of the complexity. Small happy-path boards will not prove
  that the ordering rules are implemented correctly.
- Performance is a low-risk concern on the current 8x8 board. Correctness and
  maintainable sequencing matter more than early optimization.

Mitigation ideas:

- keep sweep traversal and neighbor order explicit in helper naming and tests
- preserve one clean handoff from stable board resolution into
  `finalizeResolvedMove`
- use intentionally asymmetric fixtures for ordering-sensitive tests
- verify the final board has no overloaded cells before considering the move
  resolved

## 14. Assumptions

- This increment remains entirely in the frontend layer.
- Each turn starts from a stable board with no unresolved overloaded cells
  carried over from a previous move.
- The existing score model remains derived from board ownership rather than from
  separate stored totals.
- The current post-move outcome stage in `frontend/src/composables/useGameShell.ts`
  should remain conceptually unchanged and simply consume the new fully
  resolved board.
- No animation or intermediate sweep visualization is required in this
  increment.
- The current shell can continue to present one synchronous final-board update
  per move unless manual validation proves otherwise.

## 15. Open Questions / Blockers

- Open question: should helper naming in the gameplay shell shift from
  `allowed load` terminology toward the canonical `liberties` terminology during
  this increment, or should that remain a follow-up readability change?
- Nice-to-clarify point: would a small internal sweep-result shape improve
  readability enough to justify a minor type addition, or is a final-board-only
  return value preferable?
- Nice-to-clarify point: are any UI assertions beyond the existing shell and
  sidebar checks needed once validation confirms the board always renders the
  final resolved state?
- Blockers: none identified from the current specification.

## 16. Testing and Validation Plan

- Extend `frontend/src/composables/useGameShell.spec.ts` to cover:
  - no-explosion moves that end after the first zero-explosion sweep
  - corner, edge, and interior overload handling under sweep-based resolution
  - a later unvisited field exploding in the same sweep
  - an already-checked field waiting until the next sweep
  - repeated sweeps and a field exploding more than once in one turn
  - final stable boards containing no overloaded cells
  - score, erasure, winner, and popup behavior based on the final resolved
    board
- Run `npm test` in `frontend`.
- Run `npm run build` in `frontend`.
- Perform manual exploratory checks for:
  - chain reactions spanning multiple sweeps
  - captured ownership colors matching scoreboard changes
  - move-result popup timing after a chain reaction changes elimination or
    winner outcomes
  - board interactivity remaining blocked while a move-result popup is open

## 17. Rollout / Release Considerations

- No feature flag is expected for this frontend-local increment.
- The safest rollout is to land the sweep resolver together with the expanded
  regression suite so the canonical ordering rules are protected immediately.
- Backward compatibility primarily means preserving the current shell API and
  keeping post-move outcome behavior attached to the fully resolved board.
- Rollback remains straightforward at the branch/change level because no
  persistence, migrations, or backend contracts are involved.
- Review communication should make it clear that the prior staged
  single-explosion behavior has now been replaced by the canonical sweep model.

## 18. Documentation Impact

- This implementation plan is added under `papers/in-progress`.
- No backend or API documentation is expected for this increment.
- Once implementation is complete, the specification should move to
  `papers/done/specs` and the plan should move to `papers/done/plans`.
- A completion screenshot under `papers/done/screenshots` may be appropriate if
  the finished feature meaningfully changes visible gameplay outcomes.

## 19. Suggested Delivery Slices

- Slice 1: Sweep engine foundation.
  Includes helper clarification, one-sweep resolution, and repeated-sweep
  stabilization.

- Slice 2: Move lifecycle integration.
  Includes the played-load entry point, final-board handoff, and preservation
  of downstream score and outcome behavior.

- Slice 3: Hardening and validation.
  Includes order-sensitive regression tests, final-state assertions, build/test
  execution, and focused manual verification.

## 20. Implementation Readiness Checklist

- [x] Source specification exists in `papers/in-progress`.
- [x] `papers/game-overview.md` has been reviewed for canonical rule context.
- [x] The change is clearly frontend-only.
- [x] The current move-resolution and post-move outcome seam has been
  identified in `frontend/src/composables/useGameShell.ts`.
- [x] Primary affected files have been identified.
- [x] Validation commands are known for the affected layer.
- [ ] Decide whether the sweep resolver stays in `useGameShell.ts` or moves to
  a small local gameplay-rules module.
- [ ] Confirm the preferred helper/type naming strategy before coding starts.
- [ ] Confirm the order-sensitive fixture strategy for the regression suite
  before implementation begins.

## 21. Definition of Done for Planning

This implementation plan is complete when:

- the work is broken into clear frontend-focused workstreams
- sequencing between sweep resolution, move lifecycle integration, and
  validation is explicit
- key deterministic-order risks are visible before coding starts
- the downstream final-board handoff is called out as a non-negotiable boundary
- the validation plan names the actual checks for the affected layer
- implementation can proceed without inferring hidden behavior from
  `papers/game-overview.md` alone
