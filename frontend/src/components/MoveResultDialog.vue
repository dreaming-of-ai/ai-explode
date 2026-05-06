<script setup lang="ts">
import type { MoveResultPopup } from '@/types/game'

defineProps<{
  result: MoveResultPopup
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()
</script>

<template>
  <section class="result-dialog">
    <ul class="result-list">
      <li
        v-for="message in result.messages"
        :key="message"
        class="result-item"
      >
        {{ message }}
      </li>
    </ul>

    <div class="result-actions">
      <button
        class="primary-button"
        type="button"
        @click="emit('close')"
      >
        {{ result.winnerPlayerId === null ? 'Continue' : 'View Final Board' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.result-dialog {
  display: grid;
  gap: 1rem;
}

.result-list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.result-item {
  padding: 0.95rem 1rem;
  border-radius: 0.55rem;
  border: 1px solid rgba(93, 232, 255, 0.18);
  background:
    linear-gradient(135deg, rgba(93, 232, 255, 0.06), rgba(255, 91, 215, 0.04)),
    rgba(4, 10, 24, 0.82);
  color: var(--text-main);
  line-height: 1.55;
}

.result-actions {
  display: flex;
  justify-content: end;
}

.primary-button {
  padding: 0.95rem 1.35rem;
  border: 1px solid rgba(255, 122, 47, 0.5);
  border-radius: 0.5rem;
  background:
    radial-gradient(circle at 22% 20%, rgba(255, 229, 138, 0.3), transparent 42%),
    linear-gradient(135deg, var(--neon-orange), var(--neon-magenta));
  color: #06101d;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 0 24px rgba(255, 122, 47, 0.16);
  transition:
    transform 160ms ease,
    opacity 160ms ease,
    background 160ms ease;
}

.primary-button:hover {
  transform: translateY(-1px);
}

@media (max-width: 720px) {
  .result-actions {
    justify-content: stretch;
  }

  .primary-button {
    width: 100%;
  }
}

@media (max-width: 720px), (max-height: 520px) {
  .result-dialog {
    gap: 0.8rem;
  }

  .result-list {
    gap: 0.6rem;
  }

  .result-item {
    padding: 0.8rem 0.88rem;
  }

  .primary-button {
    padding: 0.85rem 1.1rem;
  }
}
</style>
