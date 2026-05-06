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
  <div class="game-info-panel">
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
      <div
        v-if="phase !== 'playing'"
        class="score-header"
      >
        <p class="eyebrow">Game Overview</p>
        <h3>Chain-Reaction Tactics</h3>
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
        <li>Claim empty fields or reinforce cells you already own.</li>
        <li>Trigger explosions to spread load and capture neighboring territory.</li>
        <li>Erase the other players and take over the board to win.</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.game-info-panel {
  display: grid;
  gap: 0.9rem;
  min-height: 0;
}

.turn-card {
  --active-primary: var(--accent);
  --active-light: rgba(109, 231, 255, 0.34);
  --active-dark: #09111f;
  position: relative;
  inline-size: 100%;
  overflow: hidden;
  display: grid;
  gap: 0.7rem;
  border-color: color-mix(in srgb, var(--active-primary) 50%, rgba(255, 255, 255, 0.08));
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--active-light) 62%, transparent), transparent 38%),
    radial-gradient(circle at 0 0, rgba(255, 229, 138, 0.16), transparent 42%),
    linear-gradient(150deg, color-mix(in srgb, var(--active-dark) 78%, #09111f), rgba(4, 10, 24, 0.96));
  box-shadow:
    0 18px 44px rgba(0, 0, 0, 0.34),
    0 0 28px color-mix(in srgb, var(--active-primary) 16%, transparent),
    inset 0 0 22px color-mix(in srgb, var(--active-primary) 7%, transparent);
}

.turn-card::after {
  content: '';
  position: absolute;
  inset-inline: 1rem;
  bottom: 0.55rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--active-primary), transparent);
  opacity: 0.58;
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
  letter-spacing: 0;
  text-transform: uppercase;
  text-shadow: 0 0 12px rgba(93, 232, 255, 0.18);
}

h2,
h3,
p {
  margin: 0;
}

h2 {
  font-size: clamp(1.4rem, 1.8vw, 2rem);
  text-shadow:
    0 0 18px color-mix(in srgb, var(--active-primary) 24%, transparent),
    0 0 24px rgba(255, 91, 215, 0.08);
}

h3 {
  font-size: 1.1rem;
}

.turn-meta,
.rule-list {
  color: var(--text-soft);
  line-height: 1.5;
}

.score-card {
  inline-size: 100%;
  display: grid;
  gap: 0.75rem;
  align-content: start;
  min-height: 0;
  overflow: hidden;
  border-color: rgba(93, 232, 255, 0.24);
}

.score-header {
  display: grid;
  gap: 0.25rem;
}

.score-list,
.rule-list {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
  align-content: start;
}

.score-item {
  --player-primary: var(--accent);
  --player-light: rgba(109, 231, 255, 0.34);
  --player-dark: #143247;
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid rgba(93, 232, 255, 0.13);
  border-radius: 0.5rem;
  background:
    linear-gradient(135deg, rgba(93, 232, 255, 0.045), rgba(255, 91, 215, 0.035)),
    rgba(4, 10, 24, 0.82);
  transition:
    border-color 200ms ease,
    box-shadow 200ms ease;
}

.score-item.is-active {
  border-color: color-mix(in srgb, var(--player-primary) 72%, white);
  background:
    radial-gradient(circle at 8% 50%, color-mix(in srgb, var(--player-primary) 26%, transparent), transparent 42%),
    linear-gradient(135deg, color-mix(in srgb, var(--player-primary) 14%, rgba(4, 10, 24, 0.88)), rgba(4, 10, 24, 0.9));
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--player-primary) 42%, transparent),
    0 0 18px color-mix(in srgb, var(--player-primary) 16%, transparent);
}

.score-item.is-erased {
  opacity: 0.6;
  border-style: dashed;
}

.score-item.is-winner {
  border-color: color-mix(in srgb, var(--player-primary) 82%, white);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--player-primary) 45%, transparent),
    0 0 24px color-mix(in srgb, var(--player-primary) 18%, transparent),
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
  border: 1px solid color-mix(in srgb, var(--player-light) 64%, transparent);
  border-radius: 0.45rem;
  background:
    radial-gradient(circle at 34% 24%, var(--player-light), transparent 52%),
    linear-gradient(160deg, var(--player-primary), var(--player-dark));
  color: #f6fbff;
  font-size: 0.88rem;
  font-weight: 800;
  box-shadow:
    0 0 16px color-mix(in srgb, var(--player-primary) 22%, transparent),
    inset 0 0 10px rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

strong {
  font-size: 1.25rem;
  white-space: nowrap;
}

.rule-list {
  padding-left: 1rem;
  list-style: disc;
  line-height: 1.6;
}

@media (max-width: 767px), (max-height: 520px) {
  .game-info-panel,
  .turn-card,
  .score-card {
    gap: 0.7rem;
  }

  .score-item {
    gap: 0.7rem;
    padding: 0.6rem 0.75rem;
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
</style>
