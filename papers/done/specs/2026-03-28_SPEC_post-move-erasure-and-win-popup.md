# Specification

## 1. Title

Post-Move Player Erasure, Winner Detection, and Result Popup

## 2. Summary

Add the next gameplay increment that runs after each fully resolved move. Once all explosion resolution for the move is complete, the game shall check whether any player has been erased because they no longer own any fields, and whether exactly one player remains, making that player the winner. A single small popup shall combine all resulting messages for that move. If a winner is found, the game becomes locked for further moves and a new match can only be started through the existing "New Game" flow.

## 3. Background / Problem Statement

The current game direction in `papers/game-overview.md` already defines two important post-resolution rules:

- from the second round onward, a player is eliminated if they no longer own any field after a turn is fully resolved
- from the second round onward, the game checks for a winner after the move finishes resolving

The requested increment brings those end-of-move consequences into the playable experience.

Without this increment, the game may resolve captures and explosions correctly but still fail to:

- recognize that a player has been removed from the board
- skip erased players in future turns
- stop the game once only one player remains
- tell players clearly what just happened after a decisive move

This increment is intended to sit after move resolution, not inside the explosion mechanics themselves. Its purpose is to inspect the final board state of a completed move, derive player erasure and winner outcomes, and present them in one combined user-facing result popup.

## 4. Goal

Ensure that every fully resolved move can produce correct end-of-move consequences: newly erased players are detected, a winner is declared when only one player remains, one compact popup communicates all outcomes together, and no further moves are possible once the game has been won.

## 5. Scope

Included in scope:

- Run a post-move outcome check after the move's full explosion resolution is complete.
- Detect players who newly own zero fields after the resolved move.
- Treat such players as erased for UI messaging and eliminated for game-state purposes, aligned with `papers/game-overview.md`.
- Determine whether exactly one non-erased player remains after the move.
- Show one combined popup for all erasure and winner messages produced by that move.
- Mark the game as concluded when a winner is found.
- Prevent any further board moves after the game is concluded.
- Keep the existing "New Game" mechanics as the way to start the next match after a concluded game.
- Ensure erased players are skipped in future turn order when the game continues without a winner.

## 6. Out of Scope

Explicitly out of scope for this specification:

- Redefining or reimplementing explosion resolution rules themselves
- Introducing new chain-reaction behavior beyond whatever move resolution already defines
- Changing the canonical elimination and winner timing defined in `papers/game-overview.md`
- Adding backend APIs, persistence, multiplayer support, or server-authoritative game state
- Creating a new end-of-game setup flow separate from the existing "New Game" mechanics
- Adding celebration effects, confetti, sound, match history, or post-game statistics
- Redesigning the scoreboard beyond what is needed to reflect concluded and eliminated state

## 7. Stakeholders / Users Affected

- Players, who need clear feedback when opponents are removed or the game ends
- Designers and implementers defining the playable end-of-turn loop
- Future planning work, which depends on a clean boundary between move resolution and post-resolution outcome checks

## 8. Functional Requirements

### FR-1 Post-Move Check Timing

The game shall evaluate player erasure and winner status only after the active move has fully resolved.

For this specification, "fully resolved" means the final board state after all explosion handling for that move has completed. The check shall run once per resolved move and shall use the final ownership state of the board.

### FR-2 Canonical Timing From Round Two Onward

The erasure and winner checks shall follow the timing defined in `papers/game-overview.md`:

- they do not apply during the first round, before every configured player has completed their first turn
- they do apply from the second round onward

If a first-round move leaves a player with zero owned fields, that player shall not yet be erased by this rule and no winner shall be declared from that move.

### FR-3 Newly Erased Player Detection

From the second round onward, after a resolved move, the game shall identify every player who now owns zero fields on the board and who was not already marked erased earlier in the same match.

Each such player shall:

- be marked erased for UI purposes
- be treated as eliminated for future turn-order purposes
- contribute one erasure message to the result popup for that move

### FR-4 Erased Players Leave Future Turn Rotation

If the game continues after one or more players are newly erased, those players shall no longer receive turns in later move cycles.

Existing turn order shall otherwise remain unchanged for the remaining players.

### FR-5 Winner Detection

After newly erased players have been identified for the resolved move, the game shall determine whether exactly one non-erased player remains.

If exactly one player remains, that player shall be declared the winner of the match.

This winner rule shall remain conceptually aligned with `papers/game-overview.md`, where the winning state is reached once all occupied fields belong to the same player after move resolution.

### FR-6 Single Combined Result Popup

If a resolved move produces one or more new erasure messages and/or a winner message, the UI shall show exactly one popup for that move.

The popup shall combine all messages generated by that move rather than showing separate stacked dialogs, alerts, or toasts.

If the move produces neither new erasures nor a winner, no popup shall be shown.

### FR-7 Popup Message Content

The popup shall name the affected players using their configured player names.

The popup shall support:

- one message for each newly erased player
- one winner message if a winner exists

When both erasure and winner outcomes happen in the same resolved move, the popup shall display all of them together. The winner message shall appear after the erasure messages so the popup reads as a move consequence followed by the final match result.

### FR-8 Popup Interaction Behavior

The result popup shall appear only after the move has finished resolving. It shall not interrupt explosion handling mid-resolution.

While the popup is visible, additional board interaction shall be blocked.

After the popup is dismissed:

- if no winner exists, normal play may continue with the next eligible player
- if a winner exists, the game remains concluded and board interaction stays disabled

### FR-9 Winner Lock State

When a winner is declared, the game shall enter a concluded state immediately.

In the concluded state:

- no further moves may be made on the board
- move attempts on cells shall be blocked or ignored
- turn advancement shall stop
- the winner state shall remain visible through the existing shell and score context

### FR-10 Existing New Game Flow After Victory

After a winner has been declared, the only supported way to begin another match shall be the existing "New Game" mechanics already defined in the shell.

This increment shall not introduce a separate restart flow inside the result popup.

The concluded game shall be treated as concluded rather than unfinished, so the existing "New Game" behavior should remain consistent with the prior shell specification.

### FR-11 One-Time Announcement Per State Change

A player who was already erased in an earlier move shall not generate a new erasure message on later moves.

Likewise, once a winner has been declared for the current match, the game shall not generate repeated winner announcements on later interaction attempts because later moves are no longer allowed.

## 9. Non-Functional Requirements

### NFR-1 State Consistency

The final board ownership, scoreboard, erased-player state, winner state, popup content, and move-locked status shall all describe the same resolved move outcome. The UI must not show a winner popup while still allowing moves, or show erased players while turn rotation still targets them.

### NFR-2 Clear Outcome Communication

The popup should be easy to scan and should present decisive move outcomes without requiring the player to infer them from board colors or score changes alone.

### NFR-3 Maintainable Flow Boundary

The post-move outcome check should remain clearly separated from the explosion-resolution mechanism so later gameplay work can evolve move resolution without duplicating elimination and winner logic across multiple places.

## 10. User Flow / Process Description

### Flow A: Move Resolves With Erasure But No Winner

1. A player completes a valid move.
2. All explosion processing for that move finishes.
3. The game inspects the final board ownership state.
4. One or more players are found to own zero fields for the first time in this match.
5. Those players are marked erased and removed from future turn rotation.
6. More than one non-erased player still remains.
7. One popup appears listing the newly erased players.
8. The user dismisses the popup.
9. The next turn begins for the next eligible remaining player.

### Flow B: Move Resolves With Erasure And Winner

1. A player completes a valid move.
2. All explosion processing for that move finishes.
3. The game inspects the final board ownership state.
4. One or more players are newly erased.
5. Exactly one non-erased player remains.
6. One popup appears containing the erasure messages and the winner message.
7. The user dismisses the popup.
8. The game remains concluded and no further board moves are allowed.
9. The user can only start the next match through the existing "New Game" flow.

### Flow C: Move Resolves With No End-Of-Move Outcome

1. A player completes a valid move.
2. All explosion processing for that move finishes.
3. The game inspects the final board ownership state.
4. No new player has been erased and no winner is found.
5. No result popup is shown.
6. Play continues normally.

## 11. Data / Domain Impact

Conceptually, this increment adds or formalizes the following match-state concepts:

- whether a player is still active or already erased/eliminated
- whether the match is active or concluded
- which player, if any, is the winner
- which outcome messages belong to the just-resolved move

The board ownership state remains the authority for determining whether a player still owns fields.

This specification does not require a specific storage model, but the state model must be able to distinguish:

- newly erased players from players erased earlier
- an active match from a concluded one
- a transient popup payload from durable match state

## 12. API / Interface Impact

No backend or external API changes are required for this increment.

Frontend-facing interface impact is expected conceptually in:

- move-resolution completion handling
- derived per-player ownership counts or equivalent ownership summary
- match-state flags for erased players and winner/concluded status
- popup state carrying the combined move-result messages
- turn-advancement logic that skips erased players
- board-interaction guards once the match is concluded

## 13. UI / UX Considerations

- The result popup should feel like a compact move-outcome summary, not a full-screen takeover.
- The popup should appear after the board has visually settled into its final post-move state.
- The popup should avoid duplicate or fragmented messaging by combining erased-player and winner information into one surface.
- If a winner exists, dismissing the popup should not imply that play can continue.
- The existing "New Game" entry point should remain the obvious route to start over after victory.
- No special victory animation is required in this increment.

## 14. Edge Cases

- A resolved move can erase multiple players at once; all of them must be listed in the same popup.
- A move can both erase one or more players and produce a winner; the popup must still be singular and combined.
- If no state changes occurred for erasure or victory, no popup should appear.
- A player already erased on an earlier move must not be announced again.
- If the resolved move occurs before round two begins, erasure and winner checks must not fire yet.
- Dismissing the popup after a winning move must not re-enable the board.
- The existing "New Game" action after a concluded game should not behave like interrupting an unfinished match.

## 15. Risks / Constraints / Dependencies

- This increment depends on having a reliable notion of when a move is fully resolved. If that boundary is unclear, elimination and winner checks may happen too early.
- Incorrect ownership counting will cause both erasure and winner logic to fail in visible ways.
- If turn advancement happens before the post-move outcome check, the flow may briefly point at a player who has just been erased or may allow an extra move after victory.
- The prior shell behavior around unfinished versus concluded games must stay aligned so the "New Game" flow remains coherent after a win.

## 16. Assumptions

- `papers/game-overview.md` remains the canonical gameplay source, including the rule that elimination and winner checks start from the second round.
- The requested UI term "erased" refers to the same gameplay condition that the overview describes as elimination: owning zero fields after a resolved move.
- The move-resolution system can expose or derive a final post-move ownership state before the next move is accepted.
- The existing shell already provides the "New Game" entry point needed after a concluded match.

## 17. Open Questions

- No open product questions are required for this increment if the team accepts the canonical second-round timing from `papers/game-overview.md` and the assumption that the result popup is a dismissible blocking popup rather than an auto-disappearing toast.

## 18. Acceptance Criteria

- Given a resolved move in round one leaves a player with zero owned fields, when the move finishes, then no player is yet marked erased and no winner popup is shown from that move.
- Given a resolved move from round two onward leaves one previously active player with zero owned fields, when the move finishes, then that player is marked erased and one popup appears naming that player.
- Given a resolved move from round two onward leaves multiple previously active players with zero owned fields, when the move finishes, then all newly erased players are included in a single popup.
- Given a player was already erased on an earlier move, when a later move resolves, then that player is not announced again.
- Given a resolved move from round two onward leaves more than one non-erased player in the match, when the popup is dismissed, then play continues and erased players are skipped in future turns.
- Given a resolved move from round two onward leaves exactly one non-erased player, when the move finishes, then that player is declared the winner.
- Given a move both erases one or more players and produces a winner, when the popup is shown, then it contains the erasure messages and the winner message together in one popup.
- Given a winning popup has been dismissed, when the user tries to click a board cell, then no further move is accepted.
- Given the match has concluded with a winner, when the user wants to play again, then the next match is started through the existing "New Game" mechanics rather than a new custom restart path from this increment.
- Given a resolved move produces no new erasures and no winner, when the move finishes, then no result popup is shown and normal play continues.

## 19. Implementation Notes (Optional)

- The cleanest conceptual boundary is to evaluate end-of-move outcomes once from the final resolved board state rather than mixing the checks into each individual explosion step.
- Popup content will be easier to keep correct if it is built from newly changed match outcomes for that move, not from replaying all historical erased players every time.
- The concluded-state handling should reuse the shell's existing distinction between unfinished and concluded games where possible.

## 20. Definition of Done

This specification is ready for implementation when:

- the team agrees that erasure and winner checks happen only after the move is fully resolved
- the team accepts that the canonical timing starts from round two, per `papers/game-overview.md`
- the combined popup behavior is considered clear enough to implement without inventing extra flows
- the winner lock and existing "New Game" integration are understood as part of the same increment
