<script setup lang="ts">
import type { LegalContentHeadingLevel, LegalPageDocument } from '@/data/legalPages'

defineProps<{
  document: LegalPageDocument
}>()

const emit = defineEmits<{
  (event: 'return-to-game'): void
}>()

function getHeadingTag(level: LegalContentHeadingLevel): 'h2' | 'h3' | 'h4' {
  switch (level) {
    case 2:
      return 'h2'
    case 3:
      return 'h3'
    default:
      return 'h4'
  }
}
</script>

<template>
  <section
    class="legal-page panel"
    :aria-labelledby="`${document.id}-title`"
  >
    <div class="legal-page__toolbar">
      <button
        class="legal-page__return"
        type="button"
        @click="emit('return-to-game')"
      >
        Return to Game
      </button>
    </div>

    <div class="legal-page__scroll">
      <article class="legal-page__article">
        <template
          v-for="(block, index) in document.blocks"
          :key="`${document.id}-${block.type}-${index}`"
        >
          <component
            :is="getHeadingTag(block.level)"
            v-if="block.type === 'heading'"
            :id="index === 0 ? `${document.id}-title` : undefined"
          >
            {{ block.text }}
          </component>

          <p
            v-else-if="block.type === 'paragraph'"
            v-html="block.html"
          />

          <ul v-else-if="block.type === 'list'">
            <li
              v-for="(item, itemIndex) in block.items"
              :key="`${document.id}-item-${index}-${itemIndex}`"
              v-html="item"
            />
          </ul>

          <hr
            v-else
            class="legal-page__divider"
          />
        </template>
      </article>
    </div>
  </section>
</template>

<style scoped>
.legal-page {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 1rem;
  padding: clamp(1rem, 1.8vw, 1.5rem);
}

.legal-page__toolbar {
  display: flex;
  justify-content: flex-start;
}

.legal-page__return {
  border: 1px solid rgba(109, 231, 255, 0.28);
  border-radius: 999px;
  padding: 0.72rem 1.15rem;
  background:
    linear-gradient(135deg, rgba(19, 32, 61, 0.96), rgba(7, 13, 30, 0.92)),
    rgba(7, 14, 31, 0.78);
  color: var(--text-main);
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.legal-page__return:hover {
  transform: translateY(-1px);
  border-color: rgba(109, 231, 255, 0.42);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
}

.legal-page__scroll {
  min-height: 0;
  overflow: auto;
  padding-right: 0.35rem;
}

.legal-page__article {
  max-width: 56rem;
  margin: 0 auto;
  display: grid;
  gap: 1rem;
}

.legal-page__article :deep(h2),
.legal-page__article :deep(h3),
.legal-page__article :deep(h4),
.legal-page__article :deep(p),
.legal-page__article :deep(ul) {
  margin: 0;
}

.legal-page__article :deep(h2) {
  font-size: clamp(1.7rem, 2.4vw, 2.2rem);
}

.legal-page__article :deep(h3) {
  margin-top: 0.35rem;
  font-size: 1.1rem;
}

.legal-page__article :deep(h4) {
  font-size: 0.98rem;
  color: var(--text-soft);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.legal-page__article :deep(p),
.legal-page__article :deep(ul) {
  color: rgba(244, 247, 255, 0.88);
  line-height: 1.72;
}

.legal-page__article :deep(ul) {
  padding-left: 1.25rem;
}

.legal-page__article :deep(li + li) {
  margin-top: 0.55rem;
}

.legal-page__divider {
  inline-size: 100%;
  margin: 0.1rem 0;
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
