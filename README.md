# AI Explode

## Idea

**AI Explode** is a game project inspired by a type of gameplay I've always loved.
Details can be found in the [Game Overview](/papers/game-overview.md).

The latest deployed version of the game can be found from here: [https://ai-explode.de/](https://ai-explode.de/)

In parallel, the project serves as a practical demonstration of how to build and operate an agentic development 
environment with **Codex** and **Claude Code**.
Beyond developing the game itself, the project also captures the surrounding workflow: creating specifications, 
deriving implementation plans, and executing changes in a controlled way.

> [!NOTE]  
> This project is **not vibe coded**, but it shows how to use AI agents to build a non-trivial application in a structured way.

## Build & Run

Perform the following steps to build the application:

```
npm install
npm run build
```

To run the application locally, use:

```
npm run dev
```

## Implementation

Implementation is done using **Codex** with **GPT-5.4 Medium** to **GPT-5.4 Extra High** depending on the complexity 
of the task at hand.
The implementation workflow is structured around specifications and implementation plans, which are created using the 
corresponding skills defined.
The actual implementation is then done using the implementation execution skill, which ensures that changes are made 
in a controlled way and that the codebase remains stable.
The code review skill is used to check the changes after implementation and to ensure that they meet the required 
standards.

## Testing (Black Box)

End-to-end tests are implemented using **Claude Opus 4.6** and the corresponding agents in the testing project.
The first agent creates _Gherkin_ test features from a simple textual description and the specifications.
The second agent creates _Playwright_ tests that can be easily executed.

The testing project is completely separated and lives in its own repository: 
https://github.com/dreaming-of-ai/ai-explode-testing

## Lessons Learned

### AGENTS.md File

The `AGENTS.md` must be located at the top level and not below the `.agent` directory for **Codex** to pick it up.
This means the first three sessions were done without the AI picking up the `AGENTS.md` file.

## Tracking Progress & Time (overall 14h)

### Session 7 – 2026-03-29 / 2h

### General

Used **Opus 4.6**
- to write the `technical-overview.md` document and starting to describe potential backend features.

#### Implementation

- Added content to info popup.
- Added possibility to define a delay in the explosions for better visual effects.
- Added an indication to mark the last move made.
- Finalized _Impressum_ and _Datenschutz_ pages with personal information.
- Updating to `VUE 8.0.3`.
- Preparing live deployment.

#### Testing

- Added a new test for _Impressum_ and _Datenschutz_ pages.


### Session 6 – 2026-03-28 / 3h

### General

Used **Opus 4.6**

- to write the content for the _Impressum_ and _Datenschutz_ pages.
- to write the `screen-layout.md` specification for the layout changes and the new pages.
- to check potential problems with copyright questions regarding the gameplay.

#### Implementation

- Added the chain reaction mechanism and implemented the logic to handle eliminated players and game ending state.
- Added **Impressum** and **Datenschutz** pages to comply with german DSGVO regulations.
- Minor changes to some of the displayed text to improve clarity and user experience.
- Added icons for functions: _Gaming Rules_, _Information_ and _Settings_.
- Added the gaming rules from the `game-overview.md` to the _Gaming Rules_ popup.
- Added basic setting for computer players and adding the first computer player as a _Random Player_
- Found a game state bug by letting two computer players play against each other for a while. This was fixed using **GPT-5.4 Extra High**.

### Session 5 – 2026-03-28 / 2h

#### General

- Updated `game-overview.md` to reflect changes to board size and to prepare for future additions.

#### Implementation

Specification, planning, and implementation tasks were performed with **Codex** and **GPT-5.4 High** (no re-work was needed):

- Refactored from a 10×10 board to an 8×8 board.
- Implemented explosion of an individual cell, not yet considering chain reactions.
- Implemented elimination of an individual player from the game.
- Implemented the game's end condition.

#### Testing

- Added a new test for player elimination.
- Added a new test for the game's end condition.

### Session 4 – 2026-03-27 / 1h 30m

#### Testing

- Added a basic smoke test.
- Added a test for game creation with two players and simple moves.
- Added a test for game creation and handling of illegal moves.

### Session 3 – 2026-03-26 / 2h 30m

#### Implementation

- Created the first specification using the `specification-writer.md` skill.
- Covered cleaning up the initial layout, making the board and the overall app responsive, and moving the *New Game* screen to a popup.
- Results were acceptable, though one redo was required.
- Several minor graphical changes followed, requiring a switch to **GPT-5.4 High** for some CSS work.
- Retrospectively, re-specifying those changes would have been better — but it is always tempting to just instruct the AI directly.
- Introduced self-learning using a `LEARNINGS.md` file.

#### Testing

- In parallel, a separate testing project was set up using **Claude Sonnet 4.6**, living in its own repository.
- The idea is to have the AI write _Playwright_ tests in _Gherkin_ style and then execute them. Two separate agents have been configured in the testing project for this purpose.

### Session 2 – 2026-03-25 / 2h

- Used **Claude Opus** to write `game-overview.md` containing the game's description.
- Used **Claude Opus** to write specification `2026-03-25_SPEC_game-shell-player-setup.md` for the initial implementation, then used **Codex** with **GPT-5.4 High** to create the implementation plan and execute it.

> **Note:** The initial Vue implementation had one bug due to an `Uncaught TypeError`. This was fixed in a single round trip and the initial functionality worked flawlessly afterwards. The board is not yet responsive and does not adjust to the browser window size — this will be addressed in a refinement of this first story.

### Session 1 – 2026-03-17 / 1h

- The project layout and tech stack
- `AGENTS.md`
- The specification skill
- The implementation plan skill
- The implementation execution skill
- The review skill
