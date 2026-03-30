<script setup lang="ts">
import { computed } from 'vue'

import GameInfoPanel from '@/components/GameInfoPanel.vue'
import { GAMING_RULES_SECTIONS, INFORMATION_POPUP_CONTENT } from '@/data/headerPopups'
import type {
  ExplosionDelayOption,
  ExplosionDelayPreset,
  GamePhase,
  HeaderPopupId,
  PlayerConfig,
  ScoreboardEntry,
} from '@/types/game'

const props = defineProps<{
  popupId: HeaderPopupId
  selectedExplosionDelayPreset: ExplosionDelayPreset
  explosionDelayOptions: ReadonlyArray<ExplosionDelayOption>
  entries: ScoreboardEntry[]
  activePlayer: PlayerConfig | null
  winnerPlayer: PlayerConfig | null
  round: number
  phase: GamePhase
  isConcluded: boolean
}>()

const emit = defineEmits<{
  (event: 'update-explosion-delay-preset', preset: ExplosionDelayPreset): void
}>()

const isRulesPopup = computed(() => props.popupId === 'gaming-rules')
const isInformationPopup = computed(() => props.popupId === 'information')
const isSettingsPopup = computed(() => props.popupId === 'settings')
const isGameInfoPopup = computed(() => props.popupId === 'game-info')
</script>

<template>
  <section
    v-if="isRulesPopup"
    class="rules-content"
  >
    <section
      v-for="section in GAMING_RULES_SECTIONS"
      :key="section.title"
      class="rules-section"
    >
      <h3>{{ section.title }}</h3>

      <ul>
        <li
          v-for="bullet in section.bullets"
          :key="bullet"
        >
          {{ bullet }}
        </li>
      </ul>
    </section>
  </section>

  <section
    v-else-if="isInformationPopup"
    class="info-content"
  >
    <p>{{ INFORMATION_POPUP_CONTENT.intro }}</p>
    <p>{{ INFORMATION_POPUP_CONTENT.details }}</p>

    <a
      class="info-link"
      :href="INFORMATION_POPUP_CONTENT.linkHref"
      target="_blank"
      rel="noreferrer"
    >
      {{ INFORMATION_POPUP_CONTENT.linkLabel }}
    </a>
  </section>

  <section
    v-else-if="isGameInfoPopup"
    class="game-info-content"
  >
    <GameInfoPanel
      :entries="entries"
      :active-player="activePlayer"
      :winner-player="winnerPlayer"
      :round="round"
      :phase="phase"
      :is-concluded="isConcluded"
    />
  </section>

  <section
    v-else-if="isSettingsPopup"
    class="settings-content"
  >
    <section class="settings-card">
      <div class="settings-copy">
        <p class="settings-label">Explosion Delay</p>
        <h3>Follow each chain reaction</h3>
        <p>
          Choose how much time to leave between consecutive explosion-driven cell updates.
          This affects only the visual pacing of the animation and has no impact on gameplay or the outcome of the game.
        </p>
      </div>

      <div
        class="settings-grid"
        role="radiogroup"
        aria-label="Explosion Delay"
      >
        <button
          v-for="option in explosionDelayOptions"
          :key="option.id"
          class="settings-option"
          :class="{ 'is-selected': selectedExplosionDelayPreset === option.id }"
          type="button"
          role="radio"
          :aria-checked="selectedExplosionDelayPreset === option.id"
          @click="emit('update-explosion-delay-preset', option.id)"
        >
          <span>{{ option.label }}</span>
          <small>{{ option.delayMs }} ms</small>
        </button>
      </div>
    </section>
  </section>

  <div
    v-else
    class="placeholder-spacer"
    aria-hidden="true"
  />
</template>

<style scoped>
.rules-content {
  min-height: 0;
  display: grid;
  gap: 0.95rem;
  overflow: auto;
  padding-right: 0.3rem;
}

.info-content {
  display: grid;
  gap: 0.95rem;
  align-content: start;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  background: rgba(7, 12, 28, 0.78);
  color: var(--text-soft);
  line-height: 1.6;
}

.settings-content {
  display: grid;
  min-height: 0;
}

.game-info-content {
  display: grid;
  min-height: 0;
}

.settings-card {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  background: rgba(7, 12, 28, 0.78);
}

.settings-copy {
  display: grid;
  gap: 0.45rem;
  color: var(--text-soft);
  line-height: 1.55;
}

.settings-label {
  color: var(--accent);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(122px, 1fr));
  gap: 0.75rem;
}

.settings-option {
  display: grid;
  gap: 0.28rem;
  justify-items: start;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  background: rgba(10, 16, 35, 0.88);
  color: var(--text-main);
  font: inherit;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}

.settings-option:hover,
.settings-option:focus-visible {
  transform: translateY(-1px);
  border-color: rgba(109, 231, 255, 0.34);
}

.settings-option.is-selected {
  border-color: rgba(109, 231, 255, 0.58);
  background: linear-gradient(135deg, rgba(31, 54, 94, 0.92), rgba(9, 16, 36, 0.96));
}

.settings-option small {
  color: var(--text-soft);
  font-size: 0.82rem;
}

.rules-section {
  display: grid;
  gap: 0.55rem;
  padding: 0.95rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  background: rgba(7, 12, 28, 0.78);
}

h3,
p,
ul {
  margin: 0;
}

h3 {
  font-size: 1rem;
  color: var(--text-main);
}

ul {
  display: grid;
  gap: 0.45rem;
  padding-left: 1.1rem;
  color: var(--text-soft);
  line-height: 1.55;
}

.info-link {
  justify-self: start;
  color: var(--accent);
  text-decoration: none;
  transition:
    color 160ms ease,
    opacity 160ms ease;
}

.info-link:hover,
.info-link:focus-visible {
  color: #9cf1ff;
}

.placeholder-spacer {
  min-height: clamp(3rem, 10vh, 5rem);
}

@media (max-width: 720px) {
  .info-content,
  .rules-section {
    padding: 0.9rem;
  }
}

@media (max-width: 720px), (max-height: 520px) {
  .rules-content,
  .settings-card {
    gap: 0.75rem;
  }

  .info-content,
  .rules-section,
  .settings-card {
    padding: 0.82rem;
  }

  .settings-grid {
    gap: 0.6rem;
  }

  .settings-option {
    padding: 0.82rem 0.9rem;
  }
}
</style>
