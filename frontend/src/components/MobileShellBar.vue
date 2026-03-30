<script setup lang="ts">
import { computed } from 'vue'

import type { GamePhase, PlayerConfig } from '@/types/game'

const props = defineProps<{
  activePlayer: PlayerConfig | null
  winnerPlayer: PlayerConfig | null
  round: number
  phase: GamePhase
  isConcluded: boolean
}>()

const emit = defineEmits<{
  (event: 'new-game'): void
  (event: 'open-info'): void
}>()

const infoLabel = computed(() => (props.phase === 'playing' ? 'Scoreboard' : 'Overview'))

const statusEyebrow = computed(() => {
  if (props.phase !== 'playing') {
    return 'Ready'
  }

  return props.isConcluded ? 'Winner' : 'Current Turn'
})

const statusText = computed(() => {
  if (props.phase !== 'playing') {
    return 'Open setup to start the next match.'
  }

  if (props.isConcluded && props.winnerPlayer) {
    return `${props.winnerPlayer.name} won the match.`
  }

  if (props.activePlayer) {
    return props.activePlayer.controller === 'computer'
      ? `Round ${props.round} · ${props.activePlayer.name} plays automatically.`
      : `Round ${props.round} · ${props.activePlayer.name} to play.`
  }

  return `Round ${props.round}`
})
</script>

<template>
  <section class="mobile-shell-bar panel">
    <div class="mobile-shell-bar__actions">
      <button
        class="mobile-shell-bar__button mobile-shell-bar__button--primary"
        type="button"
        @click="emit('new-game')"
      >
        New Game
      </button>

      <button
        class="mobile-shell-bar__button mobile-shell-bar__button--secondary"
        type="button"
        @click="emit('open-info')"
      >
        {{ infoLabel }}
      </button>
    </div>

    <div class="mobile-shell-bar__status">
      <p class="eyebrow">{{ statusEyebrow }}</p>
      <p class="mobile-shell-bar__status-text">{{ statusText }}</p>
    </div>
  </section>
</template>

<style scoped>
.mobile-shell-bar {
  display: none;
  gap: 0.7rem;
}

.mobile-shell-bar__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.mobile-shell-bar__button {
  min-block-size: 2.85rem;
  padding: 0.75rem 0.95rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.95rem;
  font: inherit;
  cursor: pointer;
}

.mobile-shell-bar__button--primary {
  background: linear-gradient(135deg, rgba(20, 33, 63, 0.96), rgba(8, 14, 30, 0.92));
  border-color: rgba(109, 231, 255, 0.24);
  color: var(--text-main);
  font-weight: 700;
}

.mobile-shell-bar__button--secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
}

.mobile-shell-bar__status {
  display: grid;
  gap: 0.22rem;
}

.eyebrow,
.mobile-shell-bar__status-text {
  margin: 0;
}

.eyebrow {
  color: var(--accent);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.mobile-shell-bar__status-text {
  color: var(--text-soft);
  font-size: 0.84rem;
  line-height: 1.4;
}

@media (max-width: 767px) {
  .mobile-shell-bar {
    display: grid;
  }
}

@media (orientation: landscape) and (max-width: 767px) and (max-height: 520px) {
  .mobile-shell-bar {
    gap: 0.45rem;
  }

  .mobile-shell-bar__button {
    min-block-size: 2.6rem;
    padding: 0.62rem 0.8rem;
  }

  .mobile-shell-bar__status-text {
    font-size: 0.78rem;
  }
}
</style>
