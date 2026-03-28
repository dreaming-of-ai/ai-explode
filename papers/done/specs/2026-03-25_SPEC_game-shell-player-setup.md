# SPEC: Game Shell & Player Setup

**Date:** 2026-03-25  
**Status:** Draft  
**Reference:** `papers/game-overview.md`

---

## 1. Goal

Deliver the first playable frontend increment of _AI Explode_: a complete application shell with player configuration, game start flow, and a live board view. No game mechanics (placing loads, explosions, chain reactions) are included — those are deferred to a follow-up feature.

After this feature, users can:

1. Open the app and see a polished landing/setup screen.
2. Configure 2–4 players (name + color).
3. Start a game session.
4. See a default 8×8 board, the active player indicator, and a live scoreboard.
5. Click a cell on the board to "claim" it for the active player (simplified: sets ownership with load 1, no reinforcement, no explosions).
6. Advance to the next player's turn automatically.

This gives a tangible, interactive artifact that validates layout, state management, and turn flow — forming the foundation for the full game mechanics feature.

---

## 2. Scope

### 2.1 In Scope

| Area | Detail |
|---|---|
| **App shell** | Top-level layout with header, board area, sidebar/panel for player info |
| **Player setup screen** | Configure 2–4 players: name (text input) and color (pick from 4 predefined colors). Validation: no duplicate colors, names required. Add/remove player controls (min 2, max 4). |
| **Color palette** | Exactly 4 colors to choose from. Each color has a name, a primary hex, and a lighter/darker variant for visual states. Suggested palette (can be refined during implementation): Red `#E63946`, Blue `#457B9D`, Green `#2A9D8F`, Yellow/Amber `#E9C46A`. |
| **Game start** | "Start Game" button enabled only when all validations pass. Transitions from setup screen to game screen. |
| **Board rendering** | 8×8 grid. Cells are initially empty. Visual distinction for corner, edge, and interior cells is optional but welcome (subtle border/shade to hint at liberty counts). |
| **Simplified cell interaction** | Clicking an empty cell assigns it to the active player (ownership + load 1). Clicking an owned cell of the active player increments load by 1. Cells owned by other players are not clickable. No explosion logic. |
| **Turn indicator** | Clearly visible indicator showing whose turn it is (name + color). |
| **Scoreboard** | Shows each player's name, color, and count of occupied fields. Updates after every action. |
| **Turn advancement** | After a player clicks a valid cell, the turn passes to the next player. Eliminated-player skipping is not needed yet (no elimination without explosions). |
| **Responsive layout** | The board should scale reasonably on desktop viewports (≥1024px). Full mobile optimization is deferred. |

### 2.2 Out of Scope (deferred)

- Explosion mechanics, chain reactions, sweep-based resolution
- Player elimination
- Win condition checking
- Backend communication / persistence
- Mobile-first layout
- Sound effects, advanced animations
- Game reset / new game from game screen (user refreshes for now)

---

## 3. UI Structure

```
┌──────────────────────────────────────────────────────┐
│  Header: "AI Explode"              [game status]     │
├────────────────────────┬─────────────────────────────┤
│                        │  Player Panel               │
│                        │  ┌─────────────────────┐    │
│                        │  │ ► Player 1 (Red)    │    │
│                        │  │   Fields: 3         │    │
│      10 × 10 Board     │  ├─────────────────────┤    │
│                        │  │   Player 2 (Blue)   │    │
│                        │  │   Fields: 2         │    │
│                        │  ├─────────────────────┤    │
│                        │  │   Player 3 (Green)  │    │
│                        │  │   Fields: 0         │    │
│                        │  └─────────────────────┘    │
│                        │                             │
├────────────────────────┴─────────────────────────────┤
│  Footer (optional): round counter / status messages  │
└──────────────────────────────────────────────────────┘
```

The **setup screen** replaces the board area before the game starts:

```
┌──────────────────────────────────────────────────────┐
│  Header: "AI Explode"                                │
├──────────────────────────────────────────────────────┤
│                                                      │
│   Player Setup                                       │
│                                                      │
│   Player 1:  [Name input]  [Color selector]          │
│   Player 2:  [Name input]  [Color selector]          │
│   + Add Player                                       │
│                                                      │
│   [Start Game]                                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 4. State Model (Frontend)

```typescript
// Player definition from setup
interface PlayerConfig {
  id: number;          // 1-based index
  name: string;
  color: PlayerColor;
}

// Predefined color options
interface PlayerColor {
  id: string;          // 'red' | 'blue' | 'green' | 'amber'
  name: string;        // Display name
  primary: string;     // Hex color
  light: string;       // Lighter variant
  dark: string;        // Darker variant
}

// Cell state on the board
interface Cell {
  row: number;         // 0-based
  col: number;         // 0-based
  owner: number | null; // player id or null if empty
  load: number;        // 0 if empty, ≥1 if owned
}

// Top-level game state
interface GameState {
  phase: 'setup' | 'playing';
  players: PlayerConfig[];
  board: Cell[][];      // 8×8 default grid
  activePlayerIndex: number; // index into players[]
  round: number;        // increments after all players have had a turn
}
```

---

## 5. Interaction Rules (Simplified — no explosions)

1. The active player clicks a cell.
2. If the cell is **empty**: set `owner` to active player, set `load` to 1.
3. If the cell is **owned by the active player**: increment `load` by 1.
4. If the cell is **owned by another player**: no action (cell is visually inert / non-clickable).
5. After a valid action, advance `activePlayerIndex` to the next player.
6. After all players have taken one turn, increment `round`.

---

## 6. Validation Rules (Setup)

| Rule | Detail |
|---|---|
| Min players | 2 |
| Max players | 4 |
| Name required | Each player must have a non-empty, trimmed name |
| Unique colors | No two players may select the same color |
| Start enabled | "Start Game" is enabled only when all rules pass |

---

## 7. Technology

- **Framework:** Vue 3 with Composition API (`<script setup lang="ts">`)
- **Language:** TypeScript
- **Build tool:** Vite
- **Styling:** CSS (scoped), no external UI library required. Tailwind is acceptable if desired.
- **State management:** Reactive refs / composables. Pinia only if complexity warrants it.
- **Testing:** Vitest for unit tests on state logic (optional in this increment but recommended for the game state composable).

---

## 8. Acceptance Criteria

1. App launches with a setup screen showing 2 player slots by default.
2. User can add players up to 4 and remove down to 2.
3. Each player slot has a name input and a color selector showing only available colors.
4. "Start Game" is disabled until all validations pass.
5. After starting, the board (8×8 grid) and player panel are visible.
6. The active player is clearly indicated.
7. Clicking an empty cell assigns it to the active player with load 1; the cell shows the player's color.
8. Clicking an own cell increments the displayed load.
9. Clicking an opponent's cell does nothing.
10. After each valid click, the turn advances to the next player.
11. The scoreboard updates field counts in real time.
12. The layout is clean and visually polished on a desktop viewport.

---

## 9. Open Questions

1. **Color palette:** The four suggested colors work well for colorblind accessibility when combined with player initials/icons in cells. Confirm or refine?
2. **Cell content:** Show load as a number inside the cell, or use dots/orbs? Number is simpler for this increment.
3. **Board size indicator:** Should cells subtly indicate their liberty count (e.g., faint number in corner)? Useful for learning but might clutter.
