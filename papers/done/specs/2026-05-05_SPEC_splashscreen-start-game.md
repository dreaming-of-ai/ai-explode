# Specification

## 1. Title

Splashscreen With Start Game Button

## 2. Summary

Add an initial splashscreen to the AI Explode frontend. On the first application view, users see the provided AI Explode image and a prominent "Start Game" button below it. Activating the button transitions to the current game view.

## 3. Background / Problem Statement

The application currently opens directly into the game shell. The user wants a first-launch visual entry screen that introduces the game with the provided image before showing the existing board and controls.

This feature aligns with the durable product context in `papers/game-overview.md` by presenting AI Explode as a tactical chain-reaction game before the playable screen is shown.

## 4. Goal

When a user opens the application, the first visible screen should be a polished splashscreen. The user can clearly start the game and reach the existing current game view without losing any existing game behavior.

## 5. Scope

- Add a frontend-only splashscreen as the first view shown by the app.
- Display the provided AI Explode image as the primary splash visual.
- Place a clearly visible "Start Game" button below the image.
- Transition from the splashscreen to the current game view when the button is activated.
- Preserve existing game shell behavior after the splashscreen is dismissed.
- Keep the layout usable on desktop, tablet, and phone viewports.

## 6. Out of Scope

- Backend changes.
- API contract changes.
- Persistent user preference for skipping the splashscreen.
- New routing infrastructure.
- Changes to game rules, board logic, setup flow, legal pages, or modal contents.
- Redesigning the current game screen.

## 7. Stakeholders / Users Affected

- Players opening AI Explode in the browser.
- Future maintainers working on frontend shell and onboarding behavior.

## 8. Functional Requirements

- FR-1: The application must show the splashscreen before the current game view on initial load.
- FR-2: The splashscreen must display the provided AI Explode image as the dominant visual element.
- FR-3: A visible button labeled exactly "Start Game" must appear below the image.
- FR-4: Activating "Start Game" must reveal the current game view.
- FR-5: Existing current game interactions must remain available after the splashscreen is dismissed.
- FR-6: The splashscreen must not require backend data or network calls.

## 9. Non-Functional Requirements

- The implementation must remain within the frontend layer.
- The splashscreen should fit within the viewport and avoid page-level scrolling where practical.
- The button must be keyboard-focusable and accessible to screen readers.
- The image must include useful alternative text.
- The change should be small and consistent with existing Vue 3 and TypeScript patterns.
- No new dependencies should be added.

## 10. User Flow / Process Description

1. User opens the application.
2. The splashscreen appears.
3. User sees the provided AI Explode image.
4. User activates the "Start Game" button.
5. The splashscreen is dismissed.
6. The existing game view is shown.
7. Existing setup, gameplay, legal footer, and header popup behavior continue unchanged.

## 11. Data / Domain Impact

No domain model, game state, persistence, or backend data changes are required. The only new state is local UI state controlling whether the splashscreen has been dismissed during the current app session.

## 12. API / Interface Impact

No API or backend interface impact.

## 13. UI / UX Considerations

- The provided image should be visually prominent and maintain its aspect ratio.
- The "Start Game" button should sit directly below the image and be clearly distinguishable as the primary action.
- The splashscreen should use the existing dark visual theme.
- On smaller screens, the image should scale down and the button should remain visible and tappable.
- The current game view should be hidden while the splashscreen is visible.

## 14. Edge Cases

- Very short viewports should still keep the button reachable.
- If the image cannot load, the button should still be visible so the game remains accessible.
- Keyboard users should be able to tab to and activate the button.

## 15. Risks / Constraints / Dependencies

- The provided image asset must be available to the frontend build or public assets.
- The existing application shell uses a constrained `100dvh` layout, so the splashscreen must respect viewport sizing.
- Because no router currently exists, adding routing solely for this feature would be unnecessary scope.

## 16. Assumptions

- "Beim ersten Aufruf der Anwendung" means the first view of a newly loaded app session, not a persistent once-ever preference across browser sessions.
- "Aktuelle Spielansicht" means the existing board/shell view currently rendered by `App.vue`.
- The feature is accepted as a frontend-only shell change.

## 17. Open Questions

- None blocking. Persistent skip behavior could be specified later if desired.

## 18. Acceptance Criteria

- Given the app is loaded, when the initial view renders, then the splashscreen is shown instead of the game board.
- Given the splashscreen is shown, then the provided AI Explode image is visible and scaled without distortion.
- Given the splashscreen is shown, then a prominent button labeled "Start Game" is visible below the image.
- Given the user activates "Start Game", then the current game view is displayed.
- Given the current game view is displayed, then existing gameplay and shell controls continue to work as before.
- Given a phone-sized viewport, then the button remains visible or reachable and has an adequate touch target.
