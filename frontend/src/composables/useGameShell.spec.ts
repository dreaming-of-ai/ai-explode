import { afterEach, describe, expect, it, vi } from 'vitest'

import { EXPLOSION_DELAY_MEDIUM_MS, EXPLOSION_DELAY_HIGH_MS } from '@/data/explosionDelayPresets'
import {
  BOARD_SIZE,
  COMPUTER_TURN_DELAY_MS,
  addSetupPlayer,
  createEmptyBoard,
  createInitialSetupPlayers,
  createRestartSummary,
  getPlayableMoves,
  resolveBoardAfterMove,
  createScoreboardEntries,
  getAvailableColors,
  normalizeSetupPlayers,
  playMove,
  playMoveWithOutcomeAndPlayback,
  playMoveWithOutcome,
  removeSetupPlayer,
  resolveBoardAfterMoveWithPlayback,
  selectRandomComputerMove,
  startGameSession,
  useGameShell,
  validateSetupPlayers,
} from '@/composables/useGameShell'
import type { Cell, GameState, SetupPlayer } from '@/types/game'

const EXPLOSION_BURST_ANIMATION_MS = 260

function createHumanPlayer(id: number, name: string, colorId: string): SetupPlayer {
  return {
    id,
    name,
    colorId,
    controller: 'human',
    computerPlayerId: 'random',
  }
}

function createRandomPlayer(id: number, colorId: string): SetupPlayer {
  return {
    id,
    name: '',
    colorId,
    controller: 'computer',
    computerPlayerId: 'random',
  }
}

function createNamedPlayers(): SetupPlayer[] {
  return [
    createHumanPlayer(1, 'Nova', 'red'),
    createHumanPlayer(2, 'Atlas', 'blue'),
  ]
}

function createThreeNamedPlayers(): SetupPlayer[] {
  return [
    createHumanPlayer(1, 'Nova', 'red'),
    createHumanPlayer(2, 'Atlas', 'blue'),
    createHumanPlayer(3, 'Vega', 'green'),
  ]
}

function createPlayingState(board: Cell[][] = createEmptyBoard()): GameState {
  return {
    ...startGameSession(createNamedPlayers()),
    board,
  }
}

function setBoardCell(
  board: Cell[][],
  row: number,
  col: number,
  overrides: Partial<Pick<Cell, 'owner' | 'load'>>,
) {
  board[row][col] = {
    ...board[row][col],
    ...overrides,
  }
}

function setBoardSnapshot(
  board: Cell[][],
  snapshot: ReadonlyArray<ReadonlyArray<readonly [number | null, number]>>,
) {
  snapshot.forEach((boardRow, row) => {
    boardRow.forEach(([owner, load], col) => {
      setBoardCell(board, row, col, { owner, load })
    })
  })
}

function getAllowedLoad(board: Cell[][], row: number, col: number): number {
  let allowedLoad = 0

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let colOffset = -1; colOffset <= 1; colOffset += 1) {
      if (rowOffset === 0 && colOffset === 0) {
        continue
      }

      if (board[row + rowOffset]?.[col + colOffset]) {
        allowedLoad += 1
      }
    }
  }

  return allowedLoad
}

function expectStableBoard(board: Cell[][]) {
  board.forEach((boardRow, row) => {
    boardRow.forEach((cell, col) => {
      expect(cell.load).toBeLessThanOrEqual(getAllowedLoad(board, row, col))
    })
  })
}

function cloneGameState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState
}

afterEach(() => {
  vi.useRealTimers()
})

describe('setup validation', () => {
  it('creates an 8x8 board by default', () => {
    const board = createEmptyBoard()

    expect(board).toHaveLength(BOARD_SIZE)
    board.forEach((row) => expect(row).toHaveLength(BOARD_SIZE))
    expect(board.flat()).toHaveLength(BOARD_SIZE * BOARD_SIZE)
  })

  it('starts with two distinct player slots by default', () => {
    const players = createInitialSetupPlayers()

    expect(players).toHaveLength(2)
    expect(new Set(players.map((player) => player.colorId)).size).toBe(2)
  })

  it('requires names and unique colors', () => {
    const validation = validateSetupPlayers([
      createHumanPlayer(1, '   ', 'red'),
      createHumanPlayer(2, 'Atlas', 'red'),
    ])

    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('Every human player needs a name.')
    expect(validation.errors).toContain('Each player must have a unique color.')
  })

  it('allows computer-controlled slots without manual names', () => {
    const validation = validateSetupPlayers([
      createHumanPlayer(1, 'Nova', 'red'),
      createRandomPlayer(2, 'blue'),
    ])

    expect(validation).toEqual({
      isValid: true,
      errors: [],
    })
  })

  it('caps add/remove actions at the allowed player bounds', () => {
    const added = addSetupPlayer(addSetupPlayer(addSetupPlayer(createNamedPlayers())))
    const removed = removeSetupPlayer(removeSetupPlayer(removeSetupPlayer(added, 4), 3), 2)

    expect(added).toHaveLength(4)
    expect(removeSetupPlayer(removed, 1)).toHaveLength(2)
  })

  it('limits color choices based only on earlier player selections', () => {
    const colors = getAvailableColors(
      [
        createHumanPlayer(1, 'Nova', 'red'),
        createHumanPlayer(2, 'Atlas', 'blue'),
        createHumanPlayer(3, 'Vega', 'green'),
      ],
      2,
    )

    expect(colors.map((color) => color.id)).toEqual(['blue', 'green', 'amber'])
  })

  it('auto-corrects downstream colors after an upstream change invalidates them', () => {
    const players = normalizeSetupPlayers([
      createHumanPlayer(1, 'Nova', 'blue'),
      createHumanPlayer(2, 'Atlas', 'blue'),
      createHumanPlayer(3, 'Vega', 'green'),
      createHumanPlayer(4, 'Orion', 'amber'),
    ])

    expect(players.map((player) => player.colorId)).toEqual(['blue', 'red', 'green', 'amber'])
  })

  it('generates computer-player roster names from the slot number', () => {
    const state = startGameSession([
      createHumanPlayer(1, 'Nova', 'red'),
      createRandomPlayer(2, 'blue'),
    ])

    expect(state.players[1]).toMatchObject({
      name: 'Random 2',
      controller: 'computer',
      computerPlayerId: 'random',
      initials: 'R2',
    })
  })
})

describe('play flow', () => {
  it('claims empty cells, advances turns, and updates rounds after a full cycle', () => {
    const initialState = startGameSession(createNamedPlayers())
    const afterFirstMove = playMove(initialState, 0, 0)
    const afterSecondMove = playMove(afterFirstMove, 0, 1)

    expect(afterFirstMove.board[0][0]).toMatchObject({ owner: 1, load: 1 })
    expect(afterFirstMove.activePlayerIndex).toBe(1)
    expect(afterFirstMove.round).toBe(1)

    expect(afterSecondMove.board[0][1]).toMatchObject({ owner: 2, load: 1 })
    expect(afterSecondMove.activePlayerIndex).toBe(0)
    expect(afterSecondMove.round).toBe(2)
  })

  it('lets a player reinforce their own cell on a later turn', () => {
    const initialState = startGameSession(createNamedPlayers())
    const claimed = playMove(initialState, 0, 0)
    const opponentMove = playMove(claimed, 0, 1)
    const reinforced = playMove(opponentMove, 0, 0)

    expect(reinforced.board[0][0]).toMatchObject({ owner: 1, load: 2 })
  })

  it('lets a later unvisited cell explode in the same sweep', () => {
    const board = createEmptyBoard()
    setBoardCell(board, 0, 0, { owner: 1, load: 3 })
    setBoardCell(board, 0, 1, { owner: 2, load: 2 })
    setBoardCell(board, 1, 1, { owner: 2, load: 8 })

    const initialState = createPlayingState(board)
    const resolution = resolveBoardAfterMove(initialState, 0, 0)
    const resolved = playMove(initialState, 0, 0)

    expect(resolution.sweepCount).toBe(2)
    expect(resolution.board[0][0]).toMatchObject({ owner: 1, load: 2 })
    expect(resolution.board[0][1]).toMatchObject({ owner: 1, load: 4 })
    expect(resolution.board[1][0]).toMatchObject({ owner: 1, load: 2 })
    expect(resolution.board[1][1]).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[0][2]).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[1][2]).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[2][0]).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[2][1]).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[2][2]).toMatchObject({ owner: 1, load: 1 })
    expectStableBoard(resolution.board)
    expect(resolved.board).toEqual(resolution.board)
    expect(resolved.activePlayerIndex).toBe(1)
    expect(resolved.round).toBe(1)

    expect(createScoreboardEntries(resolved)).toEqual([
      expect.objectContaining({ player: expect.objectContaining({ id: 1 }), fields: 9, isActive: false }),
      expect.objectContaining({ player: expect.objectContaining({ id: 2 }), fields: 0, isActive: true }),
    ])
  })

  it('explodes only the five valid neighbors for an edge cell', () => {
    const board = createEmptyBoard()
    setBoardCell(board, 0, 4, { owner: 1, load: 5 })

    const resolved = playMove(createPlayingState(board), 0, 4)

    expect(resolved.board[0][4]).toMatchObject({ owner: 1, load: 1 })

    ;[
      [0, 3],
      [0, 5],
      [1, 3],
      [1, 4],
      [1, 5],
    ].forEach(([neighborRow, neighborCol]) => {
      expect(resolved.board[neighborRow][neighborCol]).toMatchObject({ owner: 1, load: 1 })
    })

    ;[
      [0, 2],
      [0, 6],
      [1, 2],
      [1, 6],
      [2, 4],
    ].forEach(([row, col]) => {
      expect(resolved.board[row][col]).toMatchObject({ owner: null, load: 0 })
    })
  })

  it('explodes to all eight neighbors for an interior cell', () => {
    const board = createEmptyBoard()
    setBoardCell(board, 4, 4, { owner: 1, load: 8 })

    const resolved = playMove(createPlayingState(board), 4, 4)

    expect(resolved.board[4][4]).toMatchObject({ owner: 1, load: 1 })

    ;[
      [3, 3],
      [3, 4],
      [3, 5],
      [4, 3],
      [4, 5],
      [5, 3],
      [5, 4],
      [5, 5],
    ].forEach(([neighborRow, neighborCol]) => {
      expect(resolved.board[neighborRow][neighborCol]).toMatchObject({ owner: 1, load: 1 })
    })

    expect(resolved.board[2][2]).toMatchObject({ owner: null, load: 0 })
  })

  it('waits until the next sweep before rechecking a cell that was already visited', () => {
    const board = createEmptyBoard()
    setBoardCell(board, 0, 0, { owner: 2, load: 3 })
    setBoardCell(board, 1, 1, { owner: 1, load: 8 })

    const resolution = resolveBoardAfterMove(createPlayingState(board), 1, 1)

    expect(resolution.sweepCount).toBe(3)
    expect(resolution.board[0][0]).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[0][1]).toMatchObject({ owner: 1, load: 2 })
    expect(resolution.board[1][0]).toMatchObject({ owner: 1, load: 2 })
    expect(resolution.board[1][1]).toMatchObject({ owner: 1, load: 2 })
    expect(resolution.board[0][2]).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[1][2]).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[2][0]).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[2][1]).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[2][2]).toMatchObject({ owner: 1, load: 1 })
    expectStableBoard(resolution.board)
  })

  it('allows a field to explode again in a later sweep after receiving more load', () => {
    const board = createEmptyBoard()
    setBoardCell(board, 0, 0, { owner: 1, load: 3 })
    setBoardCell(board, 0, 1, { owner: 2, load: 5 })
    setBoardCell(board, 1, 0, { owner: 2, load: 5 })
    setBoardCell(board, 1, 1, { owner: 2, load: 6 })

    const resolution = resolveBoardAfterMove(createPlayingState(board), 0, 0)

    expect(resolution.sweepCount).toBe(3)
    expect(resolution.board[0][0]).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[0][1]).toMatchObject({ owner: 1, load: 4 })
    expect(resolution.board[1][0]).toMatchObject({ owner: 1, load: 4 })
    expect(resolution.board[1][1]).toMatchObject({ owner: 1, load: 2 })
    expect(resolution.board[0][2]).toMatchObject({ owner: 1, load: 2 })
    expect(resolution.board[1][2]).toMatchObject({ owner: 1, load: 2 })
    expect(resolution.board[2][0]).toMatchObject({ owner: 1, load: 2 })
    expect(resolution.board[2][1]).toMatchObject({ owner: 1, load: 2 })
    expect(resolution.board[2][2]).toMatchObject({ owner: 1, load: 1 })
    expectStableBoard(resolution.board)
  })

  it('captures ordered explosion playback updates separately from the final resolved board', () => {
    const board = createEmptyBoard()
    setBoardCell(board, 0, 0, { owner: 1, load: 3 })

    const resolution = resolveBoardAfterMoveWithPlayback(createPlayingState(board), 0, 0)
    const playedMove = playMoveWithOutcomeAndPlayback(createPlayingState(board), 0, 0)

    expect(resolution.initialBoard[0][0]).toMatchObject({ owner: 1, load: 4 })
    expect(resolution.explosionUpdates.map((update) => [update.row, update.col])).toEqual([
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0],
    ])
    expect(resolution.explosionUpdates[0]?.cell).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.explosionUpdates[3]?.cell).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[0][0]).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[0][1]).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[1][0]).toMatchObject({ owner: 1, load: 1 })
    expect(resolution.board[1][1]).toMatchObject({ owner: 1, load: 1 })
    expect(playedMove.initialBoard).toEqual(resolution.initialBoard)
    expect(playedMove.state.board).toEqual(resolution.board)
  })

  it("ignores clicks on an opponent's occupied cell", () => {
    const initialState = startGameSession(createNamedPlayers())
    const claimed = playMove(initialState, 0, 0)
    const invalidMove = playMove(claimed, 0, 0)

    expect(invalidMove).toBe(claimed)
  })

  it('does not erase players or declare a winner before the opening round is complete', () => {
    const board = createEmptyBoard()
    setBoardCell(board, 0, 0, { owner: 1, load: 3 })
    setBoardCell(board, 0, 1, { owner: 2, load: 1 })

    const result = playMoveWithOutcome(createPlayingState(board), 0, 0)

    expect(result.resultPopup).toBeNull()
    expect(result.state.erasedPlayerIds).toEqual([])
    expect(result.state.winnerPlayerId).toBeNull()
    expect(result.state.isConcluded).toBe(false)
    expect(result.state.activePlayerIndex).toBe(1)
    expect(result.state.round).toBe(1)
  })

  it('erases newly fieldless players, shows one popup, and skips them in turn rotation from round two onward', () => {
    const board = createEmptyBoard()
    setBoardCell(board, 0, 0, { owner: 1, load: 3 })
    setBoardCell(board, 0, 1, { owner: 2, load: 1 })
    setBoardCell(board, 2, 2, { owner: 3, load: 1 })

    const state: GameState = {
      ...startGameSession(createThreeNamedPlayers()),
      board,
      activePlayerIndex: 0,
      round: 2,
    }

    const result = playMoveWithOutcome(state, 0, 0)

    expect(result.state.erasedPlayerIds).toEqual([2])
    expect(result.state.winnerPlayerId).toBeNull()
    expect(result.state.isConcluded).toBe(false)
    expect(result.state.activePlayerIndex).toBe(2)
    expect(result.state.round).toBe(2)
    expect(result.resultPopup).toMatchObject({
      messages: ['Atlas has been erased from the board.'],
      winnerPlayerId: null,
    })
  })

  it('declares the remaining player the winner, combines messages, and locks the board', () => {
    const board = createEmptyBoard()
    setBoardCell(board, 0, 0, { owner: 1, load: 3 })
    setBoardCell(board, 0, 1, { owner: 2, load: 1 })

    const state: GameState = {
      ...startGameSession(createNamedPlayers()),
      board,
      activePlayerIndex: 0,
      round: 2,
    }

    const result = playMoveWithOutcome(state, 0, 0)

    expect(result.state.erasedPlayerIds).toEqual([2])
    expect(result.state.winnerPlayerId).toBe(1)
    expect(result.state.isConcluded).toBe(true)
    expect(result.resultPopup?.messages).toEqual([
      'Atlas has been erased from the board.',
      'Nova wins the match.',
    ])
    expect(playMove(result.state, 1, 1)).toBe(result.state)
  })

  it('evaluates erasure and winner detection from the final multi-sweep board', () => {
    const board = createEmptyBoard()
    setBoardCell(board, 1, 0, { owner: 2, load: 1 })
    setBoardCell(board, 1, 1, { owner: 2, load: 8 })
    setBoardCell(board, 1, 2, { owner: 1, load: 8 })

    const state: GameState = {
      ...startGameSession(createNamedPlayers()),
      board,
      activePlayerIndex: 0,
      round: 2,
    }

    const result = playMoveWithOutcome(state, 1, 2)

    expect(result.state.board[1][0]).toMatchObject({ owner: 1, load: 2 })
    expect(result.state.erasedPlayerIds).toEqual([2])
    expect(result.state.winnerPlayerId).toBe(1)
    expect(result.state.isConcluded).toBe(true)
    expect(result.resultPopup?.messages).toEqual([
      'Atlas has been erased from the board.',
      'Nova wins the match.',
    ])
  })

  it('concludes the match once one player owns every occupied field, even if later sweeps would cycle', () => {
    const board = createEmptyBoard()

    setBoardSnapshot(board, [
      [
        [2, 2],
        [2, 5],
        [2, 5],
        [2, 2],
        [2, 5],
        [2, 4],
        [2, 5],
        [2, 1],
      ],
      [
        [2, 3],
        [2, 3],
        [2, 5],
        [2, 8],
        [2, 6],
        [2, 8],
        [2, 5],
        [2, 5],
      ],
      [
        [2, 4],
        [2, 5],
        [2, 7],
        [2, 6],
        [2, 5],
        [2, 6],
        [2, 6],
        [2, 5],
      ],
      [
        [2, 4],
        [2, 8],
        [2, 7],
        [2, 2],
        [2, 7],
        [2, 3],
        [2, 6],
        [2, 1],
      ],
      [
        [2, 4],
        [2, 5],
        [2, 7],
        [2, 8],
        [2, 8],
        [2, 1],
        [2, 7],
        [2, 4],
      ],
      [
        [2, 4],
        [2, 8],
        [2, 8],
        [2, 6],
        [2, 8],
        [2, 2],
        [1, 8],
        [1, 2],
      ],
      [
        [2, 3],
        [2, 2],
        [2, 6],
        [2, 7],
        [2, 6],
        [1, 6],
        [1, 7],
        [1, 1],
      ],
      [
        [2, 2],
        [2, 5],
        [2, 2],
        [2, 1],
        [2, 4],
        [1, 5],
        [1, 4],
        [1, 2],
      ],
    ])

    const state: GameState = {
      ...startGameSession(createNamedPlayers()),
      board,
      activePlayerIndex: 1,
      round: 154,
    }

    const result = playMoveWithOutcome(state, 0, 4)

    expect(result.state.erasedPlayerIds).toEqual([1])
    expect(result.state.winnerPlayerId).toBe(2)
    expect(result.state.isConcluded).toBe(true)
    expect(result.state.board.flat().every((cell) => cell.owner === 2)).toBe(true)
    expect(result.resultPopup?.messages).toEqual([
      'Nova has been erased from the board.',
      'Atlas wins the match.',
    ])
  })
})

describe('shell flow', () => {
  it('defaults to low explosion delay so new games show visible burst playback', () => {
    const shell = useGameShell()

    expect(shell.explosionDelayPreset.value).toBe('low')
  })

  it('ignores manual clicks while a computer-controlled player is active', () => {
    vi.useFakeTimers()

    const shell = useGameShell()

    shell.updatePlayerController(1, 'computer')
    shell.updatePlayerName(2, 'Atlas')
    shell.startGame()
    shell.playCell(0, 0)

    expect(shell.gameState.value.board[0][0]).toMatchObject({ owner: null, load: 0 })
  })

  it('chooses only legal cells for the random computer player', () => {
    const state: GameState = {
      ...startGameSession([
        createRandomPlayer(1, 'red'),
        createHumanPlayer(2, 'Atlas', 'blue'),
      ]),
      board: createEmptyBoard(),
    }

    setBoardCell(state.board, 0, 0, { owner: 2, load: 1 })
    setBoardCell(state.board, 1, 1, { owner: 1, load: 2 })

    const playableMoves = getPlayableMoves(state)
    const selectedMove = selectRandomComputerMove(state, () => 0.999999)

    expect(playableMoves).not.toContainEqual({ row: 0, col: 0 })
    expect(selectedMove).not.toEqual({ row: 0, col: 0 })
    expect(selectedMove).toEqual(playableMoves[playableMoves.length - 1])
  })

  it('opens setup on first render, but warns before replacing an active game', () => {
    const shell = useGameShell()

    shell.openNewGame()
    expect(shell.modalState.value).toBe('setup')

    shell.updatePlayerName(1, 'Nova')
    shell.updatePlayerName(2, 'Atlas')
    shell.startGame()

    expect(shell.gameState.value.phase).toBe('playing')
    expect(shell.modalState.value).toBe('closed')

    shell.playCell(0, 0)
    const boardBeforeWarning = shell.gameState.value.board.map((row) => row.map((cell) => ({ ...cell })))

    shell.openNewGame()
    expect(shell.modalState.value).toBe('restart-warning')

    shell.proceedToSetupFromWarning()
    expect(shell.modalState.value).toBe('setup')
    expect(shell.gameState.value.board).toEqual(boardBeforeWarning)
  })

  it('creates a restart summary from the live game state', () => {
    const initialState = startGameSession(createNamedPlayers())
    const afterFirstMove = playMove(initialState, 0, 0)
    const summary = createRestartSummary(afterFirstMove)

    expect(summary).toMatchObject({
      contextLabel: 'Round 1 · Atlas to play',
    })
    expect(summary?.entries).toEqual([
      expect.objectContaining({
        player: expect.objectContaining({ name: 'Nova' }),
        fields: 1,
        isActive: false,
        isErased: false,
        isWinner: false,
      }),
      expect.objectContaining({
        player: expect.objectContaining({ name: 'Atlas' }),
        fields: 0,
        isActive: true,
        isErased: false,
        isWinner: false,
      }),
    ])
  })

  it('opens one move-result modal and keeps the next eligible player queued after dismissal', () => {
    const shell = useGameShell()
    const board = createEmptyBoard()

    setBoardCell(board, 0, 0, { owner: 1, load: 3 })
    setBoardCell(board, 0, 1, { owner: 2, load: 1 })
    setBoardCell(board, 2, 2, { owner: 3, load: 1 })

    shell.gameState.value = {
      ...startGameSession(createThreeNamedPlayers()),
      board,
      activePlayerIndex: 0,
      round: 2,
    }

    shell.updateExplosionDelayPreset('none')
    shell.playCell(0, 0)

    expect(shell.modalState.value).toBe('move-result')
    expect(shell.moveResultPopup.value?.messages).toEqual(['Atlas has been erased from the board.'])
    expect(shell.gameState.value.activePlayerIndex).toBe(2)
    expect(shell.isCellPlayable(2, 2)).toBe(false)

    shell.dismissMoveResult()

    expect(shell.modalState.value).toBe('closed')
    expect(shell.moveResultPopup.value).toBeNull()
    expect(shell.isCellPlayable(2, 2)).toBe(true)
  })

  it('opens and closes header popups without mutating the live match state', () => {
    const shell = useGameShell()

    shell.updatePlayerName(1, 'Nova')
    shell.updatePlayerName(2, 'Atlas')
    shell.startGame()
    shell.playCell(0, 0)

    const snapshot = cloneGameState(shell.gameState.value)

    shell.openHeaderPopup('gaming-rules')

    expect(shell.modalState.value).toBe('header-popup')
    expect(shell.activeHeaderPopup.value).toBe('gaming-rules')
    expect(shell.gameState.value).toEqual(snapshot)
    expect(shell.isCellPlayable(0, 1)).toBe(false)

    shell.closeHeaderPopup()

    expect(shell.modalState.value).toBe('closed')
    expect(shell.activeHeaderPopup.value).toBeNull()
    expect(shell.gameState.value).toEqual(snapshot)
    expect(shell.isCellPlayable(0, 1)).toBe(true)
  })

  it('tracks the last deliberate move, ignores invalid clicks, and clears the indicator on a fresh match', () => {
    const shell = useGameShell()

    shell.updatePlayerName(1, 'Nova')
    shell.updatePlayerName(2, 'Atlas')
    shell.startGame()

    expect(shell.lastMoveIndicator.value).toBeNull()

    shell.playCell(0, 0)

    expect(shell.lastMoveIndicator.value).toEqual({
      row: 0,
      col: 0,
      playerId: 1,
    })

    shell.playCell(0, 0)

    expect(shell.lastMoveIndicator.value).toEqual({
      row: 0,
      col: 0,
      playerId: 1,
    })

    shell.openNewGame()
    shell.proceedToSetupFromWarning()
    shell.startGame()

    expect(shell.lastMoveIndicator.value).toBeNull()
    expect(shell.displayBoard.value.flat().every((cell) => cell.owner === null && cell.load === 0)).toBe(true)
  })

  it('blocks board moves and legal navigation while a header popup is open', () => {
    const shell = useGameShell()

    shell.updatePlayerName(1, 'Nova')
    shell.updatePlayerName(2, 'Atlas')
    shell.startGame()
    shell.playCell(0, 0)

    const snapshot = cloneGameState(shell.gameState.value)

    shell.openHeaderPopup('information')
    shell.playCell(0, 1)
    shell.openLegalPage('imprint')

    expect(shell.modalState.value).toBe('header-popup')
    expect(shell.activeHeaderPopup.value).toBe('information')
    expect(shell.activeLegalPage.value).toBeNull()
    expect(shell.gameState.value).toEqual(snapshot)
  })

  it('plays delayed explosion updates on the display board while keeping match state stable until resolution completes', async () => {
    vi.useFakeTimers()

    const shell = useGameShell()
    const board = createEmptyBoard()

    setBoardCell(board, 0, 0, { owner: 1, load: 3 })

    shell.updateExplosionDelayPreset('medium')
    shell.gameState.value = {
      ...startGameSession(createNamedPlayers()),
      board,
      activePlayerIndex: 0,
      round: 1,
    }
    await Promise.resolve()

    shell.playCell(0, 0)

    expect(shell.isResolvingMove.value).toBe(true)
    expect(shell.lastMoveIndicator.value).toEqual({
      row: 0,
      col: 0,
      playerId: 1,
    })
    expect(shell.displayBoard.value[0][0]).toMatchObject({ owner: 1, load: 4 })
    expect(shell.displayBoard.value[0][1]).toMatchObject({ owner: 1, load: 1 })
    expect(shell.gameState.value.board[0][0]).toMatchObject({ owner: 1, load: 3 })
    expect(shell.activePlayer.value?.id).toBe(1)
    expect(shell.scoreboardEntries.value[0]?.fields).toBe(1)

    shell.openHeaderPopup('settings')

    expect(shell.modalState.value).toBe('closed')
    expect(shell.activeHeaderPopup.value).toBeNull()

    await vi.advanceTimersByTimeAsync(EXPLOSION_DELAY_MEDIUM_MS)
    expect(shell.displayBoard.value[1][1]).toMatchObject({ owner: 1, load: 1 })
    expect(shell.gameState.value.activePlayerIndex).toBe(0)

    await vi.advanceTimersByTimeAsync(EXPLOSION_DELAY_MEDIUM_MS)
    expect(shell.displayBoard.value[1][0]).toMatchObject({ owner: 1, load: 1 })
    expect(shell.gameState.value.round).toBe(1)

    await vi.advanceTimersByTimeAsync(EXPLOSION_DELAY_MEDIUM_MS)

    expect(shell.isResolvingMove.value).toBe(true)
    expect(shell.explodingCells.value).toEqual(new Set(['0-0']))
    expect(shell.displayBoard.value[0][0]).toMatchObject({ owner: 1, load: 1 })
    expect(shell.gameState.value.board[0][0]).toMatchObject({ owner: 1, load: 3 })

    await vi.advanceTimersByTimeAsync(EXPLOSION_BURST_ANIMATION_MS)

    expect(shell.isResolvingMove.value).toBe(false)
    expect(shell.explodingCells.value).toEqual(new Set())
    expect(shell.displayBoard.value[0][0]).toMatchObject({ owner: 1, load: 1 })
    expect(shell.gameState.value.board[0][0]).toMatchObject({ owner: 1, load: 1 })
    expect(shell.gameState.value.activePlayerIndex).toBe(1)
    expect(shell.scoreboardEntries.value[0]?.fields).toBe(4)
  })

  it('captures the selected explosion delay for the full in-flight move even if the setting changes mid-resolution', async () => {
    vi.useFakeTimers()

    const shell = useGameShell()
    const board = createEmptyBoard()

    setBoardCell(board, 0, 0, { owner: 1, load: 3 })

    shell.updateExplosionDelayPreset('high')
    shell.gameState.value = {
      ...startGameSession(createNamedPlayers()),
      board,
      activePlayerIndex: 0,
      round: 1,
    }
    await Promise.resolve()

    shell.playCell(0, 0)
    shell.updateExplosionDelayPreset('none')

    await vi.advanceTimersByTimeAsync(EXPLOSION_DELAY_MEDIUM_MS)
    expect(shell.displayBoard.value[1][1]).toMatchObject({ owner: null, load: 0 })
    expect(shell.isResolvingMove.value).toBe(true)

    await vi.advanceTimersByTimeAsync(EXPLOSION_DELAY_HIGH_MS - EXPLOSION_DELAY_MEDIUM_MS)
    expect(shell.displayBoard.value[1][1]).toMatchObject({ owner: 1, load: 1 })

    await vi.runAllTimersAsync()

    expect(shell.explosionDelayPreset.value).toBe('none')
    expect(shell.isResolvingMove.value).toBe(false)
    expect(shell.gameState.value.activePlayerIndex).toBe(1)
    expect(shell.displayBoard.value[0][0]).toMatchObject({ owner: 1, load: 1 })
  })

  it('automatically plays the first move for an opening random computer player', async () => {
    vi.useFakeTimers()

    const shell = useGameShell()

    shell.updatePlayerController(1, 'computer')
    shell.updatePlayerName(2, 'Atlas')
    shell.startGame()
    await Promise.resolve()

    expect(shell.gameState.value.phase).toBe('playing')
    expect(shell.gameState.value.players[0].name).toBe('Random 1')
    expect(shell.gameState.value.board.flat().every((cell) => cell.owner === null)).toBe(true)

    vi.advanceTimersByTime(COMPUTER_TURN_DELAY_MS)

    const occupiedCells = shell.gameState.value.board.flat().filter((cell) => cell.owner !== null)

    expect(occupiedCells).toHaveLength(1)
    expect(occupiedCells[0]).toMatchObject({ owner: 1, load: 1 })
    expect(shell.gameState.value.activePlayerIndex).toBe(1)
  })

  it('waits for delayed playback to finish before scheduling the next computer turn', async () => {
    vi.useFakeTimers()

    const shell = useGameShell()
    const board = createEmptyBoard()

    setBoardCell(board, 0, 0, { owner: 1, load: 3 })

    shell.updateExplosionDelayPreset('medium')
    shell.gameState.value = {
      ...startGameSession([
        createHumanPlayer(1, 'Nova', 'red'),
        createRandomPlayer(2, 'blue'),
      ]),
      board,
      activePlayerIndex: 0,
      round: 1,
    }
    await Promise.resolve()

    shell.playCell(0, 0)

    await vi.advanceTimersByTimeAsync(EXPLOSION_DELAY_MEDIUM_MS * 3)

    expect(shell.isResolvingMove.value).toBe(true)
    expect(shell.explodingCells.value).toEqual(new Set(['0-0']))
    expect(shell.gameState.value.activePlayerIndex).toBe(0)

    await vi.advanceTimersByTimeAsync(EXPLOSION_BURST_ANIMATION_MS)

    expect(shell.isResolvingMove.value).toBe(false)
    expect(shell.gameState.value.activePlayerIndex).toBe(1)
    expect(shell.gameState.value.board.flat().filter((cell) => cell.owner === 2)).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(COMPUTER_TURN_DELAY_MS)

    expect(shell.gameState.value.board.flat().filter((cell) => cell.owner === 2)).toHaveLength(1)
    expect(shell.gameState.value.activePlayerIndex).toBe(0)
  })

  it('automatically hands off from a human move to the next random computer move', async () => {
    vi.useFakeTimers()

    const shell = useGameShell()

    shell.updatePlayerName(1, 'Nova')
    shell.updatePlayerController(2, 'computer')
    shell.startGame()
    shell.playCell(0, 0)
    await Promise.resolve()

    expect(shell.gameState.value.board[0][0]).toMatchObject({ owner: 1, load: 1 })
    expect(shell.gameState.value.activePlayerIndex).toBe(1)

    vi.advanceTimersByTime(COMPUTER_TURN_DELAY_MS)

    const playerTwoFields = shell.gameState.value.board.flat().filter((cell) => cell.owner === 2)

    expect(playerTwoFields).toHaveLength(1)
    expect(shell.gameState.value.board[0][0]).toMatchObject({ owner: 1, load: 1 })
    expect(shell.gameState.value.activePlayerIndex).toBe(0)
    expect(shell.gameState.value.round).toBe(2)
  })

  it('preserves the current shell state while a legal page is open', () => {
    const shell = useGameShell()

    shell.updatePlayerName(1, 'Nova')
    shell.updatePlayerName(2, 'Atlas')
    shell.startGame()
    shell.playCell(0, 0)

    const snapshot = cloneGameState(shell.gameState.value)

    shell.openLegalPage('imprint')

    expect(shell.activeLegalPage.value).toBe('imprint')
    expect(shell.isCellPlayable(0, 1)).toBe(false)

    shell.playCell(0, 1)
    expect(shell.gameState.value).toEqual(snapshot)

    shell.closeLegalPage()

    expect(shell.activeLegalPage.value).toBeNull()
    expect(shell.gameState.value).toEqual(snapshot)
    expect(shell.isCellPlayable(0, 1)).toBe(true)
  })

  it('pauses and resumes queued computer turns around legal navigation', async () => {
    vi.useFakeTimers()

    const shell = useGameShell()

    shell.gameState.value = playMove(
      startGameSession([
        createHumanPlayer(1, 'Nova', 'red'),
        createRandomPlayer(2, 'blue'),
      ]),
      0,
      0,
    )
    await Promise.resolve()

    const beforeLegalPage = cloneGameState(shell.gameState.value)

    shell.openLegalPage('privacy-policy')
    vi.advanceTimersByTime(COMPUTER_TURN_DELAY_MS)

    expect(shell.gameState.value).toEqual(beforeLegalPage)
    expect(shell.activeLegalPage.value).toBe('privacy-policy')

    shell.closeLegalPage()
    await Promise.resolve()
    vi.advanceTimersByTime(COMPUTER_TURN_DELAY_MS)

    expect(shell.activeLegalPage.value).toBeNull()
    expect(shell.gameState.value.board.flat().filter((cell) => cell.owner === 2)).toHaveLength(1)
    expect(shell.gameState.value.activePlayerIndex).toBe(0)
  })

  it('pauses and resumes queued computer turns around header popups', async () => {
    vi.useFakeTimers()

    const shell = useGameShell()

    shell.gameState.value = playMove(
      startGameSession([
        createHumanPlayer(1, 'Nova', 'red'),
        createRandomPlayer(2, 'blue'),
      ]),
      0,
      0,
    )
    await Promise.resolve()

    const beforeHeaderPopup = cloneGameState(shell.gameState.value)

    shell.openHeaderPopup('gaming-rules')
    vi.advanceTimersByTime(COMPUTER_TURN_DELAY_MS)

    expect(shell.modalState.value).toBe('header-popup')
    expect(shell.activeHeaderPopup.value).toBe('gaming-rules')
    expect(shell.gameState.value).toEqual(beforeHeaderPopup)

    shell.closeHeaderPopup()
    await Promise.resolve()
    vi.advanceTimersByTime(COMPUTER_TURN_DELAY_MS)

    expect(shell.modalState.value).toBe('closed')
    expect(shell.activeHeaderPopup.value).toBeNull()
    expect(shell.gameState.value.board.flat().filter((cell) => cell.owner === 2)).toHaveLength(1)
    expect(shell.gameState.value.activePlayerIndex).toBe(0)
  })
})
