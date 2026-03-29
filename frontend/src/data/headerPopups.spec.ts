import { describe, expect, it } from 'vitest'

import { HEADER_POPUP_ENTRIES, INFORMATION_POPUP_CONTENT } from '@/data/headerPopups'

describe('header popups data', () => {
  it('keeps the required header action order and titles', () => {
    expect(
      HEADER_POPUP_ENTRIES.map((entry) => ({
        id: entry.id,
        label: entry.label,
        title: entry.title,
      })),
    ).toEqual([
      {
        id: 'gaming-rules',
        label: 'Gaming Rules',
        title: 'Gaming Rules',
      },
      {
        id: 'information',
        label: 'Information',
        title: 'Information',
      },
      {
        id: 'settings',
        label: 'Settings',
        title: 'Settings',
      },
    ])
  })

  it('links the information popup to the project README', () => {
    expect(INFORMATION_POPUP_CONTENT.linkHref).toBe(
      'https://github.com/dreaming-of-ai/ai-explode/blob/main/README.md',
    )
  })
})
