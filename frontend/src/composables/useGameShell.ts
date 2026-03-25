import { computed, ref } from 'vue'

import { PLAYER_COLORS } from '@/data/playerColors'
import type {
  Cell,
  GameState,
  PlayerColor,
  PlayerConfig,
  ScoreboardEntry,
  SetupPlayer,
  SetupValidation,
} from '@/types/game'

export const BOARD_SIZE = 10
export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 4

export function normalizePlayerName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

export function createEmptyBoard(): Cell[][] {
  return Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from({ length: BOARD_SIZE }, (_, col) => ({
      row,
      col,
      owner: null,
      load: 0,
    })),
  )
}

function getColorById(colorId: string): PlayerColor {
  return PLAYER_COLORS.find((color) => color.id === colorId) ?? PLAYER_COLORS[0]
}

function getNextAvailableColor(usedColorIds: string[]): PlayerColor {
  return (
    PLAYER_COLORS.find((color) => !usedColorIds.includes(color.id)) ?? PLAYER_COLORS[0]
  )
}

function getPlayerInitials(name: string): string {
  const parts = normalizePlayerName(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) {
    return '?'
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
}

export function createSetupPlayer(playerId: number, usedColorIds: string[] = []): SetupPlayer {
  return {
    id: playerId,
    name: '',
    colorId: getNextAvailableColor(usedColorIds).id,
  }
}

export function createInitialSetupPlayers(): SetupPlayer[] {
  const firstColorId = PLAYER_COLORS[0]?.id ?? 'red'

  return [createSetupPlayer(1, []), createSetupPlayer(2, [firstColorId])]
}

export function addSetupPlayer(players: SetupPlayer[]): SetupPlayer[] {
  if (players.length >= MAX_PLAYERS) {
    return players
  }

  const nextId = players.reduce((highestId, player) => Math.max(highestId, player.id), 0) + 1

  return [...players, createSetupPlayer(nextId, players.map((player) => player.colorId))]
}

export function removeSetupPlayer(players: SetupPlayer[], playerId: number): SetupPlayer[] {
  if (players.length <= MIN_PLAYERS) {
    return players
  }

  return players.filter((player) => player.id !== playerId)
}

export function getAvailableColors(players: SetupPlayer[], playerId: number): PlayerColor[] {
  const activePlayer = players.find((player) => player.id === playerId)

  return PLAYER_COLORS.filter((color) => {
    if (color.id === activePlayer?.colorId) {
      return true
    }

    return !players.some((player) => player.id !== playerId && player.colorId === color.id)
  })
}

export function validateSetupPlayers(players: SetupPlayer[]): SetupValidation {
  const errors: string[] = []
  const normalizedNames = players.map((player) => normalizePlayerName(player.name))
  const uniqueColorCount = new Set(players.map((player) => player.colorId)).size

  if (players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) {
    errors.push(`Choose between ${MIN_PLAYERS} and ${MAX_PLAYERS} players.`)
  }

  if (normalizedNames.some((name) => name.length === 0)) {
    errors.push('Every player needs a name.')
  }

  if (uniqueColorCount !== players.length) {
    errors.push('Each player must have a unique color.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function startGameSession(players: SetupPlayer[]): GameState {
  const roster: PlayerConfig[] = players.map((player) => {
    const name = normalizePlayerName(player.name)

    return {
      id: player.id,
      name,
      color: getColorById(player.colorId),
      initials: getPlayerInitials(name),
    }
  })

  return {
    phase: 'playing',
    players: roster,
    board: createEmptyBoard(),
    activePlayerIndex: 0,
    round: 1,
  }
}

export function isCellPlayable(state: GameState, row: number, col: number): boolean {
  if (state.phase !== 'playing') {
    return false
  }

  const cell = state.board[row]?.[col]

  if (!cell) {
    return false
  }

  const activePlayer = state.players[state.activePlayerIndex]

  return cell.owner === null || cell.owner === activePlayer.id
}

export function playMove(state: GameState, row: number, col: number): GameState {
  if (!isCellPlayable(state, row, col)) {
    return state
  }

  const board = state.board.map((boardRow) => boardRow.map((cell) => ({ ...cell })))
  const activePlayer = state.players[state.activePlayerIndex]
  const cell = board[row][col]

  if (cell.owner === null) {
    cell.owner = activePlayer.id
    cell.load = 1
  } else {
    cell.load += 1
  }

  const activePlayerIndex = (state.activePlayerIndex + 1) % state.players.length
  const round = state.round + (activePlayerIndex === 0 ? 1 : 0)

  return {
    ...state,
    board,
    activePlayerIndex,
    round,
  }
}

export function countFieldsByPlayer(players: PlayerConfig[], board: Cell[][]): Record<number, number> {
  const counts = Object.fromEntries(players.map((player) => [player.id, 0])) as Record<number, number>

  board.flat().forEach((cell) => {
    if (cell.owner !== null) {
      counts[cell.owner] = (counts[cell.owner] ?? 0) + 1
    }
  })

  return counts
}

export function createScoreboardEntries(state: GameState): ScoreboardEntry[] {
  const fieldCounts = countFieldsByPlayer(state.players, state.board)

  return state.players.map((player, index) => ({
    player,
    fields: fieldCounts[player.id] ?? 0,
    isActive: state.activePlayerIndex === index,
  }))
}

export function useGameShell() {
  const setupPlayers = ref<SetupPlayer[]>(createInitialSetupPlayers())
  const gameState = ref<GameState>({
    phase: 'setup',
    players: [],
    board: createEmptyBoard(),
    activePlayerIndex: 0,
    round: 1,
  })

  const setupValidation = computed(() => validateSetupPlayers(setupPlayers.value))
  const canAddPlayer = computed(() => setupPlayers.value.length < MAX_PLAYERS)
  const canRemovePlayer = computed(() => setupPlayers.value.length > MIN_PLAYERS)
  const scoreboardEntries = computed(() =>
    gameState.value.phase === 'playing' ? createScoreboardEntries(gameState.value) : [],
  )
  const activePlayer = computed(() =>
    gameState.value.phase === 'playing'
      ? gameState.value.players[gameState.value.activePlayerIndex] ?? null
      : null,
  )

  function updatePlayerName(playerId: number, name: string) {
    setupPlayers.value = setupPlayers.value.map((player) =>
      player.id === playerId ? { ...player, name } : player,
    )
  }

  function updatePlayerColor(playerId: number, colorId: string) {
    setupPlayers.value = setupPlayers.value.map((player) =>
      player.id === playerId ? { ...player, colorId } : player,
    )
  }

  function addPlayer() {
    setupPlayers.value = addSetupPlayer(setupPlayers.value)
  }

  function removePlayer(playerId: number) {
    setupPlayers.value = removeSetupPlayer(setupPlayers.value, playerId)
  }

  function startGame() {
    if (!setupValidation.value.isValid) {
      return
    }

    gameState.value = startGameSession(setupPlayers.value)
  }

  function playCell(row: number, col: number) {
    if (gameState.value.phase !== 'playing') {
      return
    }

    gameState.value = playMove(gameState.value, row, col)
  }

  return {
    setupPlayers,
    gameState,
    setupValidation,
    canAddPlayer,
    canRemovePlayer,
    scoreboardEntries,
    activePlayer,
    updatePlayerName,
    updatePlayerColor,
    addPlayer,
    removePlayer,
    startGame,
    playCell,
    getAvailableColors: (playerId: number) => getAvailableColors(setupPlayers.value, playerId),
    isCellPlayable: (row: number, col: number) => isCellPlayable(gameState.value, row, col),
  }
}
