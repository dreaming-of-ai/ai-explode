import type { HeaderPopupId } from '@/types/game'

export interface HeaderPopupDefinition {
  id: HeaderPopupId
  label: string
  title: string
}

export interface RulesSummarySection {
  title: string
  bullets: string[]
}

export const HEADER_POPUP_ORDER: HeaderPopupId[] = [
  'gaming-rules',
  'information',
  'settings',
]

export const HEADER_POPUP_DEFINITIONS: Record<HeaderPopupId, HeaderPopupDefinition> = {
  'gaming-rules': {
    id: 'gaming-rules',
    label: 'Gaming Rules',
    title: 'Gaming Rules',
  },
  information: {
    id: 'information',
    label: 'Information',
    title: 'Information',
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    title: 'Settings',
  },
}

export const HEADER_POPUP_ENTRIES = HEADER_POPUP_ORDER.map((popupId) => HEADER_POPUP_DEFINITIONS[popupId])

export const GAMING_RULES_SECTIONS: ReadonlyArray<RulesSummarySection> = [
  {
    title: 'Board and turn order',
    bullets: [
      'AI Explode is played by 2 to 4 players on an 8×8 board by default.',
      'Players take turns in a fixed order throughout the match.',
    ],
  },
  {
    title: 'What you can do',
    bullets: [
      'On your turn, occupy one empty field or reinforce one field you already own.',
      'You may never place load on a field owned by an opponent.',
    ],
  },
  {
    title: 'Liberties and explosions',
    bullets: [
      'Every field has a liberty count based on its adjacent neighbors, including diagonals: corners have 3, edges have 5, and interior cells have 8.',
      'A field explodes only when its load becomes strictly greater than its liberty count.',
      'Explosions add 1 load to every adjacent field, leave the remainder on the exploding field, and transfer all affected neighbors to the active player.',
    ],
  },
  {
    title: 'Chain reactions',
    bullets: [
      'Explosions resolve in full-board sweeps from the top-left corner to the bottom-right corner.',
      'Each field is checked once per sweep, and new sweeps continue until an entire pass produces no explosions.',
    ],
  },
  {
    title: 'Elimination and victory',
    bullets: [
      'From round 2 onward, any player with no remaining fields is eliminated from future turns.',
      'From round 2 onward, a player wins immediately when every occupied field belongs to them.',
    ],
  },
]
