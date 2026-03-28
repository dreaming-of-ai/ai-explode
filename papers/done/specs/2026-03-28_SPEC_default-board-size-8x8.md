# Specification

## 1. Title

Default Board Size Alignment to 8x8

## 2. Summary

Align the implemented default board size of _AI Explode_ with the canonical
product overview by changing the default board from 10x10 to 8x8. The board
should continue to occupy approximately the same overall space in the shell,
with the recovered space used to enlarge individual fields for readability and
interaction comfort. This increment also includes correcting older
specification and plan references that still describe the board as 10x10.

## 3. Background / Problem Statement

`papers/game-overview.md` already defines the default board size as 8x8, but
the shipped frontend and multiple earlier specs and plans still describe and
render a 10x10 board. This creates drift between the canonical game rules, the
implementation history, and the current UI.

That mismatch causes several issues:

- product documentation is internally inconsistent
- implementation decisions appear to contradict the game overview
- the current board renders more, smaller fields than the intended default
- later work toward configurable board dimensions would start from a conflicting
  baseline

This change is a corrective refactor, not a new gameplay feature.

## 4. Goal

Make 8x8 the actual default board size everywhere that currently treats 10x10
as the default, while preserving the board's on-screen footprint so cells
become larger and the codebase is better prepared for a future configurable
board size feature.

## 5. Scope

Included in scope:

- change the frontend default board initialization from 10x10 to 8x8
- update board rendering so the grid structure follows the default dimension
- preserve the board's approximate overall shell footprint rather than shrinking
  the board container
- use the recovered space to enlarge individual fields
- correct completed specs and plans that still describe the default board as
  10x10
- prepare implementation structure for future configurable board dimensions by
  reducing hard-coded board-size assumptions

## 6. Out of Scope

Explicitly out of scope for this specification:

- exposing board size as a user-facing setting
- supporting multiple board dimensions at runtime
- changing gameplay rules beyond the board's default dimension
- backend or API changes
- redesigning the broader shell beyond what is needed to preserve the current
  board footprint
- rewriting historical documents beyond board-size reference corrections that
  are necessary to remove inconsistencies

## 7. Stakeholders / Users Affected

- players who interact with the board and benefit from larger default fields
- maintainers relying on `papers/game-overview.md` as the canonical rules source
- future implementers of configurable board dimensions

## 8. Functional Requirements

### FR-1 Default Board Dimension

The application shall initialize a new default board as an 8-row by 8-column
grid.

### FR-2 Grid Rendering Alignment

The visible board rendering shall reflect the active board dimensions rather
than assuming a fixed 10-column layout in presentation code.

### FR-3 Preserved Board Footprint

On supported viewports, reducing the default board from 10x10 to 8x8 shall not
materially shrink the overall board area within the shell. The saved space
shall instead increase the size of the individual fields.

### FR-4 Interaction Parity

Existing valid move behavior, explosion thresholds, neighbor handling,
scoreboard derivation, and turn progression shall continue to work on the 8x8
default board without introducing rules changes unrelated to board dimension.

### FR-5 Historical Documentation Correction

Completed specifications and implementation plans that currently describe the
default board as 10x10 shall be updated so their historical references align
with the canonical 8x8 default.

### FR-6 Preparatory Board-Size Centralization

Board-dimension assumptions that are currently duplicated in implementation
shall be consolidated so future configurable board-size work can extend the
same source of truth instead of unwinding multiple hard-coded defaults.

## 9. Non-Functional Requirements

### NFR-1 Maintainability

The refactor should reduce hard-coded board-dimension literals in the frontend
where practical for this slice.

### NFR-2 UI Readability

The larger default cells should improve legibility of player initials and load
values without requiring a separate UI redesign.

### NFR-3 Regression Safety

Existing simplified play flow and implemented explosion behavior should remain
covered by updated validation where board dimensions affect expectations.

## 10. User Flow / Process Description

### Flow A: Start A New Default Game

1. The user opens the app and starts a game.
2. The game session initializes an empty default board.
3. The board renders as an 8x8 grid.
4. Each field appears larger than before because the board footprint stays
   roughly constant while the number of cells decreases.
5. The user interacts with the board using the same move rules as before.

### Flow B: Review Project Documentation

1. A maintainer reads completed specs and plans that mention the default board
   size.
2. The references align with the canonical 8x8 default instead of contradicting
   `papers/game-overview.md`.

## 11. Data / Domain Impact

The conceptual board domain remains a rectangular grid of cells with row and
column coordinates, ownership, and load.

This increment changes only the default dimension from 10x10 to 8x8. It does
not introduce persisted board-size metadata, player-selectable sizes, or new
domain rules for liberties, explosions, elimination, or winning.

## 12. API / Interface Impact

No backend or external API changes are required.

Frontend interface impact is expected in:

- game-state initialization for default boards
- board presentation code that currently assumes ten columns
- tests or helper logic that assume the previous default dimension

## 13. UI / UX Considerations

- The board should still feel like the primary visual surface in the shell.
- The board container should not collapse simply because there are fewer cells.
- Larger cells should improve readability of load values and player initials.
- Responsive behavior should continue to prioritize full board visibility.

## 14. Edge Cases

- Board-tone or neighbor logic must still classify corners, edges, and interior
  cells correctly on an 8x8 board.
- Tests that assume positions deep inside a 10x10 grid should still target
  valid coordinates on the 8x8 default board.
- CSS grid definitions must not silently retain ten columns after the logical
  board changes.
- Historical paper updates should avoid changing unrelated scope or wording.

## 15. Risks / Constraints / Dependencies

- Older docs are already completed artifacts, so corrections should stay narrow
  and factual rather than rewriting broader feature history.
- The current board UI uses fixed layout assumptions that may otherwise shrink
  the play surface when the dimension is reduced.
- Future configurable-size work benefits from centralization now, but this
  increment must stop short of exposing a real configuration feature.

## 16. Assumptions

- `papers/game-overview.md` is the canonical source of truth for the intended
  default board size.
- Preserving the board footprint means keeping the board visually comparable in
  area within the existing shell, not matching prior pixel dimensions exactly.
- The relevant implementation work is frontend-only.

## 17. Open Questions

- None that block this increment. The canonical default size is already defined
  in `papers/game-overview.md`, and the requested configurability work is
  explicitly deferred.

## 18. Acceptance Criteria

- Given a new game is initialized with default settings, when the board is
  created, then it contains 8 rows and 8 columns.
- Given the board is rendered in the shell, when the user views it on supported
  viewports, then the board still occupies approximately the same overall area
  and the individual fields are visibly larger than before.
- Given the board is rendered, when the template or styling determines the grid
  structure, then it derives from the active board dimensions rather than a
  fixed `10` column assumption.
- Given the current simplified play and explosion behavior, when moves are
  played on the default board, then the existing rules continue to work without
  board-size-related regressions.
- Given completed specs and plans previously referenced a 10x10 default board,
  when those papers are reviewed after this increment, then their default-size
  references align with 8x8.
- Given the codebase prepares for future configurable board size work, when the
  default dimension is read by board initialization and rendering, then it is
  sourced from centralized board-size assumptions instead of duplicated fixed
  literals where practical in this slice.

## 19. Implementation Notes (Optional)

- A single frontend source of truth for default board dimensions is preferable
  to separate logical and presentational constants.
- Presentation code should derive grid columns from the rendered board or a
  shared dimension value instead of hard-coding `repeat(10, ...)`.
- Validation should focus on board creation, rendering, and representative move
  or explosion behavior on the new default size.

## 20. Definition of Done

This specification is ready for implementation when:

- the scope is explicitly limited to the default-size refactor and reference
  corrections
- acceptance criteria cover both documentation and implementation alignment
- configurability is clearly marked as preparation only, not delivered scope
