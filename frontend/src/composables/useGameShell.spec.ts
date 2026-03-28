import { describe, expect, it } from 'vitest'

import {
  BOARD_SIZE,
  addSetupPlayer,
  createEmptyBoard,
  createInitialSetupPlayers,
  createRestartSummary,
  createScoreboardEntries,
  getAvailableColors,
  normalizeSetupPlayers,
  playMove,
  playMoveWithOutcome,
  removeSetupPlayer,
  startGameSession,
  useGameShell,
  validateSetupPlayers,
} from '@/composables/useGameShell'
import type { Cell, GameState, SetupPlayer } from '@/types/game'

function createNamedPlayers(): SetupPlayer[] {
  return [
    { id: 1, name: 'Nova', colorId: 'red' },
    { id: 2, name: 'Atlas', colorId: 'blue' },
  ]
}

function createThreeNamedPlayers(): SetupPlayer[] {
  return [
    { id: 1, name: 'Nova', colorId: 'red' },
    { id: 2, name: 'Atlas', colorId: 'blue' },
    { id: 3, name: 'Vega', colorId: 'green' },
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
      { id: 1, name: '   ', colorId: 'red' },
      { id: 2, name: 'Atlas', colorId: 'red' },
    ])

    expect(validation.isValid).toBe(false)
    expect(validation.errors).toContain('Every player needs a name.')
    expect(validation.errors).toContain('Each player must have a unique color.')
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
        { id: 1, name: 'Nova', colorId: 'red' },
        { id: 2, name: 'Atlas', colorId: 'blue' },
        { id: 3, name: 'Vega', colorId: 'green' },
      ],
      2,
    )

    expect(colors.map((color) => color.id)).toEqual(['blue', 'green', 'amber'])
  })

  it('auto-corrects downstream colors after an upstream change invalidates them', () => {
    const players = normalizeSetupPlayers([
      { id: 1, name: 'Nova', colorId: 'blue' },
      { id: 2, name: 'Atlas', colorId: 'blue' },
      { id: 3, name: 'Vega', colorId: 'green' },
      { id: 4, name: 'Orion', colorId: 'amber' },
    ])

    expect(players.map((player) => player.colorId)).toEqual(['blue', 'red', 'green', 'amber'])
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

  it('resolves one corner explosion, transfers ownership, updates scores, and stops there', () => {
    const board = createEmptyBoard()
    setBoardCell(board, 0, 0, { owner: 1, load: 3 })
    setBoardCell(board, 0, 1, { owner: 2, load: 2 })
    setBoardCell(board, 1, 1, { owner: 2, load: 8 })

    const resolved = playMove(createPlayingState(board), 0, 0)

    expect(resolved.board[0][0]).toMatchObject({ owner: 1, load: 1 })
    expect(resolved.board[0][1]).toMatchObject({ owner: 1, load: 3 })
    expect(resolved.board[1][0]).toMatchObject({ owner: 1, load: 1 })
    expect(resolved.board[1][1]).toMatchObject({ owner: 1, load: 9 })
    expect(resolved.board[0][2]).toMatchObject({ owner: null, load: 0 })
    expect(resolved.activePlayerIndex).toBe(1)
    expect(resolved.round).toBe(1)

    expect(createScoreboardEntries(resolved)).toEqual([
      expect.objectContaining({ player: expect.objectContaining({ id: 1 }), fields: 4, isActive: false }),
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
})

describe('shell flow', () => {
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
})
