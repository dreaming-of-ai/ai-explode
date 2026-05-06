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
  gap: 0.95rem;
  min-height: 0;
}

.sidebar-action {
  inline-size: 100%;
  margin-top: 4px;
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 0.12rem;
  justify-items: start;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(255, 122, 47, 0.44);
  border-radius: 0.55rem;
  background:
    radial-gradient(circle at 14% 20%, rgba(255, 229, 138, 0.28), transparent 42%),
    linear-gradient(135deg, rgba(255, 122, 47, 0.22), rgba(255, 91, 215, 0.1) 44%, rgba(5, 11, 28, 0.96)),
    rgba(7, 14, 31, 0.86);
  color: var(--text-main);
  text-align: left;
  cursor: pointer;
  box-shadow:
    0 14px 34px rgba(0, 0, 0, 0.26),
    0 0 28px rgba(255, 122, 47, 0.12),
    inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.sidebar-action::after {
  content: '';
  position: absolute;
  inset-inline: 0.75rem;
  bottom: 0.42rem;
  height: 1px;
  background: linear-gradient(90deg, var(--neon-cyan), var(--neon-orange), var(--neon-magenta));
  opacity: 0.58;
}

.sidebar-action span {
  font-size: 0.98rem;
  font-weight: 800;
}

.sidebar-action small {
  color: var(--text-soft);
  font-size: 0.8rem;
}

.sidebar-action:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 229, 138, 0.72);
  box-shadow:
    0 16px 36px rgba(0, 0, 0, 0.3),
    0 0 34px rgba(255, 122, 47, 0.18),
    0 0 28px rgba(93, 232, 255, 0.1);
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
