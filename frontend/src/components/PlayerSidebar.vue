<script setup lang="ts">
import GameInfoPanel from '@/components/GameInfoPanel.vue'

import type { GamePhase, PlayerConfig, ScoreboardEntry } from '@/types/game'

defineProps<{
  entries: ScoreboardEntry[]
  activePlayer: PlayerConfig | null
  winnerPlayer: PlayerConfig | null
  round: number
  phase: GamePhase
  isConcluded: boolean
}>()

const emit = defineEmits<{
  (event: 'new-game'): void
}>()
</script>

<template>
  <aside class="sidebar">
    <button
      class="sidebar-action"
      type="button"
      @click="emit('new-game')"
    >
      <span>New Game</span>
      <small>Open setup without dropping the current match.</small>
    </button>

    <GameInfoPanel
      :entries="entries"
      :active-player="activePlayer"
      :winner-player="winnerPlayer"
      :round="round"
      :phase="phase"
      :is-concluded="isConcluded"
    />
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.9rem;
  min-height: 0;
}

.sidebar-action {
  inline-size: 100%;
  margin-top: 4px;
  display: grid;
  gap: 0.12rem;
  justify-items: start;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(109, 231, 255, 0.22);
  border-radius: 1rem;
  background:
    linear-gradient(135deg, rgba(20, 33, 63, 0.96), rgba(8, 14, 30, 0.92)),
    rgba(7, 14, 31, 0.78);
  color: var(--text-main);
  text-align: left;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.sidebar-action span {
  font-size: 0.98rem;
  font-weight: 700;
}

.sidebar-action small {
  color: var(--text-soft);
  font-size: 0.8rem;
}

.sidebar-action:hover {
  transform: translateY(-1px);
  border-color: rgba(109, 231, 255, 0.38);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

@media (max-width: 1023px) {
  .sidebar {
    inline-size: min(100%, 28rem);
    justify-self: center;
  }
}

@media (max-width: 767px) {
  .sidebar {
    display: none;
  }
}
</style>
