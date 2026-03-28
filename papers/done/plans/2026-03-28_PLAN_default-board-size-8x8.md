# Implementation Plan: Default Board Size Alignment to 8x8

## 1. Title

Default Board Size Alignment to 8x8 - Implementation Plan

## 2. Summary

This plan covers a narrow frontend-and-documentation refactor that aligns the
implemented default board size with the canonical game overview by changing the
default board from 10x10 to 8x8. The work also preserves the board's shell
footprint so cells become larger, removes duplicated size assumptions that
block future configurability work, and corrects older completed specs and plans
that still refer to 10x10 as the default board.

## 3. Source Specification

- Feature title: `Default Board Size Alignment to 8x8`
- Date: `2026-03-28`
- Status: `In progress`
- Reference: `papers/done/specs/2026-03-28_SPEC_default-board-size-8x8.md`
- Canonical product context: `papers/game-overview.md`

## 4. Planning Goals

- Align code and papers with the canonical 8x8 default board size.
- Keep the execution narrow and frontend-focused.
- Preserve current gameplay behavior while updating board dimensions.
- Reduce duplicated hard-coded size assumptions so later configurable board-size
  work has a cleaner starting point.
- Validate both documentation alignment and gameplay regression safety.

## 5. Scope of This Plan

This plan covers:

- frontend board-size initialization updates
- frontend board rendering and layout updates needed to keep the board footprint
  stable with larger cells
- unit-test updates where the default board size affects expectations
- completed spec and plan corrections for stale 10x10 default references
- lightweight learnings updates if implementation reveals reusable guidance

## 6. Out of Scope

This plan does not cover:

- backend or API work
- user-configurable board sizes
- persistence of board dimensions
- new gameplay rules, balance changes, or visual redesign beyond the board-size
  refactor
- broad rewrites of historical papers unrelated to board-size references

## 7. Affected Areas

- `papers/in-progress` for the active spec and plan
- completed papers in `papers/done/specs` and `papers/done/plans` that still
  mention `10x10`
- frontend game-state setup in `frontend/src/composables/useGameShell.ts`
- frontend board rendering in `frontend/src/components/GameBoard.vue`
- frontend shell sizing in `frontend/src/App.vue` if needed to preserve board
  footprint
- frontend tests in `frontend/src/composables/useGameShell.spec.ts`
- `LEARNINGS.md` if a durable implementation lesson emerges

## 8. Workstreams

### Workstream 1: Documentation alignment

Purpose:
Remove internal project drift by aligning active and completed papers to the
canonical default board size.

Main responsibilities:

- create the new active spec and plan
- update older completed specs/plans that still describe the default board as
  10x10
- keep paper edits narrow and factual

Dependencies:

- confirmation that `papers/game-overview.md` remains authoritative

Major risks:

- unintentionally rewriting historical scope instead of correcting factual
  board-size references

### Workstream 2: Frontend board-size refactor

Purpose:
Change the default board dimension in the implementation and remove duplicated
size assumptions.

Main responsibilities:

- update board initialization from 10 to 8
- centralize board-dimension usage where duplicated
- update presentation code so grid columns track the active board

Dependencies:

- Workstream 1 for the approved scope baseline

Major risks:

- leaving hidden `10` assumptions in CSS or tests
- shrinking the visible board instead of enlarging cells

### Workstream 3: Validation and regression safety

Purpose:
Confirm the size refactor preserves gameplay behavior and shell expectations.

Main responsibilities:

- update or add unit assertions tied to default board dimensions
- run relevant frontend validation commands
- manually confirm the board footprint/cell-size outcome if practical

Dependencies:

- Workstream 2 implementation changes

Major risks:

- tests continuing to pass while presentation still assumes ten columns
- incomplete manual verification of the visual footprint requirement

## 9. Phased Execution Plan

### Phase 1: Documentation baseline

Objective:
Create the active specification and plan, then identify the historical paper
references that need correction.

Key tasks:

- add the new in-progress spec
- add the matching in-progress plan
- update completed papers that still mention `10x10` as the default

Dependencies:

- `papers/game-overview.md`

Entry criteria:

- canonical product overview is available

Exit criteria:

- the active slice is documented and historical drift points are corrected

### Phase 2: Frontend implementation

Objective:
Refactor the frontend so the default board is 8x8 and the board footprint is
preserved.

Key tasks:

- update the default board-size constant
- derive board rendering from the active board dimensions
- adjust layout sizing as needed so the board stays visually prominent and
  cells become larger

Dependencies:

- Phase 1 scope definition

Entry criteria:

- implementation scope is clear and bounded

Exit criteria:

- the board initializes and renders correctly as 8x8 with larger fields

### Phase 3: Test and validation pass

Objective:
Confirm the refactor is safe and ready to hand off.

Key tasks:

- update unit tests for board-size assumptions
- run frontend tests and other relevant validation
- record any reusable learning from the change

Dependencies:

- Phase 2 code changes

Entry criteria:

- code and paper updates are complete

Exit criteria:

- validation results are captured and remaining limitations are explicit

## 10. Task Breakdown

- T1. Create the active feature spec in `papers/in-progress`.
  Purpose: establish approved scope before implementation.
  Dependencies: none.
  Affected area: documentation.

- T2. Create the matching implementation plan in `papers/in-progress`.
  Purpose: define execution order and validation scope.
  Dependencies: T1.
  Affected area: documentation.

- T3. Correct completed specs and plans that still refer to a `10x10` default
  board.
  Purpose: remove documentation drift with the canonical overview.
  Dependencies: T1.
  Affected area: documentation.
  Notes/Risks: keep edits limited to stale default-size references.

- T4. Update frontend board initialization and shared dimension assumptions.
  Purpose: make 8x8 the real default board in code.
  Dependencies: T2.
  Affected area: frontend state/composable.

- T5. Update board rendering/layout so the visual board footprint is preserved
  and individual cells enlarge.
  Purpose: satisfy the UX requirement introduced by the smaller grid.
  Dependencies: T4.
  Affected area: frontend UI/layout.

- T6. Update automated tests affected by the new default board size.
  Purpose: keep regression coverage aligned with the new default.
  Dependencies: T4, T5.
  Affected area: frontend tests.

- T7. Run validation and capture learnings if the change reveals durable
  project guidance.
  Purpose: finish the increment with explicit validation status.
  Dependencies: T3, T4, T5, T6.
  Affected area: validation/documentation.

## 11. Dependency Map

- The active spec must exist before planning and implementation.
- Historical paper corrections depend on the canonical overview, not on code
  changes.
- The board-size constant update should happen before template/CSS cleanup so
  rendering changes can follow a single source of truth.
- Test updates should follow the code changes they validate.
- Learnings updates, if any, should be written after implementation findings
  are concrete.

## 12. Technical Decision Points

### Decision 1: Source of truth for board dimensions

Why it matters:
Future configurable-size work will be harder if board size remains duplicated
across state and presentation.

Options at a high level:

- keep a single exported default dimension constant and derive rendering from
  live board data
- introduce a wider board-dimension structure immediately

Impact of delaying the decision:
This refactor could remove the obvious `10` literals but still leave the next
feature with cleanup debt.

### Decision 2: How to preserve board footprint

Why it matters:
An 8x8 board can unintentionally appear visually smaller if container sizing is
left implicit.

Options at a high level:

- keep the existing board container limit and let cells expand naturally
- add explicit board-size or cell-size adjustments if the current shell causes
  shrinkage

Impact of delaying the decision:
The code could be logically correct while missing the intended UX benefit.

## 13. Risks and Complexity Drivers

- Presentation code currently hard-codes a ten-column grid, so the visual board
  can drift from the logical board if both are not updated together.
- Historical paper updates can become noisy if they are not tightly scoped to
  stale board-size references.
- Explosion-related tests must continue to target valid positions on a smaller
  default board.

Mitigation ideas:

- search broadly for `10x10`, `10×10`, and hard-coded grid-column assumptions
- keep documentation edits narrowly textual
- rerun frontend unit coverage after the board-size change

## 14. Assumptions

- The frontend is the only implemented gameplay layer affected by this change.
- Keeping the existing board container bounds will be sufficient, or nearly
  sufficient, to enlarge cells once the grid drops to 8x8.
- No user-facing board-size selector should appear in this increment.

## 15. Open Questions / Blockers

- No blocker is currently visible.
- Nice-to-clarify: whether any completed paper wording should explicitly say
  "default board" rather than rewriting every historical mention of a rendered
  grid.

## 16. Testing and Validation Plan

- Run frontend unit tests covering setup, move flow, explosions, and shell
  behavior.
- Run frontend build and/or type-aware validation if configured and practical.
- Manually verify that the rendered board is 8x8 and the cells are larger while
  the board remains visually prominent in the shell.
- Confirm documentation search results no longer leave stale `10x10` default
  references in completed specs/plans.

## 17. Rollout / Release Considerations

- This is a small frontend-and-documentation correction, so no feature flag is
  expected.
- Because the change alters the default visual density of the main board,
  manual visual verification should accompany automated tests before merge.

## 18. Documentation Impact

- Add the active spec and plan for this increment.
- Correct stale default-size references in completed specs/plans.
- Update `LEARNINGS.md` only if the implementation reveals a reusable rule about
  board-dimension handling or shell sizing.

## 19. Suggested Delivery Slices

### Slice A: Paper alignment

- T1
- T2
- T3

Outcome:
The requested refactor is documented and previous paper drift is corrected.

### Slice B: Frontend refactor and validation

- T4
- T5
- T6
- T7

Outcome:
The live app renders an 8x8 default board with larger cells and validated
behavior.

## 20. Implementation Readiness Checklist

- [x] Canonical board default confirmed from `papers/game-overview.md`.
- [x] Active specification exists.
- [x] Active implementation plan exists.
- [x] Affected documentation and frontend areas are identified.
- [x] Validation expectations are defined.
- [x] Configurable board size is explicitly deferred.

## 21. Definition of Done for Planning

This implementation plan is complete when:

- the paper-alignment and frontend-refactor work is decomposed clearly
- execution order is explicit
- validation expectations are visible
- future configurability prep is scoped without expanding into a new feature
