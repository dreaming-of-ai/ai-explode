<script setup lang="ts">
import type { PlayerConfig, ScoreboardEntry } from '@/types/game'

defineProps<{
  entries: ScoreboardEntry[]
  activePlayer: PlayerConfig | null
  round: number
}>()
</script>

<template>
  <aside class="sidebar">
    <section
      v-if="activePlayer"
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
        Round {{ round }} · {{ activePlayer.color.name }}
      </p>
      <div class="turn-badge">
        <span>{{ activePlayer.initials }}</span>
      </div>
    </section>

    <section class="score-card panel">
      <div class="score-header">
        <div>
          <p class="eyebrow">Scoreboard</p>
          <h3>Occupied fields</h3>
        </div>
        <p class="score-note">Updates after every valid move.</p>
      </div>

      <ul class="score-list">
        <li
          v-for="entry in entries"
          :key="entry.player.id"
          class="score-item"
          :class="{ 'is-active': entry.isActive }"
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
              <span>{{ entry.player.color.name }}</span>
            </div>
          </div>

          <strong>{{ entry.fields }}</strong>
        </li>
      </ul>
    </section>
  </aside>
</template>

<style scoped>
.sidebar {
  display: grid;
  gap: 1rem;
}

.turn-card {
  --active-primary: var(--accent);
  --active-light: rgba(109, 231, 255, 0.34);
  --active-dark: #09111f;
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 0.7rem;
  min-height: 13rem;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--active-light) 48%, transparent), transparent 38%),
    linear-gradient(150deg, color-mix(in srgb, var(--active-dark) 72%, #09111f), rgba(6, 11, 26, 0.95));
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
  font-size: clamp(1.8rem, 2vw, 2.2rem);
}

h3 {
  font-size: 1.2rem;
}

.turn-meta,
.score-note {
  color: var(--text-soft);
  line-height: 1.5;
}

.turn-badge {
  position: absolute;
  right: 1.15rem;
  bottom: 1rem;
  display: grid;
  place-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: 1.2rem;
  background: color-mix(in srgb, var(--active-primary) 72%, black);
  color: white;
  font-size: 1.15rem;
  font-weight: 700;
}

.score-card {
  display: grid;
  gap: 1rem;
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
  font-size: 0.92rem;
}

.score-list {
  display: grid;
  gap: 0.8rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.score-item {
  --player-primary: var(--accent);
  --player-light: rgba(109, 231, 255, 0.34);
  --player-dark: #143247;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.1rem;
  background: rgba(7, 12, 28, 0.8);
}

.score-item.is-active {
  border-color: color-mix(in srgb, var(--player-primary) 72%, white);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--player-primary) 40%, transparent);
}

.score-player {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.score-player-info p {
  font-weight: 600;
}

.score-player-info span {
  color: var(--text-soft);
  font-size: 0.9rem;
}

.player-mark {
  display: grid;
  place-items: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.95rem;
  background: linear-gradient(160deg, var(--player-primary), var(--player-dark));
  color: #f6fbff;
  font-size: 0.92rem;
  font-weight: 700;
}

strong {
  font-size: 1.4rem;
}

@media (max-width: 1120px) {
  .score-header {
    flex-direction: column;
    align-items: start;
  }

  .score-note {
    max-width: none;
    text-align: left;
  }
}
</style>
