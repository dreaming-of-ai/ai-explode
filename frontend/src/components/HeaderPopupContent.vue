<script setup lang="ts">
import { computed } from 'vue'

import { GAMING_RULES_SECTIONS } from '@/data/headerPopups'
import type { HeaderPopupId } from '@/types/game'

const props = defineProps<{
  popupId: HeaderPopupId
}>()

const isRulesPopup = computed(() => props.popupId === 'gaming-rules')
</script>

<template>
  <section
    v-if="isRulesPopup"
    class="rules-content"
  >
    <section
      v-for="section in GAMING_RULES_SECTIONS"
      :key="section.title"
      class="rules-section"
    >
      <h3>{{ section.title }}</h3>

      <ul>
        <li
          v-for="bullet in section.bullets"
          :key="bullet"
        >
          {{ bullet }}
        </li>
      </ul>
    </section>
  </section>

  <div
    v-else
    class="placeholder-spacer"
    aria-hidden="true"
  />
</template>

<style scoped>
.rules-content {
  min-height: 0;
  display: grid;
  gap: 0.95rem;
  overflow: auto;
  padding-right: 0.3rem;
}

.rules-section {
  display: grid;
  gap: 0.55rem;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  background: rgba(7, 12, 28, 0.78);
}

h3,
ul {
  margin: 0;
}

h3 {
  font-size: 1rem;
  color: var(--text-main);
}

ul {
  display: grid;
  gap: 0.45rem;
  padding-left: 1.1rem;
  color: var(--text-soft);
  line-height: 1.55;
}

.placeholder-spacer {
  min-height: clamp(3rem, 10vh, 5rem);
}

@media (max-width: 720px) {
  .rules-section {
    padding: 0.9rem;
  }
}
</style>
