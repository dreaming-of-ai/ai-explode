# Implementation Plan: Computer Player Support (Random)

## 1. Title

Computer Player Support (Random) - Implementation Plan

## 2. Summary

This plan covers the first frontend-only implementation of computer players in
`AI Explode`. The work adds per-slot human/computer configuration in the setup
flow, introduces a small registry for available computer-player definitions,
and executes automatic turns for the first computer player type, `Random`.

## 3. Source Specification

- Feature title: `SPEC: Computer Player Support (Random)`
- Date: `2026-03-28`
- Status: `Draft`
- Reference: `papers/game-overview.md`

## 4. Planning Goals

- Keep the implementation strictly inside `frontend`.
- Extend the current game-shell model without disturbing existing move
  resolution, elimination, or modal behavior.
- Make the first AI type easy to test and easy to extend later.
- Keep the setup UI changes focused and predictable.

## 5. Scope of This Plan

This plan covers:

- setup-state and runtime-state changes for human/computer player metadata
- a frontend registry for computer-player definitions with one entry: `Random`
- setup UI controls for controller choice and computer-player selection
- generated names for computer-controlled slots
- automatic scheduling and execution of computer turns in the shell composable
- test coverage for setup validation and auto-play behavior
- documentation updates in `papers/in-progress` and `LEARNINGS.md`

## 6. Out of Scope

This plan does not cover:

- backend or API changes
- advanced AI heuristics or lookahead
- persistence of preferred player setups
- new modal concepts or major UI redesign
- post-feature archival of papers to `papers/done`
- broader refactors unrelated to computer-player support

## 7. Affected Areas

- `frontend/src/types/game.ts`
- `frontend/src/composables/useGameShell.ts`
- `frontend/src/components/PlayerSetup.vue`
- `frontend/src/components/PlayerSidebar.vue`
- optional small frontend data registry for computer-player definitions
- `frontend/src/composables/useGameShell.spec.ts`
- `papers/in-progress`
- `LEARNINGS.md`

## 8. Workstreams

### Workstream 1: Data-model extension

Purpose:
Add the setup and runtime metadata needed to represent human and computer
players cleanly.

Main responsibilities:

- extend setup-player typing with controller and computer-player selection
- extend runtime player typing with computer metadata
- add helpers for generated naming and AI identification

Dependencies:

- source specification
- current setup and game-state structures

Major risks:

- leaking setup-only fields into unrelated runtime code
- creating brittle naming rules spread across components

### Workstream 2: Setup flow integration

Purpose:
Expose computer-player configuration in the existing player-setup modal while
preserving current add/remove and color-selection behavior.

Main responsibilities:

- add controller toggle UI per slot
- conditionally render the computer-player selector
- preserve human-name editing for human slots
- update validation rules and start-game gating

Dependencies:

- Workstream 1 data model

Major risks:

- validation becoming inconsistent across controller types
- setup UI becoming cluttered or unclear

### Workstream 3: Computer turn orchestration

Purpose:
Automatically execute legal moves for active computer-controlled players.

Main responsibilities:

- implement a pure helper that lists legal moves for the active player
- implement deterministic random-move selection for the `Random` AI
- schedule computer turns from the shell composable with modal-aware timing
- prevent manual board interaction during computer turns

Dependencies:

- Workstream 1 runtime metadata
- existing move execution and modal flow in `useGameShell.ts`

Major risks:

- timer behavior conflicting with result modals
- duplicated legal-move logic drifting away from the manual move path

### Workstream 4: Test and documentation hardening

Purpose:
Lock down the new setup rules and autoplay flow with targeted tests and capture
implementation learnings.

Main responsibilities:

- add validation tests for computer-controlled setup slots
- add logic tests for random move selection
- add shell-level tests for automatic computer turns
- record durable learning in `LEARNINGS.md`

Dependencies:

- implementation from Workstreams 1 to 3

Major risks:

- flaky timer-based tests
- under-testing modal interactions after computer turns

## 9. Phased Execution Plan

### Phase 1: Documentation and type foundations

Objective:
Create the active spec/plan and define the core controller and AI metadata.

Key tasks:

- add the active specification document
- add the matching implementation plan
- update setup/runtime types and helper signatures for human/computer players

Entry criteria:

- feature request is clear from the task and `papers/game-overview.md`

Exit criteria:

- docs exist in `papers/in-progress`
- the data model can represent `Random` computer players

### Phase 2: Setup-state and UI changes

Objective:
Enable computer-player configuration from the setup modal.

Key tasks:

- add a small computer-player registry for setup options
- update setup-player defaults and validation
- update `PlayerSetup.vue` to switch controller modes and show the AI selector
- keep generated computer names visible in the setup experience

Dependencies:

- Phase 1 complete

Entry criteria:

- controller and AI types are available

Exit criteria:

- a valid mixed human/computer roster can be configured from the UI

### Phase 3: Automatic turn execution

Objective:
Make the game shell play computer turns automatically and safely.

Key tasks:

- implement legal-move enumeration and random selection helpers
- add shell logic to schedule a computer move when the active player is an AI
- pause autoplay while modals are open or the game is concluded
- ensure manual board clicks are rejected during computer turns

Dependencies:

- Phase 2 complete
- existing move-result modal behavior remains intact

Entry criteria:

- runtime players carry AI metadata

Exit criteria:

- `Random` players can complete turns automatically in active matches

### Phase 4: Validation and learnings

Objective:
Verify behavior and capture durable implementation knowledge.

Key tasks:

- update unit tests around setup, move selection, and shell autoplay
- run frontend tests and production build
- append relevant learning to `LEARNINGS.md`

Dependencies:

- Phases 1 to 3 complete

Entry criteria:

- implementation is feature-complete for this slice

Exit criteria:

- validation passes or failures are clearly documented
- learning is recorded

## 10. Task Breakdown

- **T1** Create active feature docs
  - Add spec and plan files under `papers/in-progress`.
  - Purpose: satisfy the repository workflow before execution.
  - Affected area: documentation.

- **T2** Extend game types and setup helpers
  - Add controller/computer-player metadata to setup and runtime player models.
  - Purpose: let the shell represent human and computer players explicitly.
  - Depends on: T1.
  - Affected area: frontend state/types.

- **T3** Add computer-player definitions and naming helpers
  - Introduce a typed registry and generated-name helper for `Random`.
  - Purpose: centralize extensible AI metadata.
  - Depends on: T2.
  - Affected area: frontend state/data.

- **T4** Update setup validation and game-session creation
  - Enforce valid AI selection for computer slots and derive runtime names.
  - Purpose: ensure the roster is valid before gameplay begins.
  - Depends on: T2, T3.
  - Affected area: frontend state/composable.

- **T5** Update setup UI
  - Add controller toggles, AI select input, and generated-name presentation.
  - Purpose: expose the new feature to users without reworking the shell.
  - Depends on: T2, T3, T4.
  - Affected area: frontend components.

- **T6** Implement random legal-move selection
  - Add pure helpers to enumerate legal cells and choose one by indexable
    randomness.
  - Purpose: keep AI behavior testable and aligned with manual move rules.
  - Depends on: T2, T4.
  - Affected area: frontend composable logic.

- **T7** Implement modal-aware computer-turn scheduling
  - Trigger automatic turns after game start or after previous moves settle.
  - Purpose: support mixed and fully automated matches.
  - Depends on: T5, T6.
  - Affected area: frontend composable logic.

- **T8** Update tests and validate
  - Expand `useGameShell.spec.ts`; run tests and build.
  - Purpose: catch regressions and verify readiness.
  - Depends on: T4, T6, T7.
  - Affected area: frontend tests/validation.

- **T9** Record learnings
  - Append durable implementation guidance to `LEARNINGS.md`.
  - Purpose: support future computer-player work.
  - Depends on: T8.
  - Affected area: repository documentation.

## 11. Dependency Map

- T1 must precede all implementation work to satisfy the documented workflow.
- T2 and T3 underpin both setup UI changes and autoplay logic.
- T4 must land before T5 and T7 so both UI and runtime share the same model.
- T6 must exist before T7 so the autoplay loop uses the tested move-selection
  helper.
- T8 depends on the feature-complete implementation from T4 to T7.
- T9 depends on implementation and validation being complete enough to produce a
  durable learning.

## 12. Technical Decision Points

- Whether to keep computer-player definitions in the composable or a small
  dedicated data module.
- How to represent the generated display name while preserving any previously
  typed human name if the slot is toggled back.
- What small autoplay delay best balances readability and responsiveness.
- Whether `playCell` should remain UI-only while AI moves use a shared internal
  move executor.

## 13. Validation Strategy

- Run `npm test` in `frontend`.
- Run `npm run build` in `frontend`.
- Cover at least:
  - mixed human/computer setup validation
  - generated computer naming
  - random move selection staying within legal moves
  - autoplay after start or turn handoff
  - modal pause behavior indirectly through shell tests where practical

## 14. Risks / Blockers

- Timer-driven autoplay can create brittle tests if not isolated carefully.
- Existing modal sequencing must not accidentally trigger multiple queued AI
  turns.
- Fully automated matches could move very quickly, so a delay that is too short
  may reduce readability.

## 15. Assumptions

- No backend work is needed for this feature slice.
- The existing composable remains the single source of truth for turn flow.
- One shipped AI type is sufficient for the first computer-player increment.

## 16. Definition of Ready for Implementation

- Active spec and plan exist.
- Scope is limited to frontend setup plus autoplay for `Random`.
- No unresolved blockers remain for the first slice.

## 17. Definition of Done

- Setup supports human/computer configuration with `Random`.
- Runtime names for computer players follow the `Random N` format.
- Computer turns execute automatically and legally.
- Frontend tests and build are run.
- `LEARNINGS.md` contains any durable takeaway from the implementation.
