# AI Explode – Game Overview

## Gameplay Description

### Overview

_AI Explode_ is a strategic board game for two to four players. Players take turns placing loads on a rectangular m×n grid, trying to trigger chain reactions that overtake their opponents' fields. The last player standing wins.

### Setup

The board consists of a rectangular grid of m×n squares. The default board size is 8×8, resulting in 64 fields. All fields start empty. Players agree on a turn order before the game begins. The game supports a minimum of 2 and a maximum of 4 players.

### Turns

Players take turns in a fixed order. On their turn a player **must** perform exactly one action:

- **Occupy an empty field** – the field is now owned by the player with a _load_ of 1.
- **Reinforce an own field** – add 1 to the _load_ of a field the player already owns.

A player may **never** place load on a field owned by another player. A turn is complete once the player has placed their load and all resulting explosions (see below) have been fully resolved.

### Adjacency (Liberties)

Each field's _liberty count_ equals the number of its adjacent fields, **including diagonals**. Adjacency therefore follows the Moore neighborhood:

| Position   | Adjacent fields | Liberties |
|------------|-----------------|-----------|
| Corner     | 3               | 3         |
| Edge       | 5               | 5         |
| Interior   | 8               | 8         |

### Explosions

An explosion occurs whenever a field's load becomes **strictly greater** than its liberty count. This means a corner field explodes at load 4, an edge field at load 6, and an interior field at load 9.

When a single field explodes the following happens **in order**:

1. **Distribution** – each adjacent field receives +1 load. The adjacent fields are processed in **clockwise order starting from the top-left** neighbor: ↖ ↑ ↗ → ↘ ↓ ↙ ←.
2. **Reduction** – the exploding field's load is reduced by the number of its liberties (i.e. by the amount distributed). The remainder stays on the field. Because the explosion condition is _strictly greater than_, at least 1 load always remains.
3. **Ownership transfer** – every adjacent field that received load is now owned by the _active player_ (the player whose turn triggered the explosion), regardless of previous ownership. The existing load on those fields is kept and the +1 is added on top.

#### Chain Reactions (Sweep-Based Resolution)

After the active player places their load, explosions are resolved in **sweeps** across the entire board:

1. **Sweep** – the board is scanned row by row from the top-left corner to the bottom-right corner (left to right within each row). Every field whose load exceeds its liberty count explodes immediately when encountered (following the three steps above). Each field is checked **exactly once** per sweep, even if it receives additional load later in the same sweep from another explosion.
2. **Repeat** – after a complete sweep, a new sweep starts from the top-left corner. Fields that received load during a previous sweep and now exceed their liberty count will explode in this new sweep.
3. **Termination** – sweeps repeat until a full pass over the board produces **zero explosions**. At that point the turn is complete.

Because each field is only checked once per sweep, a field may accumulate load well above its liberty count during a single sweep (from multiple neighboring explosions) and will not explode until the next sweep. This means fields can temporarily hold a load significantly greater than 1 after their own explosion, if they receive load from later explosions within the same sweep.

### Elimination

Starting from the **second round** (i.e. after every player has completed their first turn), a player is **eliminated** if they no longer own any field on the board after a turn has been fully resolved. An eliminated player skips all future turns. If more than one player remains after an elimination, the game continues.

### Winning the Game

Starting from the **second round**, the game checks for a winner after every turn – once all sweeps have fully resolved. If all occupied fields on the board belong to the same player, that player wins immediately. The game does **not** need to wait until every player has had an equal number of turns.

### Summary of Key Rules

- The board is m×n squares; the default size is 8×8.
- The game is played by 2 to 4 players.
- A player can only interact with empty fields or their own fields.
- Explosions fire when load is **strictly greater** than the liberty count.
- Distribution follows clockwise order starting from the top-left neighbor.
- The exploding field always retains at least 1 load.
- Ownership of adjacent fields transfers to the active player upon explosion.
- Chain reactions are resolved in full-board sweeps (top-left to bottom-right, row by row); each field is checked once per sweep.
- Sweeps repeat until no explosion occurs in a full pass.
- Elimination and victory are only checked from round 2 onward, after all sweeps have resolved.
- A player with no remaining fields is eliminated; the game continues until only one player remains.

---

## Computer Players

### Overview

By default, all players in AI Explode are controlled by human participants sharing the same device or session. 
However, any player slot can optionally be assigned to a computer player instead. This applies to all player slots 
simultaneously, making fully automated games – where every player is controlled by the computer – possible as well.

### Configuration

Computer players are configured during game setup. In the setup screen, each player slot offers the option to activate a 
computer player. When a player slot is switched to computer control, a dropdown list becomes available from which the 
specific computer player can be selected.

### Computer Player Types
Each computer player has a distinct playing style and strength level. The available computer players differ in how 
they evaluate the board, how far ahead they plan, and how aggressively they pursue chain reactions versus territorial 
expansion. This gives players the flexibility to choose opponents that match their desired level of challenge.

The concrete list of available computer players, including their names, playing styles, and strength ratings, is 
defined separately as part of the feature specification for computer player support.