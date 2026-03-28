# Specification

## 1. Title

Responsive Board-First Shell and New Game Modal Refinement

## 2. Summary

Refine the initial graphical setup of _AI Explode_ so the board is visible immediately, the layout stays responsive without requiring page scrolling to see the board, and game creation moves into a dedicated "New Game" modal. The shell should also support a guarded restart flow that warns before replacing an unfinished game and shows the current score summary.

## 3. Background / Problem Statement

The current frontend opens in a setup-heavy landing layout that hides the board until the game starts. It also gives significant visual weight to supporting copy such as "What ships now," while the core play surface and primary action are deferred.

This causes several product and UX issues:

- The board, which is the center of the game, is not visible on first load.
- The header hierarchy does not yet match the desired emphasis: "AI Explode" should stand out more, while "Tactical chain-reaction playground" should be smaller and stay on one line.
- The current setup flow occupies the main screen instead of using a focused modal.
- Restarting a running game has no confirmation path.
- The layout is not yet explicitly defined to guarantee that the board remains fully visible without scrolling.

The requested change is a refinement of the existing game shell, not a new gameplay feature. The goal is to make the first impression more board-centric, safer to restart, and more responsive across viewport sizes.

## 4. Goal

Present a board-first shell where users can always see the game board immediately, start a new game through a modal flow, and safely interrupt an existing session only after a clear warning. The updated shell should prioritize the game brand, simplify the setup presentation, and keep the board fully visible across supported responsive breakpoints.

## 5. Scope

Included in scope:

- Rework the top-level screen so the board is visible from initial load onward.
- Add a persistent "New Game" action to open player configuration in a modal.
- Move player setup into the modal instead of using a full setup page.
- Remove the "What ships now" panel.
- Adjust header typography and visual hierarchy.
- Define responsive behavior so the board remains fully visible without page scroll on supported viewports.
- Add a restart-warning modal when "New Game" is triggered during an unfinished game.
- Show current score details, and eliminated-player status when available, inside the restart warning.
- Define ordered color availability behavior across player slots.

## 6. Out of Scope

Explicitly out of scope for this specification:

- New gameplay mechanics such as explosions or chain-reaction resolution
- Persistent save/resume support
- Multiplayer networking or backend storage
- Reworking the underlying scoring model beyond what is needed to display the current score in the warning dialog
- Final winner flow or end-of-match celebration UX
- Audio, advanced animation, or tutorial content

## 7. Stakeholders / Users Affected

- First-time players who need to understand the game at a glance
- Returning players who want faster access to a new round
- Designers and implementers responsible for the game shell and responsive behavior

## 8. Functional Requirements

### FR-1 Board-First Initial State

The application shall render the game board immediately on first load. The board shall no longer be hidden behind a full-screen player setup view.

### FR-2 Initial Idle State Before Game Start

Before a game is started, the board area shall remain visible in an idle, non-playing state. The shell may show supporting copy or an overlay cue near the board, but the board itself must remain visible and recognizable.

### FR-3 New Game Primary Entry Point

The shell shall provide a visible "New Game" button from the beginning. This action shall open a modal dialog for player configuration.

### FR-4 Player Setup Modal

The "New Game" modal shall allow users to:

- define 2 to 4 players
- enter a name for each player
- assign a unique color to each player
- start the game only when validation passes

The modal replaces the current full-page setup flow.

### FR-5 Start Game Behavior

When the setup modal is submitted successfully:

- a fresh game session shall be created
- the board shall reset to an empty starting state
- the configured player roster shall become active
- the modal shall close

### FR-6 Restart Guard For Unfinished Game

If the user presses "New Game" while an unfinished game is in progress, the application shall not immediately discard the current session. Instead, it shall show a warning dialog before any reset happens.

For this specification, an unfinished game means any currently active game session that has not been explicitly concluded by a winner or end-state flow.

### FR-7 Restart Warning Content

The warning dialog shall summarize the current game so the user can make an informed decision. At minimum, it shall display:

- current round or turn context
- each player's current score as occupied-field count
- whether a player has already been eliminated, if elimination state is available in the game state

If elimination is not yet available in the current increment, the dialog shall still show the score summary and remain structurally ready to display eliminated players later.

### FR-8 Restart Warning Actions

The warning dialog shall offer two explicit actions:

- continue the current game and close the warning
- start over and proceed to new game setup

Choosing to start over shall open the player setup modal and allow the user to configure the replacement game.

### FR-9 Header Hierarchy Update

The header shall be visually rebalanced so that:

- "AI Explode" is more prominent than it is today
- "Tactical chain-reaction playground" is smaller than it is today
- the headline stays on a single line on supported viewport sizes

### FR-10 Removal Of "What Ships Now"

The "What ships now" content block shall be removed from the shell.

### FR-11 Responsive Board Visibility

The layout shall be designed so that the full default 8x8 board remains visible without requiring page scrolling on supported viewports. Supporting panels, status areas, and controls may compress, stack, collapse, or move into denser layouts as needed, but the board itself must remain fully visible.

### FR-12 Responsive Layout Prioritization

When viewport height or width is constrained, the layout shall prioritize preserving board visibility over preserving large decorative copy or spacious panel layouts.

This may include:

- reducing header height
- reducing typography scale
- reducing panel padding and gaps
- moving secondary information below or beside the board in a compact form
- using modal-based controls instead of permanently visible setup content

### FR-13 Ordered Color Availability

Player color selection shall follow ordered availability:

- Player 1 can choose from all four colors.
- Player 2 can choose only from the three colors not currently assigned to Player 1.
- Player 3 can choose only from the colors not currently assigned to Players 1 and 2.
- Player 4 can choose only from the single remaining color not assigned to Players 1, 2, and 3.

### FR-14 Color Recalculation After Upstream Changes

If a player earlier in the list changes color, the available color options for all later players shall recalculate immediately so the ordered-availability rule remains true.

When such a change invalidates a later player's current selection, the application shall automatically move that later player to the next available remaining color so the modal never presents duplicate assignments as a stable state.

### FR-15 Player Validation

The player setup modal shall continue to enforce:

- minimum 2 players
- maximum 4 players
- required player names
- unique colors

Validation messaging shall remain visible within the modal.

## 9. Non-Functional Requirements

### NFR-1 Responsive Usability

On supported viewports, the interface shall keep the board fully visible within the viewport without requiring document scrolling to inspect the playfield.

### NFR-2 Visual Hierarchy

The shell shall emphasize the game brand and active game controls over explanatory marketing copy.

### NFR-3 Accessibility

Modal interactions shall support keyboard use, visible focus states, and a clear dismiss/continue path. Warning dialogs shall use explicit action labels rather than ambiguous confirmations.

### NFR-4 Maintainability

The refined shell should build on the current frontend structure and keep the board, sidebar, and setup responsibilities clearly separated so later gameplay features can be layered in without another major shell rewrite.

## 10. User Flow / Process Description

### Flow A: First Visit / No Active Game

1. The user opens the app.
2. The board is immediately visible in an idle state.
3. The user presses "New Game."
4. The player setup modal opens.
5. The user defines 2 to 4 players with names and unique colors.
6. The user starts the game.
7. The modal closes and the configured game begins on the visible board.

### Flow B: Start A Replacement Game While Another Game Is Running

1. The user is in an active game.
2. The user presses "New Game."
3. A warning dialog appears instead of immediately resetting the game.
4. The dialog shows the current score summary and any eliminated-player status that is available.
5. The user chooses either:
6. Continue current game: the warning closes and the current game remains unchanged.
7. Start over: the warning closes and the player setup modal opens.
8. The user configures players and starts a new game.
9. The current game is replaced only after the new game is confirmed.

### Flow C: Color Assignment In Setup Modal

1. Player 1 selects a color from all four options.
2. Player 2 sees only the remaining colors.
3. Additional players continue to receive only the remaining unassigned colors.
4. If an earlier player changes to a different color, later player options refresh immediately.
5. Any later player whose color is no longer valid is reassigned automatically to the next available color.

## 11. Data / Domain Impact

Conceptually, the shell will need to distinguish more UI states than the current `setup` versus `playing` split. The implementation will likely need separate state for:

- whether a setup modal is open
- whether a restart warning is open
- whether a game session is idle, active, or concluded
- a lightweight current-game summary for the restart warning

The score summary shown in the warning dialog depends on current per-player occupied-field counts, which already align with the existing scoreboard concept.

If elimination status is to be displayed, the game state or derived UI state must expose whether a player is eliminated. This specification does not require implementing elimination mechanics, but it does require the restart warning to be able to display that information once available.

## 12. API / Interface Impact

No backend or external API changes are required.

Frontend interface impact is expected in:

- app-shell state management
- modal open/close events
- restart confirmation handling
- derived score summary passed into the warning dialog
- player setup color-option calculation

## 13. UI / UX Considerations

- The board should remain the dominant visual element from the first render onward.
- The "New Game" button should be easy to discover and should not compete with excessive secondary copy.
- The player setup should feel like a focused task, which is why it moves into a modal instead of occupying the whole screen.
- The restart warning should feel intentional and informative, not like a generic browser confirm.
- The warning should clearly explain that the current game will be replaced only if the user proceeds.
- Secondary shell content should be simplified or compressed before the board is ever pushed out of view.
- On smaller screens, sidebar information may need to become more compact or move below the board, provided board visibility is preserved.

## 14. Edge Cases

- The user opens the setup modal before any game has ever been started.
- The user opens "New Game" during an active session but decides to continue instead.
- The user opens the warning, then dismisses it without choosing to start over.
- An earlier player's color change invalidates one or more later selections.
- The viewport height is limited and the shell must compress non-board content to keep the board visible.
- Elimination status is not yet available in the current gameplay increment; the warning still needs to display meaningful score information.
- The headline risks wrapping on narrower widths and must scale or layout differently before wrapping.

## 15. Risks / Constraints / Dependencies

- The current shell was structured around `setup` and `playing` as full-screen phases, so moving to modal-driven setup may require a moderate shell-state refactor.
- Guaranteeing full board visibility without page scroll may require tighter control of viewport-height-based spacing and panel behavior than the current layout uses.
- If elimination display is required immediately, it depends on game-state support that may not exist yet in the current increment.
- Auto-reassigning later player colors after an upstream change is deterministic but may surprise users unless the UI makes the update obvious.

## 16. Assumptions

- Supported responsive behavior includes at least common modern desktop and mobile viewport sizes where the app is expected to run in a single browser window.
- Keeping the board fully visible is a higher priority than keeping all supporting text permanently expanded.
- The restart warning may reuse the current scoreboard calculation for occupied-field counts.
- Eliminated-player display is included as a forward-compatible requirement; in the current simplified gameplay, it may not yet appear.
- Later player colors may be auto-adjusted to preserve uniqueness when an earlier selection changes.

## 17. Open Questions

- What minimum supported viewport size should be treated as the hard responsive target for the "board fully visible without scrolling" requirement?
- Should the board remain completely non-interactive before the first game starts, or should it show a lightweight empty-state prompt within the board area?
- When later player colors are auto-reassigned, should the UI show a short inline notice so the change is visible?
- If a game has technically started but no moves have been made yet, should pressing "New Game" still trigger the restart warning or go directly to setup?

## 18. Acceptance Criteria

- Given the app is opened for the first time, when the initial shell renders, then the default 8x8 board is already visible without opening setup first.
- Given the initial shell is visible, when the user looks at the primary controls, then a "New Game" button is available.
- Given the user presses "New Game" with no active game to protect, when the action is processed, then a player setup modal opens.
- Given the setup modal is open, when the user configures valid players and starts the game, then the modal closes and a fresh game begins on the visible board.
- Given the header is rendered, when the user views the title area, then "AI Explode" is more visually prominent and "Tactical chain-reaction playground" appears smaller on a single line.
- Given the shell is rendered, when the user scans the side content, then the "What ships now" box is no longer present.
- Given the player setup modal is open, when Player 1 selects a color, then Player 2 only sees the remaining colors.
- Given the player setup modal is open with 4 players, when the first three players each have a unique color, then Player 4 is limited to the one remaining color.
- Given a later player already has a color, when an earlier player changes to a color that removes that option, then the later player is reassigned to an available remaining color and duplicate colors do not persist.
- Given an unfinished game is active, when the user presses "New Game," then a warning dialog appears before any current game state is discarded.
- Given the restart warning is shown, when the user reviews it, then the current score is visible and eliminated-player status is shown whenever such state exists.
- Given the restart warning is shown, when the user chooses to continue the current game, then the warning closes and the existing game remains unchanged.
- Given the restart warning is shown, when the user chooses to start over, then the player setup modal opens and the current session is not replaced until the new setup is confirmed.
- Given the app is viewed on a supported responsive viewport, when the shell is rendered, then the full board remains visible without requiring page scrolling.
