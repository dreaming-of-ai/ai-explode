import type { ExplosionDelayOption, ExplosionDelayPreset } from '@/types/game'

export const EXPLOSION_DELAY_NONE_MS = 0
export const EXPLOSION_DELAY_LOW_MS = 50
export const EXPLOSION_DELAY_MEDIUM_MS = 100
export const EXPLOSION_DELAY_HIGH_MS = 250

export const DEFAULT_EXPLOSION_DELAY_PRESET: ExplosionDelayPreset = 'low'

export const EXPLOSION_DELAY_MS_BY_PRESET: Record<ExplosionDelayPreset, number> = {
  none: EXPLOSION_DELAY_NONE_MS,
  low: EXPLOSION_DELAY_LOW_MS,
  medium: EXPLOSION_DELAY_MEDIUM_MS,
  high: EXPLOSION_DELAY_HIGH_MS,
}

export const EXPLOSION_DELAY_OPTIONS: ReadonlyArray<ExplosionDelayOption> = [
  {
    id: 'none',
    label: 'None',
    delayMs: EXPLOSION_DELAY_NONE_MS,
  },
  {
    id: 'low',
    label: 'Low',
    delayMs: EXPLOSION_DELAY_LOW_MS,
  },
  {
    id: 'medium',
    label: 'Medium',
    delayMs: EXPLOSION_DELAY_MEDIUM_MS,
  },
  {
    id: 'high',
    label: 'High',
    delayMs: EXPLOSION_DELAY_HIGH_MS,
  },
]

export function getExplosionDelayMs(preset: ExplosionDelayPreset): number {
  return EXPLOSION_DELAY_MS_BY_PRESET[preset]
}
