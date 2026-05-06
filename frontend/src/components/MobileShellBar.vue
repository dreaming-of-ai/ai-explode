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
  border-color: rgba(93, 232, 255, 0.3);
}

.mobile-shell-bar__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.mobile-shell-bar__button {
  min-block-size: 2.85rem;
  padding: 0.75rem 0.95rem;
  border: 1px solid rgba(93, 232, 255, 0.2);
  border-radius: 0.5rem;
  font: inherit;
  font-weight: 750;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    filter 160ms ease;
}

.mobile-shell-bar__button--primary {
  background:
    radial-gradient(circle at 22% 20%, rgba(255, 229, 138, 0.26), transparent 44%),
    linear-gradient(135deg, rgba(255, 122, 47, 0.35), rgba(255, 91, 215, 0.16) 48%, rgba(5, 12, 30, 0.96));
  border-color: rgba(255, 122, 47, 0.46);
  color: #fff8df;
  box-shadow: 0 0 22px rgba(255, 122, 47, 0.12);
}

.mobile-shell-bar__button--secondary {
  background:
    linear-gradient(135deg, rgba(93, 232, 255, 0.12), rgba(5, 12, 30, 0.9));
  color: var(--text-main);
}

.mobile-shell-bar__button:hover,
.mobile-shell-bar__button:focus-visible {
  transform: translateY(-1px);
  border-color: rgba(255, 229, 138, 0.62);
  filter: brightness(1.06);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.26),
    0 0 24px rgba(93, 232, 255, 0.14);
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
  letter-spacing: 0;
  text-transform: uppercase;
  text-shadow: 0 0 12px rgba(93, 232, 255, 0.18);
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

@media (hover: none) and (pointer: coarse) {
  .mobile-shell-bar__button:hover {
    transform: none;
    filter: none;
  }
}
</style>
