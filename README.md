# AI Explode

## Idea

`AI Explode` is a game project centered around a type of gameplay I personally enjoy.

In parallel, the project serves as a practical demonstration of how to build and operate an agentic development environment with `Codex` or `Claude Code`. Beyond developing the game itself, the project also captures the surrounding workflow: creating specifications, deriving implementation plans, executing changes in a controlled way, and reviewing uncommitted work before it is committed.

## Testing (Black Box)

Tests are implemented using *Claude Opus 4.6* and the corresponding agents in the testing project.
The first agent is creating a Gherkin test feature from a simple description and the specifications.
The second agent is running the test and reporting the results.

The testing project lives in its own repository under: https://github.com/dreaming-of-ai/ai-explode-testing

## Lessons Learned

### AGENT.md file

The *AGENT.md* must be located top-level and not below the `.agent`-directory for `Codex` to pick it up.
This means the first three sessions have been done without the AI picking up the *AGENT.md* file.

## Tracking Progress & Time (overall 7h 15m)

### Session 4 - 2026-03-27 / 1h 30m

#### Testing

- Added basic smoke test.
- Added test for game creation with two players and simple moves.
- Added test for game creation and handling illegal moves.

### Session 3 - 2026-03-26 / 2h 30m

#### Implementation

- Created the first specification with `Codex` and `GPT 5.4 Medium` using the `specification-writer` skill.
- This was about cleaning up the initial optic, making the board and the overall app responsive, and moving the *New Game* screen to a popup.
- Results have been ok so far, but one redo was needed.
- Then several minor graphical changes have been done with the need to switch to `GPT 5.4 High` for some of the CSS work needed.
- Maybe re-specifying those changes would have been better, but it is always tempting to just tell the AI what to do right away.
- Introduced self-learning using a `LEARNINGS.md` file.

#### Testing

- In parallel a separate testing project has been set up that is based on `Claude` and lifes in its own repository. This was done using `Claude sonnet 4.6`.
- The idea of the testing project is having the AI writing Playwright tests for the game in Gherkin style and then running them. Therefore two separate agents have been configured in the testing project.

### Session 2 - 2026-03-25 / 2h

- Used _Claude Opus_ to write the `game-overview.md` file containing the game's description.
- Used _Claude Opus_ to write specification `2026-03-25_SPEC_game-shell-player-setup.md` for initial implementation, then used `Codex` with `GPT 5.4 High` to create the implementation plan and execute it.

> **Note:** The initial Vue implementation had one bug due to an `Uncaught TypeError`. This was fixed in a single round trip and the initial functionality worked flawlessly afterwards. The board is not yet responsive and does not adjust to the browser window size. This will be addressed in a refinement of this first story.

### Session 1 - 2026-03-17 / 1h 15m

Used `ChatGPT 5.4 Thinking` to prepare initial versions of:

- The project layout and tech stack
- `AGENTS.md`
- The specification skill
- The implementation plan skill
- The implementation execution skill
- The review skill