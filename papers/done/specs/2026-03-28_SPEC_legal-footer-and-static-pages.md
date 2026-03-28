# Specification

## 1. Title

German Legal Footer and Static Legal Pages

## 2. Summary

Add the next shell increment that exposes legal information from the game screen. The board-first application shell shall gain a footer below the board area with two German-language entries, `Impressum` and `Datenschutz`, as described in `papers/screen-layout.md`. Clicking either entry shall open a static legal page inside the application. Each legal page shall show a clearly visible `Return to Game` button at the top and shall render its content from the corresponding source file in `papers/legal`.

## 3. Background / Problem Statement

The current product direction already defines the main shell as a board-first experience with persistent application chrome. `papers/game-overview.md` establishes the core game experience, while `papers/screen-layout.md` now defines a footer area at the bottom of the viewport containing:

- `Impressum`
- `Datenschutz`

That footer is part of the intended shell, but the legal navigation and the destination pages are not yet specified as a concrete implementation slice.

This leaves a gap between the intended layout and the actual product behavior:

- users do not yet have an in-app way to access the required legal content
- the footer entries described in `papers/screen-layout.md` are not yet tied to concrete interaction behavior
- the product does not yet define how legal content should coexist with an ongoing game session

The requested increment fills that gap by defining a small, self-contained legal navigation flow that keeps the game shell intact while making the legal texts reachable.

## 4. Goal

Ensure that AI Explode exposes its legal information directly from the board-first shell through a persistent footer, opens dedicated static legal screens for `Impressum` and `Datenschutz`, keeps those pages in German even though the rest of the application is in English, and lets the user return to the exact game shell context through a `Return to Game` button.

## 5. Scope

Included in scope:

- Add a footer to the board-first shell in the location and style direction defined by `papers/screen-layout.md`.
- Show exactly two footer entries: `Impressum` and `Datenschutz`.
- Keep those two entries in German even when surrounding application chrome remains English.
- Open a dedicated static in-app page when either footer entry is clicked.
- Add a `Return to Game` button at the top of both legal pages.
- Source the visible legal content from:
  - `papers/legal/imprint.md`
  - `papers/legal/privacy-policy.md`
- Preserve the current game or idle shell state when the user navigates to and from a legal page.
- Define the UX expectations for long-form legal content inside the existing single-page application shell.

## 6. Out of Scope

Explicitly out of scope for this specification:

- Changing gameplay rules, board interaction rules, or turn flow from `papers/game-overview.md`
- Adding backend APIs, persistence, authentication, or server-side content delivery for the legal pages
- Creating editable legal-content management tools or a CMS workflow
- Rewriting the authored legal copy for legal correctness
- Replacing placeholder business/contact data in the legal source files with real operator data
- Introducing language switching for the overall application
- Adding cookie consent, analytics opt-in UI, or any additional compliance flows beyond exposing the provided legal texts
- Defining browser-routing, SEO, or deployment behavior beyond the in-app user-facing experience

## 7. Stakeholders / Users Affected

- Players, who need uninterrupted access to legal information without losing their current game context
- The product owner/operator, who needs the legal texts to be visibly accessible from the application shell
- Designers and implementers responsible for the shell, footer, and static content views

## 8. Functional Requirements

### FR-1 Footer Presence In The Board Shell

The main application shell shall include a footer below the board/main content area, aligned with the structure defined in `papers/screen-layout.md`.

The footer shall be visible whenever the user is on the board-first shell, including:

- the idle state before a game has started
- an active game
- a concluded game state

### FR-2 Footer Entries And Language

The footer shall contain exactly two interactive text entries:

- `Impressum`
- `Datenschutz`

These entries shall be shown in German exactly as written above, even though the rest of the shell may remain in English.

### FR-3 Footer Layout Alignment With Screen Layout Reference

The footer shall follow the intent of `papers/screen-layout.md`:

- it is positioned at the bottom of the viewport beneath the main board/sidebar area
- it remains visually separate from the board and does not overlap it
- it is centered and styled as subtle application chrome rather than as a primary gameplay control

This increment does not redefine the footer's visual design beyond what `papers/screen-layout.md` already establishes.

### FR-4 In-App Legal Navigation

Clicking `Impressum` or `Datenschutz` shall open the corresponding legal content inside the application rather than downloading a file or forcing an external site.

For this increment, the legal content is a dedicated static app view that replaces the board-focused main content while the legal page is being read.

### FR-5 Impressum Page

Clicking `Impressum` shall open the legal page whose content is sourced from `papers/legal/imprint.md`.

The visible page content for end users shall be German-language legal content. If the repository source file contains authoring notes or non-German explanatory text that is not intended as end-user legal copy, those notes are not required to be shown in the rendered page.

### FR-6 Datenschutz Page

Clicking `Datenschutz` shall open the legal page whose content is sourced from `papers/legal/privacy-policy.md`.

The visible page content for end users shall be German-language legal content. If the repository source file contains authoring notes or non-German explanatory text that is not intended as end-user legal copy, those notes are not required to be shown in the rendered page.

### FR-7 Return To Game Action

Each legal page shall show a `Return to Game` button at the top of the page, before the legal text begins.

The button label shall be exactly `Return to Game`.

### FR-8 Return Behavior And State Preservation

When the user presses `Return to Game`, the application shall return to the board-first shell without resetting or replacing the previously visible game/session state.

This means:

- if a game was active before opening the legal page, the same game state shall still be present after returning
- if no game had started yet, the user shall return to the idle shell state rather than a newly created game
- opening a legal page shall not advance turns, alter scores, or otherwise mutate gameplay state

### FR-9 One-Way Content Mapping

The legal pages shall be treated as static content views sourced from the files in `papers/legal`.

For this increment, the application is only responsible for presenting that content. It is not responsible for editing, validating, or enriching the legal text beyond rendering it in the app shell.

### FR-10 Long-Form Content Readability

The legal pages shall support long-form static content without truncation.

If the legal text exceeds the visible height of the viewport, the legal page shall allow vertical scrolling so the full content remains readable.

### FR-11 Placeholder Handling

The source files currently contain unresolved placeholders such as names, addresses, and email values. This increment shall not invent or substitute missing operator data.

The implementation may therefore display the authored placeholder text as-is until real legal data is provided, provided that the page still renders safely and legibly.

### FR-12 No Gameplay Controls On Legal Pages

While a legal page is visible, gameplay interaction with the board shall not be available because the board-focused shell content is temporarily replaced by the legal view.

The required navigation control on the legal page is the `Return to Game` button.

## 9. Non-Functional Requirements

### NFR-1 Layout Consistency

The footer integration shall remain consistent with `papers/screen-layout.md`, especially the requirement that the board area and footer coexist cleanly without overlap.

### NFR-2 Language Intent

The shell may remain English-first, but the legal entry labels and visible legal content shall remain German-first in accordance with the requested compliance-oriented product behavior.

### NFR-3 Content Safety And Stability

The legal pages should render the authored content predictably as static content without introducing interactive editing states, partial loading artifacts, or formatting loss that would make the legal copy difficult to read.

### NFR-4 Maintainable Separation

The legal-page flow should stay clearly separated from gameplay rules so future work on moves, explosions, scoring, and winner flow does not become coupled to legal-content presentation.

## 10. User Flow / Process Description

### Flow A: Open Impressum During An Active Game

1. The user is on the main board shell during an active game.
2. The footer below the board shows `Impressum · Datenschutz`.
3. The user clicks `Impressum`.
4. The application opens the Impressum page inside the app.
5. A `Return to Game` button is visible at the top.
6. The user reads the legal text.
7. The user presses `Return to Game`.
8. The prior game shell reappears with the same game state still intact.

### Flow B: Open Datenschutz Before Any Game Has Started

1. The user opens the application and sees the idle board-first shell.
2. The footer below the board shows `Impressum · Datenschutz`.
3. The user clicks `Datenschutz`.
4. The application opens the Datenschutz page inside the app.
5. A `Return to Game` button is visible at the top.
6. The user presses `Return to Game`.
7. The application returns to the idle board shell without starting a game automatically.

### Flow C: Read Long Privacy Content

1. The user opens the Datenschutz page.
2. The page displays the full static legal text sourced from `papers/legal/privacy-policy.md`.
3. The content extends beyond the visible viewport height.
4. The user scrolls vertically through the legal page.
5. The full text remains readable without truncation.

## 11. Data / Domain Impact

This increment does not add new gameplay domain rules.

Conceptually, it adds a small amount of shell/navigation state:

- whether the user is currently in the board shell or a legal-content view
- which legal page, if any, is currently open
- what board/game state should be resumed when leaving the legal page

The legal text itself is sourced from repository-authored documents and is not modeled as gameplay data.

## 12. API / Interface Impact

No backend or external API changes are required for this increment.

Frontend interface impact is expected conceptually in:

- top-level shell state or route state for switching between board and legal views
- footer interaction handling
- static content rendering for the two legal documents
- preserving current game/idle state while a legal page is open

## 13. UI / UX Considerations

- The footer should feel like low-emphasis application chrome, not like a gameplay toolbar.
- The legal pages should remain visually consistent with the application's established dark shell unless the team explicitly chooses otherwise later.
- The `Return to Game` button should be immediately discoverable at the top of each legal page.
- The legal pages should prioritize readability over visual decoration.
- The German legal labels are intentional and must not be normalized into English for consistency with the rest of the UI.

## 14. Edge Cases

- If the user opens a legal page while a game is in progress, returning must not reset the board or restart the match.
- If the user opens a legal page before any game exists, returning must not create a new game implicitly.
- The privacy policy content is long and may require scrolling; the page must still expose the full text.
- The source documents contain placeholders and authoring comments; the user-facing rendering must remain safe and readable even when real legal data has not yet been supplied.
- The footer must remain present on the board shell even when the rest of the interface is in English.

## 15. Risks / Constraints / Dependencies

- This increment depends on `papers/screen-layout.md` remaining the design reference for footer placement and board/footer coexistence.
- The legal source files contain unresolved placeholders, so the resulting user-facing content may still be legally incomplete until the operator replaces those values.
- If the app later introduces more complex routing or modal flows, the legal-page navigation must continue to preserve game state rather than accidentally reinitializing the shell.
- Rendering repository-authored markdown or rich text safely is important so the legal pages do not expose raw formatting artifacts unnecessarily.

## 16. Assumptions

- `papers/game-overview.md` remains the canonical source for gameplay behavior, and this increment does not alter any of those rules.
- `papers/screen-layout.md` is the canonical source for where the footer belongs in the shell.
- The product requirement that these legal pages be shown in German takes precedence over the otherwise English shell language.
- The legal source files in `papers/legal` are the current source of truth for the content of the two pages, even though they still contain placeholders.
- Returning from a legal page should restore the previously visible shell context rather than always navigating to a fresh home state.

## 17. Open Questions

- No additional product questions are required for this increment if the team accepts that the legal pages are in-app static views, that gameplay state is preserved while they are open, and that unresolved placeholders remain visible until real legal data is supplied.

## 18. Acceptance Criteria

- Given the user is on the board-first shell, when the footer is shown, then it contains exactly the entries `Impressum` and `Datenschutz` in German.
- Given the rest of the application chrome is in English, when the footer is shown, then the two legal entries still remain `Impressum` and `Datenschutz`.
- Given the user clicks `Impressum`, when navigation occurs, then a static in-app legal page opens with a `Return to Game` button at the top and legal content sourced from `papers/legal/imprint.md`.
- Given the user clicks `Datenschutz`, when navigation occurs, then a static in-app legal page opens with a `Return to Game` button at the top and legal content sourced from `papers/legal/privacy-policy.md`.
- Given a legal page is open, when the user reads beyond the initial viewport height, then the page allows vertical scrolling so the full text remains accessible.
- Given an active game is in progress, when the user opens a legal page and then presses `Return to Game`, then the prior game state is restored without reset or turn changes.
- Given no game has started yet, when the user opens a legal page and then presses `Return to Game`, then the idle board shell is restored and no new game is created.
- Given the source legal files still contain placeholders, when the pages are rendered, then the application does not invent substitute values and the content remains readable.
- Given the footer is integrated into the shell, when the board page is displayed, then the footer does not overlap or obscure the board area.

## 19. Implementation Notes (Optional)

- A simple top-level view switch or route-based approach would both satisfy this specification as long as game state is preserved when navigating to and from legal pages.
- The safest content path is to treat the repository legal files as authored source content and render them as static content rather than hand-copying fragmented text into components.
- If the source files include repository-only notes or comments, the user-facing page can omit those notes while still preserving the intended German legal text.

## 20. Definition of Done

This specification is ready for implementation when:

- the team agrees that the footer belongs to the board shell per `papers/screen-layout.md`
- the team accepts `Impressum` and `Datenschutz` as fixed German labels in the otherwise English app
- the team accepts that both legal pages are static in-app views sourced from `papers/legal`
- the team accepts that `Return to Game` restores the prior shell/game context without resetting it
