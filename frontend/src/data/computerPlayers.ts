import type { ComputerPlayerDefinition, ComputerPlayerId } from '@/types/game'

export const DEFAULT_COMPUTER_PLAYER_ID: ComputerPlayerId = 'random'

export const COMPUTER_PLAYERS: ComputerPlayerDefinition[] = [
  {
    id: 'random',
    name: 'Random',
    description: 'Chooses one legal field at random.',
  },
]

export function getComputerPlayerDefinition(
  computerPlayerId: ComputerPlayerId,
): ComputerPlayerDefinition | null {
  return COMPUTER_PLAYERS.find((player) => player.id === computerPlayerId) ?? null
}

export function getComputerPlayerDisplayName(
  computerPlayerId: ComputerPlayerId,
  slotNumber: number,
): string {
  const computerPlayer = getComputerPlayerDefinition(computerPlayerId)
  const computerPlayerName = computerPlayer?.name ?? 'Computer'

  return `${computerPlayerName} ${slotNumber}`
}
