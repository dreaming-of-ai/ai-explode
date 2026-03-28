# Specification

## 1. Title

Header Icon Bar Popups

## 2. Summary

Add the next shell increment from `papers/screen-layout.md`: a top-right header icon bar with three entries, `Gaming Rules`, `Information`, and `Settings`. Each icon opens a centered modal popup. For this increment, the `Gaming Rules` popup shall display a short in-app summary of the gameplay rules derived from `papers/game-overview.md`, while `Information` and `Settings` shall open intentionally empty placeholder popups with only the modal chrome and title.

## 3. Background / Problem Statement

`papers/screen-layout.md` already defines the intended application chrome in the header, including a right-aligned icon bar with three entries:

- `Gaming Rules`
- `Information`
- `Settings`

That design reference describes the intended interaction pattern at a high level, but the feature has not yet been turned into a concrete implementation slice.

At the same time, `papers/game-overview.md` contains the canonical gameplay rules for AI Explode, including turn structure, explosions, sweep-based chain reactions, elimination, and victory conditions. Those rules are currently documented for implementers and product work, but not yet surfaced to players inside the application shell.

This leaves three gaps:

- the header icon bar from `papers/screen-layout.md` is not yet specified as a user-facing feature increment
- players do not yet have a lightweight in-app way to read the core rules while on the game screen
- the future `Information` and `Settings` destinations have no placeholder interaction, which makes the shell design incomplete

This increment fills those gaps in the smallest coherent way by adding the full header icon interaction pattern, making the rules icon useful immediately, and deferring actual information/settings content until later increments.

## 4. Goal

Ensure that the main AI Explode shell exposes the header icon bar described in `papers/screen-layout.md`, provides players with a concise in-app `Gaming Rules` reference based on `papers/game-overview.md`, and establishes reusable popup behavior for the `Information` and `Settings` icons without yet committing to their eventual content.

## 5. Scope

Included in scope:

- Add the top-right header icon bar defined in `papers/screen-layout.md`.
- Show exactly three icons in this order from left to right:
  - `Gaming Rules`
  - `Information`
  - `Settings`
- Make each icon open a centered modal popup with a shared interaction pattern.
- Define the visible content of the `Gaming Rules` popup as a short summary derived from `papers/game-overview.md`.
- Define `Information` and `Settings` as intentionally empty placeholder popups for now.
- Keep popup behavior available from the main board-first shell in idle, active-game, and post-game states.
- Preserve the underlying game/shell state when a popup is opened and closed.

## 6. Out of Scope

Explicitly out of scope for this specification:

- Implementing any actual settings controls, preferences, toggles, or persisted configuration
- Implementing version display, credits, author metadata, legal links, or other real information content inside the `Information` popup
- Changing, simplifying, or rebalancing the canonical gameplay rules in `papers/game-overview.md`
- Adding backend APIs, persistence, database changes, or server-side rendering for the popup content
- Introducing a separate full-screen rules page, tutorial flow, or onboarding sequence
- Defining mobile-specific redesigns beyond keeping the header icon feature compatible with the existing shell direction
- Translating the popup content into additional languages

## 7. Stakeholders / Users Affected

- Players, who need an in-app way to read the core rules without leaving the game shell
- Designers and frontend implementers responsible for the application chrome and popup interactions
- Product owners, who need the header layout described in `papers/screen-layout.md` to be realized incrementally without overcommitting future content decisions

## 8. Functional Requirements

### FR-1 Header Icon Bar Presence

The main application header shall include a right-aligned icon bar as described in `papers/screen-layout.md`.

The icon bar shall be visible whenever the main board-first shell is visible, including:

- before a game has started
- during an active game
- after a game has concluded, if the board shell is still the active view

### FR-2 Icon Set And Order

The header icon bar shall contain exactly three entries in this left-to-right order:

1. `Gaming Rules`
2. `Information`
3. `Settings`

Each entry shall be represented by an icon consistent with the glyph guidance in `papers/screen-layout.md`:

- book or scroll for `Gaming Rules`
- circle-i for `Information`
- gear/cog for `Settings`

The exact icon asset source is not prescribed by this specification as long as the three actions remain visually distinct and recognizable.

### FR-3 Shared Popup Behavior

Clicking any header icon shall open a modal popup centered in the viewport with:

- a semi-transparent dark backdrop
- a clearly visible close button (`×`) in the top-right corner of the popup
- dismissal on close-button click
- dismissal on backdrop click
- dismissal on `Escape`

If popup content exceeds the available height, the popup content area shall support internal scrolling.

Only one header popup may be open at a time.

### FR-4 Modal Interaction Blocking

While a header popup is open:

- the underlying board shell shall remain visible only as background context behind the backdrop
- gameplay interactions with the board and shell controls behind the popup shall not be available
- opening and closing a popup shall not reset, restart, or otherwise mutate the current game/session state

If the application has automated turn progression active, that progression shall not continue while the popup is open.

### FR-5 Gaming Rules Popup Availability

Clicking the `Gaming Rules` icon shall open a popup titled `Gaming Rules`.

This popup shall contain a short player-facing rules summary derived from `papers/game-overview.md`. The summary shall be concise, but it must remain faithful to the canonical rules and include the core mechanics that make AI Explode distinct.

### FR-6 Required Rules Summary Content

The `Gaming Rules` popup shall include, in concise form, all of the following topics:

- the game is played by 2 to 4 players on an 8×8 board by default
- players take turns in fixed order
- on a turn, a player may either occupy an empty field or reinforce a field they already own
- players may not place load on an opponent-owned field
- each field has a liberty count based on adjacent fields, including diagonals
- a field explodes when its load becomes strictly greater than its liberty count
- an explosion distributes load to adjacent fields, keeps a remainder on the exploding field, and transfers affected neighboring ownership to the active player
- chain reactions are resolved in full-board sweeps from top-left to bottom-right until a sweep produces no explosions
- from round 2 onward, players with no remaining fields are eliminated
- from round 2 onward, a player wins as soon as all occupied fields belong to them

The rules popup does not need to reproduce `papers/game-overview.md` verbatim, but it shall not omit the diagonal-adjacency model or replace sweep-based resolution with a simpler but inaccurate explanation.

### FR-7 Rules Summary Presentation

The `Gaming Rules` popup shall present the rules summary in a readable, scannable structure suitable for quick in-game reference.

The summary should be organized into short sections or bullets rather than as a long uninterrupted paragraph.

### FR-8 Information Popup Placeholder

Clicking the `Information` icon shall open a popup titled `Information`.

For this increment, the popup body is intentionally empty. No version details, credits, legal links, external links, or explanatory copy are required.

Aside from standard popup chrome such as the title and close affordances, this popup is a placeholder only.

### FR-9 Settings Popup Placeholder

Clicking the `Settings` icon shall open a popup titled `Settings`.

For this increment, the popup body is intentionally empty. No toggles, selectors, forms, or saved preferences are required.

Aside from standard popup chrome such as the title and close affordances, this popup is a placeholder only.

### FR-10 State Preservation On Close

Closing any header popup shall return the user to the exact same underlying shell state that was visible before the popup opened.

This means:

- an active game remains active
- the current board state is unchanged
- the current player and round state are unchanged
- no new game is started automatically
- no gameplay result dialogs or other shell state are dismissed unless the user explicitly closes them separately

## 9. Non-Functional Requirements

### NFR-1 Layout Consistency

The icon bar and popups shall remain visually aligned with the dark-shell direction defined in `papers/screen-layout.md`. The header icons should read as secondary application chrome rather than as primary gameplay controls.

### NFR-2 Rules Fidelity

The `Gaming Rules` popup shall remain semantically consistent with `papers/game-overview.md`. The short form may compress wording, but it must not change the meaning of the rules.

### NFR-3 Readability

The `Gaming Rules` popup should be easy to scan quickly during play. Dense wall-of-text presentation should be avoided.

### NFR-4 Extensibility

The `Information` and `Settings` popups should be specified in a way that allows later increments to add real content without redesigning the overall header-popup interaction model.

### NFR-5 Modal Usability

Popup dismissal must remain predictable and consistent across all three icons, especially for repeated open/close interactions during gameplay.

## 10. User Flow / Process Description

### Flow A: Open And Close Gaming Rules During An Active Game

1. The user is on the main game shell during an active match.
2. The header shows the icon bar in the upper-right area.
3. The user clicks the `Gaming Rules` icon.
4. A centered popup opens with a dark backdrop and the title `Gaming Rules`.
5. The user reads the short rules summary.
6. The user closes the popup using the close button, the backdrop, or `Escape`.
7. The same active game shell remains visible and unchanged.

### Flow B: Open Information Placeholder

1. The user is on the main shell.
2. The user clicks the `Information` icon.
3. A centered popup titled `Information` opens.
4. The popup has standard modal chrome but no feature content in its body.
5. The user closes the popup and returns to the unchanged shell state.

### Flow C: Open Settings Placeholder

1. The user is on the main shell.
2. The user clicks the `Settings` icon.
3. A centered popup titled `Settings` opens.
4. The popup has standard modal chrome but no feature content in its body.
5. The user closes the popup and returns to the unchanged shell state.

## 11. Data / Domain Impact

This increment does not change gameplay rules or backend domain behavior.

Conceptually, it introduces only small shell-level UI state:

- whether a header popup is currently open
- which popup is open
- the static short-form rules content shown in the `Gaming Rules` popup

The canonical source of truth for gameplay rules remains `papers/game-overview.md`.

## 12. API / Interface Impact

No backend API changes are required for this increment.

Frontend interface impact is expected conceptually in:

- header chrome interactions
- popup open/close state
- temporary suspension of background shell interaction while a popup is open
- rendering static rules-summary content inside the `Gaming Rules` popup

## 13. UI / UX Considerations

- The icon bar should appear in the upper-right header area with muted styling and a hover-brightening effect consistent with `papers/screen-layout.md`.
- Popup titles should match the entry names exactly:
  - `Gaming Rules`
  - `Information`
  - `Settings`
- The `Gaming Rules` content should favor short headings and bullets over long prose blocks.
- The two placeholder popups should feel intentionally incomplete rather than broken; however, this increment does not require any placeholder sentence such as `Coming soon`.
- The popup content area should remain scrollable if future content or the current rules summary exceeds the visible space.

## 14. Edge Cases

- If the user presses `Escape` repeatedly, the open popup should close cleanly without affecting the underlying shell state beyond dismissing the popup itself.
- If the user clicks the backdrop, only the popup should close; no other background action should fire.
- If the `Gaming Rules` summary requires more vertical space than available, the popup content must remain readable through internal scrolling.
- If a game with computer players is active, opening a header popup must not allow background turns to continue while the popup is visible.
- Reopening the same popup multiple times in a session should always show the same defined content/state for this increment.

## 15. Risks / Constraints / Dependencies

- This increment depends on `papers/screen-layout.md` remaining the canonical header and popup design reference.
- The gameplay summary depends on `papers/game-overview.md` remaining the canonical rules source.
- Because `Information` and `Settings` are intentionally empty in this increment, later work must define real content without breaking the popup contract established here.
- If the shell already contains other modal flows, the header popup behavior must coexist with them predictably so input blocking and focus behavior remain stable.

## 16. Assumptions

- The main application shell remains English-language for these header labels and popup titles.
- A concise player-facing rules summary is preferable here to showing the full text of `papers/game-overview.md`.
- The placeholder `Information` and `Settings` popups are intentionally blank by product decision and are not considered incomplete implementations for this increment.
- Reusing existing modal behavior patterns is preferred over inventing a separate popup interaction model.

## 17. Open Questions

- No additional product questions are required for this increment if the team accepts that `Information` and `Settings` are title-only placeholder popups for now and that the `Gaming Rules` popup is a concise summary rather than a full rulebook rendering.

## 18. Acceptance Criteria

- The main shell displays a right-aligned header icon bar with exactly three entries in this order: `Gaming Rules`, `Information`, `Settings`.
- Clicking any of the three icons opens a centered popup with a dark backdrop, a visible close button, and dismissal via close button, backdrop click, and `Escape`.
- Only one header popup can be open at a time.
- Clicking `Gaming Rules` opens a popup titled `Gaming Rules` whose content gives a short, scannable, faithful summary of the rules from `papers/game-overview.md`, including turn actions, diagonal-adjacency liberties, explosion behavior, sweep-based chain reactions, elimination, and victory.
- Clicking `Information` opens a popup titled `Information` whose body is intentionally empty apart from normal popup structure.
- Clicking `Settings` opens a popup titled `Settings` whose body is intentionally empty apart from normal popup structure.
- While a popup is open, the board and underlying shell controls are not interactable.
- Opening and closing any popup does not reset or mutate the current game or idle shell state.
- If popup content exceeds visible height, the popup body remains readable through internal scrolling.

## 19. Implementation Notes (Optional)

- The header popups should reuse the project's established modal behavior where possible so dismissal, focus handling, and background interaction blocking stay consistent with the rest of the shell.
- The `Gaming Rules` content should be maintained as concise static UI copy derived from `papers/game-overview.md`, not as a new gameplay source of truth.
