import { computed, ref } from 'vue'

import { PLAYER_COLORS } from '@/data/playerColors'
import type {
  Cell,
  GameState,
  ModalState,
  MoveResultPopup,
  PlayerColor,
  PlayerConfig,
  RestartSummary,
  ScoreboardEntry,
  SetupPlayer,
  SetupValidation,
} from '@/types/game'

export const BOARD_SIZE = 8
export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 4

// Preserve the canonical neighbor order for later sweep-based explosion work.
const NEIGHBOR_OFFSETS_CLOCKWISE: ReadonlyArray<readonly [number, number]> = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
]

export interface PlayedMoveResult {
  state: GameState
  resultPopup: MoveResultPopup | null
}

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

export function createIdleGameState(): GameState {
  return {
    phase: 'idle',
    players: [],
    board: createEmptyBoard(),
    activePlayerIndex: 0,
    round: 1,
    erasedPlayerIds: [],
    winnerPlayerId: null,
    isConcluded: false,
  }
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

export function normalizeSetupPlayers(players: SetupPlayer[]): SetupPlayer[] {
  const assignedColors: string[] = []

  return players.map((player) => {
    const availableColorIds = PLAYER_COLORS.map((color) => color.id).filter(
      (colorId) => !assignedColors.includes(colorId),
    )
    const nextColorId = availableColorIds.includes(player.colorId)
      ? player.colorId
      : (availableColorIds[0] ?? PLAYER_COLORS[0]?.id ?? 'red')

    assignedColors.push(nextColorId)

    if (nextColorId === player.colorId) {
      return player
    }

    return {
      ...player,
      colorId: nextColorId,
    }
  })
}

export function createInitialSetupPlayers(): SetupPlayer[] {
  const firstColorId = PLAYER_COLORS[0]?.id ?? 'red'

  return normalizeSetupPlayers([
    createSetupPlayer(1, []),
    createSetupPlayer(2, [firstColorId]),
  ])
}

export function addSetupPlayer(players: SetupPlayer[]): SetupPlayer[] {
  if (players.length >= MAX_PLAYERS) {
    return players
  }

  const nextId = players.reduce((highestId, player) => Math.max(highestId, player.id), 0) + 1

  return normalizeSetupPlayers([
    ...players,
    createSetupPlayer(nextId, players.map((player) => player.colorId)),
  ])
}

export function removeSetupPlayer(players: SetupPlayer[], playerId: number): SetupPlayer[] {
  if (players.length <= MIN_PLAYERS) {
    return players
  }

  return normalizeSetupPlayers(players.filter((player) => player.id !== playerId))
}

export function getAvailableColors(players: SetupPlayer[], playerId: number): PlayerColor[] {
  const playerIndex = players.findIndex((player) => player.id === playerId)

  if (playerIndex === -1) {
    return PLAYER_COLORS
  }

  const reservedColorIds = players.slice(0, playerIndex).map((player) => player.colorId)

  return PLAYER_COLORS.filter((color) => !reservedColorIds.includes(color.id))
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
    erasedPlayerIds: [],
    winnerPlayerId: null,
    isConcluded: false,
  }
}

export function isCellPlayable(state: GameState, row: number, col: number): boolean {
  if (state.phase !== 'playing' || state.isConcluded) {
    return false
  }

  const cell = state.board[row]?.[col]

  if (!cell) {
    return false
  }

  const activePlayer = state.players[state.activePlayerIndex]

  return cell.owner === null || cell.owner === activePlayer?.id
}

function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((boardRow) => boardRow.map((cell) => ({ ...cell })))
}

function getAdjacentCells(board: Cell[][], row: number, col: number): Cell[] {
  return NEIGHBOR_OFFSETS_CLOCKWISE.flatMap(([rowOffset, colOffset]) => {
    const neighbor = board[row + rowOffset]?.[col + colOffset]

    return neighbor ? [neighbor] : []
  })
}

function getAllowedLoad(board: Cell[][], row: number, col: number): number {
  return getAdjacentCells(board, row, col).length
}

function resolveSingleExplosion(board: Cell[][], row: number, col: number, activePlayerId: number) {
  const origin = board[row]?.[col]

  if (!origin) {
    return
  }

  const adjacentCells = getAdjacentCells(board, row, col)

  if (origin.load <= adjacentCells.length) {
    return
  }

  adjacentCells.forEach((neighbor) => {
    neighbor.load += 1
    neighbor.owner = activePlayerId
  })

  origin.load -= adjacentCells.length
}

function resolveBoardAfterMove(state: GameState, row: number, col: number): Cell[][] {
  const board = cloneBoard(state.board)
  const activePlayer = state.players[state.activePlayerIndex]
  const cell = board[row][col]

  if (cell.owner === null) {
    cell.owner = activePlayer.id
    cell.load = 1
  } else {
    cell.load += 1
  }

  if (cell.load > getAllowedLoad(board, row, col)) {
    resolveSingleExplosion(board, row, col, activePlayer.id)
  }

  return board
}

function shouldEvaluatePostMoveOutcomes(state: GameState): boolean {
  if (state.phase !== 'playing') {
    return false
  }

  return state.round > 1 || state.activePlayerIndex === state.players.length - 1
}

function getNextActivePlayerIndex(state: GameState, erasedPlayerIds: number[]): number {
  const erasedPlayerIdSet = new Set(erasedPlayerIds)

  for (let offset = 1; offset <= state.players.length; offset += 1) {
    const candidateIndex = (state.activePlayerIndex + offset) % state.players.length
    const candidatePlayer = state.players[candidateIndex]

    if (candidatePlayer && !erasedPlayerIdSet.has(candidatePlayer.id)) {
      return candidateIndex
    }
  }

  return state.activePlayerIndex
}

function createMoveResultPopup(
  players: PlayerConfig[],
  newlyErasedPlayerIds: number[],
  winnerPlayerId: number | null,
): MoveResultPopup | null {
  const messages = [
    ...newlyErasedPlayerIds.flatMap((playerId) => {
      const player = players.find((entry) => entry.id === playerId)

      return player ? [`${player.name} has been erased from the board.`] : []
    }),
  ]

  if (winnerPlayerId !== null) {
    const winner = players.find((player) => player.id === winnerPlayerId)

    if (winner) {
      messages.push(`${winner.name} wins the match.`)
    }
  }

  if (messages.length === 0) {
    return null
  }

  const hasWinner = winnerPlayerId !== null

  return {
    eyebrow: hasWinner ? 'Match Result' : 'Move Result',
    title: hasWinner ? 'Match concluded' : 'Players erased',
    description: hasWinner
      ? 'The board is locked. Start a new game when you are ready for the next match.'
      : 'The resolved move removed players from future turn rotation.',
    messages,
    winnerPlayerId,
  }
}

function finalizeResolvedMove(state: GameState): PlayedMoveResult {
  let erasedPlayerIds = state.erasedPlayerIds
  let winnerPlayerId = state.winnerPlayerId
  let isConcluded = state.isConcluded
  let resultPopup: MoveResultPopup | null = null

  if (shouldEvaluatePostMoveOutcomes(state)) {
    const fieldCounts = countFieldsByPlayer(state.players, state.board)
    const existingErasedPlayerIds = new Set(state.erasedPlayerIds)
    const newlyErasedPlayerIds = state.players
      .filter((player) => !existingErasedPlayerIds.has(player.id) && (fieldCounts[player.id] ?? 0) === 0)
      .map((player) => player.id)

    const erasedPlayerIdSet = new Set([...state.erasedPlayerIds, ...newlyErasedPlayerIds])
    erasedPlayerIds = state.players
      .filter((player) => erasedPlayerIdSet.has(player.id))
      .map((player) => player.id)

    const remainingPlayers = state.players.filter((player) => !erasedPlayerIdSet.has(player.id))

    if (remainingPlayers.length === 1) {
      winnerPlayerId = remainingPlayers[0].id
      isConcluded = true
    }

    resultPopup = createMoveResultPopup(state.players, newlyErasedPlayerIds, winnerPlayerId)
  }

  if (isConcluded) {
    return {
      state: {
        ...state,
        erasedPlayerIds,
        winnerPlayerId,
        isConcluded,
      },
      resultPopup,
    }
  }

  const nextActivePlayerIndex = getNextActivePlayerIndex(state, erasedPlayerIds)
  const round = state.round + (nextActivePlayerIndex <= state.activePlayerIndex ? 1 : 0)

  return {
    state: {
      ...state,
      activePlayerIndex: nextActivePlayerIndex,
      round,
      erasedPlayerIds,
      winnerPlayerId,
      isConcluded,
    },
    resultPopup,
  }
}

export function playMoveWithOutcome(state: GameState, row: number, col: number): PlayedMoveResult {
  if (!isCellPlayable(state, row, col)) {
    return {
      state,
      resultPopup: null,
    }
  }

  const board = resolveBoardAfterMove(state, row, col)

  return finalizeResolvedMove({
    ...state,
    board,
  })
}

export function playMove(state: GameState, row: number, col: number): GameState {
  return playMoveWithOutcome(state, row, col).state
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
  const erasedPlayerIds = new Set(state.erasedPlayerIds)

  return state.players.map((player, index) => ({
    player,
    fields: fieldCounts[player.id] ?? 0,
    isActive: !state.isConcluded && state.activePlayerIndex === index && !erasedPlayerIds.has(player.id),
    isErased: erasedPlayerIds.has(player.id),
    isWinner: state.winnerPlayerId === player.id,
  }))
}

export function createRestartSummary(state: GameState): RestartSummary | null {
  if (state.phase !== 'playing') {
    return null
  }

  const activePlayer = !state.isConcluded ? state.players[state.activePlayerIndex] : null
  const winner = state.players.find((player) => player.id === state.winnerPlayerId) ?? null

  return {
    contextLabel: winner
      ? `Winner · ${winner.name}`
      : activePlayer
        ? `Round ${state.round} · ${activePlayer.name} to play`
        : `Round ${state.round}`,
    entries: createScoreboardEntries(state),
  }
}

export function useGameShell() {
  const setupPlayers = ref<SetupPlayer[]>(createInitialSetupPlayers())
  const gameState = ref<GameState>(createIdleGameState())
  const modalState = ref<ModalState>('closed')
  const moveResultPopup = ref<MoveResultPopup | null>(null)

  const setupValidation = computed(() => validateSetupPlayers(setupPlayers.value))
  const canAddPlayer = computed(() => setupPlayers.value.length < MAX_PLAYERS)
  const canRemovePlayer = computed(() => setupPlayers.value.length > MIN_PLAYERS)
  const hasActiveGame = computed(() => gameState.value.phase === 'playing')
  const scoreboardEntries = computed(() =>
    gameState.value.phase === 'playing' ? createScoreboardEntries(gameState.value) : [],
  )
  const activePlayer = computed(() =>
    gameState.value.phase === 'playing' && !gameState.value.isConcluded
      ? gameState.value.players[gameState.value.activePlayerIndex] ?? null
      : null,
  )
  const winnerPlayer = computed(() =>
    gameState.value.phase === 'playing'
      ? gameState.value.players.find((player) => player.id === gameState.value.winnerPlayerId) ?? null
      : null,
  )
  const restartSummary = computed(() => createRestartSummary(gameState.value))
  const isSetupModalOpen = computed(() => modalState.value === 'setup')
  const isRestartWarningOpen = computed(() => modalState.value === 'restart-warning')
  const isMoveResultOpen = computed(
    () => modalState.value === 'move-result' && moveResultPopup.value !== null,
  )

  function updatePlayerName(playerId: number, name: string) {
    setupPlayers.value = setupPlayers.value.map((player) =>
      player.id === playerId ? { ...player, name } : player,
    )
  }

  function updatePlayerColor(playerId: number, colorId: string) {
    setupPlayers.value = normalizeSetupPlayers(
      setupPlayers.value.map((player) =>
        player.id === playerId ? { ...player, colorId } : player,
      ),
    )
  }

  function addPlayer() {
    setupPlayers.value = addSetupPlayer(setupPlayers.value)
  }

  function removePlayer(playerId: number) {
    setupPlayers.value = removeSetupPlayer(setupPlayers.value, playerId)
  }

  function openNewGame() {
    modalState.value = hasActiveGame.value ? 'restart-warning' : 'setup'
  }

  function closeSetupModal() {
    if (modalState.value === 'setup') {
      modalState.value = 'closed'
    }
  }

  function continueCurrentGame() {
    if (modalState.value === 'restart-warning') {
      modalState.value = 'closed'
    }
  }

  function proceedToSetupFromWarning() {
    modalState.value = 'setup'
  }

  function dismissMoveResult() {
    if (modalState.value === 'move-result') {
      moveResultPopup.value = null
      modalState.value = 'closed'
    }
  }

  function startGame() {
    if (!setupValidation.value.isValid) {
      return
    }

    gameState.value = startGameSession(setupPlayers.value)
    moveResultPopup.value = null
    modalState.value = 'closed'
  }

  function playCell(row: number, col: number) {
    if (gameState.value.phase !== 'playing' || modalState.value !== 'closed') {
      return
    }

    const moveResult = playMoveWithOutcome(gameState.value, row, col)
    gameState.value = moveResult.state

    if (moveResult.resultPopup) {
      moveResultPopup.value = moveResult.resultPopup
      modalState.value = 'move-result'
      return
    }

    moveResultPopup.value = null
  }

  return {
    setupPlayers,
    gameState,
    modalState,
    moveResultPopup,
    setupValidation,
    canAddPlayer,
    canRemovePlayer,
    hasActiveGame,
    scoreboardEntries,
    activePlayer,
    winnerPlayer,
    restartSummary,
    isSetupModalOpen,
    isRestartWarningOpen,
    isMoveResultOpen,
    updatePlayerName,
    updatePlayerColor,
    addPlayer,
    removePlayer,
    openNewGame,
    closeSetupModal,
    continueCurrentGame,
    proceedToSetupFromWarning,
    dismissMoveResult,
    startGame,
    playCell,
    getAvailableColors: (playerId: number) => getAvailableColors(setupPlayers.value, playerId),
    isCellPlayable: (row: number, col: number) =>
      modalState.value === 'closed' && isCellPlayable(gameState.value, row, col),
  }
}
