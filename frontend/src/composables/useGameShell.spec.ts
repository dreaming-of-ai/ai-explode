import { describe, expect, it } from 'vitest'

import {
  addSetupPlayer,
  createInitialSetupPlayers,
  createRestartSummary,
  getAvailableColors,
  normalizeSetupPlayers,
  playMove,
  removeSetupPlayer,
  startGameSession,
  useGameShell,
  validateSetupPlayers,
} from '@/composables/useGameShell'
import type { SetupPlayer } from '@/types/game'

function createNamedPlayers(): SetupPlayer[] {
  return [
    { id: 1, name: 'Nova', colorId: 'red' },
    { id: 2, name: 'Atlas', colorId: 'blue' },
  ]
}

describe('setup validation', () => {
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

  it("ignores clicks on an opponent's occupied cell", () => {
    const initialState = startGameSession(createNamedPlayers())
    const claimed = playMove(initialState, 0, 0)
    const invalidMove = playMove(claimed, 0, 0)

    expect(invalidMove).toBe(claimed)
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
      expect.objectContaining({ player: expect.objectContaining({ name: 'Nova' }), fields: 1, isActive: false }),
      expect.objectContaining({ player: expect.objectContaining({ name: 'Atlas' }), fields: 0, isActive: true }),
    ])
  })
})
