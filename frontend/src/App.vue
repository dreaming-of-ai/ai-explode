<script setup lang="ts">
import { computed } from 'vue'

import GameBoard from '@/components/GameBoard.vue'
import HeaderIconBar from '@/components/HeaderIconBar.vue'
import HeaderPopupContent from '@/components/HeaderPopupContent.vue'
import LegalFooter from '@/components/LegalFooter.vue'
import LegalPage from '@/components/LegalPage.vue'
import MobileShellBar from '@/components/MobileShellBar.vue'
import MoveResultDialog from '@/components/MoveResultDialog.vue'
import PlayerSetup from '@/components/PlayerSetup.vue'
import PlayerSidebar from '@/components/PlayerSidebar.vue'
import RestartWarningDialog from '@/components/RestartWarningDialog.vue'
import ShellModal from '@/components/ShellModal.vue'
import { useGameShell } from '@/composables/useGameShell'
import { HEADER_POPUP_DEFINITIONS, HEADER_POPUP_ENTRIES } from '@/data/headerPopups'
import { getLegalPageDocument, LEGAL_PAGE_LINKS } from '@/data/legalPages'

const {
  setupPlayers,
  gameState,
  displayBoard,
  activeLegalPage,
  activeHeaderPopup,
  explosionDelayPreset,
  explosionDelayOptions,
  setupValidation,
  canAddPlayer,
  canRemovePlayer,
  scoreboardEntries,
  activePlayer,
  winnerPlayer,
  restartSummary,
  isSetupModalOpen,
  isRestartWarningOpen,
  isMoveResultOpen,
  isHeaderPopupOpen,
  lastMoveIndicator,
  moveResultPopup,
  updatePlayerName,
  updatePlayerController,
  updateComputerPlayer,
  updatePlayerColor,
  updateExplosionDelayPreset,
  addPlayer,
  removePlayer,
  openNewGame,
  closeSetupModal,
  continueCurrentGame,
  proceedToSetupFromWarning,
  openLegalPage,
  closeLegalPage,
  openHeaderPopup,
  closeHeaderPopup,
  dismissMoveResult,
  startGame,
  playCell,
  getAvailableColors,
  isCellPlayable,
} = useGameShell()

const isBoardShellVisible = computed(() => activeLegalPage.value === null)
const activeLegalDocument = computed(() =>
  activeLegalPage.value ? getLegalPageDocument(activeLegalPage.value) : null,
)
const activeHeaderPopupDefinition = computed(() =>
  activeHeaderPopup.value ? HEADER_POPUP_DEFINITIONS[activeHeaderPopup.value] : null,
)
const isModalOpen = computed(
  () =>
    isSetupModalOpen.value ||
    isRestartWarningOpen.value ||
    isMoveResultOpen.value ||
    isHeaderPopupOpen.value,
)
</script>

<template>
  <div class="app-frame">
    <div
      class="app-shell"
      :class="{
        'app-shell--board': isBoardShellVisible,
        'app-shell--legal': !isBoardShellVisible,
      }"
      :inert="isModalOpen"
      :aria-hidden="isModalOpen"
    >
      <header class="app-header">
        <div class="brand-block">
          <h1>AI Explode</h1>
          <p class="brand-subtitle">A Tactical Chain-Reaction Game</p>
        </div>

        <HeaderIconBar
          v-if="isBoardShellVisible"
          class="header-actions"
          :entries="HEADER_POPUP_ENTRIES"
          :active-popup="activeHeaderPopup"
          @open="openHeaderPopup"
        />
      </header>

      <main class="shell-main">
        <div
          v-if="isBoardShellVisible"
          class="shell-layout"
        >
          <GameBoard
            :board="displayBoard"
            :players="gameState.players"
            :phase="gameState.phase"
            :last-move-indicator="lastMoveIndicator"
            :is-cell-playable="isCellPlayable"
            @play-cell="playCell($event.row, $event.col)"
          />

          <MobileShellBar
            :active-player="activePlayer"
            :winner-player="winnerPlayer"
            :round="gameState.round"
            :phase="gameState.phase"
            :is-concluded="gameState.isConcluded"
            @new-game="openNewGame"
            @open-info="openHeaderPopup('game-info')"
          />

          <PlayerSidebar
            :entries="scoreboardEntries"
            :active-player="activePlayer"
            :winner-player="winnerPlayer"
            :round="gameState.round"
            :phase="gameState.phase"
            :is-concluded="gameState.isConcluded"
            @new-game="openNewGame"
          />
        </div>

        <LegalPage
          v-else-if="activeLegalDocument"
          :document="activeLegalDocument"
          @return-to-game="closeLegalPage"
        />
      </main>

      <LegalFooter
        v-if="isBoardShellVisible"
        :entries="LEGAL_PAGE_LINKS"
        @open="openLegalPage"
      />
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
        @update-controller="updatePlayerController($event.playerId, $event.controller)"
        @update-computer-player="updateComputerPlayer($event.playerId, $event.computerPlayerId)"
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

    <ShellModal
      v-if="isMoveResultOpen && moveResultPopup"
      :eyebrow="moveResultPopup.eyebrow"
      :title="moveResultPopup.title"
      :description="moveResultPopup.description"
      :dismissible="false"
      :close-on-backdrop="false"
    >
      <MoveResultDialog
        :result="moveResultPopup"
        @close="dismissMoveResult"
      />
    </ShellModal>

    <ShellModal
      v-if="isHeaderPopupOpen && activeHeaderPopupDefinition && activeHeaderPopup"
      :eyebrow="''"
      :title="activeHeaderPopupDefinition.title"
      @close="closeHeaderPopup"
    >
      <HeaderPopupContent
        :popup-id="activeHeaderPopup"
        :selected-explosion-delay-preset="explosionDelayPreset"
        :explosion-delay-options="explosionDelayOptions"
        :entries="scoreboardEntries"
        :active-player="activePlayer"
        :winner-player="winnerPlayer"
        :round="gameState.round"
        :phase="gameState.phase"
        :is-concluded="gameState.isConcluded"
        @update-explosion-delay-preset="updateExplosionDelayPreset"
      />
    </ShellModal>
  </div>
</template>

<style scoped>
.app-frame {
  height: 100%;
  min-height: 0;
  display: grid;
}

.app-shell {
  min-height: 0;
  display: grid;
  gap: clamp(0.65rem, 1.4vh, 1rem);
}

.app-shell--board {
  --board-size-limit: 46rem;
  grid-template-rows: auto minmax(0, 1fr) auto;
}

.app-shell--legal {
  grid-template-rows: auto minmax(0, 1fr);
}

.app-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem 1.25rem;
  min-width: 0;
}

.shell-main {
  min-height: 0;
  display: grid;
  overflow: hidden;
}

.brand-block {
  min-width: 0;
  flex: 1 1 auto;
}

.header-actions {
  flex: 0 0 auto;
  margin-inline-start: auto;
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
  overflow: hidden;
}

@media (max-width: 1023px) {
  .shell-layout {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
  }
}

@media (max-width: 767px) {
  .app-shell {
    gap: 0.55rem;
  }

  .app-header {
    gap: 0.7rem 0.9rem;
  }

  h1 {
    font-size: clamp(1.85rem, 9vw, 2.6rem);
  }

  .brand-subtitle {
    display: none;
  }

  .shell-layout {
    gap: 0.55rem;
  }
}

@media (max-height: 860px) {
  .app-shell--board {
    --board-size-limit: 42rem;
    gap: 0.7rem;
  }
}

@media (max-height: 860px) and (max-width: 1023px) {
  .app-shell--board {
    --board-size-limit: 40rem;
  }
}

@media (max-width: 767px) and (orientation: landscape) and (max-height: 520px) {
  .app-shell {
    gap: 0.4rem;
  }

  .app-header {
    align-items: center;
    gap: 0.5rem 0.85rem;
  }

  h1 {
    font-size: clamp(1.6rem, 4.6vw, 2.15rem);
  }

  .shell-layout {
    gap: 0.45rem;
  }
}

@media (min-width: 1024px) and (orientation: landscape) and (max-height: 520px) {
  .app-shell {
    gap: 0.45rem;
  }

  .app-header {
    align-items: center;
    gap: 0.6rem 0.95rem;
  }

  .brand-subtitle {
    display: none;
  }

  .header-actions {
    width: auto;
  }

  .shell-layout {
    gap: 0.55rem;
  }
}
</style>
