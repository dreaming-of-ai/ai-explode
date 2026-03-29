# Specification

## 1. Title

Last-Move Highlight And Configurable Explosion Delay

## 2. Summary

Improve board usability in two related ways:

- make the last deliberate move clearly visible on the board, following the
  behavior described in `papers/screen-layout.md`
- add a configurable explosion playback delay in the `Settings` popup so
  players can slow down chain reactions and follow board changes more easily

This increment is purely a usability improvement. It does not change the
canonical gameplay rules defined in `papers/game-overview.md`.

## 3. Background / Problem Statement

`papers/screen-layout.md` already defines a last-move indicator for the board:
after a player places a load, the played cell should briefly animate and then
retain a static highlight ring in the acting player's color until the next
move. That design intent is useful because AI Explode can change many cells in
quick succession, and players need a clear way to distinguish the deliberate
move from the resulting chain effects.

At the same time, the current explosion behavior resolves immediately. This is
rule-correct but can be hard to visually follow, especially once
`papers/game-overview.md` chain reactions span multiple explosions and sweeps.
Players may miss how a reaction propagated, which cells changed first, or why
the final board state looks the way it does.

The `Settings` popup was previously introduced as shell chrome but intentionally
left empty. This usability increment gives that popup its first concrete game
setting by allowing players to choose a preset explosion delay level.

Together, these two additions make the board easier to read without changing
turn legality, explosion ordering, ownership rules, elimination, or winner
detection.

## 4. Goal

Help players understand what just happened on the board by:

- clearly marking the cell where the current last move was deliberately played
- allowing explosion-driven board updates to be played back more slowly through
  a simple preset setting

## 5. Scope

Included in scope:

- add the last-move indicator behavior described in `papers/screen-layout.md`
- keep that indicator anchored to the originally played cell even when the move
  triggers explosions or chain reactions
- add one explosion-delay setting to the existing `Settings` popup
- support exactly four preset delay levels:
  - `None`
  - `Low`
  - `Medium`
  - `High`
- define the preset millisecond values as named constants that can be adjusted
  later without changing feature behavior
- apply the configured delay to explosion-driven board updates only
- keep all gameplay rules and explosion ordering aligned with
  `papers/game-overview.md`

## 6. Out of Scope

Explicitly out of scope for this specification:

- changing legal move rules, explosion triggers, sweep order, ownership
  transfer, elimination timing, or winner timing
- adding arbitrary/custom numeric delay input beyond the four presets
- adding pause, replay, frame-by-frame stepping, or animation scrubbing tools
- adding sound effects, haptics, or other presentation changes unrelated to the
  last-move indicator or explosion delay
- adding backend APIs, persistence services, or server-side configuration for
  this setting
- filling the `Settings` popup with additional unrelated settings
- redesigning the `Settings` modal interaction pattern already established by
  the header-popup shell work

## 7. Stakeholders / Users Affected

- players, who need to understand the most recent move and follow chain
  reactions more easily
- designers and frontend implementers, who need the board behavior to align
  with `papers/screen-layout.md`
- reviewers and testers, who need clear boundaries between gameplay logic and
  usability-only playback behavior

## 8. Functional Requirements

### FR-1 Last-Move Indicator On Valid Move

After every valid move, the cell the player directly selected shall become the
last-move cell.

For this feature, a valid move means a legal placement on an empty field or a
legal reinforcement of a field already owned by the acting player.

### FR-2 Last-Move Entrance Animation

Immediately after a valid move is applied, the played cell shall show a brief
entrance animation as described in `papers/screen-layout.md`, such as a subtle
scale-up or pop effect.

The exact animation implementation is not prescribed by this specification, but
it must be visibly brief and must draw attention to the deliberate move before
the board settles into its persistent last-move state.

### FR-3 Persistent Highlight Ring

After the brief entrance animation completes, the played cell shall display a
static highlight ring.

The ring shall:

- remain visible until the next valid move is made
- use the color of the player who made that move
- identify the deliberate move location, not merely the most recently changed
  cell

### FR-4 Last-Move Indicator During Chain Reactions

If the move triggers one or more explosions, the last-move indicator shall stay
on the originally played cell for the entire explosion-resolution sequence.

It shall not move to:

- neighboring cells changed by the explosion
- later exploding cells in the same move
- any other cell that changes during the resulting chain reaction

### FR-5 One Active Indicator At A Time

At most one last-move indicator may be visible on the board at any time.

When a later valid move is made, the previous last-move indicator shall be
removed and replaced by the new one.

### FR-6 Indicator Reset Behavior

Before the first valid move of a game, no last-move indicator shall be shown.

Starting a new game or otherwise resetting the board for a new match shall
clear the previous match's last-move indicator.

If a game ends and no new move occurs yet, the indicator shall remain on the
final move's originally played cell.

### FR-7 Invalid Interaction Does Not Move The Indicator

An invalid click or blocked board interaction shall not create, move, or clear
the last-move indicator.

Only a successfully applied valid move may update the indicator.

### FR-8 Settings Popup Contains Explosion Delay Control

The `Settings` popup shall no longer be empty. It shall contain a clearly
labeled control for `Explosion Delay`.

That control shall allow the user to select exactly one of these four preset
levels:

1. `None`
2. `Low`
3. `Medium`
4. `High`

### FR-9 Delay Level Definitions

The four delay levels shall map to these millisecond values:

- `None` = `0 ms`
- `Low` = `20 ms`
- `Medium` = `50 ms`
- `High` = `100 ms`

These preset values shall be defined from centralized named constants rather
than repeated inline literals, so they can be adjusted later without changing
the meaning of the setting labels.

The exact constant identifiers are not prescribed by this specification.

### FR-10 Default Setting Value

The default selected explosion delay level shall be `None`.

This preserves current gameplay speed for players who do not change the new
setting.

### FR-11 Delay Applies To Explosion-Driven Cell Updates Only

The configured explosion delay shall affect only board changes caused by
explosion resolution.

It shall not add delay to:

- normal move selection before a move is committed
- the initial placement/reinforcement action itself
- opening or closing the `Settings` popup
- unrelated shell interactions

### FR-12 Delay Means Pause Between Consecutive Explosion Updates

For this feature, the configured delay shall be interpreted as the pause
between consecutive visible cell updates that occur during explosion
resolution.

A visible cell update represents the complete visible change for one affected
cell in one explosion step. Examples:

- a receiving neighboring cell updates as one step, even if that step includes
  both load increase and ownership/color change
- the exploding origin cell's reduction is one step

No extra delay is required before the first explosion-driven cell update of a
move, and no extra trailing delay is required after the final explosion-driven
cell update has been applied.

### FR-13 Delay Must Preserve Canonical Explosion Order

Adding visual delay shall not change the canonical gameplay order from
`papers/game-overview.md`.

Explosion-driven board updates shall still be presented in the same logical
order in which gameplay resolves them, including:

- sweep order across the board
- neighbor distribution order within an explosion
- later explosions triggered by earlier ones in the same move

The delay changes pacing only. It must not change the final resolved board
state for a given move.

### FR-14 Delay Applies Across The Full Resolution Sequence

If a move triggers multiple explosions across one or more sweeps, the selected
delay level shall apply throughout the entire explosion-resolution sequence for
that move.

The move shall not be treated as complete until all delayed explosion-driven
updates for that move have finished.

### FR-15 Downstream Move Completion Waits For Delayed Resolution

Turn advancement, score updates that are meant to reflect the stable final
state, and any existing post-move outcome handling shall occur only after the
full delayed explosion-resolution sequence has completed.

This usability feature must not cause downstream UI to behave as though the
move were already finished while delayed explosion playback is still in
progress.

### FR-16 Setting Changes Affect Future Resolution, Not In-Flight Resolution

If the explosion delay setting is changed after a move has already begun
resolving, the updated setting shall apply only to later moves.

The delay level used for a move's explosion playback shall remain stable for
that move until it fully resolves.

### FR-17 Setting Remains Active Until Changed

Once the user selects a delay level, that selection shall remain active after
the `Settings` popup is closed and shall continue to apply to later moves until
the user changes it again or the current application session ends.

This specification does not require persistence beyond the current application
session.

## 9. Non-Functional Requirements

### NFR-1 Rules Fidelity

The feature shall remain faithful to `papers/game-overview.md`. It may change
how clearly the board updates are presented, but it must not change the
underlying gameplay outcome.

### NFR-2 Usability Clarity

The last-move indicator and delayed explosion playback should make it easier
for a player to answer both of these questions at a glance:

- where was the deliberate move played
- how did the chain reaction propagate from that move

### NFR-3 Maintainability Of Delay Presets

The preset delay values should be easy to update in one place during later
implementation or balancing work.

### NFR-4 Predictable Timing

Each delay preset should feel consistent across the entire explosion-resolution
sequence of a move. The pacing must not appear random or dependent on unrelated
render timing.

## 10. User Flow / Process Description

### Flow A: Valid Move With No Explosion

1. A player makes a valid move on the board.
2. The played cell briefly animates.
3. A static highlight ring remains on that cell in the acting player's color.
4. No explosion occurs, so the explosion delay setting has no visible effect.
5. The game continues normally.

### Flow B: Valid Move With Chain Reaction At Medium Delay

1. A player makes a valid move that causes an explosion.
2. The played cell becomes the last-move cell and shows the brief entrance
   animation.
3. The highlight ring remains anchored to that original cell.
4. Explosion-driven board changes are played back in canonical gameplay order.
5. After each visible explosion-driven cell update, the interface waits
   `50 ms` because `Medium` is selected.
6. Additional explosions and sweeps, if any, continue using the same delay.
7. Only after the final delayed update finishes does the move count as fully
   resolved for downstream UI behavior.

### Flow C: Player Changes Explosion Delay In Settings

1. The player opens the `Settings` popup from the header icon bar.
2. The popup shows an `Explosion Delay` setting with four preset choices:
   `None`, `Low`, `Medium`, and `High`.
3. The player selects `High`.
4. The popup is closed.
5. Future explosion-driven board updates use `100 ms` pacing between
   consecutive visible cell updates until the setting is changed again.

## 11. Data / Domain Impact

This increment does not change the canonical game rules or backend domain
model.

Conceptually, it introduces or formalizes these frontend/game-session state
elements:

- the identity of the last deliberately played cell
- the player color associated with the current last-move indicator
- the currently selected explosion delay preset
- the preset-to-millisecond mapping used by that setting
- the effective delay level captured for an in-flight move resolution

## 12. API / Interface Impact

No backend API changes are required.

Frontend interface impact is expected conceptually in:

- board-cell rendering for the last-move animation and persistent ring
- `Settings` popup content for the new `Explosion Delay` control
- move-resolution sequencing so explosion playback can be paced without
  changing gameplay order
- existing post-move UI behavior, which must wait for the delayed resolution to
  finish before treating the move as complete

## 13. UI / UX Considerations

- The last-move indicator should visually match the intent described in
  `papers/screen-layout.md`.
- The persistent ring should remain easy to distinguish even when the cell's
  load text or ownership color changes.
- The `Explosion Delay` control should make the four preset choices easy to
  compare at a glance; the exact widget type is not prescribed.
- The preset labels should communicate both relative speed and concrete timing,
  for example by pairing the label with its millisecond value.
- The new setting should feel like a usability preference, not like a gameplay
  rule toggle.

## 14. Edge Cases

- Before any valid move has been made in a match, the board shows no
  last-move indicator.
- A move that triggers many explosions still keeps the indicator on the
  originally played cell.
- If the originally played cell later changes load during the same move because
  it explodes, the indicator still remains attached to that cell.
- Invalid board interactions do not change the indicator.
- If no explosion occurs for a move, the delay setting produces no additional
  waiting.
- If `None` is selected, explosion behavior remains visually equivalent to the
  current no-deliberate-delay behavior.
- If the final delayed explosion update produces a board state that triggers
  existing winner or erasure handling, that downstream handling waits until the
  delayed resolution has fully finished.
- Changing the setting after a move has already started resolving does not
  retroactively change the pacing of the move already in progress.

## 15. Risks / Constraints / Dependencies

- The feature depends on keeping a clean separation between gameplay logic and
  presentation pacing. If delay handling is mixed directly into rule logic, it
  may become harder to keep deterministic behavior.
- The last-move indicator must remain readable without obscuring cell contents
  such as ownership color or load value.
- Delayed playback increases the time before a move is fully settled, so any
  post-move UI must remain correctly sequenced.
- This feature depends on the existing `Settings` popup shell remaining
  available as the place where gameplay-related usability preferences live.

## 16. Assumptions

- The requested per-field explosion delay is interpreted as the pause between
  consecutive visible explosion-driven cell updates, not as a separate idle
  pause after the final update of a move.
- Session-level persistence is sufficient for this increment; durable
  persistence across full browser reloads is not required unless later work
  asks for it.
- The last-move indicator color should represent the player who made the move,
  consistent with `papers/screen-layout.md`, rather than dynamically tracking
  any later ownership change.

## 17. Open Questions

- Should the selected explosion delay eventually persist across full browser
  reloads, or is session-only persistence the intended long-term behavior?
- Should the `Settings` popup show only the labels (`None`, `Low`, `Medium`,
  `High`) or both labels and explicit millisecond values in the final UI copy?

## 18. Acceptance Criteria

- Given a valid move is made, when the move is applied, then the directly
  played cell shows a brief entrance animation and becomes the only active
  last-move indicator.
- Given a last-move indicator is visible, when another valid move is made,
  then the previous indicator is removed and the new move's cell becomes the
  only indicated cell.
- Given a move triggers one or more explosions, when the board resolves, then
  the last-move indicator stays on the originally played cell and never moves
  to explosion-affected cells.
- Given no valid move has yet been made in a match, when the board is shown,
  then no last-move indicator is visible.
- Given the `Settings` popup is opened, when the user views the available
  controls, then an `Explosion Delay` setting with exactly four presets is
  available: `None`, `Low`, `Medium`, and `High`.
- Given the explosion delay presets, when their values are defined, then they
  map to `0 ms`, `20 ms`, `50 ms`, and `100 ms` respectively.
- Given `None` is selected, when a move triggers explosions, then explosion
  resolution behaves with no deliberate per-update delay.
- Given `Medium` is selected, when a move triggers multiple explosion-driven
  cell updates, then the interface waits `50 ms` between consecutive visible
  explosion-driven cell updates.
- Given a move triggers multiple explosions across sweeps, when the sequence is
  played back, then the configured delay applies throughout the full move
  resolution without changing canonical resolution order or final board state.
- Given a move is still resolving delayed explosion updates, when downstream
  turn/result UI would normally run, then it waits until the delayed resolution
  has fully completed.
- Given the player changes the explosion delay setting, when the current move
  has not yet started resolving, then later moves use the newly selected level
  until it is changed again.
