# AI Explode

## Idea

`AI Explode` is a game project centered around a type of gameplay I personally enjoy.

In parallel, the project serves as a practical demonstration of how to build and operate an agentic development environment with `Codex` or `Claude Code`. Beyond developing the game itself, the project also captures the surrounding workflow: creating specifications, deriving implementation plans, executing changes in a controlled way, and reviewing uncommitted work before it is committed.

## Tracking Progress & Time (overall 3h 15m)

### 2026-03-25 / 2h

- Used _Claude Opus_ to write the `game-overview.md` file containing the game's description.
- Used _Claude Opus_ to write specification `2026-03-25_SPEC_game-shell-player-setup.md` for initial implementation, then used `Codex` with `GPT 5.4 High` to create the implementation plan and execute it (~45K tokens).

> **Note:** The initial Vue implementation had one bug due to an `Uncaught TypeError`. This was fixed in a single round trip and the initial functionality worked flawlessly afterwards. The board is not yet responsive and does not adjust to the browser window size. This will be addressed in a refinement of this first story.

### 2026-03-17 / 1h 15m

Used `ChatGPT 5.4 Thinking` to prepare initial versions of:

- The project layout and tech stack
- `AGENTS.md`
- The specification skill
- The implementation plan skill
- The implementation execution skill
- The review skill