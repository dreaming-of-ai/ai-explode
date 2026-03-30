# Specification

## 1. Title

Mobile Shell Support for Board Visibility and Primary Actions

## 2. Summary

Refine the AI Explode game shell so common mobile phone viewports are supported in both portrait and landscape orientation. The mobile layout must keep the full 8x8 board visible, keep the "New Game" action reachable, and prevent the board from shrinking into an impractically small play surface when the device rotates.

## 3. Background / Problem Statement

The current shell is based on the board-first responsive work documented in `papers/done/specs/2026-03-26_SPEC_responsive-board-first-shell.md` and the durable layout guidance in `papers/screen-layout.md`.

That shell works well on desktop and tablet-sized viewports, but it still has visible issues on phones:

- on narrow portrait phones, the sidebar stacks below the board and the "New Game" button can fall behind the visible board area instead of remaining reachable
- on short landscape phone viewports, the board scales down too aggressively and becomes visually tiny
- the current design reference in `papers/screen-layout.md` explicitly says portrait phone layouts are not a priority, which no longer matches the desired product behavior

These issues undermine the board-first vision from `papers/game-overview.md`, because players on a shared device need a layout that keeps the board playable and the primary action discoverable on mobile as well.

## 4. Goal

Deliver a mobile-friendly game shell where players can comfortably see and use the board, access the "New Game" action without layout workarounds, and rotate the device without losing a legible play surface or breaking the active session.

## 5. Scope

Included in scope:

- define supported mobile portrait and landscape shell behavior for the main game screen
- keep the board and the primary "New Game" action visible and reachable on supported mobile viewports
- define how secondary sidebar content behaves on phones so it no longer forces the board or action controls off-screen
- define orientation-change behavior for the active shell
- define mobile-specific usability constraints for board sizing and tappable controls
- define how existing shell modals should continue to fit on supported mobile viewports

## 6. Out of Scope

Explicitly out of scope:

- gameplay rule changes
- changing the default 8x8 board size
- backend or API changes
- redesigning the player setup flow beyond layout and viewport-fit requirements
- adding new game features unrelated to mobile layout
- tablet- or desktop-specific visual redesign beyond what is required to keep responsive behavior coherent

## 7. Stakeholders / Users Affected

- players using phones in portrait orientation
- players using phones in landscape orientation
- implementers responsible for the frontend shell and responsive layout
- designers maintaining consistency between `papers/screen-layout.md` and the live application shell

## 8. Functional Requirements

### FR-1 Supported Mobile Viewports

The main board shell shall support common phone-sized viewports at `360x640` CSS pixels and above in portrait, and `640x360` CSS pixels and above in landscape.

### FR-2 Board Visibility on Mobile

On supported mobile viewports, the full default 8x8 board shall remain visible inside the viewport without requiring document-level scrolling.

### FR-3 Primary Action Visibility on Mobile

On supported mobile viewports, the primary "New Game" action shall remain visible and tappable in the board shell. It shall not be hidden behind the board, clipped outside the visible shell, or accessible only by unreachable off-screen content.

### FR-4 No Board-Action Overlap

The mobile layout shall not place the board and the primary action in a way that visually overlaps, obscures, or blocks interaction with either element.

### FR-5 Mobile Layout Prioritization

When space is constrained on mobile, the shell shall prioritize, in order:

1. board visibility
2. primary action visibility
3. active-turn context
4. secondary informational content such as scoreboard detail or overview copy

Secondary content may collapse, condense, move behind a compact disclosure pattern, or otherwise switch to a denser presentation so the first two priorities remain intact.

### FR-6 Portrait Mobile Behavior

On supported portrait phone viewports, the board shall remain the dominant visual element and the primary "New Game" action shall remain directly reachable without requiring the user to rotate the device.

### FR-7 Landscape Mobile Behavior

On supported landscape phone viewports, the shell shall re-balance chrome, spacing, and secondary content so the board remains visually dominant and does not shrink into a tiny, hard-to-use play surface.

### FR-8 Orientation Change Reflow

When a supported mobile device rotates between portrait and landscape during an idle game, active game, concluded game, or open shell modal, the layout shall reflow to the new orientation without losing current game state or leaving controls clipped.

### FR-9 Secondary Sidebar Content on Mobile

On supported mobile viewports, scoreboard and overview content shall remain available, but it shall not require a permanently visible desktop-style sidebar if that would reduce board usability or hide the primary action.

### FR-10 Mobile Modal Fit

The existing setup, restart warning, move result, and header popup modals shall continue to fit within supported mobile viewports. Their actions must remain reachable even on short landscape screens, using internal scrolling if needed.

### FR-11 Safe-Area Awareness

Any mobile-specific action placement near viewport edges shall respect device safe areas so actions, footer content, and modal controls are not blocked by notches, rounded corners, or home-indicator areas.

### FR-12 State Preservation

Mobile layout changes and orientation changes shall not reset the current match, clear the scoreboard, or dismiss a modal unless the user explicitly performs that action.

## 9. Non-Functional Requirements

### NFR-1 Mobile Touch Usability

On supported mobile viewports, each board cell shall remain large enough for touch interaction and visual recognition. The minimum rendered interactive cell size shall be `32x32` CSS pixels.

### NFR-2 Primary Action Tap Target

The mobile presentation of the "New Game" action shall provide a touch target of at least `44x44` CSS pixels.

### NFR-3 Responsive Stability

Mobile layout changes shall react correctly to dynamic viewport changes caused by browser chrome expanding or collapsing. The shell shall remain usable without requiring a full page reload.

### NFR-4 Accessibility

Compact mobile patterns used for scoreboard or secondary content shall remain keyboard-accessible and screen-reader understandable, consistent with the existing modal accessibility baseline.

### NFR-5 Maintainability

The mobile support refinement should extend the current frontend shell rather than introduce a separate mobile-only gameplay flow.

## 10. User Flow / Process Description

### Flow A: Portrait Phone, Start a New Match

1. The user opens the app on a supported portrait phone viewport.
2. The board is fully visible within the viewport.
3. The "New Game" action is immediately visible and tappable.
4. The user taps "New Game."
5. The setup modal opens and fits within the viewport.
6. The user starts a match and returns to the board shell without layout breakage.

### Flow B: Portrait Phone, Active Match

1. The user is playing on a supported portrait phone viewport.
2. The board remains the dominant element.
3. The user can still reach the primary "New Game" action.
4. Secondary score or overview content remains available through the mobile layout pattern without pushing the board or primary action off-screen.

### Flow C: Rotate to Landscape During Play

1. The user is in an active match on a phone.
2. The device rotates to landscape.
3. The shell reflows to the landscape mobile layout.
4. The board stays fully visible and remains comfortably usable.
5. The current game state, turn context, and modal state remain unchanged.

## 11. Data / Domain Impact

No gameplay-domain or backend data changes are required.

Conceptually, the frontend shell may need additional UI state for mobile-only presentation behavior such as:

- whether secondary information is collapsed or expanded
- whether a mobile action region or compact info region is visible
- viewport or orientation-aware layout mode

These are presentation concerns only and shall not alter the authoritative game state.

## 12. API / Interface Impact

No backend or external API changes are required.

Frontend interface impact is expected in:

- top-level shell layout behavior
- placement and presentation of the primary "New Game" action on mobile
- presentation of scoreboard and overview content on mobile
- resize and orientation handling for board sizing and modal fit

## 13. UI / UX Considerations

- The board should continue to be the hero element on every supported viewport.
- The mobile "New Game" action should stay easy to discover and easy to reach with touch.
- The chosen mobile pattern for secondary content should reduce clutter rather than recreate the desktop sidebar in a cramped form.
- Mobile chrome should compact before the board gives up critical space.
- The solution should feel like the same AI Explode shell, not a separate mobile product.

## 14. Edge Cases

- supported short landscape phone viewport with an active game and four-player scoreboard data
- long player names that increase the height or width pressure of score content
- an open setup or restart modal during rotation
- browser UI chrome expanding or collapsing and changing the effective viewport height
- devices with safe-area insets
- a concluded match where winner messaging and the "New Game" action are both visible on mobile

## 15. Risks / Constraints / Dependencies

- `papers/screen-layout.md` currently treats portrait phone layouts as non-priority; implementation will need to intentionally supersede that part of the older guidance
- the current shell already optimizes for a no-document-scroll viewport; the mobile solution must preserve that principle for the core board shell without making controls inaccessible
- mobile improvements depend on careful balancing of header, footer, board sizing, and secondary panel density rather than a single breakpoint change

## 16. Assumptions

- this feature affects the frontend only
- the board remains 8x8 for this work
- supported mobile behavior targets common modern phone viewports, not watches, foldables, or ultra-small legacy devices below the defined viewport floor
- internal scrolling inside modals or compact secondary panels is acceptable, but document-level scrolling is not the primary mechanism for reaching the board or the "New Game" action

## 17. Open Questions

- Which compact mobile pattern should secondary score and overview content use: collapsible section, drawer, segmented panel, or another approach?
- Should the mobile "New Game" action live at the top of the shell, near the footer, or in a dedicated mobile action bar, as long as the visibility requirements are met?

## 18. Acceptance Criteria

- Given a `360x640` portrait viewport, when the board shell loads, then the full 8x8 board is visible and the "New Game" action is visible and tappable without document scrolling.
- Given a `640x360` landscape viewport, when the board shell loads or the device rotates into landscape, then the full 8x8 board remains visible and each board cell renders at no smaller than `32x32` CSS pixels.
- Given a supported mobile viewport and an active match, when the secondary score or overview content is present, then that content does not hide the "New Game" action or force the board off-screen.
- Given a supported mobile viewport with an open setup, restart warning, move result, or header popup modal, when the modal is shown, then its primary actions remain reachable within the viewport.
- Given a supported mobile viewport, when browser chrome or safe-area constraints change the effective viewport bounds, then the shell remains usable and no primary action is clipped into an unsafe area.
