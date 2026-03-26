# Implementation Plan: Game Shell & Player Setup

## 1. Title

Game Shell & Player Setup - Implementation Plan

## 2. Summary

This plan covers the first playable frontend increment of `AI Explode`: a
desktop-oriented application shell, a player setup flow for 2 to 4 players, a
game start transition, and a live 10x10 board view with simplified turn-based
cell claiming. The goal is to deliver a polished interactive vertical slice
that validates layout, state flow, and core frontend structure without
implementing explosion mechanics, elimination, win detection, persistence, or
backend integration.

## 3. Source Specification

- Feature title: `SPEC: Game Shell & Player Setup`
- Date: `2026-03-25`
- Status: `Draft`
- Reference: `papers/game-overview.md`
- Additional note: the source specification for this plan was provided in the
  task input and is treated as the authoritative feature brief for this
  planning step.

## 4. Planning Goals

- Define a safe execution order for the first frontend increment.
- Keep implementation strictly within the frontend layer.
- Establish a reusable state foundation for later game mechanics.
- Separate UI concerns from game-state logic early enough to avoid coupling.
- Identify validation, testing, and UX hardening work needed before review.

## 5. Scope of This Plan

This plan covers:

- frontend-only implementation in `frontend`
- application shell and layout structure
- setup screen for configuring 2 to 4 players
- predefined player color handling and setup validation
- game start transition from setup to playing phase
- 10x10 board rendering with simplified ownership and load display
- active player indicator, round tracking, and scoreboard updates
- turn advancement after valid moves
- desktop-ready visual polish and responsive behavior for >=1024px widths
- targeted validation and unit testing for core state logic where practical

## 6. Out of Scope

This plan does not cover:

- PHP backend changes
- HTTP APIs or persistence
- explosion and sweep resolution logic
- elimination and winner detection
- reset/new game flow after entering the game screen
- mobile-first optimization
- advanced animation, audio, or effects
- speculative state architecture for later multiplayer or online features

## 7. Affected Areas

- `frontend` application bootstrap and shell composition
- frontend game setup UI
- frontend board and player panel components
- frontend game-state composables or equivalent local state layer
- frontend styling tokens and component-level CSS
- frontend tests for validation and turn/state transitions
- documentation in `papers` only if implementation follow-up requires updates

## 8. Workstreams

### Workstream 1: UI foundation and visual system

Purpose:
Create the shell structure, layout regions, and a consistent visual language
for setup and play views.

Main responsibilities:

- define top-level page structure
- establish spacing, typography, color token usage, and panel/card styling
- ensure the board and sidebar fit coherently in desktop layouts

Dependencies:

- agreement on the four-player color palette
- confirmation that desktop-first responsiveness is sufficient

Major risks:

- layout work becoming tightly coupled to unfinished game logic
- over-designing visual details before state flow is stable

### Workstream 2: Setup flow and validation

Purpose:
Deliver a setup experience that supports 2 to 4 players with clear constraints
and a reliable start gate.

Main responsibilities:

- model player configuration rows
- enforce minimum and maximum player count
- validate required names and unique colors
- expose derived form validity to the start action

Dependencies:

- color option data structure
- game-state initialization contract for the start action

Major risks:

- validation rules becoming scattered across components
- color availability logic becoming inconsistent between UI and state

### Workstream 3: Game-state foundation

Purpose:
Introduce a clear frontend state model for setup, board state, active player,
round progression, and scoreboard data.

Main responsibilities:

- define the initial board state and player state initialization flow
- centralize simplified move validation and turn advancement
- derive scoreboard counts and active-player metadata from source state

Dependencies:

- finalized setup payload shape
- agreement on whether round increments at end-of-cycle or start-of-cycle

Major risks:

- embedding turn rules directly in view components
- shaping state in a way that blocks later explosion mechanics

### Workstream 4: Board interaction and play view

Purpose:
Render the board and connect valid click behavior to the simplified game-state
rules.

Main responsibilities:

- render a 10x10 interactive grid
- display ownership and load values for occupied cells
- block invalid interactions on opponent-owned cells
- reflect active player changes immediately after valid moves

Dependencies:

- stable state actions from Workstream 3
- visual decisions on how cell load is displayed

Major risks:

- board rendering and click handling becoming overly stateful inside cells
- unclear visual affordances for disabled or inert cells

### Workstream 5: Validation, testing, and hardening

Purpose:
Reduce regressions in the new state flow and ensure the feature is reviewable.

Main responsibilities:

- add unit coverage for setup validation and simplified move rules where feasible
- manually verify acceptance criteria in a browser
- confirm no backend or API assumptions leaked into the frontend

Dependencies:

- implemented setup and board interaction flow

Major risks:

- relying only on manual QA for turn and round sequencing
- missing edge-case coverage around invalid moves and player configuration

## 9. Phased Execution Plan

### Phase 1: Clarification and technical preparation

Objective:
Confirm the small unresolved UX decisions and choose the minimal frontend
structure needed for this increment.

Key tasks:

- confirm the canonical four-color palette and naming
- decide whether load is displayed as a number for this increment
- identify the component and composable boundaries for setup and gameplay
- verify existing frontend tooling conventions before introducing patterns

Dependencies:

- source specification
- existing frontend scaffold, if already present

Entry criteria:

- approved specification is available

Exit criteria:

- palette, load display, and high-level state ownership decisions are clear

### Phase 2: State foundation and domain modeling

Objective:
Create the state structures and state transitions that drive both the setup and
play views.

Key tasks:

- define the player configuration, color option, cell, and game-state models
- define board initialization and game start initialization rules
- define state transitions for valid and invalid moves
- define round and active-player advancement rules
- define derived selectors for available colors, active player, and field counts

Dependencies:

- Phase 1 decisions

Entry criteria:

- planning decisions for core data shapes are clear

Exit criteria:

- the frontend has a single clear source of truth for setup and gameplay state

### Phase 3: Setup screen implementation

Objective:
Implement the pre-game configuration flow and its validations.

Key tasks:

- render two default player slots
- support add/remove player controls within 2 to 4 bounds
- connect name input and color selection UI to state
- surface validation and disabled state for the start action
- keep setup UI visually polished and easy to scan

Dependencies:

- Phase 2 state foundation

Entry criteria:

- setup models and validation rules are defined

Exit criteria:

- a valid player roster can be configured and used to start a session

### Phase 4: Game shell and board view implementation

Objective:
Build the main play screen and connect the board to the simplified turn flow.

Key tasks:

- render the header, board area, and player panel
- show the active player indicator prominently
- render board cells with empty, owned, and disabled states
- wire valid cell interactions to ownership/load changes
- update the scoreboard and round display after each valid action

Dependencies:

- Phase 2 state actions
- Phase 3 game start flow

Entry criteria:

- the app can transition from setup to playing

Exit criteria:

- the app supports a complete simplified turn loop for 2 to 4 configured players

### Phase 5: Validation and polish

Objective:
Verify acceptance criteria, stabilize edge cases, and prepare the increment for
review.

Key tasks:

- test invalid clicks on opponent-owned cells
- test own-cell reinforcement and empty-cell claiming
- test color uniqueness and required-name validation
- test turn advancement across 2-, 3-, and 4-player games
- confirm the layout remains clean on desktop viewport widths
- refine visual affordances for active player, selected colors, and inert cells

Dependencies:

- completed setup and play flows

Entry criteria:

- the end-to-end happy path is working

Exit criteria:

- acceptance criteria are satisfied and the feature is ready for review

## 10. Task Breakdown

### Task Group A: Frontend structure

- A1. Inspect the existing `frontend` scaffold and identify the current entry
  points.
- A2. Define the top-level shell composition for setup and playing phases.
- A3. Establish shared styling primitives for panels, buttons, inputs, and cell
  states.

### Task Group B: Player setup domain and UI

- B1. Define the canonical player color option dataset.
- B2. Define setup-state handling for default players, add/remove controls, and
  field updates.
- B3. Implement name validation and unique-color validation.
- B4. Implement setup UI feedback and disabled/enabled start action behavior.

### Task Group C: Game-state composable or equivalent state layer

- C1. Define board initialization for a 10x10 empty grid.
- C2. Define the `start game` transition that materializes setup into play
  state.
- C3. Define valid move handling for empty, own, and opponent-owned cells.
- C4. Define turn advancement and round progression.
- C5. Define derived scoreboard counts and active-player metadata.

### Task Group D: Playing view

- D1. Implement the board grid rendering.
- D2. Implement the cell presentation for ownership and load values.
- D3. Implement the player panel and active-player emphasis.
- D4. Integrate status text or footer information if included in the selected
  layout.

### Task Group E: Testing and verification

- E1. Add unit tests for setup validation logic.
- E2. Add unit tests for simplified move and turn advancement rules.
- E3. Perform manual validation against the acceptance criteria.
- E4. Record any deferred follow-up items for the full game mechanics feature.

## 11. Sequencing and Dependencies

- Work on state modeling before finalizing interaction-heavy UI wiring.
- Complete setup validation before enabling the setup-to-game transition.
- Keep board interaction dependent on centralized state actions rather than
  component-local rules.
- Defer nonessential polish until the simplified turn loop is working end to
  end.
- Treat tests for setup validation and move progression as the minimum useful
  automated safety net.

## 12. Validation Strategy

Recommended validation for this increment:

- unit tests for:
  - name trimming and required-name validation
  - unique-color enforcement
  - player add/remove boundaries
  - valid move outcomes for empty, own, and opponent-owned cells
  - active-player advancement
  - round increment after a full player cycle
- manual browser validation for:
  - default setup rendering
  - setup-to-game transition
  - scoreboard updates after each move
  - responsive desktop layout behavior
  - visual clarity of active player and disabled cells

## 13. Risks and Mitigations

- Risk: round progression is implemented inconsistently with future mechanics.
  Mitigation: keep round logic centralized and documented in one state layer.
- Risk: setup validation is duplicated across UI and state.
  Mitigation: derive form validity from shared validation logic, not isolated
  component checks.
- Risk: color-only ownership cues reduce accessibility.
  Mitigation: include initials, labels, or clear load text where useful and
  retain strong contrast.
- Risk: the board UI is built in a way that makes later explosion logic hard to
  integrate.
  Mitigation: keep move rules in a composable or equivalent state module and
  keep cells presentational where possible.
- Risk: optional liberty-hint visuals add clutter before core flow is stable.
  Mitigation: treat liberty hints as a non-blocking enhancement within this
  increment.

## 14. Assumptions

- This feature is frontend-only and requires no backend work.
- The game should start with exactly two empty player rows by default.
- The suggested four-color palette is acceptable unless refined during
  implementation.
- Displaying numeric load values inside cells is acceptable for this increment.
- The current increment should favor a composable/reactive local state approach
  over introducing Pinia unless the existing frontend already depends on it.
- Full mobile optimization is intentionally deferred.

## 15. Open Questions and Blockers

- Should cell ownership rely only on color, or should cells also include a
  player initial marker for better accessibility?
- Should subtle liberty-count hints be included in this increment, or deferred
  entirely to avoid visual noise?
- Is Tailwind already part of the intended frontend stack, or should styling
  stay purely in component-scoped CSS?

Current blocker status:

- No blocking dependency is visible for planning.
- Open questions are UX-level and can be resolved during implementation without
  changing scope.

## 16. Delivery and Review Readiness

This increment is ready for implementation once the frontend scaffold and the
small UX choices above are confirmed. The implementation should remain
deliberately narrow: setup flow, shell layout, simplified move handling, and
reviewable validation coverage. After this increment is complete, the next
logical follow-up is a dedicated specification and plan for explosion mechanics,
chain reactions, elimination, and win detection.
