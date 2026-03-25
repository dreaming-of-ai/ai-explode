# AI Explode – Game Description

## Overview

_AI Explode_ is a strategic board game for two to four players. Players take turns placing loads on a 10×10 grid, trying to trigger chain reactions that overtake their opponents' fields. The last player standing wins.

## Setup

The board consists of a grid of 10×10 squares. All fields start empty. Players agree on a turn order before the game begins.

## Turns

Players take turns in a fixed order. On their turn a player **must** perform exactly one action:

- **Occupy an empty field** – the field is now owned by the player with a _load_ of 1.
- **Reinforce an own field** – add 1 to the _load_ of a field the player already owns.

A player may **never** place load on a field owned by another player. A turn is complete once the player has placed their load and all resulting explosions (see below) have been fully resolved.

## Adjacency (Liberties)

Each field's _liberty count_ equals the number of its adjacent fields, **including diagonals**. Adjacency therefore follows the Moore neighborhood:

| Position   | Adjacent fields | Liberties |
|------------|-----------------|-----------|
| Corner     | 3               | 3         |
| Edge       | 5               | 5         |
| Interior   | 8               | 8         |

## Explosions

An explosion occurs whenever a field's load becomes **strictly greater** than its liberty count. This means a corner field explodes at load 4, an edge field at load 6, and an interior field at load 9.

When a single field explodes the following happens **in order**:

1. **Distribution** – each adjacent field receives +1 load. The adjacent fields are processed in **clockwise order starting from the top-left** neighbor: ↖ ↑ ↗ → ↘ ↓ ↙ ←.
2. **Reduction** – the exploding field's load is reduced by the number of its liberties (i.e. by the amount distributed). The remainder stays on the field. Because the explosion condition is _strictly greater than_, at least 1 load always remains.
3. **Ownership transfer** – every adjacent field that received load is now owned by the _active player_ (the player whose turn triggered the explosion), regardless of previous ownership. The existing load on those fields is kept and the +1 is added on top.

### Chain Reactions (Sweep-Based Resolution)

After the active player places their load, explosions are resolved in **sweeps** across the entire board:

1. **Sweep** – the board is scanned row by row from the top-left corner to the bottom-right corner (left to right within each row). Every field whose load exceeds its liberty count explodes immediately when encountered (following the three steps above). Each field is checked **exactly once** per sweep, even if it receives additional load later in the same sweep from another explosion.
2. **Repeat** – after a complete sweep, a new sweep starts from the top-left corner. Fields that received load during a previous sweep and now exceed their liberty count will explode in this new sweep.
3. **Termination** – sweeps repeat until a full pass over the board produces **zero explosions**. At that point the turn is complete.

Because each field is only checked once per sweep, a field may accumulate load well above its liberty count during a single sweep (from multiple neighboring explosions) and will not explode until the next sweep. This means fields can temporarily hold a load significantly greater than 1 after their own explosion, if they receive load from later explosions within the same sweep.

## Elimination

If at any point during the game a player no longer owns any field on the board, that player is **eliminated** and skips all future turns.

## Winning the Game

Starting from the **second round** (i.e. after every player has completed their first turn), the game checks for a winner after every turn – once all sweeps have fully resolved. If all occupied fields on the board belong to the same player, that player wins immediately. The game does **not** need to wait until every player has had an equal number of turns.

## Summary of Key Rules

- A player can only interact with empty fields or their own fields.
- Explosions fire when load is **strictly greater** than the liberty count.
- Distribution follows clockwise order starting from the top-left neighbor.
- The exploding field always retains at least 1 load.
- Ownership of adjacent fields transfers to the active player upon explosion.
- Chain reactions are resolved in full-board sweeps (top-left to bottom-right, row by row); each field is checked once per sweep.
- Sweeps repeat until no explosion occurs in a full pass.
- A player with no remaining fields is eliminated.
- Victory is possible from round 2 onward, checked after all sweeps have resolved.