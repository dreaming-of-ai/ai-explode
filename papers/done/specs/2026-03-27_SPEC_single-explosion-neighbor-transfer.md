# Specification

## 1. Title

Single Explosion Neighbor Transfer and Score Update

## 2. Summary

Introduce the first gameplay increment of explosion behavior in _AI Explode_. When a played field exceeds its allowed load, that one field shall explode immediately, give +1 load to each neighboring field, transfer ownership of all receiving fields to the exploding field's owner, and update the score accordingly. This increment stops after that single explosion and explicitly does not implement chain reactions or further overload checks on recipient fields.

## 3. Background / Problem Statement

The current playable shell supports turn order, placing on empty fields, reinforcing owned fields, and score display based on occupied-field counts. It does not yet support any explosion behavior, ownership takeover through explosions, or the resulting score swings.

The long-term rules in `papers/game-overview.md` define explosions as a core mechanic of the game. However, this increment is intentionally narrower than the full rule set. The immediate need is to introduce the first visible and testable slice of that mechanic:

- a single overloaded field can explode
- neighboring fields receive load
- neighboring ownership changes immediately
- scoring reflects the new ownership immediately

This increment is intentionally limited so the project can validate the first explosion interaction before adding sweep resolution, chain reactions, elimination effects, or other downstream gameplay rules.

## 4. Goal

Make one explosion work end to end in the current game flow: after a player causes one of their fields to exceed its allowed load, that field explodes once, adjacent fields receive load and change ownership instantly, and the visible score updates to match the new board ownership.

## 5. Scope

Included in scope:

- Detect when the just-played field exceeds its allowed load.
- Resolve one immediate explosion for that field.
- Add +1 load to every adjacent field of the exploding field.
- Change ownership of every receiving adjacent field to the owner of the exploding field.
- Reflect ownership transfer immediately in board colors.
- Update score calculation so captured fields affect the scoreboard immediately.
- Keep the increment limited to this one explosion event only.

## 6. Out of Scope

Explicitly out of scope for this specification:

- Sweep-based explosion resolution across the whole board
- Chain reactions of any kind
- Re-checking recipient fields for overload in the same move
- Re-checking the exploding field for another explosion in the same move
- Elimination rules or winner detection changes
- Any new backend API, persistence, or multiplayer behavior
- Additional UI affordances beyond the immediate board color and score changes
- Animation requirements for explosion or capture effects

## 7. Stakeholders / Users Affected

- Players, who will see the first true board-capture mechanic land
- Designers and implementers defining the staged rollout from simple placement to full explosion gameplay
- Future planning work, which depends on a precise boundary between this increment and later chain-reaction increments

## 8. Functional Requirements

### FR-1 Explosion Trigger

After a valid move is applied, the game shall check whether the played field now exceeds its allowed load.

For this increment, "allowed load" follows the liberty-count concept described in `papers/game-overview.md`:

- corner field: allowed load 3
- edge field: allowed load 5
- interior field: allowed load 8

The explosion trigger shall be strictly greater than the allowed load.

### FR-2 Single-Field Explosion Resolution

If the played field exceeds its allowed load, that same field shall explode immediately during the same move resolution.

This increment shall resolve only that one exploding field. No other field may start its own explosion as part of this move.

### FR-3 Load Distribution To Neighbors

When the field explodes, each adjacent field shall receive exactly +1 load.

Adjacency shall follow the same neighboring-field model described in `papers/game-overview.md`, including diagonals:

- corner fields affect 3 neighbors
- edge fields affect 5 neighbors
- interior fields affect 8 neighbors

### FR-4 Exploding Field Load Reduction

To stay aligned with the canonical rules in `papers/game-overview.md`, the exploding field shall lose load equal to the number of neighbors that received load.

The exploding field shall remain on the board with its post-explosion remainder load.

### FR-5 Ownership Transfer On Receipt

Every field that receives load from the explosion shall be owned immediately by the player who owned the exploding field at the moment of explosion.

This ownership transfer shall apply regardless of whether the receiving field was:

- empty before the explosion
- already owned by the exploding player
- owned by another player

### FR-6 Immediate Visual Ownership Update

The board UI shall reflect the ownership transfer immediately after the explosion resolves. Receiving fields that change owner shall switch to the exploding player's color without waiting for another interaction or refresh.

### FR-7 Score Update After Ownership Transfer

Scoring for this increment shall continue to be based on occupied-field counts, but it must be recalculated from the post-explosion ownership state.

This means:

- an empty receiving field newly owned by the exploding player increases that player's score by 1
- an opponent-owned receiving field captured by the exploding player increases the exploding player's score by 1 and decreases the previous owner's score by 1
- a receiving field already owned by the exploding player does not change ownership-based score totals

### FR-8 No Chain Reaction Checks

If any receiving field ends the explosion with load above its own allowed load, it shall not explode in this increment.

The move resolution stops after the single originating explosion has been applied.

### FR-9 No Additional Logic Changes

Apart from the single-field explosion behavior, ownership transfer, immediate color update, and resulting score impact, the existing game flow shall remain unchanged for this increment.

This includes keeping the current turn progression and move constraints unless they are directly required to support the single explosion resolution.

## 9. Non-Functional Requirements

### NFR-1 Immediate State Consistency

The board state, ownership colors, and visible score shall all represent the same post-explosion result within one completed move update. The UI must not show captured colors with stale scores, or updated scores with stale ownership.

### NFR-2 Maintainable Scope Boundary

The implementation should preserve a clean boundary between this increment and future chain-reaction work so that later increments can add overload re-checks without rewriting unrelated behavior.

### NFR-3 Rules Transparency

The resulting behavior should remain explainable to players and reviewers as an intentional partial increment of the full game rules, not as a hidden or accidental deviation.

## 10. User Flow / Process Description

### Flow A: Reinforce And Trigger One Explosion

1. A player selects a playable field they already own.
2. The move adds 1 load to that field.
3. The game checks whether the field now exceeds its allowed load.
4. If it does not, the move ends under the existing rules.
5. If it does, that field explodes immediately.
6. Each adjacent field receives +1 load.
7. Every receiving field becomes owned by the exploding field's owner immediately.
8. The exploding field loses load equal to the number of distributed increments.
9. The board colors and score update to match the new ownership state.
10. The move ends with no further explosion checks.

### Flow B: Recipient Ends Overloaded

1. A field receives +1 load from a neighboring explosion.
2. Its new load may exceed its own allowed load.
3. The field still does not explode in this increment.
4. The board simply keeps that higher load value and the transferred ownership state.

## 11. Data / Domain Impact

Conceptually, this increment introduces the following gameplay concepts into the current model:

- each field has an allowed load derived from board position
- a move can trigger a one-time explosion on the played field
- neighboring fields can receive load without being directly played
- ownership can change as a consequence of explosion resolution
- score remains ownership-based and therefore changes when captured fields change owner

The existing cell concept of `{ row, col, owner, load }` remains sufficient for this increment. No new persistent domain entities are required by the specification.

## 12. API / Interface Impact

No backend or external API changes are required for this increment.

The impact is conceptual and local to the current frontend gameplay layer:

- move resolution logic needs explosion-aware handling
- board rendering needs to reflect ownership changes immediately
- scoreboard derivation needs to use the post-explosion board state

## 13. UI / UX Considerations

- Ownership change must be visible immediately through the receiving fields' colors.
- The board should not require an additional click, refresh, or turn advance before the captured state is visible.
- No special explosion animation is required in this increment.
- Score changes should appear as part of the same resolved move so players can understand the capture impact at once.

## 14. Edge Cases

- A corner explosion affects only its 3 valid neighboring fields.
- An edge explosion affects only its 5 valid neighboring fields.
- An interior explosion affects all 8 neighboring fields.
- Empty neighboring fields become owned by the exploding player after receiving load.
- Neighboring fields already owned by the exploding player keep that owner and simply gain load.
- Opponent-owned neighboring fields are captured immediately after receiving load.
- A receiving neighboring field may become overloaded and still must not explode in this increment.
- If multiple neighboring fields from different opponents are captured in one explosion, all ownership and score changes must reflect the final board state after the same move resolution.

## 15. Risks / Constraints / Dependencies

- This increment intentionally implements only part of the full explosion rules from `papers/game-overview.md`, so the partial behavior must be clearly understood during implementation and review.
- Because scoring is ownership-based, incorrect ownership transfer handling will immediately produce visible score bugs.
- Future chain-reaction work will depend on this increment not hard-coding assumptions that prevent repeated explosion checks later.
- The current project state appears frontend-local for gameplay logic, so this increment should avoid introducing unnecessary backend coupling.

## 16. Assumptions

- "Exceeds its load" in the request means the field's load becomes strictly greater than its allowed load derived from its number of adjacent fields.
- The exploding field is owned by the active player, because current move rules only allow reinforcing owned fields or occupying empty fields.
- The canonical explosion model in `papers/game-overview.md` remains the long-term target, even though this increment deliberately stops after one explosion.
- Score in the current increment remains the number of fields owned by each player.

## 17. Open Questions

- No open product questions identified for this increment, provided the team accepts the assumption that explosion resolution still includes reducing the exploding field's load in line with `papers/game-overview.md`.

## 18. Acceptance Criteria

- Given a player reinforces one of their fields and its load does not exceed its allowed load, when the move resolves, then no explosion occurs and the existing move behavior remains unchanged.
- Given a player reinforces one of their fields and its load becomes strictly greater than its allowed load, when the move resolves, then that field explodes immediately during the same move.
- Given a corner field explodes, when the move resolves, then exactly its 3 adjacent fields each receive +1 load.
- Given an edge field explodes, when the move resolves, then exactly its 5 adjacent fields each receive +1 load.
- Given an interior field explodes, when the move resolves, then exactly its 8 adjacent fields each receive +1 load.
- Given a neighboring field receives load from an explosion, when the move resolves, then that field is owned by the exploding field's owner immediately afterward.
- Given an opponent-owned neighboring field receives load from an explosion, when the move resolves, then the board color changes immediately to the exploding player's color and the score reflects the capture.
- Given an empty neighboring field receives load from an explosion, when the move resolves, then it becomes owned by the exploding player and counts toward that player's score.
- Given a neighboring field already owned by the exploding player receives load from an explosion, when the move resolves, then its load increases but ownership-based score totals do not change because ownership did not change.
- Given the originating field explodes, when the move resolves, then its load is reduced by the number of neighbors that received load.
- Given a neighboring field ends the move above its own allowed load because of received load, when the move resolves, then that neighboring field does not explode in this increment.
- Given the originating field or any neighboring field would still qualify for another explosion after the first resolution step, when the move resolves, then no further explosion processing occurs in this increment.

## 19. Implementation Notes (Optional)

- Keep this as a single-move, single-explosion resolution path rather than introducing a general sweep engine yet.
- Reuse the current ownership-based scoreboard derivation instead of inventing a separate scoring system for this increment.
- Treat this increment as the first slice of the full explosion model, with future increments expected to add repeated overload checks and chain-reaction behavior.

## 20. Definition of Done

This specification is ready for implementation when:

- the team agrees that this increment covers exactly one explosion and no chain reactions
- the load threshold and neighbor model are accepted as aligned with `papers/game-overview.md`
- acceptance criteria are considered sufficient to plan and test the increment
- the explicit partial-rule boundary versus future full explosion logic is understood
