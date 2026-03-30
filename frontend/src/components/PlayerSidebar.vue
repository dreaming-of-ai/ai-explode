<script setup lang="ts">
import { computed, ref } from 'vue'

import type { GamePhase, PlayerConfig, ScoreboardEntry } from '@/types/game'

const props = defineProps<{
  entries: ScoreboardEntry[]
  activePlayer: PlayerConfig | null
  winnerPlayer: PlayerConfig | null
  round: number
  phase: GamePhase
  isConcluded: boolean
}>()

const isSecondaryOpen = ref(false)

const emit = defineEmits<{
  (event: 'new-game'): void
}>()

const secondaryTitle = computed(() =>
  props.phase === 'playing' ? 'Occupied fields' : 'Chain-Reaction Tactics',
)

const secondaryEyebrow = computed(() =>
  props.phase === 'playing' ? 'Scoreboard' : 'Game Overview',
)

const secondaryNote = computed(() => {
  if (props.phase === 'playing' && props.isConcluded) {
    return 'The board is locked until you begin the next match.'
  }

  if (props.phase === 'playing') {
    return 'Updates after every valid move.'
  }

  return 'Open the Gaming Rules popup in the header for the full rules.'
})

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

function toggleSecondary() {
  isSecondaryOpen.value = !isSecondaryOpen.value
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

    <section
      class="score-card panel"
      :class="{ 'is-collapsed': !isSecondaryOpen }"
    >
      <div class="score-header">
        <div>
          <p class="eyebrow">{{ secondaryEyebrow }}</p>
          <h3>{{ secondaryTitle }}</h3>
        </div>
        <p class="score-note">
          {{ secondaryNote }}
        </p>
      </div>

      <button
        class="score-toggle"
        type="button"
        :aria-expanded="isSecondaryOpen ? 'true' : 'false'"
        @click="toggleSecondary"
      >
        <span>{{ secondaryEyebrow }}</span>
        <small>{{ isSecondaryOpen ? 'Hide' : 'Show' }}</small>
      </button>

      <div class="score-card__content">
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
          <li>Claim empty fields or reinforce cells you already own.</li>
          <li>Trigger explosions to spread load and capture neighboring territory.</li>
          <li>Erase the other players and take over the board to win.</li>
        </ul>
      </div>
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
  flex: 1 1 auto;
  inline-size: 100%;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 0.95rem;
  min-height: 0;
  overflow: hidden;
}

.score-card__content {
  min-height: 0;
  display: grid;
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

.score-toggle {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-block-size: 2.75rem;
  padding: 0.72rem 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.95rem;
  background: rgba(7, 12, 28, 0.62);
  color: var(--text-main);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.score-toggle span {
  font-weight: 600;
}

.score-toggle small {
  color: var(--accent);
  font-size: 0.8rem;
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
  .sidebar {
    inline-size: min(100%, 28rem);
    justify-self: center;
  }

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
  .sidebar {
    gap: 0.6rem;
    max-block-size: min(36dvh, 14.5rem);
  }

  .sidebar-action {
    padding: 0.78rem 0.9rem;
  }

  .sidebar-action span {
    font-size: 0.94rem;
  }

  .sidebar-action small {
    font-size: 0.76rem;
  }

  .turn-card {
    gap: 0.45rem;
  }

  h2 {
    font-size: 1.15rem;
  }

  .score-card {
    gap: 0.7rem;
  }

  .score-toggle {
    display: inline-flex;
  }

  .score-card.is-collapsed .score-card__content {
    display: none;
  }

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

@media (max-width: 720px), (max-height: 520px) {
  .score-note {
    max-width: none;
  }
}

@media (orientation: landscape) and (max-height: 520px) {
  .sidebar {
    inline-size: 100%;
    max-block-size: none;
    gap: 0.45rem;
  }

  .sidebar-action {
    padding: 0.72rem 0.82rem;
    min-block-size: 3rem;
  }

  .turn-card {
    gap: 0.35rem;
  }

  h2 {
    font-size: 1.02rem;
  }

  h3 {
    font-size: 1rem;
  }

  .eyebrow {
    font-size: 0.7rem;
  }

  .turn-meta,
  .score-note,
  .score-player-info span {
    font-size: 0.78rem;
  }

  .score-card {
    gap: 0.55rem;
  }

  .score-toggle {
    display: inline-flex;
    min-block-size: 2.5rem;
    padding: 0.62rem 0.72rem;
  }

  .score-card.is-collapsed .score-card__content {
    display: none;
  }

  .score-item {
    gap: 0.65rem;
    padding: 0.62rem 0.68rem;
  }

  .player-mark {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 0.6rem;
    font-size: 0.74rem;
  }

  strong {
    font-size: 1rem;
  }
}
</style>
