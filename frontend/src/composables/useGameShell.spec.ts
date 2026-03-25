import { describe, expect, it } from 'vitest'

import {
  addSetupPlayer,
  createInitialSetupPlayers,
  getAvailableColors,
  playMove,
  removeSetupPlayer,
  startGameSession,
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

  it('only offers colors that are still free for a given player', () => {
    const colors = getAvailableColors(
      [
        { id: 1, name: 'Nova', colorId: 'red' },
        { id: 2, name: 'Atlas', colorId: 'blue' },
        { id: 3, name: 'Vega', colorId: 'green' },
      ],
      2,
    )

    expect(colors.map((color) => color.id)).toEqual(['blue', 'amber'])
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
