# Implementation Plan: German Legal Footer and Static Legal Pages

## 1. Title

German Legal Footer and Static Legal Pages - Implementation Plan

## 2. Summary

This plan covers a frontend-only shell increment that adds the legal footer
defined in `papers/screen-layout.md`, opens in-app static legal pages for
`Impressum` and `Datenschutz`, preserves the current idle or game state while
those pages are open, and keeps the legal content sourced from the existing
repository-authored files under `papers/legal`.

## 3. Source Specification

- Feature title: `German Legal Footer and Static Legal Pages`
- Date: `2026-03-28`
- Status: `In progress`
- Reference: `papers/in-progress/2026-03-28_SPEC_legal-footer-and-static-pages.md`
- Canonical product context: `papers/game-overview.md`
- Layout reference: `papers/screen-layout.md`

## 4. Planning Goals

- Define a clean execution path for adding legal navigation without touching
  gameplay rules.
- Keep the implementation strictly frontend-only and avoid unnecessary
  dependency expansion.
- Preserve the current board shell state across entry to and exit from legal
  pages.
- Make content-sourcing, rendering, and layout constraints explicit before
  coding starts.
- Define validation work that covers both state preservation and the required
  footer/legal-page UX.

## 5. Scope of This Plan

This plan covers:

- top-level frontend shell/view-state changes needed to switch between the
  board shell and legal-content views
- footer integration for the board shell using the fixed German labels
  `Impressum` and `Datenschutz`
- creation of a dedicated legal-page presentation path with a `Return to Game`
  action
- sourcing and rendering the legal content from `papers/legal/imprint.md` and
  `papers/legal/privacy-policy.md`
- layout and scrolling adjustments so the board shell keeps its fixed-height
  structure while legal content remains fully readable
- frontend tests and manual validation for idle-state return, active-game
  return, footer visibility, and long-form legal-content readability
- learnings updates only if implementation reveals a durable shell-state or
  static-content pattern worth preserving

## 6. Out of Scope

This plan does not cover:

- backend, API, persistence, authentication, or server-rendering work
- legal-copy rewrites or replacement of placeholder operator data
- cookie consent, analytics consent, or any additional compliance workflow
- SEO, browser-routing, or deployment behavior beyond the single-page app
- gameplay-rule changes, move flow changes, or modal-flow redesign unrelated to
  legal navigation
- broad visual redesign beyond the footer and legal-page presentation required
  by the specification

## 7. Affected Areas

- `papers/in-progress/2026-03-28_SPEC_legal-footer-and-static-pages.md`
- `papers/in-progress/2026-03-28_PLAN_legal-footer-and-static-pages.md`
- `papers/legal/imprint.md` and `papers/legal/privacy-policy.md` as read-only
  source inputs
- frontend shell composition in `frontend/src/App.vue`
- shared shell styling in `frontend/src/styles.css`
- shell/game state handling in `frontend/src/composables/useGameShell.ts`
- shell/game state types in `frontend/src/types/game.ts`
- frontend tests in `frontend/src/composables/useGameShell.spec.ts`
- likely new focused frontend component or helper files under
  `frontend/src/components` and/or `frontend/src/data` for the footer and legal
  content presentation
- `LEARNINGS.md` only if implementation produces a reusable architectural
  lesson

## 8. Workstreams

### Workstream 1: Shell view-state foundation

Purpose:
Introduce a narrow top-level app state that can switch between the board shell
and a legal page without reinitializing the live game state.

Main responsibilities:

- decide where legal-page state should live
- keep gameplay state and legal-page state separated
- preserve current board, round, winner, and idle/playing context while legal
  content is open
- ensure the legal flow coexists safely with existing modal behavior

Dependencies:

- the accepted scope from the specification
- current shell ownership in `useGameShell`

Major risks:

- accidental game-state reset caused by coupling the legal view to game
  initialization
- view-state changes interfering with current modal handling or computer-turn
  scheduling

### Workstream 2: Legal content sourcing and rendering

Purpose:
Render the authored legal documents inside the SPA in a readable way while
avoiding repository-only notes and formatting artifacts.

Main responsibilities:

- choose the legal-content ingestion approach
- map each footer entry to the correct source document
- preserve German legal copy while omitting non-user-facing notes if needed
- support headings, paragraphs, lists, placeholders, and long-form content

Dependencies:

- a decision on the content-loading and rendering approach
- a legal-page container ready to display scrollable content

Major risks:

- showing raw markdown/comments in a way that harms readability
- introducing unsafe HTML handling or unnecessary dependencies
- drifting from the source files by duplicating or manually rewriting content

### Workstream 3: Footer and shell layout integration

Purpose:
Add the footer and legal-page layout within the existing dark shell while
preserving the fixed viewport structure from `papers/screen-layout.md`.

Main responsibilities:

- add the legal footer to the board shell
- keep the footer visually separate from the board and sidebar
- ensure the board shell still fits header, main content, and footer inside the
  viewport
- provide a legal-page layout with a prominent `Return to Game` button and a
  dedicated scrollable content region

Dependencies:

- Workstream 1 for view switching
- Workstream 2 for the shape of the rendered content

Major risks:

- footer overlap with the board on shorter viewports
- legal-page scrolling failing because the app currently keeps body scrolling
  disabled
- inconsistent chrome between the board shell and legal view

### Workstream 4: Validation and regression safety

Purpose:
Confirm the legal flow works without breaking the existing board shell or game
session behavior.

Main responsibilities:

- extend automated coverage where current test setup supports it
- run build/test validation
- manually verify the footer, navigation, state preservation, and scrolling
  behavior in the browser
- capture a learning if a reusable shell-state pattern emerges

Dependencies:

- completed work from Workstreams 1 through 3

Major risks:

- current automated tests are centered on composable logic rather than rendered
  UI, so visual/footer behavior may rely on manual verification
- subtle regressions in shell height, focus behavior, or return-state handling
  escaping logic-only tests

## 9. Phased Execution Plan

### Phase 1: Technical preparation and decision alignment

Objective:
Confirm the narrowest implementation strategy for view switching, legal-content
loading, and legal-page layout before source edits begin.

Key tasks:

- confirm the preferred view-state approach for legal-page navigation
- confirm how legal files will be sourced and transformed for display
- confirm the intended footer/legal-page chrome relationship
- identify the specific frontend files and tests to update

Dependencies:

- `papers/game-overview.md`
- `papers/screen-layout.md`
- the active feature specification

Entry criteria:

- the feature specification is accepted as the implementation source of truth

Exit criteria:

- the implementation path is clear enough to start frontend changes without
  reopening scope

### Phase 2: Shell state and navigation foundation

Objective:
Introduce the app-level legal-view state and navigation hooks while preserving
existing game state and modal/gameplay behavior.

Key tasks:

- add or extend shell state to represent the active legal page, if any
- expose open/close actions for legal views
- ensure returning from a legal page restores the prior board shell context
- verify legal-page entry does not reset the idle shell or active game data

Dependencies:

- Phase 1 decisions

Entry criteria:

- the chosen state-management approach is agreed

Exit criteria:

- the app can switch between board and legal views without losing game state

### Phase 3: Footer and legal-page UI integration

Objective:
Render the board-shell footer and the dedicated legal-page UI within the
existing application shell.

Key tasks:

- add the footer with `Impressum · Datenschutz`
- wire the footer entries to the legal navigation state
- add the legal-page header area with `Return to Game`
- preserve the board-shell footer presence in idle, active, and concluded board
  states

Dependencies:

- Phase 2 state/navigation foundation

Entry criteria:

- shell navigation hooks exist

Exit criteria:

- the user can enter and leave the legal views through visible UI controls

### Phase 4: Legal content rendering and scroll behavior

Objective:
Display the legal source documents inside the app in a readable, stable, and
scrollable form.

Key tasks:

- connect each legal page to the correct source document
- handle repository-only notes, HTML comments, and non-user-facing sections as
  defined by the chosen rendering strategy
- ensure long-form legal content scrolls inside the intended viewport region
- keep the overall shell visually consistent with the current dark theme

Dependencies:

- Phase 1 content-rendering decision
- Phase 3 legal-page container

Entry criteria:

- the legal-page UI exists and can host content

Exit criteria:

- the full legal texts are readable in-app without truncation or shell breakage

### Phase 5: Validation and hardening

Objective:
Confirm the feature is ready for implementation handoff completion and merge.

Key tasks:

- update automated tests for the new shell/legal state behavior where feasible
- run frontend validation commands
- manually verify footer visibility, legal navigation, return behavior, and
  legal-page scrolling
- record any durable learning from the implementation

Dependencies:

- Phases 2 through 4

Entry criteria:

- shell, footer, and legal content work is complete

Exit criteria:

- validation outcomes are captured and any residual risks are explicitly stated

## 10. Task Breakdown

- T1. Decide the legal navigation state model.
  Description: choose whether legal-page state extends `useGameShell`, lives in
  a small adjacent app-shell state, or uses another narrow top-level mechanism.
  Purpose: keep board/game state stable while allowing in-app legal navigation.
  Dependencies: none.
  Affected area: frontend shell state.
  Notes/Risks: avoid a design that couples legal navigation to game
  re-creation.

- T1.1. Define the supported legal-view identifiers and transitions.
  Description: identify the legal-page states, the board-shell state, and the
  allowed transitions between them.
  Purpose: make view switching explicit before wiring UI controls.
  Dependencies: T1.
  Affected area: frontend shell state/types.
  Notes/Risks: transitions must preserve idle, active, and concluded shell
  contexts.

- T2. Decide the legal-content ingestion and rendering approach.
  Description: choose how the app will source the two legal markdown files and
  present them without exposing repository-only comments or obvious formatting
  artifacts.
  Purpose: keep the legal copy tied to the source documents while maintaining
  readability.
  Dependencies: none.
  Affected area: frontend content/data layer.
  Notes/Risks: the current frontend has no existing markdown renderer or router
  pattern to reuse.

- T3. Extend app-shell state and actions for legal navigation.
  Description: add the selected legal-view state, open actions for each footer
  entry, and a return action that restores the previous board shell context.
  Purpose: create the feature's behavioral foundation.
  Dependencies: T1, T1.1.
  Affected area: frontend composable/types.
  Notes/Risks: existing modal and computer-turn behavior must remain stable.

- T4. Refactor the top-level shell layout to support footer and legal-page
  rendering.
  Description: restructure the app shell so it can render board content plus
  footer in the board state and render the legal page in the legal state.
  Purpose: establish the visual container structure required by the spec.
  Dependencies: T3.
  Affected area: frontend app shell/layout.
  Notes/Risks: the board shell must continue fitting inside the fixed-height
  viewport.

- T5. Add the board-shell footer and legal navigation controls.
  Description: render the centered footer entries in German and connect them to
  the legal navigation actions.
  Purpose: expose the legal entry points from the intended shell location.
  Dependencies: T3, T4.
  Affected area: frontend UI.
  Notes/Risks: footer visibility must be preserved in idle, active, and
  concluded board states.

- T6. Add the legal-page presentation and return interaction.
  Description: create the legal-page view with a prominent `Return to Game`
  button and content area for either legal document.
  Purpose: fulfill the in-app reading flow defined by the specification.
  Dependencies: T3, T4.
  Affected area: frontend UI.
  Notes/Risks: legal pages must not expose gameplay controls while active.

- T7. Connect and normalize legal source content for user-facing display.
  Description: map `Impressum` and `Datenschutz` to the corresponding source
  files and apply the chosen filtering/rendering rules for comments,
  placeholders, headings, and long-form text.
  Purpose: present the authored legal copy predictably without manually
  duplicating it in components.
  Dependencies: T2, T6.
  Affected area: frontend content/data layer.
  Notes/Risks: placeholders must remain visible as authored; English authoring
  notes are optional and may be omitted.

- T8. Update layout and scrolling behavior for board/footer coexistence and
  legal-page readability.
  Description: adjust shared styles so the board shell still respects header,
  main content, and footer spacing, and the legal page gains its own vertical
  scrolling region.
  Purpose: satisfy the layout and readability requirements from the spec and
  screen-layout reference.
  Dependencies: T4, T5, T6, T7.
  Affected area: frontend styles/layout.
  Notes/Risks: body scrolling is currently disabled, so legal-page overflow must
  be handled intentionally.

- T9. Extend automated regression coverage for the new shell/legal behavior.
  Description: add or adapt tests for legal-view state transitions and state
  preservation, and cover the logic most likely to regress.
  Purpose: keep the new shell state safe as gameplay work continues.
  Dependencies: T3, T7.
  Affected area: frontend tests.
  Notes/Risks: full visual/footer verification may still require manual checks
  because current tests run in a node environment.

- T10. Run validation and capture any durable learning.
  Description: execute the relevant frontend checks, perform manual UI
  verification, and update `LEARNINGS.md` only if the implementation reveals a
  reusable shell-state or static-content rule.
  Purpose: finish the increment with explicit evidence and preserved context for
  later work.
  Dependencies: T5, T6, T7, T8, T9.
  Affected area: validation/documentation.
  Notes/Risks: manual verification should cover both idle and in-progress game
  returns.

## 11. Dependency Map

- T1 and T2 are the two early decision tasks that unlock the rest of the work.
- T1.1 depends on T1 because supported transitions follow the chosen state
  model.
- T3 depends on T1 and T1.1 because the shell cannot expose legal navigation
  until its state model is defined.
- T4 depends on T3 because layout changes need the legal-view state to know what
  to render.
- T5 and T6 both depend on T3 and T4 because they are the visible entry and
  destination views for the same navigation flow.
- T7 depends on T2 and T6 because content normalization must fit the chosen
  legal-page presentation.
- T8 follows T4 through T7 because layout and overflow behavior depend on the
  final shell, footer, and content structure.
- T9 follows the state and content work it validates.
- T10 is last because validation and learnings should reflect the finished
  implementation.

## 12. Technical Decision Points

### Decision 1: Where legal-page state should live

Why it matters:
The feature needs a stable way to switch views without resetting board state,
and the current app has a single central shell composable but no router.

Options at a high level:

- extend `useGameShell` with a narrow legal-view state
- introduce a small adjacent app-level UI state in `App.vue` or a new focused
  composable
- introduce routing despite the feature being scoped as an in-app shell flow

Impact of delaying the decision:
Frontend changes can become fragmented, and later work may need to unwind state
coupling if legal navigation is added in an ad hoc way.

### Decision 2: How to source and render the legal markdown files

Why it matters:
The legal copy must stay tied to `papers/legal`, but the current frontend has no
existing markdown-rendering pattern and the source files contain comments and
non-user-facing notes.

Options at a high level:

- load the authored files directly at build time and apply a small
  presentation-focused transform
- create a structured frontend adapter that still derives from the source files
- add a dedicated markdown-rendering dependency if a simpler internal approach
  is not sufficient

Impact of delaying the decision:
UI work can be blocked, or the feature can drift into manual copy duplication
that violates the source-of-truth requirement.

### Decision 3: Whether footer chrome persists on legal pages or stays scoped to
the board shell

Why it matters:
This choice affects layout structure, footer placement, and how strongly the
legal pages inherit the existing shell chrome.

Options at a high level:

- keep header and footer as global shell chrome while only swapping main content
- show the footer only on board-shell views and let the legal page rely on the
  `Return to Game` action

Impact of delaying the decision:
App-shell layout work may be implemented twice if the legal-page structure later
needs to change.

### Decision 4: How much UI behavior to automate with the current test stack

Why it matters:
The repo currently has logic-heavy Vitest coverage but no visible component-test
setup for rendered Vue UI behavior.

Options at a high level:

- keep automated coverage focused on state transitions and rely on manual UI
  checks for layout/navigation details
- add component-testing capability if the current setup proves insufficient

Impact of delaying the decision:
Validation scope stays ambiguous, and the feature may merge with either
unnecessary dependency growth or insufficient UI verification.

## 13. Risks and Complexity Drivers

- The current app shell uses a fixed-height viewport and disables body
  scrolling, so the legal-page scroll container must be designed deliberately.
- There is no existing router or markdown-rendering pattern in the frontend, so
  this feature introduces a new kind of shell state and a new content path.
- Legal source files include English notices, HTML comments, and placeholder
  data, which creates presentation and filtering choices that must stay aligned
  with the specification.
- Existing shell logic already coordinates setup, restart-warning, and
  move-result modal states, so legal navigation must not accidentally interfere
  with those flows.
- Footer behavior must remain correct in idle, active, and concluded board
  states, which adds UI verification beyond the current game-logic focus.

Mitigation ideas:

- keep legal navigation isolated from gameplay state changes
- choose the simplest content adapter that still preserves source fidelity
- validate layout manually across at least one wide and one narrow viewport
- focus automated tests on state preservation and transition safety

## 14. Assumptions

- The implementation will remain frontend-only, with no backend or API work.
- The legal source files are read-only inputs for this increment and will not be
  edited as part of implementation.
- The current single-page app can satisfy the required in-app navigation without
  introducing a full routing layer.
- Placeholder values in the legal content may remain visible exactly as authored
  until real operator data is supplied.
- It is acceptable for the legal content to use an internal scroll region,
  because the current shell intentionally keeps page-level scrolling disabled.

## 15. Open Questions / Blockers

- No blocker is currently visible.
- Nice-to-clarify: whether the English-language `Language Notice` sections in
  the source files should be omitted entirely from the user-facing legal pages
  or simply de-emphasized if the chosen rendering approach can display them
  cleanly.
- Nice-to-clarify: whether the legal footer should remain visible on legal pages
  or be scoped only to board-shell views.

## 16. Testing and Validation Plan

- Run `npm test` in `frontend` to validate updated logic-level coverage.
- Run `npm run build` in `frontend` to validate the TypeScript and production
  bundle path.
- Add automated checks for legal-view state transitions and return-state
  preservation where the current Vitest setup supports it.
- Manually verify the footer appears on the idle shell, an active game, and a
  concluded game.
- Manually verify `Impressum` opens the imprint content and `Datenschutz` opens
  the privacy-policy content.
- Manually verify `Return to Game` restores the prior board shell without
  restarting the game or creating a new one.
- Manually verify the legal page scrolls vertically through long content while
  the board shell still keeps footer and main content separated correctly.
- Manually verify placeholders remain visible as authored and that repository
  comments or formatting artifacts do not make the page unreadable.

## 17. Rollout / Release Considerations

- No feature flag is expected for this narrow frontend increment.
- No backend rollout coordination is expected.
- Manual browser verification should accompany automated checks because the
  feature materially changes the shell layout and introduces long-form content
  display.
- If the chosen content-rendering approach embeds legal files at build time, any
  later legal-text update will require a normal frontend rebuild/redeploy.

## 18. Documentation Impact

- Add this implementation plan in `papers/in-progress`.
- Keep `papers/game-overview.md` and `papers/screen-layout.md` as unchanged
  references only.
- Keep `papers/legal/imprint.md` and `papers/legal/privacy-policy.md` as the
  source of truth for legal copy rather than duplicating maintained text
  elsewhere.
- Update `LEARNINGS.md` only if implementation surfaces a durable reusable rule
  for app-shell state separation or static document rendering.

## 19. Suggested Delivery Slices

### Slice A: Shell state and footer entry points

- T1
- T1.1
- T3
- T4
- T5

Outcome:
The board shell gains the legal footer and can enter a dedicated legal-view
state without resetting game data.

### Slice B: Legal-page content and layout completion

- T2
- T6
- T7
- T8

Outcome:
The app can display both legal documents in a readable in-app page with return
navigation and proper scrolling behavior.

### Slice C: Validation and hardening

- T9
- T10

Outcome:
The feature has explicit regression coverage, build/test validation, and manual
layout verification.

## 20. Implementation Readiness Checklist

- [x] Canonical gameplay context reviewed in `papers/game-overview.md`.
- [x] Footer/layout reference reviewed in `papers/screen-layout.md`.
- [x] Active feature specification exists in `papers/in-progress`.
- [x] The increment is confirmed as frontend-only.
- [x] Source legal documents are identified.
- [x] Affected shell, state, and test areas are identified.
- [x] Key technical decisions and risks are visible.
- [x] Validation expectations are defined.

## 21. Definition of Done for Planning

This implementation plan is complete when:

- the work is broken into clear frontend workstreams and phases
- sequencing and dependencies are explicit
- the main legal-content and shell-state decisions are surfaced
- validation expectations cover both logic and UI behavior
- the plan stays implementation-oriented without drifting into code
