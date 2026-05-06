<script setup lang="ts">
import { computed, ref } from 'vue'

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
  explodingCells,
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

const isSplashVisible = ref(true)
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

function enterGameView() {
  isSplashVisible.value = false
}
</script>

<template>
  <div class="app-frame">
    <section
      v-if="isSplashVisible"
      class="splash-screen"
      aria-labelledby="splash-title"
    >
      <div class="splash-content">
        <div class="splash-image-shell">
          <img
            class="splash-image"
            src="/splash-ai-explode.png"
            alt="AI Explode overview showing the neon game board, explosion thresholds, and gameplay steps."
          />
        </div>

        <h1
          id="splash-title"
          class="splash-title"
        >
          AI Explode
        </h1>

        <button
          class="splash-start-button"
          type="button"
          @click="enterGameView"
        >
          Start Game
        </button>
      </div>
    </section>

    <template v-else>
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
              :exploding-cells="explodingCells"
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
    </template>
  </div>
</template>

<style scoped>
.app-frame {
  height: 100%;
  min-height: 0;
  display: grid;
}

.splash-screen {
  min-height: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.splash-content {
  width: min(100%, 80rem);
  max-height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.75rem, 1.8vh, 1.35rem);
  overflow: auto;
  padding: 0.25rem 0.1rem;
}

.splash-image-shell {
  width: min(100%, 72rem);
  max-height: min(74dvh, 48rem);
  aspect-ratio: 3 / 2;
  padding: clamp(0.35rem, 0.7vw, 0.6rem);
  border: 1px solid rgba(109, 231, 255, 0.34);
  border-radius: 1.2rem;
  background:
    linear-gradient(145deg, rgba(109, 231, 255, 0.16), rgba(255, 102, 196, 0.12)),
    rgba(4, 8, 20, 0.76);
  box-shadow:
    0 28px 90px rgba(0, 0, 0, 0.42),
    0 0 42px rgba(109, 231, 255, 0.14);
}

.splash-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0.85rem;
}

.splash-start-button {
  min-width: min(100%, 16rem);
  min-height: 3.3rem;
  padding: 0.85rem 2.2rem;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  color: #07101f;
  background:
    linear-gradient(135deg, #78ecff 0%, #fff1a8 48%, #ff7aca 100%);
  box-shadow:
    0 18px 42px rgba(255, 122, 202, 0.24),
    0 0 30px rgba(109, 231, 255, 0.2);
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    filter 160ms ease;
}

.splash-start-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
  box-shadow:
    0 22px 50px rgba(255, 122, 202, 0.3),
    0 0 38px rgba(109, 231, 255, 0.26);
}

.splash-start-button:active {
  transform: translateY(0);
}

@media (max-width: 1023px) {
  .splash-image-shell {
    width: min(100%, 58rem);
    max-height: min(70dvh, 39rem);
  }
}

@media (max-width: 767px) {
  .splash-content {
    gap: 0.85rem;
  }

  .splash-image-shell {
    border-radius: 0.9rem;
    max-height: 64dvh;
    padding: 0.25rem;
  }

  .splash-image {
    border-radius: 0.65rem;
  }

  .splash-start-button {
    width: min(100%, 15rem);
    min-height: 3rem;
    padding: 0.75rem 1.4rem;
    font-size: 0.92rem;
  }
}

@media (max-height: 620px) {
  .splash-content {
    gap: 0.65rem;
  }

  .splash-image-shell {
    max-height: 68dvh;
  }

  .splash-start-button {
    min-height: 2.8rem;
    padding-block: 0.65rem;
  }
}

@media (hover: none) and (pointer: coarse) {
  .splash-start-button:hover {
    transform: none;
    filter: none;
  }
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
  position: relative;
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem 1.25rem;
  min-width: 0;
  padding-bottom: 0.2rem;
}

.app-header::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: -0.28rem;
  height: 1px;
  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(93, 232, 255, 0.52),
      rgba(255, 122, 47, 0.58),
      rgba(255, 91, 215, 0.48),
      transparent
    );
  box-shadow: 0 0 16px rgba(93, 232, 255, 0.18);
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
  letter-spacing: 0;
  color: transparent;
  background:
    linear-gradient(92deg, var(--neon-cyan) 0%, #66a8ff 32%, var(--neon-orange) 58%, var(--neon-magenta) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  text-shadow:
    0 0 18px rgba(93, 232, 255, 0.18),
    0 0 28px rgba(255, 91, 215, 0.12);
}

.splash-title {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.brand-subtitle {
  margin-top: 0.25rem;
  color: var(--text-soft);
  font-size: clamp(0.9rem, 1.35vw, 1.05rem);
  text-shadow: 0 0 14px rgba(93, 232, 255, 0.12);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shell-layout {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(15rem, 17.5rem);
  gap: 0.95rem;
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

  .app-header::after {
    bottom: -0.2rem;
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
