export interface PlayerColor {
  id: string
  name: string
  primary: string
  light: string
  dark: string
}

export type GamePhase = 'idle' | 'playing'

export type LegalPageId = 'imprint' | 'privacy-policy'

export type HeaderPopupId = 'gaming-rules' | 'information' | 'settings' | 'game-info'

export type ModalState =
  | 'closed'
  | 'setup'
  | 'restart-warning'
  | 'move-result'
  | 'header-popup'

export type PlayerController = 'human' | 'computer'

export type ComputerPlayerId = 'random'

export type ExplosionDelayPreset = 'none' | 'low' | 'medium' | 'high'

export interface ComputerPlayerDefinition {
  id: ComputerPlayerId
  name: string
  description: string
}

export interface SetupPlayer {
  id: number
  name: string
  colorId: string
  controller: PlayerController
  computerPlayerId: ComputerPlayerId
}

export interface PlayerConfig {
  id: number
  name: string
  color: PlayerColor
  initials: string
  controller: PlayerController
  computerPlayerId: ComputerPlayerId | null
}

export interface Cell {
  row: number
  col: number
  owner: number | null
  load: number
}

export interface LastMoveIndicator {
  row: number
  col: number
  playerId: number
}

export interface GameState {
  phase: GamePhase
  players: PlayerConfig[]
  board: Cell[][]
  activePlayerIndex: number
  round: number
  erasedPlayerIds: number[]
  winnerPlayerId: number | null
  isConcluded: boolean
}

export interface SetupValidation {
  isValid: boolean
  errors: string[]
}

export interface ScoreboardEntry {
  player: PlayerConfig
  fields: number
  isActive: boolean
  isErased: boolean
  isWinner: boolean
}

export type RestartSummaryEntry = ScoreboardEntry

export interface RestartSummary {
  contextLabel: string
  entries: RestartSummaryEntry[]
}

export interface MoveResultPopup {
  eyebrow: string
  title: string
  description: string
  messages: string[]
  winnerPlayerId: number | null
}

export interface ExplosionDelayOption {
  id: ExplosionDelayPreset
  label: string
  delayMs: number
}
