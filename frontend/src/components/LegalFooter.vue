<script setup lang="ts">
import type { LegalPageLink } from '@/data/legalPages'
import type { LegalPageId } from '@/types/game'

defineProps<{
  entries: readonly LegalPageLink[]
}>()

const emit = defineEmits<{
  (event: 'open', pageId: LegalPageId): void
}>()
</script>

<template>
  <footer class="legal-footer">
    <nav
      class="legal-footer__nav"
      aria-label="Legal navigation"
    >
      <template
        v-for="(entry, index) in entries"
        :key="entry.id"
      >
        <span
          v-if="index > 0"
          class="legal-footer__separator"
          aria-hidden="true"
        >
          ·
        </span>

        <button
          class="legal-footer__link"
          type="button"
          @click="emit('open', entry.id)"
        >
          {{ entry.label }}
        </button>
      </template>
    </nav>
  </footer>
</template>

<style scoped>
.legal-footer {
  display: flex;
  justify-content: center;
  padding: 0.15rem 0 max(0.15rem, var(--safe-bottom));
}

.legal-footer__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: rgba(184, 215, 255, 0.62);
  text-shadow: 0 0 12px rgba(93, 232, 255, 0.08);
}

.legal-footer__separator {
  user-select: none;
}

.legal-footer__link {
  border: 0;
  padding: 0.18rem 0.1rem;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: color 160ms ease;
}

.legal-footer__link:hover {
  color: rgba(255, 229, 138, 0.9);
}

@media (max-width: 720px), (max-height: 520px) {
  .legal-footer {
    padding-top: 0;
  }

  .legal-footer__nav {
    gap: 0.28rem 0.45rem;
    font-size: 0.72rem;
  }
}
</style>
