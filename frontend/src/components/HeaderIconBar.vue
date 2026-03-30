<script setup lang="ts">
import type { HeaderPopupDefinition } from '@/data/headerPopups'
import type { HeaderPopupId } from '@/types/game'

defineProps<{
  entries: ReadonlyArray<HeaderPopupDefinition>
  activePopup: HeaderPopupId | null
}>()

const emit = defineEmits<{
  (event: 'open', popupId: HeaderPopupId): void
}>()

const ICON_PATHS: Record<HeaderPopupId, readonly string[]> = {
  'gaming-rules': [
    'M6.5 3A2.5 2.5 0 0 0 4 5.5v12A2.5 2.5 0 0 1 6.5 15H20V3H6.5Zm0 2H18v8H7.5A4.48 4.48 0 0 0 6 13.26V5.5a.5.5 0 0 1 .5-.5Z',
    'M6.5 17A2.5 2.5 0 0 0 4 19.5V21h16v-2H6.5Z',
  ],
  information: [
    'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
    'M11 10h2v7h-2v-7Zm0-3h2v2h-2V7Z',
  ],
  settings: [
    'm12 2 1.56 2.74 3.11.71-.7 3.12 2.32 2.2-2.2 2.32.7 3.12-3.11.7L12 22l-1.56-2.74-3.11-.71.7-3.12L5.71 13l2.32-2.2-.7-3.12 3.11-.7L12 2Zm0 4.2-1.02 1.78-.33.58-.66.15-2.03.46.46 2.03.15.66-.49.47-1.52 1.45 1.52 1.45.49.47-.15.66-.46 2.03 2.03.46.66.15.33.58L12 18.8l1.02-1.78.33-.58.66-.15 2.03-.46-.46-2.03-.15-.66.49-.47 1.52-1.45-1.52-1.45-.49-.47.15-.66.46-2.03-2.03-.46-.66-.15-.33-.58L12 6.2Z',
    'M12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2Zm0-2a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z',
  ],
  'game-info': [
    'M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-13ZM6.5 5a.5.5 0 0 0-.5.5V10h12V5.5a.5.5 0 0 0-.5-.5h-11Z',
    'M7.5 13h3v2h-3v-2Zm0 3.5h5v2h-5v-2Zm7-3.5h2.5v5.5H14.5V13Z',
  ],
}
</script>

<template>
  <nav
    class="header-icon-bar"
    aria-label="Header quick actions"
  >
    <button
      v-for="entry in entries"
      :key="entry.id"
      class="header-icon-button"
      :class="{ 'is-active': activePopup === entry.id }"
      type="button"
      :aria-label="entry.label"
      :aria-expanded="activePopup === entry.id ? 'true' : 'false'"
      aria-haspopup="dialog"
      @click="emit('open', entry.id)"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          v-for="path in ICON_PATHS[entry.id]"
          :key="path"
          :d="path"
          fill="currentColor"
        />
      </svg>

      <span
        class="header-icon-tooltip"
        aria-hidden="true"
      >
        {{ entry.label }}
      </span>
    </button>
  </nav>
</template>

<style scoped>
.header-icon-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.header-icon-button {
  position: relative;
  inline-size: 2.65rem;
  block-size: 2.65rem;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  color: var(--text-soft);
  cursor: pointer;
  transition:
    transform 160ms ease,
    color 160ms ease,
    border-color 160ms ease,
    background 160ms ease,
    box-shadow 160ms ease;
}

.header-icon-button:hover,
.header-icon-button:focus-visible {
  transform: translateY(-1px);
  color: var(--text-main);
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
}

.header-icon-button:hover .header-icon-tooltip,
.header-icon-button:focus-visible .header-icon-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.header-icon-button.is-active {
  color: var(--accent);
  border-color: rgba(109, 231, 255, 0.3);
  background: rgba(109, 231, 255, 0.08);
}

.header-icon-tooltip {
  position: absolute;
  top: calc(100% + 0.45rem);
  left: 50%;
  z-index: 1;
  padding: 0.35rem 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: rgba(6, 11, 26, 0.96);
  color: var(--text-main);
  font-size: 0.78rem;
  line-height: 1.2;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
  transition:
    opacity 140ms ease,
    transform 140ms ease;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.24);
}

svg {
  inline-size: 1.25rem;
  block-size: 1.25rem;
}

@media (max-width: 720px) {
  .header-icon-bar {
    gap: 0.4rem;
  }

  .header-icon-button {
    inline-size: 2.45rem;
    block-size: 2.45rem;
  }

  svg {
    inline-size: 1.15rem;
    block-size: 1.15rem;
  }
}

@media (max-height: 520px) {
  .header-icon-bar {
    gap: 0.35rem;
  }

  .header-icon-button {
    inline-size: 2.25rem;
    block-size: 2.25rem;
  }

  svg {
    inline-size: 1.05rem;
    block-size: 1.05rem;
  }
}
</style>
