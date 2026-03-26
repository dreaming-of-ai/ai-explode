<script setup lang="ts">
import { computed } from 'vue'

import GameBoard from '@/components/GameBoard.vue'
import PlayerSetup from '@/components/PlayerSetup.vue'
import PlayerSidebar from '@/components/PlayerSidebar.vue'
import RestartWarningDialog from '@/components/RestartWarningDialog.vue'
import ShellModal from '@/components/ShellModal.vue'
import { useGameShell } from '@/composables/useGameShell'

const {
  setupPlayers,
  gameState,
  setupValidation,
  canAddPlayer,
  canRemovePlayer,
  scoreboardEntries,
  activePlayer,
  restartSummary,
  isSetupModalOpen,
  isRestartWarningOpen,
  updatePlayerName,
  updatePlayerColor,
  addPlayer,
  removePlayer,
  openNewGame,
  closeSetupModal,
  continueCurrentGame,
  proceedToSetupFromWarning,
  startGame,
  playCell,
  getAvailableColors,
  isCellPlayable,
} = useGameShell()

const isModalOpen = computed(() => isSetupModalOpen.value || isRestartWarningOpen.value)
</script>

<template>
  <div class="app-frame">
    <div
      class="app-shell"
      :inert="isModalOpen"
      :aria-hidden="isModalOpen"
    >
      <header class="app-header">
        <div class="brand-block">
          <h1>AI Explode</h1>
          <p class="brand-subtitle">A Tactical Chain-Reaction Game</p>
        </div>
      </header>

      <main class="shell-layout">
        <GameBoard
          :board="gameState.board"
          :players="gameState.players"
          :phase="gameState.phase"
          :is-cell-playable="isCellPlayable"
          @play-cell="playCell($event.row, $event.col)"
        />

        <PlayerSidebar
          :entries="scoreboardEntries"
          :active-player="activePlayer"
          :round="gameState.round"
          :phase="gameState.phase"
          @new-game="openNewGame"
        />
      </main>
    </div>

    <ShellModal
      v-if="isSetupModalOpen"
      eyebrow="AI Explode"
      @close="closeSetupModal"
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
    </ShellModal>

    <ShellModal
      v-if="isRestartWarningOpen"
      title="Replace current game?"
      description="Your current session stays intact unless you continue into setup and confirm a fresh match."
      :dismissible="false"
      :close-on-backdrop="false"
    >
      <RestartWarningDialog
        :summary="restartSummary"
        @continue-game="continueCurrentGame"
        @start-over="proceedToSetupFromWarning"
      />
    </ShellModal>
  </div>
</template>

<style scoped>
.app-frame {
  --board-size-limit: min(calc(100dvh - 13.5rem), calc(100vw - 19rem));
  height: 100%;
  display: grid;
}

.app-shell {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: clamp(0.75rem, 1.5vh, 1.1rem);
}

.app-header {
  display: block;
}

.brand-block {
  min-width: 0;
}

h1,
p {
  margin: 0;
}

h1 {
  font-size: clamp(2.4rem, 4.5vw, 4.8rem);
  line-height: 0.9;
  letter-spacing: 0.02em;
}

.brand-subtitle {
  margin-top: 0.25rem;
  color: var(--text-soft);
  font-size: clamp(0.9rem, 1.35vw, 1.05rem);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shell-layout {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(15rem, 17.5rem);
  gap: 0.85rem;
  align-items: stretch;
}

@media (max-width: 1080px) {
  .app-shell {
    --board-size-limit: min(calc(100dvh - 17rem), calc(100vw - 2rem));
  }

  .shell-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .brand-subtitle {
    white-space: normal;
  }
}

@media (max-height: 860px) {
  .app-shell {
    --board-size-limit: min(calc(100dvh - 11.5rem), calc(100vw - 20rem));
    gap: 0.7rem;
  }
}

@media (max-height: 860px) and (max-width: 1080px) {
  .app-shell {
    --board-size-limit: min(calc(100dvh - 15.5rem), calc(100vw - 2rem));
  }
}
</style>
