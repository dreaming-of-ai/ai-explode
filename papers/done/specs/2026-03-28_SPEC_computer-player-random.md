# SPEC: Computer Player Support (Random)

**Date:** 2026-03-28  
**Status:** Draft  
**Reference:** `papers/game-overview.md`

---

## 1. Title

Computer Player Support (Random)

## 2. Summary

Add the first computer-controlled player option to the frontend game shell.
Each player slot in setup can stay human-controlled or be switched to computer
control. The first available computer player is `Random`, which automatically
plays one randomly selected legal move whenever its turn begins.

## 3. Background / Problem Statement

`papers/game-overview.md` defines computer-player support as a core game
capability: any player slot may be controlled by a computer, including fully
automated matches. The current frontend only supports human participants with
free-text names, so all turns require manual interaction on the board.

Without this feature:

- the setup flow cannot express human-vs-computer or computer-vs-computer games
- the game shell cannot advance turns for non-human participants
- the game overview and the playable product slice are out of alignment

## 4. Goal

Allow users to configure any player slot as a computer player and play a full
local match in which `Random` computer players take their turns automatically.

## 5. Scope

### In Scope

- frontend-only implementation in `frontend`
- setup controls for choosing whether each player slot is human or computer
- a computer-player selector shown when a slot is set to computer control
- one available computer player type: `Random`
- automatic naming for computer-controlled players using the computer-player
  name plus the player slot number, for example `Random 2`
- automatic execution of legal moves for active computer-controlled players
- support for mixed human/computer matches and fully automated matches
- validation updates needed for mixed controller types
- targeted automated tests for setup rules and computer-turn behavior
- documentation in `papers/in-progress` and `LEARNINGS.md`

### Out of Scope

- additional computer-player strategies beyond `Random`
- AI difficulty ratings or style descriptions in the UI
- backend APIs, persistence, or saved preferences
- animation systems beyond any minimal existing UI timing needed to make
  auto-play readable
- new win-condition or board-resolution rules
- analytics, telemetry, or match replay features

## 6. Stakeholders / Users Affected

- local players who want to play against the device
- users who want to watch automated matches
- future implementers adding stronger computer players on top of this slice

## 7. Functional Requirements

- **FR-1** Each setup player slot must let the user choose between `Human` and
  `Computer` control.
- **FR-2** When a slot is switched to `Computer`, the setup UI must reveal a
  control for selecting the computer player type.
- **FR-3** The initial implementation must offer exactly one computer player
  type: `Random`.
- **FR-4** A computer-controlled slot must use the display name
  `<computer player name> <player slot number>`, for example `Random 2`.
- **FR-5** Human-controlled slots must continue to allow manual name entry and
  keep existing color-selection behavior.
- **FR-6** Starting a game must remain blocked until all human slots have valid
  names, all players have unique colors, and all computer slots have a valid
  computer-player selection.
- **FR-7** During gameplay, when the active player is controlled by `Random`,
  the app must automatically choose one currently legal move and play it
  without requiring a board click.
- **FR-8** `Random` must only choose from the same fields a human player could
  legally play at that moment: empty fields or fields already owned by the
  active player.
- **FR-9** After a human move finishes resolving, the shell must continue into
  the next computer turn automatically if the next active player is a computer.
- **FR-10** After a computer move finishes resolving, the shell must either:
  continue to the next computer turn, pause for any existing result modal, or
  stop if the match is concluded.
- **FR-11** Manual board interaction must not be accepted while it is a
  computer-controlled player's turn.
- **FR-12** Existing elimination, winner detection, modal, and restart flows
  must keep working for games with computer players.

## 8. Non-Functional Requirements

- Keep the change frontend-only and reuse the current state/composable pattern.
- Keep move selection deterministic in tests by allowing the random source to be
  controlled or injected at the logic layer.
- Preserve current desktop usability and avoid broad visual redesign.
- Keep the feature extensible so more computer-player types can be added later
  without rewriting the setup flow.

## 9. User Flow / Process Description

1. The user opens the new-game setup modal.
2. For any player slot, the user leaves the slot as `Human` or switches it to
   `Computer`.
3. If the slot is `Computer`, the user chooses `Random` from the computer-player
   selector and sees the generated name for that slot.
4. The user starts the game once setup validation passes.
5. If the active player is human, the user clicks a legal board cell.
6. If the active player is `Random`, the app briefly pauses, selects one legal
   move at random, and plays it automatically.
7. The game continues alternating between human input and automatic computer
   turns until a modal pauses the flow or the match concludes.

## 10. Data / Domain Impact

Frontend player-setup data needs controller metadata in addition to the
existing name and color:

- whether the slot is human- or computer-controlled
- which computer-player type is selected for computer-controlled slots

Frontend runtime player data also needs enough metadata to identify whether a
player is computer-controlled and which computer-player definition is attached.

## 11. API / Interface Impact

No backend or HTTP API changes are required for this slice.

## 12. UI / UX Considerations

- The setup UI should make the human/computer choice obvious per player slot.
- The computer-player selector should appear only when relevant.
- Computer-generated names should be visible before the game starts so the
  scoreboard and turn card feel predictable.
- Automatic turns should be readable to the user, which may require a small
  delay before a computer move is played.
- When it is a computer player's turn, the board should not present itself as
  manually interactive.

## 13. Edge Cases

- A game may start with player 1 as a computer, so auto-play must work
  immediately after setup closes.
- All configured players may be computers, so the match must keep advancing
  without human board input.
- A result modal opened after a computer move must pause any further computer
  turns until the modal is dismissed.
- Switching a slot between human and computer during setup should not corrupt
  color selection or player ordering.
- If no legal move is available unexpectedly, the shell should fail safely
  rather than crash.

## 14. Risks / Constraints / Dependencies

- Auto-play timing must not fight with the existing modal flow.
- Random move selection should not duplicate legal-move rules separately from
  the board interaction logic.
- The setup flow should stay extensible for future AI types without overbuilding
  a full AI framework in this first slice.

## 15. Assumptions

- This feature targets the existing local frontend shell only.
- Player slot numbers continue to be based on the ordered setup slots.
- The generated computer-player name replaces manual naming for
  computer-controlled slots in the visible game roster.
- A small autoplay delay is acceptable so users can perceive computer turns.

## 16. Open Questions

- None for this initial slice; future AI metadata such as strength or style can
  be specified when additional computer players are introduced.

## 17. Acceptance Criteria

1. The setup modal lets each player slot switch between `Human` and `Computer`.
2. Switching a slot to `Computer` reveals a computer-player selector with
   `Random` as an option.
3. A computer-controlled slot shows the generated player name `Random N`, where
   `N` matches that player's slot number.
4. Human-controlled slots still require non-empty names and unique colors.
5. Starting a game with player 1 set to `Random` begins the match and then
   automatically plays player 1's first legal move.
6. When a human finishes a turn and the next active player is `Random`, the
   app automatically performs exactly one legal move for that player.
7. `Random` never attempts to play an opponent-owned field.
8. Manual board clicks are ignored during a computer-controlled turn.
9. Existing elimination and winner popups still appear correctly after
   computer-triggered moves.
10. A fully automated match with all slots set to `Random` can continue without
    human board input.

## 18. Implementation Notes

- Keep computer-player definitions in a small typed frontend registry.
- Keep random move selection as a pure helper where possible so tests can drive
  it deterministically.
- Reuse the existing game-shell composable for turn orchestration instead of
  scattering AI timing across components.

## 19. Definition of Done

This feature is ready when:

- the active specification and plan exist in `papers/in-progress`
- the frontend setup flow supports human and computer slots
- `Random` computer turns execute automatically and legally
- relevant tests pass
- learnings from the implementation are captured in `LEARNINGS.md`
