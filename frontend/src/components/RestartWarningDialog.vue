<script setup lang="ts">
import type { RestartSummary } from '@/types/game'

defineProps<{
  summary: RestartSummary | null
}>()

const emit = defineEmits<{
  (event: 'continue-game'): void
  (event: 'start-over'): void
}>()
</script>

<template>
  <section class="warning-dialog">
    <p class="warning-copy">
      Starting over will not replace the current match until you confirm a fresh setup. Use the snapshot below to decide whether to keep playing or continue into the new-game modal.
    </p>

    <section class="summary-card">
      <div class="summary-header">
        <div>
          <p class="eyebrow">Current Match</p>
          <h3>{{ summary?.contextLabel ?? 'Active game in progress' }}</h3>
        </div>
        <p class="summary-note">Occupied fields are the current score proxy for this increment.</p>
      </div>

      <ul class="summary-list">
        <li
          v-for="entry in summary?.entries ?? []"
          :key="entry.player.id"
          class="summary-item"
          :style="{
            '--player-primary': entry.player.color.primary,
            '--player-dark': entry.player.color.dark,
          }"
        >
          <div class="summary-player">
            <span class="player-mark">{{ entry.player.initials }}</span>
            <div>
              <p>{{ entry.player.name }}</p>
              <span>
                {{
                  entry.isWinner
                    ? 'Winner'
                    : entry.isErased
                      ? 'Erased'
                      : summary?.contextLabel.startsWith('Winner')
                        ? 'Still standing'
                    : entry.isActive
                      ? 'To play'
                      : 'In play'
                }}
              </span>
            </div>
          </div>

          <strong>{{ entry.fields }}</strong>
        </li>
      </ul>

      <p class="future-note">
        This summary reflects live erased and winner state, so the next setup choice stays grounded in the current match.
      </p>
    </section>

    <div class="warning-actions">
      <button
        class="secondary-button"
        type="button"
        @click="emit('continue-game')"
      >
        Continue Current Game
      </button>

      <button
        class="primary-button"
        type="button"
        @click="emit('start-over')"
      >
        Start Over
      </button>
    </div>
  </section>
</template>

<style scoped>
.warning-dialog {
  display: grid;
  gap: 1rem;
}

.warning-copy,
.summary-note,
.future-note {
  margin: 0;
  color: var(--text-soft);
  line-height: 1.55;
}

.summary-card {
  display: grid;
  gap: 0.95rem;
  padding: 1rem;
  border: 1px solid rgba(93, 232, 255, 0.18);
  border-radius: 0.55rem;
  background:
    linear-gradient(135deg, rgba(93, 232, 255, 0.06), rgba(255, 91, 215, 0.04)),
    rgba(4, 10, 24, 0.82);
}

.summary-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--accent);
  font-size: 0.78rem;
  letter-spacing: 0;
  text-transform: uppercase;
  text-shadow: 0 0 12px rgba(93, 232, 255, 0.18);
}

h3,
p {
  margin: 0;
}

h3 {
  font-size: 1.2rem;
}

.summary-list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.summary-item {
  --player-primary: var(--accent);
  --player-dark: #143247;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 0.9rem;
  border-radius: 0.5rem;
  background:
    radial-gradient(circle at 8% 50%, color-mix(in srgb, var(--player-primary) 18%, transparent), transparent 42%),
    rgba(5, 12, 30, 0.88);
  border: 1px solid rgba(93, 232, 255, 0.13);
}

.summary-player {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.summary-player p {
  font-weight: 600;
}

.summary-player span {
  color: var(--text-soft);
  font-size: 0.88rem;
}

.player-mark {
  display: grid;
  place-items: center;
  width: 2.3rem;
  height: 2.3rem;
  border: 1px solid color-mix(in srgb, var(--player-primary) 58%, transparent);
  border-radius: 0.45rem;
  background:
    radial-gradient(circle at 32% 20%, rgba(255, 255, 255, 0.28), transparent 42%),
    linear-gradient(160deg, var(--player-primary), var(--player-dark));
  color: #f6fbff;
  font-size: 0.86rem;
  font-weight: 800;
  box-shadow: 0 0 16px color-mix(in srgb, var(--player-primary) 20%, transparent);
}

strong {
  font-size: 1.15rem;
}

.warning-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: end;
  gap: 0.8rem;
}

.primary-button,
.secondary-button {
  padding: 0.95rem 1.35rem;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  font: inherit;
  cursor: pointer;
  transition:
    transform 160ms ease,
    opacity 160ms ease,
    background 160ms ease;
}

.primary-button {
  border-color: rgba(255, 122, 47, 0.5);
  background:
    radial-gradient(circle at 22% 20%, rgba(255, 229, 138, 0.3), transparent 42%),
    linear-gradient(135deg, var(--neon-orange), var(--neon-magenta));
  color: #06101d;
  font-weight: 800;
  box-shadow: 0 0 24px rgba(255, 122, 47, 0.16);
}

.secondary-button {
  border-color: rgba(93, 232, 255, 0.2);
  background:
    linear-gradient(135deg, rgba(93, 232, 255, 0.1), rgba(5, 12, 30, 0.86));
  color: var(--text-main);
}

.primary-button:hover,
.secondary-button:hover {
  transform: translateY(-1px);
}

@media (max-width: 720px) {
  .summary-header,
  .warning-actions {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 720px), (max-height: 520px) {
  .warning-dialog {
    gap: 0.8rem;
  }

  .summary-card {
    gap: 0.8rem;
    padding: 0.85rem;
  }

  .summary-list {
    gap: 0.6rem;
  }

  .summary-item {
    padding: 0.68rem 0.78rem;
  }

  .primary-button,
  .secondary-button {
    padding: 0.82rem 1.05rem;
  }
}
</style>
