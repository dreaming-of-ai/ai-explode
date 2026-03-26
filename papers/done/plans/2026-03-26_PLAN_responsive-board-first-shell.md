# Implementation Plan: Responsive Board-First Shell and New Game Modal Refinement

## 1. Title

Responsive Board-First Shell and New Game Modal Refinement - Implementation Plan

## 2. Summary

This plan covers the next frontend refinement of `AI Explode`: keeping the
10x10 board visible from first render, moving player setup into a modal,
guarding restarts of unfinished games, tightening responsive layout behavior
so the board remains visible without page scrolling on supported viewports,
and updating player color assignment to follow ordered availability with
automatic downstream correction.

The work stays frontend-only and builds on the existing Vue shell,
`useGameShell` composable, board/sidebar components, and Vitest coverage. The
goal is to reshape the app shell without introducing new gameplay mechanics.

## 3. Source Specification

- Feature title: `Responsive Board-First Shell and New Game Modal Refinement`
- Date: `2026-03-26`
- Status: `In progress`
- Reference: `papers/in-progress/2026-03-26_SPEC_responsive-board-first-shell.md`

## 4. Planning Goals

- Define a safe refactor path from the current `setup`/`playing` full-screen
  split to a persistent board-first shell.
- Separate shell UI state, game session state, and modal state so later
  gameplay additions remain easy to layer in.
- Make responsive and accessibility work explicit rather than treating it as
  incidental styling cleanup.
- Break the feature into reviewable work packages that can be executed without
  mixing layout, state, and validation concerns.
- Surface unresolved product decisions that affect implementation details or
  acceptance testing.

## 5. Scope of This Plan

This plan covers:

- frontend-only changes in `frontend`
- persistent board-first shell composition from initial load onward
- replacing the full-page setup screen with a modal-based player setup flow
- restart warning flow for unfinished games
- score-summary derivation for restart warning content
- responsive layout changes needed to preserve board visibility
- ordered color-availability and downstream reassignment behavior
- accessibility, validation, testing, and rollout preparation for the refined
  shell

## 6. Out of Scope

This plan does not cover:

- PHP backend or API changes
- persistence or save/resume behavior
- multiplayer or online synchronization
- explosions, eliminations, winner detection, or other new gameplay rules
- celebratory end-of-game UX beyond state hooks needed for future support
- audio, advanced animation systems, or tutorial overlays
- speculative architectural changes not required for this shell refinement

## 7. Affected Areas

- top-level app shell composition in `frontend/src/App.vue`
- shell and session state in `frontend/src/composables/useGameShell.ts`
- shared state types in `frontend/src/types/game.ts`
- player setup presentation in `frontend/src/components/PlayerSetup.vue`
- board presentation and idle-state behavior in `frontend/src/components/GameBoard.vue`
- sidebar/status presentation in `frontend/src/components/PlayerSidebar.vue`
- shared layout and viewport styling in `frontend/src/styles.css`
- likely new modal-focused frontend components for setup and restart warning
- unit tests in `frontend/src/composables/useGameShell.spec.ts`
- any follow-up paper updates if implementation changes acceptance testing or
  usage guidance

## 8. Workstreams

### Workstream 1: Shell-state refactor

Purpose:
Replace the current page-level `setup` versus `playing` split with a persistent
shell that can show the board, status, and modal overlays independently.

Main responsibilities:

- define UI state for idle, active, and later-concluded sessions
- define modal state for setup and restart warning flows
- preserve a single source of truth for current session data and derived shell
  labels
- ensure new-game actions do not destroy the current game before confirmation

Dependencies:

- alignment on what counts as an unfinished game
- agreement on whether an untouched fresh game still requires restart warning

Major risks:

- overloading `GameState` with UI concerns
- creating ambiguous transitions between idle, active, and replacement flows

### Workstream 2: Modal UX and accessibility

Purpose:
Move setup into a focused modal and introduce a restart warning dialog with
clear, keyboard-friendly interaction.

Main responsibilities:

- define modal container and dismissal behavior
- preserve validation messaging inside setup modal
- present score summary and eliminated-state placeholders in warning dialog
- ensure focus management, explicit action labels, and safe keyboard handling

Dependencies:

- shell-state model from Workstream 1
- agreement on any backdrop-dismiss behavior for each modal type

Major risks:

- accessibility regressions if modal semantics or focus trapping are partial
- accidental state loss if dismiss and confirm actions are not clearly split

### Workstream 3: Responsive layout and visual hierarchy

Purpose:
Rebalance the shell around the board while ensuring supported viewports keep
the full board visible without document scrolling.

Main responsibilities:

- shrink and rebalance header hierarchy
- remove the current supporting-marketing panel
- prioritize board space over secondary copy and sidebar expansion
- define compact layouts for constrained height and width

Dependencies:

- target supported viewport matrix
- understanding of minimum readable board size for the 10x10 grid

Major risks:

- claiming board visibility without a concrete viewport target
- layout regressions caused by existing panel padding, header sizing, and app
  frame spacing

### Workstream 4: Ordered color assignment and validation hardening

Purpose:
Enforce deterministic upstream-to-downstream color availability in the modal
instead of the current symmetric unique-color filtering model.

Main responsibilities:

- define ordered option calculation by player position
- auto-correct downstream selections when earlier choices invalidate them
- keep uniqueness validation and modal messaging aligned with the new behavior
- ensure add/remove player actions preserve valid defaults

Dependencies:

- current shared player color data
- agreement on whether auto-adjustments need explanatory UI messaging

Major risks:

- surprising users when downstream colors change automatically
- splitting availability logic across the composable and the modal UI

### Workstream 5: Testing, validation, and release readiness

Purpose:
Verify the refactor safely and confirm the new shell is reviewable before
implementation is considered complete.

Main responsibilities:

- expand unit coverage around shell-state transitions and ordered color logic
- define manual responsive and accessibility checks
- confirm no hidden gameplay regressions from board-first idle behavior
- prepare rollout notes and follow-up documentation needs

Dependencies:

- completion of the preceding workstreams

Major risks:

- relying on visual inspection alone for modal and state-transition behavior
- leaving responsive acceptance subjective without a test matrix

## 9. Phased Execution Plan

### Phase 1: Clarification and execution framing

Objective:
Resolve the few specification gaps that materially affect state flow and
responsive acceptance.

Key tasks:

- define the supported viewport targets used for responsive sign-off
- confirm whether a started-but-unplayed game is treated as unfinished for the
  restart guard
- confirm whether idle board should be fully inert or allow a lightweight empty
  prompt overlay
- decide whether automatic color reassignment requires visible inline notice

Dependencies:

- source specification
- current frontend shell behavior

Entry criteria:

- specification is accepted as the planning baseline

Exit criteria:

- responsive target matrix and remaining UX assumptions are documented

### Phase 2: Shell-state and type model refactor

Objective:
Introduce the state structure needed to support a persistent board, modal
overlays, and restart-safe transitions.

Key tasks:

- extend shared frontend types to distinguish session status from modal status
- define derived shell labels for idle and active states
- preserve board state even when setup modal opens over an existing game
- define replacement-game flow so reset happens only after confirmed setup
- add derived summary data for warning-dialog content

Dependencies:

- Phase 1 decisions

Entry criteria:

- key UX assumptions are documented

Exit criteria:

- the app has a clear, non-ambiguous state model for shell, session, and modal
  transitions

### Phase 3: Board-first shell composition

Objective:
Rework the top-level layout so the board remains present from first load and
secondary content no longer dominates the initial view.

Key tasks:

- remove the page-level setup branch from the shell
- keep `GameBoard` mounted for idle and active states
- introduce a persistent primary `New Game` action in the shell chrome
- update status and header hierarchy to match the new brand emphasis
- remove the `What ships now` content block and compress supporting text

Dependencies:

- Phase 2 state model

Entry criteria:

- board and shell can render without setup-first gating

Exit criteria:

- first render shows the board and a discoverable new-game entry point

### Phase 4: Setup modal and restart warning implementation

Objective:
Move player configuration into a modal and add the restart-protection flow.

Key tasks:

- wrap player setup in a modal container instead of a full-page card
- preserve add/remove player controls, name validation, and color controls
- implement warning dialog with current round/turn context and score summary
- keep eliminated-player display structurally ready even if current gameplay
  state does not yet expose it
- route `New Game` to either setup modal or warning dialog depending on current
  session status

Dependencies:

- Phase 2 state model
- Phase 3 shell composition

Entry criteria:

- persistent shell and board-first layout are in place

Exit criteria:

- new-game flow behaves correctly for both first-time and in-progress sessions

### Phase 5: Ordered color logic and modal-state hardening

Objective:
Replace the existing free-form unique-color selection behavior with the ordered
availability rules described by the specification.

Key tasks:

- calculate allowed colors based on upstream player assignments only
- automatically reassign downstream players when upstream edits invalidate their
  choices
- keep newly added players on the next remaining valid color
- ensure validation remains stable and duplicate colors never persist as a
  steady state
- verify player removal re-normalizes later availability correctly

Dependencies:

- Phase 4 modal setup flow

Entry criteria:

- modal setup flow works end to end

Exit criteria:

- modal color assignment is deterministic, unique, and spec-compliant across
  all player-count changes

### Phase 6: Responsive compression, testing, and hardening

Objective:
Lock in board-visibility behavior across supported viewports and validate the
refined shell.

Key tasks:

- tighten app-frame, header, board, and sidebar spacing for constrained heights
- define compact stacking behavior when width is limited
- verify the full board remains visible without document scrolling across the
  agreed viewport matrix
- add or update unit tests for shell transitions, color recalculation, and
  summary derivation
- run manual keyboard and focus checks for both modals

Dependencies:

- Phases 3 through 5

Entry criteria:

- shell, modal, and ordered color behavior are implemented

Exit criteria:

- responsive and modal acceptance criteria can be demonstrated reliably

## 10. Task Breakdown

### T1. Define shell/session/modal state model

Description:
Document and implement the frontend state shape needed to separate persistent
board rendering from modal visibility and current game lifecycle.

Purpose:
Prevent the current `setup`/`playing` binary from blocking the new shell.

Dependencies:

- Phase 1 decisions

Affected area:

- `frontend/src/types/game.ts`
- `frontend/src/composables/useGameShell.ts`

Notes or risks:

- Keep UI-only modal state from leaking too deeply into board mechanics.

### T1.1. Define unfinished-session detection

Description:
Specify the frontend rule that decides when `New Game` opens setup immediately
versus showing the restart warning.

Purpose:
Avoid inconsistent restart-guard behavior.

Dependencies:

- T1

Affected area:

- shell-state logic

Notes or risks:

- This depends on whether an untouched started session still counts as
  unfinished.

### T1.2. Define warning-summary derivation

Description:
Derive current turn/round context, occupied-field counts, and optional
elimination metadata from current session state for warning display.

Purpose:
Keep warning content consistent with the live board and scoreboard.

Dependencies:

- T1

Affected area:

- composable-derived state
- sidebar/warning shared display model

Notes or risks:

- Elimination data may be absent initially and must be treated as optional.

### T2. Recompose the board-first app shell

Description:
Refactor the top-level app so the board and shell chrome render on first load,
with setup no longer owning the entire screen.

Purpose:
Deliver FR-1 through FR-3, FR-9, and FR-10.

Dependencies:

- T1

Affected area:

- `frontend/src/App.vue`
- `frontend/src/components/GameBoard.vue`
- `frontend/src/components/PlayerSidebar.vue`
- `frontend/src/styles.css`

Notes or risks:

- Layout should preserve future room for richer gameplay status without
  reintroducing setup-first branching.

### T2.1. Update header hierarchy and status language

Description:
Adjust brand prominence, subtitle scale, single-line behavior, and status copy
for idle versus active sessions.

Purpose:
Match the revised first-impression hierarchy.

Dependencies:

- T2

Affected area:

- top-level shell presentation

Notes or risks:

- The subtitle should compress before wrapping on supported viewports.

### T2.2. Define idle-board presentation

Description:
Choose how the board communicates its pre-game state while staying visible and
recognizable.

Purpose:
Support FR-2 without making the initial board feel broken or ambiguous.

Dependencies:

- T2

Affected area:

- board presentation
- shell copy/overlay treatment

Notes or risks:

- Interactivity expectations before first game start must stay clear.

### T3. Introduce modal infrastructure

Description:
Add or adapt a reusable modal pattern that can support both setup and restart
warning dialogs with clear open/close semantics.

Purpose:
Keep modal work consistent and accessible instead of building two ad hoc
overlays.

Dependencies:

- T1

Affected area:

- new frontend modal components or shell-local modal structure
- shared styling

Notes or risks:

- Focus handling and dismissal rules should be decided before visual polish.

### T3.1. Migrate player setup into modal flow

Description:
Place the existing player configuration UI inside the modal structure and align
its action labels and validation feedback with the new context.

Purpose:
Deliver FR-4 and FR-5 while preserving current setup functionality.

Dependencies:

- T3
- T4

Affected area:

- `frontend/src/components/PlayerSetup.vue`
- shell modal wiring

Notes or risks:

- Ensure the modal closes only after successful new-game confirmation.

### T3.2. Add restart warning dialog

Description:
Create the warning flow that summarizes the current session and offers explicit
continue versus start-over actions.

Purpose:
Deliver FR-6 through FR-8.

Dependencies:

- T1.1
- T1.2
- T3

Affected area:

- shell modal wiring
- new warning-dialog presentation

Notes or risks:

- The warning must not destroy the current session until replacement setup is
  confirmed.

### T4. Rework setup color assignment logic

Description:
Replace the current availability helper with ordered upstream-to-downstream
color assignment and automatic downstream repair.

Purpose:
Deliver FR-13 through FR-15 and remove a key mismatch between current behavior
and the new specification.

Dependencies:

- T1
- T3.1

Affected area:

- `frontend/src/composables/useGameShell.ts`
- `frontend/src/components/PlayerSetup.vue`
- related shared types if needed

Notes or risks:

- The composable should remain the canonical source for both availability and
  auto-reassignment.

### T4.1. Normalize add/remove behavior under ordered colors

Description:
Ensure player addition and removal preserve valid ordered defaults and do not
leave stale downstream assignments.

Purpose:
Make the modal resilient during rapid roster edits.

Dependencies:

- T4

Affected area:

- setup-player state transitions

Notes or risks:

- Removal can change downstream option sets even without direct color edits.

### T4.2. Decide on user-facing feedback for auto-reassignment

Description:
Choose whether the UI merely updates color chips silently or also surfaces a
small notice when downstream colors are changed automatically.

Purpose:
Reduce surprise without adding unnecessary noise.

Dependencies:

- T4

Affected area:

- setup modal UX

Notes or risks:

- This is not a blocker for the core logic, but it affects usability polish.

### T5. Tighten responsive layout for board visibility

Description:
Adjust shell spacing, stacking, and density rules so the board remains fully
visible across the agreed viewport matrix without document scrolling.

Purpose:
Deliver FR-11, FR-12, and NFR-1.

Dependencies:

- T2
- T3

Affected area:

- `frontend/src/App.vue`
- `frontend/src/components/GameBoard.vue`
- `frontend/src/components/PlayerSidebar.vue`
- `frontend/src/styles.css`

Notes or risks:

- Board visibility must be proven against explicit viewport checks, not by
  visual assumption on a single desktop size.

### T5.1. Define compact sidebar/status behavior

Description:
Compress or reposition secondary information so it yields space before the
board does.

Purpose:
Honor the board-first priority under constrained width or height.

Dependencies:

- T5

Affected area:

- sidebar/status layout

Notes or risks:

- Compact mode should preserve current-turn and score readability.

### T5.2. Validate headline single-line behavior

Description:
Tune typography scaling and container behavior so the brand headline remains on
one line for supported widths.

Purpose:
Deliver the header acceptance criteria without sacrificing brand emphasis.

Dependencies:

- T2.1
- T5

Affected area:

- shell header styling

Notes or risks:

- This depends on the minimum supported width chosen in Phase 1.

### T6. Expand automated and manual validation

Description:
Add focused tests and a manual verification checklist for state transitions,
color ordering, modal flows, and viewport behavior.

Purpose:
Reduce regression risk in a cross-cutting shell refactor.

Dependencies:

- T1 through T5

Affected area:

- `frontend/src/composables/useGameShell.spec.ts`
- manual browser validation workflow

Notes or risks:

- Pure unit tests will not fully cover responsive layout and focus behavior.

## 11. Dependency Map

- Shell-state refactor must land before modal orchestration, because setup and
  warning dialogs depend on separate UI-state control.
- Warning-summary derivation depends on the same board and scoreboard sources
  already used in gameplay, so summary work should follow state-shape
  clarification and precede warning-dialog presentation.
- Board-first shell composition should happen before deep responsive tuning,
  otherwise viewport work will be based on the wrong structure.
- Ordered color logic should be centralized before setup-modal polish, so the
  modal does not encode temporary business rules in the view layer.
- Responsive sign-off depends on both the persistent shell and the modal stack
  being present, because fixed overlays and compressed panels both affect
  viewport usage.
- Automated test expansion should trail the main state and setup logic changes,
  but validation cases should be identified early so implementation does not
  miss coverage targets.

## 12. Technical Decision Points

### Decision 1: Session-state modeling approach

Why it matters:
The current `phase: 'setup' | 'playing'` model is too narrow for a persistent
board-first shell.

Options at a high level:

- keep a single game-state object and add shell/modal sub-state alongside it
- split shell UI state from gameplay session state more explicitly

Impact of delaying the decision:
Modal flow and restart protection will likely be implemented inconsistently if
the state boundary is not settled first.

### Decision 2: Definition of unfinished game

Why it matters:
This determines when users are warned before opening replacement setup.

Options at a high level:

- warn for any active session after initial game creation
- warn only after at least one move has been made

Impact of delaying the decision:
Restart-guard logic and tests may need to be rewritten after UX review.

### Decision 3: Idle-board interactivity model

Why it matters:
The initial board must be visible, but the spec leaves room for either a fully
inert board or a lightweight overlay cue.

Options at a high level:

- fully non-interactive board with shell-level prompt
- visible board with overlay hint or inline empty-state cue

Impact of delaying the decision:
Board presentation and accessibility messaging may be reworked late in the
implementation.

### Decision 4: Responsive target matrix

Why it matters:
The requirement to keep the board fully visible cannot be validated without a
clear viewport baseline.

Options at a high level:

- define a minimum supported desktop and mobile matrix for acceptance
- use an informal "common modern devices" standard with manual judgment

Impact of delaying the decision:
Responsive work may appear complete but still fail review due to mismatched
expectations.

### Decision 5: Auto-reassignment transparency

Why it matters:
Ordered color recalculation is deterministic, but silent downstream changes may
surprise users.

Options at a high level:

- silent automatic updates
- small inline notice or transient message when reassignment occurs

Impact of delaying the decision:
The underlying logic can still be built, but modal UX polish may remain
unfinished.

### Decision 6: Modal dismissal rules

Why it matters:
Backdrop clicks, `Escape`, and close buttons should behave predictably for both
setup and restart warning dialogs.

Options at a high level:

- allow lightweight dismissal for setup but stricter dismissal for warning
- allow consistent dismissal semantics for both modals

Impact of delaying the decision:
Accessibility and state-flow testing may become inconsistent or incomplete.

## 13. Risks and Complexity Drivers

- The current shell is organized around mutually exclusive screen phases, so
  moving to a persistent board will touch both state shape and layout
  composition.
- Responsive board visibility is constrained by viewport height as much as
  width, making spacing and panel density as important as breakpoint stacking.
- Restart protection introduces a two-step replacement flow, which raises the
  chance of accidental premature resets if state transitions are not carefully
  modeled.
- Ordered color recalculation is simple in concept but easy to implement
  inconsistently when players are added, removed, or edited upstream.
- Modal accessibility can become a hidden regression area if focus movement,
  dismissal handling, and button labeling are not planned explicitly.
- Eliminated-player status is forward-compatible rather than fully powered by
  current gameplay rules, so the warning dialog must gracefully handle partial
  data.

Mitigation ideas:

- centralize all shell and setup transition logic in the composable layer
- agree on a viewport matrix before CSS hardening begins
- derive warning-summary data from existing board counts instead of duplicating
  scoring logic
- add unit tests for ordered color recalculation and unfinished-game detection
- include manual keyboard walkthroughs for both modal types in sign-off

## 14. Assumptions

- This increment remains frontend-only and does not require backend support.
- The existing occupied-field scoreboard logic is sufficient for restart warning
  score summaries.
- Eliminated-player status may be absent initially and should be treated as
  optional display data.
- The board should remain the dominant visual surface even when sidebar content
  compresses or moves.
- A reusable modal pattern is preferable to implementing separate one-off
  overlays for setup and warning flows.
- Ordered color logic will be owned by the composable/state layer rather than
  duplicated in presentational components.

## 15. Open Questions / Blockers

- Open question: What exact minimum viewport sizes define the acceptance target
  for "board fully visible without scrolling"?
- Open question: Should a newly started game with zero moves already count as
  unfinished for restart-warning purposes?
- Open question: Should the idle board show a dedicated empty-state cue or stay
  visually plain and inactive?
- Nice-to-clarify: Should the setup modal surface a visible notice when
  downstream player colors are auto-adjusted?
- Nice-to-clarify: Should the restart warning support backdrop dismissal, or
  only explicit action buttons plus `Escape`?
- Nice-to-clarify: If/when elimination data appears later, should eliminated
  players be visually grouped or simply labeled inline in the warning summary?

## 16. Testing and Validation Plan

- Add unit tests for shell-state transitions between idle, active, warning-open,
  and setup-open states.
- Add unit tests for unfinished-game detection once that rule is finalized.
- Add unit tests for ordered color availability, upstream color edits,
  downstream auto-reassignment, and add/remove player normalization.
- Add unit tests for restart-summary derivation from current board/player state.
- Retain and adapt existing tests for setup validation and move progression so
  the shell refactor does not break gameplay basics.
- Perform manual browser validation for:
  first-load board visibility
  new-game flow with no active session
  restart-warning flow with active session
  continue-current-game path
  start-over path that only replaces the session after confirmed setup
- Perform manual responsive checks against the agreed viewport matrix,
  confirming no document scroll is required to see the full board.
- Perform manual keyboard checks for modal open, tab order, visible focus,
  `Escape`, and safe dismissal behavior.

## 17. Rollout / Release Considerations

- No feature flag is strictly required for a local frontend-only project, but
  the implementation should remain reviewable as a single cohesive slice rather
  than a half-switched shell.
- Because the feature changes the default first-load experience, manual review
  should compare the initial idle shell, first game start, and replacement-game
  flow before merge.
- If responsive sign-off is incomplete for the chosen viewport matrix, the work
  should not be treated as done even if the desktop shell looks correct.
- If elimination data is still unavailable, release notes or review notes should
  clarify that the warning dialog is structurally ready and currently shows the
  score summary only.

## 18. Documentation Impact

- Update progress notes or implementation records in `README.md` after delivery
  to reflect the board-first shell refinement and responsive milestone.
- If the responsive target matrix is formalized during implementation, capture
  it in project papers so later shell changes can be tested against the same
  baseline.
- If a reusable modal pattern is introduced, lightweight internal notes may be
  helpful so future gameplay dialogs follow the same accessibility conventions.

## 19. Suggested Delivery Slices

### Slice A: Core shell refactor

- T1
- T2
- T2.1
- T2.2

Outcome:
Board is visible on first render, shell hierarchy is updated, and the app no
longer depends on the full-page setup screen.

### Slice B: Modalized setup and guarded restart

- T3
- T3.1
- T3.2
- T1.1
- T1.2

Outcome:
New-game flows work correctly for both idle and in-progress sessions without
premature data loss.

### Slice C: Ordered colors and responsive hardening

- T4
- T4.1
- T4.2
- T5
- T5.1
- T5.2
- T6

Outcome:
The setup modal follows the ordered color rules and the refined shell is ready
for responsive and accessibility review.

## 20. Implementation Readiness Checklist

- [ ] Source specification is accepted for implementation.
- [ ] Responsive viewport targets are defined for acceptance and testing.
- [ ] Unfinished-game detection rule is agreed.
- [ ] Shell/session/modal state model is reviewed and understood.
- [ ] Ordered color behavior and downstream auto-reassignment expectations are
      aligned.
- [ ] Modal accessibility expectations are agreed, including dismissal rules.
- [ ] Task breakdown is reviewed and execution sequencing is accepted.
- [ ] Validation approach covers state logic, modal flow, and responsive review.

## 21. Definition of Done for Planning

This implementation plan is complete when:

- the board-first shell refactor is decomposed into clear workstreams
- execution phases are ordered and dependency-aware
- task packages are concrete enough to assign and estimate
- key state-model, modal, responsive, and color-order decisions are visible
- risks, assumptions, and open questions are documented explicitly
- testing, rollout, and documentation impacts are defined at planning level
- the plan can be handed directly into implementation without requiring coding
  decisions to be invented mid-flight
