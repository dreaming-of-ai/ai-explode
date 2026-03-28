# Specification

## 1. Title

Sweep-Based Chain Reaction Resolution

## 2. Summary

Implement the next gameplay increment of _AI Explode_ by replacing the current
single-originating-explosion limit with the full chain-reaction mechanism
described in `papers/game-overview.md`. After each valid move, explosions shall
resolve in repeated full-board sweeps from the top-left corner to the
bottom-right corner. Overloaded fields explode immediately when encountered,
each field is checked exactly once per sweep, receiving neighbors gain load and
transfer ownership to the active player, and sweeps repeat until a full pass
produces zero explosions.

This increment updates move resolution only. Existing post-move elimination,
winner detection, score derivation, and result-popup behavior remain conceptually
downstream and must use the fully resolved final board state produced by the
new sweep engine.

## 3. Background / Problem Statement

The staged rollout for _AI Explode_ has already separated gameplay into
incremental slices. The previous explosion increment intentionally stopped after
one immediate explosion on the just-played field so the project could validate
neighbor distribution, ownership transfer, and score updates without taking on
the full rule system at once.

The canonical game rules in `papers/game-overview.md` go further. They require
explosions to resolve as deterministic chain reactions across the whole board:

- the board is scanned in sweeps
- overloaded fields explode when encountered
- each field is checked once per sweep
- later explosions in the same sweep can affect fields not yet visited
- fields already visited in that sweep must wait for the next sweep
- the turn ends only when a full sweep causes no explosions

Without this increment, the gameplay loop still diverges from the intended game
in a core way. Overloaded recipient fields can remain unresolved, sweep order
cannot influence outcomes as the rules require, and post-move elimination or
winner checks risk running against an intermediate board rather than the true
fully resolved state.

## 4. Goal

Make each valid move resolve to the stable final board state defined by
`papers/game-overview.md`, using deterministic sweep-based chain reactions so
that no explosion-eligible field remains unresolved when the turn completes.

## 5. Scope

Included in scope:

- Run explosion resolution after every valid move as full-board sweeps.
- Scan the board row by row from top-left to bottom-right during each sweep.
- Trigger explosions for every field whose load exceeds its liberty count at the
  moment that field is encountered.
- Apply the canonical explosion sequence for every exploding field:
  distribution, reduction, and ownership transfer.
- Keep diagonal adjacency as part of the liberty and distribution rules.
- Enforce the rule that each field is checked exactly once per sweep.
- Repeat sweeps until a complete pass produces zero explosions.
- Allow chain reactions to continue across multiple sweeps within the same turn.
- Ensure score display and existing post-move outcome handling consume only the
  final fully resolved board state.

## 6. Out of Scope

Explicitly out of scope for this specification:

- Changing the valid-move rule that a player may only play on empty fields or
  fields they already own
- Changing the board size, player setup flow, or existing shell layout
- Redefining elimination timing, winner timing, result-popup content, or new
  game behavior already anchored in `papers/game-overview.md` and the related
  post-move outcome increment
- Introducing backend APIs, persistence, multiplayer support, or
  server-authoritative gameplay
- Adding new scoring rules beyond the existing ownership-based field counts
- Adding explosion animations, replay controls, or step-by-step sweep
  visualizers
- Reworking unrelated UI copy unless it becomes inaccurate because of this
  rules change

## 7. Stakeholders / Users Affected

- Players, who should experience the core chain-reaction mechanic of the game
- Designers and implementers, who need the gameplay loop aligned with the
  canonical rules in `papers/game-overview.md`
- Reviewers and testers, who need deterministic ordering rules to validate
  complex turns
- Future planning work, which depends on a clean handoff from move resolution to
  the already defined post-move elimination and winner flow

## 8. Functional Requirements

### FR-1 Full Turn Resolution Starts After Every Valid Move

After a player performs a valid move, the game shall treat the move as
incomplete until explosion resolution has finished.

Explosion resolution shall operate on the board state that exists immediately
after the played field receives its +1 load.

### FR-2 Liberty Model And Explosion Trigger

Explosion eligibility shall follow the liberty rules from
`papers/game-overview.md`:

- corner field: 3 liberties, explodes at load 4 or higher
- edge field: 5 liberties, explodes at load 6 or higher
- interior field: 8 liberties, explodes at load 9 or higher

The trigger condition is strictly greater than the field's liberty count.

### FR-3 Sweep Order

Explosion resolution shall scan the full board in sweeps.

Each sweep shall:

- start at the top-left cell of the board
- proceed left to right within a row
- proceed row by row from top to bottom
- check each field exactly once during that sweep

### FR-4 Immediate Explosion On Encounter

If a field's load is above its liberty count at the moment it is encountered in
the current sweep, that field shall explode immediately during that same sweep.

### FR-5 Explosion Sequence

When a field explodes, the following steps shall happen in order:

1. Distribution: each valid adjacent field receives `+1` load.
2. Reduction: the exploding field loses load equal to its liberty count.
3. Ownership transfer: every adjacent field that received load becomes owned by
   the active player.

The exploding field shall keep its remainder load after the reduction step.

### FR-6 Neighbor Order During Distribution

Distribution from an exploding field shall follow the canonical neighbor order
from `papers/game-overview.md`, using only valid in-bounds neighbors:

`↖`, `↑`, `↗`, `→`, `↘`, `↓`, `↙`, `←`

The sequence starts at the top-left neighbor and proceeds clockwise.

### FR-7 Ownership Transfer Uses The Active Player

For every explosion in the chain reaction, ownership transfer on receiving
neighbor fields shall use the active player whose turn is currently resolving.

This applies regardless of whether a receiving field was empty, already owned by
the active player, or previously owned by another player.

### FR-8 Later Fields May Explode In The Same Sweep

If an earlier explosion in a sweep causes a field that has not yet been checked
in that same sweep to exceed its liberty count, that field shall still be
eligible to explode later in the same sweep when its board position is reached.

### FR-9 Already-Checked Fields Must Wait For The Next Sweep

If a field has already been checked earlier in the current sweep and later
receives enough load to exceed its liberty count, that field shall not be
checked again during the current sweep.

It may explode only in a subsequent sweep.

### FR-10 Repeated Sweeps Until Stable

After one full sweep completes:

- if at least one explosion occurred during that sweep, a new sweep shall start
  from the top-left cell
- if zero explosions occurred during that sweep, explosion resolution shall end

There shall be no artificial limit of one explosion, one sweep, or one
explosion per field per turn.

### FR-11 A Field May Explode More Than Once In One Turn

If a field explodes in one sweep and later becomes overloaded again before a
future sweep checks it, that same field may explode again in a later sweep of
the same turn.

### FR-12 Turn Completion Uses Only The Final Stable Board

Turn advancement, score derivation, board ownership display, and any existing
post-move elimination, winner, and result-popup handling shall use only the
final board state after sweep resolution has terminated.

Intermediate sweep states shall not be treated as completed turns.

### FR-13 Stable End State

When explosion resolution ends for a move, no field on the board shall have load
strictly greater than its liberty count.

## 9. Non-Functional Requirements

### NFR-1 Deterministic Resolution

Given the same starting board and active player, the sweep-based chain reaction
must always produce the same final board state. Resolution must not depend on
incidental array ordering or non-deterministic iteration behavior.

### NFR-2 State Consistency

The board state, ownership colors, scoreboard, active-turn state, and any
existing post-move outcome messaging must all describe the same final resolved
move result.

### NFR-3 Maintainable Flow Boundary

The sweep-based move-resolution logic should remain conceptually separate from
the already defined post-move erasure and winner checks so later work can
change one stage without duplicating rules in multiple places.

## 10. User Flow / Process Description

### Flow A: Valid Move With No Explosions

1. A player makes a valid move and the selected field receives `+1` load.
2. Sweep resolution starts at the top-left cell.
3. The board is checked once in row-major order.
4. No field exceeds its liberty count when encountered.
5. The sweep ends with zero explosions.
6. The move is complete immediately after that stable sweep.
7. Score and any existing post-move outcome logic use the resulting board.

### Flow B: Chain Reaction Across One Sweep And A Later Sweep

1. A player makes a valid move and the selected field becomes overloaded.
2. During the current sweep, that field is encountered and explodes.
3. Its valid neighbors receive `+1` load in clockwise order and become owned by
   the active player.
4. A neighboring field located later in sweep order becomes overloaded before
   it has been checked.
5. When the sweep reaches that later field, it explodes in the same sweep.
6. A field that was already checked earlier in the sweep receives more load and
   now also exceeds its liberty count.
7. That already-checked field does not explode again during the current sweep.
8. The sweep ends with at least one explosion, so a new sweep begins from the
   top-left cell.
9. The previously skipped overloaded field is eligible again and may now
   explode.
10. Sweeps continue until a full pass causes zero explosions.

### Flow C: Stable Board Hands Off To Existing Outcome Logic

1. A player's move triggers one or more sweeps.
2. The final sweep ends with zero explosions.
3. The move-resolution stage is now complete.
4. Only then do score updates, player erasure checks, winner detection, and any
   result popup logic evaluate the move outcome.

## 11. Data / Domain Impact

Conceptually, this increment formalizes the following gameplay concepts:

- move resolution is a multi-sweep process rather than a single-explosion check
- each sweep has a fixed board traversal order
- each field has a per-sweep checked-once constraint
- all explosions within a turn remain associated with the same active player for
  ownership transfer
- the final stable board after all sweeps is the authoritative output of a turn

The existing board-cell concept of `{ row, col, owner, load }` remains
sufficient for the gameplay model. This specification does not require new
persistent entities or backend data structures.

## 12. API / Interface Impact

No backend or external API changes are required for this increment.

Conceptual frontend impact includes:

- move-resolution logic must support full-board sweep processing
- score and ownership presentation must read the final stable board from that
  move-resolution stage
- existing post-move elimination and winner handling must treat sweep
  completion as the boundary for "move fully resolved"

## 13. UI / UX Considerations

- No special explosion or sweep animation is required in this increment.
- The player should not regain board control until the move's sweep resolution
  is complete.
- If the UI presents the move as one immediate state update, it should present
  the fully resolved final board rather than an intermediate partial sweep
  state.
- Score changes and existing result-popup behavior should occur only after the
  board has reached its final stable post-sweep state.

## 14. Edge Cases

- A corner explosion affects exactly 3 valid neighboring fields.
- An edge explosion affects exactly 5 valid neighboring fields.
- An interior explosion affects exactly 8 valid neighboring fields.
- A field later in sweep order can become overloaded and still explode during
  the same sweep.
- A field already checked in the current sweep can become overloaded and must
  wait until the next sweep.
- A field can receive additional load after its own explosion during the same
  sweep and may therefore remain above threshold until a later sweep resolves
  it again.
- Multiple overloaded fields present at the start of a sweep must resolve in
  row-major sweep order, not by creation time or visual proximity.
- A field captured earlier in the turn can later explode, and its receiving
  neighbors still transfer to the active player.
- A move can require several sweeps before stabilizing.
- A first sweep can produce zero explosions, in which case the move ends without
  additional sweeps.

## 15. Risks / Constraints / Dependencies

- This increment depends on treating `papers/game-overview.md` as the canonical
  authority for sweep order, distribution order, and ownership transfer rules.
- The ordering rules are part of the gameplay contract. If sweep order or
  neighbor order is implemented loosely, chain reactions may produce incorrect
  outcomes even when simpler cases look correct.
- Existing post-move elimination and winner behavior depends on a reliable
  notion of "fully resolved move." If that handoff happens too early, the game
  can announce outcomes from the wrong board state.
- The current project direction keeps gameplay logic frontend-local, so this
  increment should avoid introducing backend coupling for local turn
  resolution.

## 16. Assumptions

- The single-explosion increment remains the conceptual baseline that this
  feature extends.
- The existing post-move erasure and winner flow should remain intact and simply
  consume the new fully resolved board state.
- Score continues to mean the number of fields currently owned by each player.
- Turns always begin from a stable board state with no unresolved overloaded
  fields carried over from a prior turn.

## 17. Open Questions

- No blocking product questions are identified for this increment if the team
  accepts `papers/game-overview.md` as authoritative for sweep order,
  distribution order, and active-player ownership transfer.

## 18. Acceptance Criteria

- Given a valid move that does not cause any field to exceed its liberty count,
  when the first sweep completes, then that sweep contains zero explosions and
  the move ends without starting a second sweep.
- Given a valid move that causes the played field to exceed its liberty count,
  when the first sweep reaches that field, then the field explodes immediately
  during that sweep.
- Given a corner field explodes, when the explosion resolves, then exactly 3
  valid neighboring fields receive `+1` load and the exploding field loses 3
  load.
- Given an edge field explodes, when the explosion resolves, then exactly 5
  valid neighboring fields receive `+1` load and the exploding field loses 5
  load.
- Given an interior field explodes, when the explosion resolves, then exactly 8
  valid neighboring fields receive `+1` load and the exploding field loses 8
  load.
- Given a field receives load from any explosion during the active player's
  turn, when that explosion resolves, then the receiving field is owned by the
  active player afterward regardless of its previous owner.
- Given an early explosion in a sweep makes a later unvisited field exceed its
  liberty count, when the sweep reaches that later field, then it explodes in
  the same sweep.
- Given a field was already checked earlier in the current sweep and only later
  becomes overloaded, when the current sweep finishes, then that field has not
  exploded again during that sweep.
- Given a field explodes and later receives additional load in the same sweep so
  that it again exceeds its liberty count, when the next sweep begins, then that
  field is eligible to explode again in that later sweep.
- Given at least one explosion occurred during a sweep, when that sweep ends,
  then a new sweep begins from the top-left cell of the board.
- Given a full sweep produces zero explosions, when that sweep ends, then the
  move is fully resolved and no field remains above its liberty count.
- Given one or more chain-reaction sweeps occurred during a move, when the move
  finally resolves, then score updates and any existing player-erasure, winner,
  and result-popup logic use only the final stable board state.

## 19. Implementation Notes (Optional)

- Preserve a clear internal boundary between sweep-based move resolution and the
  separate post-move outcome stage.
- Treat sweep order and neighbor order as first-class rule definitions rather
  than incidental implementation details.
- Reuse existing ownership-based score derivation from the final board rather
  than introducing parallel score state.

## 20. Definition of Done

This specification is ready for implementation when:

- the team agrees that the next increment is the full sweep-based chain-reaction
  mechanic from `papers/game-overview.md`
- the ordering rules for sweeps and per-explosion neighbor distribution are
  considered explicit enough to implement and test
- the boundary between sweep resolution and existing post-move outcome handling
  is understood
- the acceptance criteria are sufficient to support implementation planning and
  review without inferring hidden rules from the overview alone
