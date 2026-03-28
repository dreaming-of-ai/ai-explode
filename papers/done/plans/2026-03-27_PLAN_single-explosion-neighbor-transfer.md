# Implementation Plan: Single Explosion Neighbor Transfer and Score Update

## 1. Title

Single Explosion Neighbor Transfer and Score Update - Implementation Plan

## 2. Summary

This plan covers the first explosion-related gameplay increment for `AI
Explode`. It introduces a single immediate explosion on the just-played field
when that field exceeds its allowed load, distributes `+1` load to valid
neighbors, transfers ownership of those receiving neighbors to the exploding
player, and keeps the board colors and scoreboard synchronized within the same
move resolution.

The work remains frontend-only and builds on the existing local gameplay state
in `frontend/src/composables/useGameShell.ts`, the shared `Cell` / `GameState`
types, the `GameBoard` presentation layer, and the ownership-based scoreboard
already shown in the sidebar. The increment intentionally stops after the
originating explosion and preserves a clean boundary for later sweep-based
chain-reaction work described in `papers/game-overview.md`.

## 3. Source Specification

- Feature title: `Single Explosion Neighbor Transfer and Score Update`
- Date: `2026-03-27`
- Status: `In progress`
- Reference: `papers/in-progress/2026-03-27_SPEC_single-explosion-neighbor-transfer.md`
- Canonical product context: `papers/game-overview.md`

## 4. Planning Goals

- Define a safe execution order for adding the first explosion mechanic without
  mixing it with later sweep logic.
- Keep gameplay rules centralized in the frontend state layer rather than
  scattering them across Vue components.
- Preserve scoreboard derivation from board ownership so score updates stay
  consistent with visible captures.
- Identify the minimal UI, state, and test changes required for a reviewable
  increment.
- Surface the technical decisions that matter now for later chain-reaction
  increments.

## 5. Scope of This Plan

This plan covers:

- frontend-only changes in `frontend`
- allowed-load evaluation for the just-played cell based on board position
- one immediate explosion on the just-played cell only
- neighbor discovery including diagonal adjacency
- load distribution to valid neighboring cells
- ownership transfer for all receiving neighboring cells
- post-explosion load reduction on the originating cell
- immediate scoreboard and board-color consistency from the resulting board
  state
- automated and manual validation for the new move-resolution behavior

## 6. Out of Scope

This plan does not cover:

- PHP backend or API changes
- persistence, multiplayer, or server-authoritative rules
- sweep-based board scans
- chain reactions or repeated overload checks
- explosion ordering rules across multiple simultaneous candidates
- elimination or winner-detection logic
- animation systems or new visual effects beyond existing board/score updates
- speculative state architecture for later online or backend-synced play

## 7. Affected Areas

- `frontend/src/composables/useGameShell.ts`
  for move resolution, load-threshold checks, neighbor handling, and derived
  scoreboard continuity
- `frontend/src/types/game.ts`
  if shared gameplay types need small extensions to support clearer move
  resolution structure
- `frontend/src/components/GameBoard.vue`
  for immediate visual reflection of captured ownership through existing cell
  color rendering
- `frontend/src/components/PlayerSidebar.vue`
  for score messaging if the copy should acknowledge post-explosion ownership
  changes
- `frontend/src/composables/useGameShell.spec.ts`
  for rule, capture, and no-chain-reaction regression coverage
- `papers`
  for implementation artifact management only

## 8. Workstreams

### Workstream 1: Explosion rule foundation

Purpose:
Define the reusable gameplay-rule helpers needed to determine whether the
played cell explodes and which neighbors participate in the one-step
resolution.

Main responsibilities:

- define allowed-load/liberty calculation from board position
- define valid-neighbor collection including diagonals
- define the trigger boundary as strictly greater than allowed load
- ensure the one-explosion increment is clearly separated from future sweep
  logic

Dependencies:

- source specification
- alignment with `papers/game-overview.md` liberty model

Major risks:

- encoding thresholds in a way that is hard to extend to sweep processing later
- mixing future chain-reaction assumptions into the first increment

### Workstream 2: Single-move state resolution

Purpose:
Update the current move-resolution path so a valid move can either end as a
normal claim/reinforcement or continue into a single originating explosion and
produce one final board state.

Main responsibilities:

- preserve current playable-cell constraints and turn progression
- clone and update board state safely within one move
- apply neighbor load distribution and ownership transfer
- reduce the exploding field by the number of loads distributed
- guarantee that no additional overload checks run after this one explosion

Dependencies:

- Workstream 1 helper decisions
- current `playMove` state transition model in `useGameShell`

Major risks:

- updating turn progression before explosion resolution is finalized
- introducing hidden second-pass logic that violates the spec boundary

### Workstream 3: UI synchronization and player feedback

Purpose:
Ensure the board and score presentation remain aligned with the final
post-explosion board in the same rendered move update.

Main responsibilities:

- preserve immediate board-color changes on captured cells
- ensure sidebar scores continue to derive from final ownership counts
- confirm no stale intermediate state is visible between move, capture, and
  score update
- decide whether any lightweight copy adjustment is needed to reflect the new
  gameplay behavior

Dependencies:

- final board state shape from Workstream 2
- current derived scoreboard behavior

Major risks:

- accidental mismatch between rendered owner colors and derived score counts
- UI components assuming only directly clicked cells can change per move

### Workstream 4: Validation and regression hardening

Purpose:
Prove the new increment works for corners, edges, interiors, captures, empty
neighbor fills, and the explicit no-chain-reaction boundary.

Main responsibilities:

- extend unit coverage around move resolution helpers and public shell behavior
- define manual checks for visible board-color and score synchronization
- confirm unchanged behavior for non-exploding turns and invalid moves
- document residual risks for the later sweep-based increment

Dependencies:

- completion of the preceding workstreams

Major risks:

- relying on happy-path testing and missing edge-position behavior
- under-testing the deliberate partial-rule boundary against future regressions

## 9. Phased Execution Plan

### Phase 1: Rule clarification and execution framing

Objective:
Lock the minimal rule decisions needed for the single-explosion increment
before changing state logic.

Key tasks:

- confirm the implementation uses liberty-derived thresholds from
  `papers/game-overview.md`
- confirm neighbor handling includes diagonals only within board bounds
- confirm the increment ends after the originating explosion even if any cell
  remains overloaded
- confirm the existing occupied-field scoreboard remains purely derived from
  final ownership

Dependencies:

- source specification
- current frontend move and score behavior

Entry criteria:

- approved specification is available

Exit criteria:

- no rule ambiguity remains around thresholds, neighbor set, score basis, or
  stop condition

### Phase 2: Gameplay helper and state-model preparation

Objective:
Prepare the helper-level rule structure needed to keep explosion logic readable
and extensible without committing to sweep support yet.

Key tasks:

- define the planning-level boundaries between generic board-rule helpers and
  single-move orchestration
- determine whether existing shared types are sufficient or whether small
  supporting types would improve clarity
- identify the board-cloning and state-derivation path that remains the single
  source of truth during a move

Dependencies:

- Phase 1 decisions

Entry criteria:

- rule assumptions are documented

Exit criteria:

- the later implementation can add explosion behavior without mixing state,
  view, and validation concerns

### Phase 3: Single-explosion move resolution

Objective:
Extend the move path so reinforcing or claiming a cell can trigger one complete
originating explosion and produce one final board state.

Key tasks:

- keep existing valid-move behavior for empty claims and self-reinforcement
- evaluate overload only on the just-played cell
- distribute load to valid neighbors and transfer ownership immediately
- reduce the originating cell by the number of receiving neighbors
- keep turn advancement and round progression aligned with the resolved move

Dependencies:

- Phase 2 structure decisions

Entry criteria:

- helper boundaries and state flow are clear

Exit criteria:

- one move results in a correct final board for both exploding and
  non-exploding cases

### Phase 4: Presentation synchronization

Objective:
Verify the existing board and sidebar presentation layers consume the updated
board state cleanly and reflect captures in the same UI update.

Key tasks:

- confirm `GameBoard` reflects transferred ownership through existing owner
  color rendering
- confirm `PlayerSidebar` score entries update from the final board ownership
  counts
- adjust any user-facing copy only if the current wording becomes misleading

Dependencies:

- Phase 3 final board behavior

Entry criteria:

- move resolution produces stable post-explosion state

Exit criteria:

- visible ownership and visible score stay synchronized after every resolved
  move

### Phase 5: Validation and review preparation

Objective:
Make the increment reviewable by covering the critical rules, edge cases, and
intentional non-features.

Key tasks:

- add unit scenarios for corner, edge, and interior explosions
- add tests for empty-cell capture, opponent capture, self-owned neighbor
  reinforcement, and no-explosion turns
- add tests proving recipient overload does not trigger further explosions
- run the available frontend validation suite and perform focused manual board
  checks

Dependencies:

- completion of Phases 3 and 4

Entry criteria:

- gameplay and UI behavior are functionally complete for the increment

Exit criteria:

- validation evidence exists for the accepted scope and the explicit scope
  boundary

## 10. Task Breakdown

### T1. Establish rule helpers and state boundaries

- Title: Define explosion-rule helper responsibilities
- Description: Identify the minimal helper responsibilities for liberty count,
  overload checks, and neighbor collection so the move-resolution path stays
  readable.
- Purpose: Prevent the first explosion increment from becoming tangled with
  component rendering or future sweep orchestration.
- Dependencies: Source specification; `papers/game-overview.md`
- Affected area: `frontend/src/composables/useGameShell.ts`,
  `frontend/src/types/game.ts`
- Notes or risks: Over-fragmenting the first increment would add complexity;
  under-structuring it would make later sweep work harder.

### T1.1

- Title: Define allowed-load calculation
- Description: Plan the rule representation for corner, edge, and interior
  thresholds so the just-played cell can be evaluated consistently.
- Purpose: Keep threshold behavior aligned with the canonical liberty model.
- Dependencies: T1
- Affected area: `frontend/src/composables/useGameShell.ts`
- Notes or risks: Threshold naming should stay compatible with later full-rule
  terminology.

### T1.2

- Title: Define neighbor collection model
- Description: Plan how valid neighboring cells are identified within board
  bounds, including diagonals, for all board positions.
- Purpose: Support consistent load distribution and future re-use.
- Dependencies: T1
- Affected area: `frontend/src/composables/useGameShell.ts`
- Notes or risks: Neighbor ordering is not functionally important for this
  increment but should not be made harder to add later.

### T2. Extend move resolution for one originating explosion

- Title: Update `playMove` orchestration
- Description: Plan the state transition so one move can apply the played load,
  detect overload on the played cell, optionally resolve exactly one explosion,
  and then advance turn state.
- Purpose: Keep the move lifecycle authoritative in one place.
- Dependencies: T1, T1.1, T1.2
- Affected area: `frontend/src/composables/useGameShell.ts`
- Notes or risks: Turn and round advancement must occur after the final board
  state is determined.

### T2.1

- Title: Plan non-exploding path preservation
- Description: Preserve the existing claim/reinforce behavior when the played
  cell does not exceed its allowed load.
- Purpose: Avoid regressions in current gameplay.
- Dependencies: T2
- Affected area: `frontend/src/composables/useGameShell.ts`
- Notes or risks: This path should remain easy to compare against current
  behavior in tests.

### T2.2

- Title: Plan single-explosion board mutation sequence
- Description: Sequence the originating cell reduction, neighbor load
  increments, and ownership transfers so one final board state results from the
  move.
- Purpose: Make the partial explosion rule explicit and reviewable.
- Dependencies: T2
- Affected area: `frontend/src/composables/useGameShell.ts`
- Notes or risks: The sequence must preserve the rule that the exploding field
  remains on the board with the remainder load.

### T2.3

- Title: Plan no-chain-reaction stop condition
- Description: Ensure the move-resolution design stops after the first
  originating explosion even if the resulting board contains overloaded cells.
- Purpose: Protect the scope boundary promised by the specification.
- Dependencies: T2.2
- Affected area: `frontend/src/composables/useGameShell.ts`
- Notes or risks: This is a likely future-regression point once sweep logic is
  introduced later.

### T3. Keep visual ownership and score derivation aligned

- Title: Verify presentation consumes final ownership state
- Description: Plan the small presentation adjustments, if any, needed so
  board colors and sidebar scores reflect captures immediately from the same
  resolved board state.
- Purpose: Meet the immediate consistency requirement without duplicating score
  state.
- Dependencies: T2
- Affected area: `frontend/src/components/GameBoard.vue`,
  `frontend/src/components/PlayerSidebar.vue`
- Notes or risks: Existing UI may already be sufficient if no intermediate
  state leaks into rendering.

### T3.1

- Title: Review scoreboard wording
- Description: Check whether the sidebar copy still accurately describes score
  updates once captures can change multiple fields in one move.
- Purpose: Keep user-facing messaging truthful to the increment.
- Dependencies: T3
- Affected area: `frontend/src/components/PlayerSidebar.vue`
- Notes or risks: This may be optional if current copy remains accurate.

### T4. Expand automated validation

- Title: Add gameplay regression coverage
- Description: Plan unit-level validation around helper behavior, move
  resolution outcomes, and shell-visible score updates.
- Purpose: Catch rule regressions before later explosion increments build on
  this one.
- Dependencies: T2, T3
- Affected area: `frontend/src/composables/useGameShell.spec.ts`
- Notes or risks: Tests should cover both domain correctness and user-visible
  consequences.

### T4.1

- Title: Cover board-position edge cases
- Description: Add scenarios for corner, edge, and interior explosions with
  the correct affected-neighbor counts.
- Purpose: Validate liberty-derived thresholds and adjacency handling.
- Dependencies: T4
- Affected area: `frontend/src/composables/useGameShell.spec.ts`
- Notes or risks: These cases guard against off-by-one and bounds mistakes.

### T4.2

- Title: Cover ownership-transfer score outcomes
- Description: Add scenarios for empty-neighbor acquisition, opponent capture,
  and already-owned neighboring cells so score changes are validated from final
  ownership counts.
- Purpose: Ensure the visible score impact matches the board result.
- Dependencies: T4
- Affected area: `frontend/src/composables/useGameShell.spec.ts`
- Notes or risks: Score assertions should remain board-derived rather than
  tied to a second scoring mechanism.

### T4.3

- Title: Cover explicit non-features
- Description: Add scenarios proving recipient overload and post-explosion
  remainder states do not trigger additional explosions in this increment.
- Purpose: Lock in the staged rollout boundary for future work.
- Dependencies: T4
- Affected area: `frontend/src/composables/useGameShell.spec.ts`
- Notes or risks: This is especially important before later sweep work begins.

### T5. Manual validation and review packaging

- Title: Prepare review evidence
- Description: Plan focused manual checks and concise implementation notes so
  review can confirm behavior against the specification.
- Purpose: Make the increment easy to verify end to end.
- Dependencies: T4
- Affected area: frontend runtime verification; `papers`
- Notes or risks: Manual verification should explicitly include capture colors,
  score updates, and unchanged invalid-move behavior.

## 11. Dependency Map

- The liberty/allowed-load rule model must be clarified before `playMove`
  sequencing can be updated safely.
- Neighbor collection behavior must be settled before explosion reduction and
  ownership transfer can be planned accurately.
- Final-board move resolution must exist before UI synchronization can be
  reviewed, because both board colors and scoreboard entries derive from the
  resulting ownership state.
- Automated regression coverage depends on the chosen move-resolution shape,
  but validation scenarios should be identified early so helper and state
  boundaries support them cleanly.
- Manual review preparation depends on both gameplay correctness and the
  sidebar/board remaining synchronized in practice.

## 12. Technical Decision Points

### Decision 1: Where the explosion rules live

- Why it matters: The first increment should keep gameplay rules centralized
  without over-engineering a full rules engine.
- Options: keep the logic in `useGameShell.ts` with small helper extraction, or
  introduce a separate gameplay-rules module now.
- Impact of delaying: Delaying this choice can lead to a half-structured move
  path that is harder to extend during the later sweep increment.

### Decision 2: Whether to extend shared types for move-resolution clarity

- Why it matters: Small supporting types could improve readability for
  neighbors or intermediate move outcomes, but unnecessary type growth would
  add noise.
- Options: stay with existing `Cell` / `GameState` shapes only, or add small
  supporting internal/shared types where they improve clarity.
- Impact of delaying: Implementation may drift into anonymous object shapes or
  deeply nested logic.

### Decision 3: How explicit to make the no-chain-reaction boundary

- Why it matters: This increment intentionally stops early, and the plan should
  prevent accidental future checks from slipping in.
- Options: express the stop condition purely in the move path, or isolate a
  named single-explosion resolution step that clearly terminates.
- Impact of delaying: The staged scope boundary may become unclear in code and
  in tests.

### Decision 4: Whether sidebar copy needs adjustment

- Why it matters: Score wording that was accurate for single-cell moves might
  undersell capture-driven swings.
- Options: keep current copy if still truthful, or slightly revise messaging to
  mention ownership changes through explosions.
- Impact of delaying: Low implementation risk, but potential UX mismatch during
  manual review.

## 13. Risks and Complexity Drivers

- The feature intentionally implements only part of the canonical explosion
  rules, so the biggest complexity driver is preserving a clean path toward
  sweep-based chain reactions without leaking them into this increment.
- Score changes are derived from ownership, so any mistake in neighbor transfer
  logic will surface immediately as a visible board/score inconsistency.
- Board-position rules vary by corner, edge, and interior cells, which makes
  adjacency and threshold handling a likely source of off-by-one errors.
- The current UI appears to assume that the clicked cell is the main change per
  move; explosion behavior introduces multi-cell updates and therefore raises
  regression risk in rendering and perception.
- Future increments will likely need neighbor-order and sweep-order rules from
  `papers/game-overview.md`; this increment should avoid helper designs that
  make those rules harder to add later.

Mitigation ideas:

- keep the first increment small and explicitly terminated after one explosion
- add dedicated tests for each board-position category
- keep scores derived from the final board instead of adding parallel scoring
  state
- treat the no-chain-reaction rule as a first-class validation target

## 14. Assumptions

- All gameplay changes for this increment remain in the frontend layer.
- The just-played cell is always either empty or already owned by the active
  player under current move constraints.
- The scoreboard should remain derived from occupied-field ownership counts
  rather than from a separately tracked score total.
- Existing board rendering already supports immediate ownership-color changes as
  long as the final board state is correct.
- No backend persistence or API contract is needed before this increment can be
  implemented and validated.

## 15. Open Questions / Blockers

- Open question: Should the sidebar explanatory copy be updated to mention that
  scores can now shift through explosion captures, or is the current wording
  considered sufficient?
- Nice-to-clarify point: Should the implementation introduce helper naming that
  already mirrors future terms like "liberties" and "sweeps," or stay more
  increment-local until the full rule set lands?

No blocking product questions are identified for implementation planning.

## 16. Testing and Validation Plan

- Unit-test the move-resolution behavior for non-exploding claims and
  reinforcements.
- Unit-test overload detection for corner, edge, and interior thresholds.
- Unit-test neighbor distribution counts for each board-position category.
- Unit-test ownership transfer outcomes for empty, enemy-owned, and already
  friendly neighboring cells.
- Unit-test score derivation after capture-heavy explosions using the final
  board state.
- Unit-test the explicit stop condition when recipient cells become overloaded.
- Run the frontend validation commands already used by the project, including
  the relevant test suite and any available type-check/build checks.
- Perform manual browser checks to confirm board colors and sidebar scores
  update together after an explosion-triggering move.

## 17. Rollout / Release Considerations

- No feature flag is expected for this frontend-local increment unless the team
  wants a temporary branch-only review flow.
- Because the change alters core move behavior, manual regression checks should
  include standard non-explosion turns to confirm existing gameplay still
  behaves as before.
- This increment should be communicated as a staged rollout of the full
  explosion mechanic, not as the complete chain-reaction rule set.
- Rollback is straightforward at the branch/change level because no backend,
  persistence, or migration work is involved.

## 18. Documentation Impact

- The new plan document must be tracked in `papers/in-progress`.
- Implementation follow-up may need a short note in user-facing or reviewer
  copy to explain that explosions now exist in single-step form only.
- When the feature is completed, the spec and plan should be moved to the
  corresponding `papers/done` directories per repository workflow.

## 19. Suggested Delivery Slices

### Slice A: Rule and state foundation

- allowed-load model
- neighbor discovery model
- single-explosion move sequencing

### Slice B: Visible gameplay integration

- board-state application
- ownership transfer
- scoreboard and board-color synchronization

### Slice C: Validation and review hardening

- automated regression coverage
- manual scenario verification
- review notes on the intentional no-chain-reaction boundary

## 20. Implementation Readiness Checklist

- Source specification is accepted as the implementation baseline.
- The liberty-derived threshold model is agreed for corner, edge, and interior
  cells.
- The single-explosion stop condition is explicitly accepted as part of this
  increment.
- The current frontend ownership-based scoreboard remains the agreed scoring
  basis.
- Affected frontend files and responsibilities are understood.
- Validation expectations cover both exploding and non-exploding turns.
- No blocking product or architecture questions remain unresolved.

## 21. Definition of Done for Planning

This implementation plan is complete when:

- the workstreams for rule foundation, move resolution, UI synchronization, and
  validation are identified
- sequencing and dependencies are explicit
- tasks are concrete enough for execution without containing code
- the staged boundary versus future chain-reaction work is visible
- testing and rollout expectations are documented
- the plan can be used directly as the execution guide for the next
  implementation step
