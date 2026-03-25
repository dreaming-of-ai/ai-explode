<script setup lang="ts">
import { computed } from 'vue'

import GameBoard from '@/components/GameBoard.vue'
import PlayerSetup from '@/components/PlayerSetup.vue'
import PlayerSidebar from '@/components/PlayerSidebar.vue'
import { useGameShell } from '@/composables/useGameShell'

const {
  setupPlayers,
  gameState,
  setupValidation,
  canAddPlayer,
  canRemovePlayer,
  scoreboardEntries,
  activePlayer,
  updatePlayerName,
  updatePlayerColor,
  addPlayer,
  removePlayer,
  startGame,
  playCell,
  getAvailableColors,
  isCellPlayable,
} = useGameShell()

const statusLabel = computed(() => {
  if (gameState.value.phase === 'setup') {
    return 'Configure your lineup'
  }

  const currentPlayer = activePlayer.value

  return currentPlayer ? `Round ${gameState.value.round} · ${currentPlayer.name} to play` : 'Game in progress'
})
</script>

<template>
  <div class="app-frame">
    <header class="app-header">
      <div>
        <p class="brand-kicker">AI Explode</p>
        <h1>Tactical chain-reaction playground</h1>
      </div>

      <div class="status-pill">
        {{ statusLabel }}
      </div>
    </header>

    <main
      v-if="gameState.phase === 'setup'"
      class="setup-layout"
    >
      <PlayerSetup
        :players="setupPlayers"
        :validation="setupValidation"
        :can-add-player="canAddPlayer"
        :can-remove-player="canRemovePlayer"
        :get-available-colors="getAvailableColors"
        @update-name="updatePlayerName($event.playerId, $event.name)"
        @update-color="updatePlayerColor($event.playerId, $event.colorId)"
        @add-player="addPlayer"
        @remove-player="removePlayer($event.playerId)"
        @start-game="startGame"
      />

      <section class="setup-sidebar">
        <article class="panel preview-card">
          <p class="eyebrow">What ships now</p>
          <h2>Playable shell, turn flow, and live scoreboard</h2>
          <p>
            This first increment focuses on the application shell and the rhythm of play. Empty cells can be
            claimed, owned cells can be reinforced, and the active turn rotates automatically after every legal move.
          </p>
        </article>

        <article class="panel facts-card">
          <div>
            <p class="eyebrow">Rules in this increment</p>
            <ul>
              <li>2 to 4 players with unique colors</li>
              <li>10 x 10 grid with numeric load display</li>
              <li>Own cells reinforce, rival cells stay locked</li>
            </ul>
          </div>

          <div>
            <p class="eyebrow">Next feature</p>
            <p>Explosions, chain reactions, elimination, and winner detection will layer onto this same state model later.</p>
          </div>
        </article>
      </section>
    </main>

    <main
      v-else
      class="game-layout"
    >
      <GameBoard
        :board="gameState.board"
        :players="gameState.players"
        :is-cell-playable="isCellPlayable"
        @play-cell="playCell($event.row, $event.col)"
      />

      <PlayerSidebar
        :entries="scoreboardEntries"
        :active-player="activePlayer"
        :round="gameState.round"
      />
    </main>
  </div>
</template>

<style scoped>
.app-frame {
  display: grid;
  gap: 1.8rem;
}

.app-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.brand-kicker,
.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--accent);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1,
h2,
p,
ul {
  margin: 0;
}

h1 {
  font-size: clamp(2.6rem, 4vw, 4.4rem);
  line-height: 0.95;
  max-width: 12ch;
}

h2 {
  font-size: 1.55rem;
  line-height: 1.15;
}

.status-pill {
  padding: 0.9rem 1.15rem;
  border: 1px solid rgba(109, 231, 255, 0.26);
  border-radius: 999px;
  background: rgba(7, 14, 31, 0.76);
  color: var(--text-main);
  white-space: nowrap;
}

.setup-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
  gap: 1.2rem;
  align-items: start;
}

.setup-sidebar {
  display: grid;
  gap: 1rem;
}

.preview-card,
.facts-card {
  display: grid;
  gap: 1rem;
}

.preview-card p,
.facts-card p,
.facts-card li {
  color: var(--text-soft);
  line-height: 1.65;
}

.facts-card ul {
  display: grid;
  gap: 0.6rem;
  padding-left: 1.1rem;
}

.game-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.8fr);
  gap: 1.2rem;
  align-items: start;
}

@media (max-width: 1120px) {
  .setup-layout,
  .game-layout {
    grid-template-columns: 1fr;
  }

  .app-header {
    flex-direction: column;
    align-items: start;
  }

  .status-pill {
    white-space: normal;
  }
}
</style>
