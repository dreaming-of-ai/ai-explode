import imprintSource from '../../../papers/legal/imprint.md?raw'
import privacyPolicySource from '../../../papers/legal/privacy-policy.md?raw'

import type { LegalPageId } from '@/types/game'

export type LegalContentHeadingLevel = 2 | 3 | 4

export type LegalContentBlock =
  | {
      type: 'heading'
      level: LegalContentHeadingLevel
      text: string
    }
  | {
      type: 'paragraph'
      html: string
    }
  | {
      type: 'list'
      items: string[]
    }
  | {
      type: 'divider'
    }

export interface LegalPageLink {
  id: LegalPageId
  label: string
}

export interface LegalPageDocument {
  id: LegalPageId
  label: string
  blocks: LegalContentBlock[]
}

interface LegalSourceConfig {
  id: LegalPageId
  label: string
  startHeading: string
  source: string
}

const LEGAL_SOURCE_CONFIGS: readonly LegalSourceConfig[] = [
  {
    id: 'imprint',
    label: 'Impressum',
    startHeading: '## Impressum',
    source: imprintSource,
  },
  {
    id: 'privacy-policy',
    label: 'Datenschutz',
    startHeading: '## Datenschutzerklärung',
    source: privacyPolicySource,
  },
]

export const LEGAL_PAGE_LINKS: readonly LegalPageLink[] = LEGAL_SOURCE_CONFIGS.map(
  ({ id, label }) => ({
    id,
    label,
  }),
)

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderInlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
}

function normalizeLegalSource(source: string, startHeading: string): string {
  const normalized = source.replace(/\r\n/g, '\n').replace(/<!--[\s\S]*?-->/g, '')
  const startIndex = normalized.indexOf(startHeading)
  const relevantSource = startIndex >= 0 ? normalized.slice(startIndex) : normalized

  return relevantSource.replace(/\n{3,}/g, '\n\n').trim()
}

function parseLegalBlocks(source: string): LegalContentBlock[] {
  const blocks: LegalContentBlock[] = []
  const paragraphLines: string[] = []
  const listItems: string[] = []

  function flushParagraph() {
    if (paragraphLines.length === 0) {
      return
    }

    blocks.push({
      type: 'paragraph',
      html: renderInlineMarkdown(paragraphLines.join(' ')),
    })
    paragraphLines.length = 0
  }

  function flushList() {
    if (listItems.length === 0) {
      return
    }

    blocks.push({
      type: 'list',
      items: listItems.map((item) => renderInlineMarkdown(item)),
    })
    listItems.length = 0
  }

  source
    .split('\n')
    .forEach((rawLine) => {
      const line = rawLine.trim()

      if (line.length === 0) {
        flushParagraph()
        flushList()
        return
      }

      const headingMatch = /^(#{2,4})\s+(.+)$/.exec(line)

      if (headingMatch) {
        flushParagraph()
        flushList()
        blocks.push({
          type: 'heading',
          level: headingMatch[1].length as LegalContentHeadingLevel,
          text: headingMatch[2].trim(),
        })
        return
      }

      if (/^---+$/.test(line)) {
        flushParagraph()
        flushList()
        blocks.push({ type: 'divider' })
        return
      }

      const listMatch = /^-\s+(.+)$/.exec(line)

      if (listMatch) {
        flushParagraph()
        listItems.push(listMatch[1].trim())
        return
      }

      flushList()
      paragraphLines.push(line)
    })

  flushParagraph()
  flushList()

  return blocks
}

function createLegalPageDocument(config: LegalSourceConfig): LegalPageDocument {
  return {
    id: config.id,
    label: config.label,
    blocks: parseLegalBlocks(normalizeLegalSource(config.source, config.startHeading)),
  }
}

const legalPageDocuments = Object.fromEntries(
  LEGAL_SOURCE_CONFIGS.map((config) => [config.id, createLegalPageDocument(config)]),
) as Record<LegalPageId, LegalPageDocument>

export function getLegalPageDocument(pageId: LegalPageId): LegalPageDocument {
  return legalPageDocuments[pageId]
}
