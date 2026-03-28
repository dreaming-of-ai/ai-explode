<script setup lang="ts">
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

function getPlayerStatus(entry: ScoreboardEntry): string {
  if (entry.isWinner) {
    return 'Winner'
  }

  if (entry.isErased) {
    return 'Erased'
  }

  if (entry.isActive) {
    return 'To play'
  }

  return 'In play'
}

function getPlayerRole(player: PlayerConfig): string {
  return player.controller === 'computer' ? 'Computer' : 'Human'
}
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

    <section
      v-if="phase === 'playing' && !isConcluded && activePlayer"
      class="turn-card panel"
      :style="{
        '--active-primary': activePlayer.color.primary,
        '--active-light': activePlayer.color.light,
        '--active-dark': activePlayer.color.dark,
      }"
    >
      <p class="eyebrow">Current Turn</p>
      <h2>{{ activePlayer.name }}</h2>
      <p class="turn-meta">
        {{
          activePlayer.controller === 'computer'
            ? `Round ${round} · Computer turn plays automatically.`
            : `Round ${round}`
        }}
      </p>
    </section>

    <section
      v-else-if="phase === 'playing' && winnerPlayer"
      class="turn-card panel is-concluded"
      :style="{
        '--active-primary': winnerPlayer.color.primary,
        '--active-light': winnerPlayer.color.light,
        '--active-dark': winnerPlayer.color.dark,
      }"
    >
      <p class="eyebrow">Winner</p>
      <h2>{{ winnerPlayer.name }}</h2>
      <p class="turn-meta">Match concluded. Start a new game to play again.</p>
    </section>

    <section class="score-card panel">
      <div class="score-header">
        <div>
          <p class="eyebrow">{{ phase === 'playing' ? 'Scoreboard' : 'Rules in this increment' }}</p>
          <h3>{{ phase === 'playing' ? 'Occupied fields' : 'Current shell behavior' }}</h3>
        </div>
        <p class="score-note">
          {{
            phase === 'playing' && isConcluded
              ? 'The board is locked until you begin the next match.'
              : phase === 'playing'
              ? 'Updates after every valid move.'
              : 'Current progress: board-first shell, modal setup, guarded restart, and turn rotation.'
          }}
        </p>
      </div>

      <ul
        v-if="phase === 'playing'"
        class="score-list"
      >
        <li
          v-for="entry in entries"
          :key="entry.player.id"
          class="score-item"
          :class="{
            'is-active': entry.isActive,
            'is-erased': entry.isErased,
            'is-winner': entry.isWinner,
          }"
          :style="{
            '--player-primary': entry.player.color.primary,
            '--player-light': entry.player.color.light,
            '--player-dark': entry.player.color.dark,
          }"
        >
          <div class="score-player">
            <span class="player-mark">{{ entry.player.initials }}</span>
            <div class="score-player-info">
              <p>{{ entry.player.name }}</p>
              <span>{{ entry.player.color.name }} · {{ getPlayerRole(entry.player) }} · {{ getPlayerStatus(entry) }}</span>
            </div>
          </div>

          <strong>{{ entry.fields }}</strong>
        </li>
      </ul>

      <ul
        v-else
        class="rule-list"
      >
        <li>Board loads immediately and stays visible before the first match.</li>
        <li>New Game opens modal setup instead of replacing the whole screen.</li>
        <li>Claim empty cells, reinforce your own cells, and watch turns rotate automatically.</li>
      </ul>
    </section>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.9rem;
  min-height: 0;
  overflow: hidden;
}

.sidebar-action {
  order: 1;
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

.turn-card {
  --active-primary: var(--accent);
  --active-light: rgba(109, 231, 255, 0.34);
  --active-dark: #09111f;
  order: 2;
  inline-size: 100%;
  overflow: hidden;
  display: grid;
  gap: 0.7rem;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--active-light) 48%, transparent), transparent 38%),
    linear-gradient(150deg, color-mix(in srgb, var(--active-dark) 72%, #09111f), rgba(6, 11, 26, 0.95));
}

.turn-card.is-concluded {
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--active-light) 62%, transparent), transparent 40%),
    linear-gradient(150deg, color-mix(in srgb, var(--active-primary) 18%, #09111f), rgba(6, 11, 26, 0.95));
}

.eyebrow {
  margin: 0;
  color: var(--accent);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h2,
h3,
p {
  margin: 0;
}

h2 {
  font-size: clamp(1.4rem, 1.8vw, 2rem);
}

h3 {
  font-size: 1.1rem;
}

.turn-meta,
.score-note,
.rule-list {
  color: var(--text-soft);
  line-height: 1.5;
}

.score-card {
  order: 3;
  inline-size: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0.95rem;
  min-height: 0;
  overflow: hidden;
}

.score-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.score-note {
  max-width: 12rem;
  text-align: right;
  font-size: 0.88rem;
}

.score-list,
.rule-list {
  display: grid;
  gap: 0.7rem;
  margin: 0;
  padding: 0;
  list-style: none;
  min-height: 0;
  overflow: auto;
  padding-right: 0.2rem;
}

.score-item {
  --player-primary: var(--accent);
  --player-light: rgba(109, 231, 255, 0.34);
  --player-dark: #143247;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 1rem;
  padding: 0.82rem 0.9rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  background: rgba(7, 12, 28, 0.8);
}

.score-item.is-active {
  border-color: color-mix(in srgb, var(--player-primary) 72%, white);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--player-primary) 40%, transparent);
}

.score-item.is-erased {
  opacity: 0.64;
  border-style: dashed;
}

.score-item.is-winner {
  border-color: color-mix(in srgb, var(--player-primary) 82%, white);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--player-primary) 45%, transparent),
    inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.score-player {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
}

.score-player-info {
  min-width: 0;
}

.score-player-info p {
  font-weight: 600;
  overflow-wrap: anywhere;
}

.score-player-info span {
  display: block;
  color: var(--text-soft);
  font-size: 0.88rem;
  overflow-wrap: anywhere;
}

.player-mark {
  display: grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 0.85rem;
  background: linear-gradient(160deg, var(--player-primary), var(--player-dark));
  color: #f6fbff;
  font-size: 0.88rem;
  font-weight: 700;
}

strong {
  font-size: 1.25rem;
  white-space: nowrap;
}

.rule-list {
  padding-left: 1rem;
  list-style: disc;
}

@media (max-width: 1080px) {
  .score-header {
    flex-direction: column;
    align-items: start;
  }

  .score-note {
    max-width: none;
    text-align: left;
  }
}

@media (max-width: 720px) {
  .score-item {
    gap: 0.8rem;
    padding: 0.75rem 0.8rem;
  }

  .player-mark {
    width: 2rem;
    height: 2rem;
    border-radius: 0.7rem;
    font-size: 0.8rem;
  }

  strong {
    font-size: 1.1rem;
  }
}

@media (max-height: 860px) {
  .sidebar {
    gap: 0.75rem;
  }

  .turn-card {
    gap: 0.55rem;
  }

  .score-card {
    gap: 0.8rem;
  }

  .score-item {
    padding: 0.68rem 0.78rem;
  }

  .score-list,
  .rule-list {
    gap: 0.55rem;
  }
}
</style>
