import { describe, expect, it } from 'vitest'

import { getLegalPageDocument, LEGAL_PAGE_LINKS } from '@/data/legalPages'

function flattenDocumentText(documentBlocks: ReturnType<typeof getLegalPageDocument>['blocks']): string {
  return documentBlocks
    .flatMap((block) => {
      switch (block.type) {
        case 'heading':
          return block.text
        case 'paragraph':
          return block.html
        case 'list':
          return block.items
        default:
          return []
      }
    })
    .join(' ')
}

describe('legal page data', () => {
  it('exposes the required footer links in German order', () => {
    expect(LEGAL_PAGE_LINKS).toEqual([
      { id: 'imprint', label: 'Impressum' },
      { id: 'privacy-policy', label: 'Datenschutz' },
    ])
  })

  it('renders the imprint from the German source section without authoring comments', () => {
    const document = getLegalPageDocument('imprint')
    const flattenedText = flattenDocumentText(document.blocks)

    expect(document.blocks[0]).toEqual({
      type: 'heading',
      level: 2,
      text: 'Impressum',
    })
    expect(flattenedText).toContain('Angaben gemäß § 5 DDG')
    expect(flattenedText).toContain('{{VORNAME NACHNAME}}')
    expect(flattenedText).not.toContain('Language Notice')
    expect(flattenedText).not.toContain('Legal Notice / Impressum')
    expect(flattenedText).not.toContain('TODO:')
    expect(flattenedText).not.toContain('<!--')
  })

  it('renders the privacy policy from the German source section without the English preface', () => {
    const document = getLegalPageDocument('privacy-policy')
    const flattenedText = flattenDocumentText(document.blocks)

    expect(document.blocks[0]).toEqual({
      type: 'heading',
      level: 2,
      text: 'Datenschutzerklärung',
    })
    expect(flattenedText).toContain('Verantwortlicher im Sinne der Datenschutz-Grundverordnung')
    expect(flattenedText).toContain('{{ANALYTICS-TOOL}}')
    expect(flattenedText).not.toContain('Privacy Policy / Datenschutzerklärung')
    expect(flattenedText).not.toContain('Language Notice')
    expect(flattenedText).not.toContain('<!--')
  })
})
