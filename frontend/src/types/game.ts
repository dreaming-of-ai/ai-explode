export interface PlayerColor {
  id: string
  name: string
  primary: string
  light: string
  dark: string
}

export interface SetupPlayer {
  id: number
  name: string
  colorId: string
}

export interface PlayerConfig {
  id: number
  name: string
  color: PlayerColor
  initials: string
}

export interface Cell {
  row: number
  col: number
  owner: number | null
  load: number
}

export interface GameState {
  phase: 'setup' | 'playing'
  players: PlayerConfig[]
  board: Cell[][]
  activePlayerIndex: number
  round: number
}

export interface SetupValidation {
  isValid: boolean
  errors: string[]
}

export interface ScoreboardEntry {
  player: PlayerConfig
  fields: number
  isActive: boolean
}
