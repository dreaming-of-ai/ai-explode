<script setup lang="ts">
import { computed } from 'vue'

import type {
  ComputerPlayerId,
  PlayerColor,
  PlayerController,
  SetupPlayer,
  SetupValidation,
} from '@/types/game'

const props = defineProps<{
  players: SetupPlayer[]
  validation: SetupValidation
  canAddPlayer: boolean
  canRemovePlayer: boolean
  getAvailableColors: (playerId: number) => PlayerColor[]
}>()

const emit = defineEmits<{
  (event: 'update-name', payload: { playerId: number; name: string }): void
  (event: 'update-controller', payload: { playerId: number; controller: PlayerController }): void
  (event: 'update-computer-player', payload: { playerId: number; computerPlayerId: ComputerPlayerId }): void
  (event: 'update-color', payload: { playerId: number; colorId: string }): void
  (event: 'add-player'): void
  (event: 'remove-player', payload: { playerId: number }): void
  (event: 'start-game'): void
}>()

function setController(playerId: number, controller: PlayerController) {
  emit('update-controller', { playerId, controller })
}

function getSelectedColor(player: SetupPlayer): PlayerColor | null {
  const available = props.getAvailableColors(player.id)
  return available.find((color) => color.id === player.colorId) ?? null
}

const cards = computed(() =>
  props.players.map((player, index) => ({
    player,
    index,
    selectedColor: getSelectedColor(player),
  })),
)
</script>

<template>
  <section class="setup-card panel">
    <div class="section-header">
      <p class="eyebrow">New Game</p>
      <h3>Players Assemble</h3>
    </div>

    <div class="setup-grid">
      <article
        v-for="{ player, index, selectedColor } in cards"
        :key="player.id"
        class="player-card"
      >
        <div class="player-card__top">
          <span
            class="player-index-badge"
            :style="
              selectedColor
                ? { background: `linear-gradient(135deg, ${selectedColor.primary}, ${selectedColor.dark})` }
                : {}
            "
          >
            {{ index + 1 }}
          </span>

          <div class="controller-toggle compact">
            <button
              class="controller-button"
              :class="{ 'is-selected': player.controller === 'human' }"
              type="button"
              @click="setController(player.id, 'human')"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              Human
            </button>

            <button
              class="controller-button"
              :class="{ 'is-selected': player.controller === 'computer' }"
              type="button"
              @click="setController(player.id, 'computer')"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="3"
                  width="20"
                  height="14"
                  rx="2"
                />
                <path d="M8 21h8M12 17v4" />
              </svg>
              Computer
            </button>
          </div>

          <button
            v-if="canRemovePlayer"
            class="ghost-button remove-btn"
            type="button"
            aria-label="Remove player"
            @click="emit('remove-player', { playerId: player.id })"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
              />
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
              />
            </svg>
          </button>
        </div>

        <div class="player-card__body">
          <input
            v-if="player.controller === 'human'"
            class="name-input"
            :value="player.name"
            type="text"
            maxlength="18"
            placeholder="Enter name…"
            @input="
              emit('update-name', {
                playerId: player.id,
                name: ($event.target as HTMLInputElement).value,
              })
            "
          />
          <div
            v-else
            class="generated-name"
          >
            Random {{ index + 1 }}
          </div>

          <div class="color-chips-row">
            <button
              v-for="color in getAvailableColors(player.id)"
              :key="color.id"
              class="color-dot"
              :class="{ 'is-selected': player.colorId === color.id }"
              type="button"
              :title="color.name"
              :aria-label="color.name"
              :style="{
                '--chip-primary': color.primary,
                '--chip-light': color.light,
                '--chip-dark': color.dark,
              }"
              @click="emit('update-color', { playerId: player.id, colorId: color.id })"
            />
          </div>
        </div>
      </article>
    </div>

    <div class="setup-actions">
      <button
        class="secondary-button"
        type="button"
        :disabled="!canAddPlayer"
        @click="emit('add-player')"
      >
        Add Player
      </button>

      <button
        class="primary-button"
        type="button"
        :disabled="!validation.isValid"
        @click="emit('start-game')"
      >
        Start Game
      </button>
    </div>

    <ul
      v-if="validation.errors.length > 0"
      class="validation-list"
    >
      <li
        v-for="error in validation.errors"
        :key="error"
      >
        {{ error }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.setup-card {
  display: grid;
  gap: 1.25rem;
  min-height: 0;
  overflow: hidden;
  border-color: rgba(93, 232, 255, 0.24);
}

.section-header {
  display: grid;
  gap: 0.3rem;
}

.eyebrow {
  margin: 0;
  color: var(--accent);
  font-size: 0.78rem;
  letter-spacing: 0;
  text-transform: uppercase;
  text-shadow: 0 0 12px rgba(93, 232, 255, 0.18);
}

h3 {
  margin: 0;
  font-size: clamp(1.4rem, 2.2vw, 1.9rem);
  font-weight: 700;
  line-height: 1;
}

.setup-grid {
  display: grid;
  gap: 0.6rem;
  min-height: 0;
  overflow: auto;
  padding-right: 0.2rem;
}

.player-card {
  display: grid;
  gap: 0.65rem;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(93, 232, 255, 0.16);
  border-radius: 0.55rem;
  background:
    linear-gradient(135deg, rgba(93, 232, 255, 0.065), rgba(255, 91, 215, 0.04)),
    rgba(4, 10, 24, 0.82);
  box-shadow: inset 0 0 18px rgba(93, 232, 255, 0.035);
}

.player-card__top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.player-index-badge {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 1.9rem;
  height: 1.9rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 0.42rem;
  font-size: 0.82rem;
  font-weight: 800;
  color: #f6fbff;
  background:
    radial-gradient(circle at 32% 20%, rgba(255, 229, 138, 0.42), transparent 46%),
    linear-gradient(135deg, rgba(109, 231, 255, 0.72), rgba(20, 50, 71, 0.95));
  box-shadow: 0 0 16px rgba(93, 232, 255, 0.18);
}

.controller-toggle.compact {
  display: flex;
  gap: 0.45rem;
  flex: 1;
  min-width: 0;
}

.controller-toggle.compact .controller-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.65rem;
  font-size: 0.84rem;
}

.controller-button {
  padding: 0.5rem 0.65rem;
  border: 1px solid rgba(93, 232, 255, 0.16);
  border-radius: 0.45rem;
  background:
    linear-gradient(135deg, rgba(93, 232, 255, 0.055), rgba(10, 16, 35, 0.88)),
    rgba(10, 16, 35, 0.88);
  color: var(--text-main);
  font: inherit;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}

.controller-button:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 229, 138, 0.46);
}

.controller-button.is-selected {
  border-color: rgba(255, 122, 47, 0.58);
  background:
    radial-gradient(circle at 24% 18%, rgba(255, 229, 138, 0.22), transparent 44%),
    linear-gradient(135deg, rgba(255, 122, 47, 0.24), rgba(9, 16, 36, 0.96));
  box-shadow: 0 0 18px rgba(255, 122, 47, 0.12);
}

.remove-btn {
  padding: 0.4rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.player-card__body {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.75rem;
}

.name-input,
.generated-name {
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(93, 232, 255, 0.16);
  border-radius: 0.45rem;
  background:
    linear-gradient(135deg, rgba(93, 232, 255, 0.04), rgba(9, 16, 36, 0.75)),
    rgba(9, 16, 36, 0.75);
  color: var(--text-main);
  font: inherit;
  width: 100%;
}

.name-input:focus {
  outline: 2px solid rgba(255, 229, 138, 0.56);
  outline-offset: 1px;
}

.generated-name {
  display: grid;
  align-items: center;
  min-height: 2.6rem;
  font-weight: 600;
  color: var(--text-soft);
  font-size: 0.92rem;
}

.color-chips-row {
  display: flex;
  gap: 0.45rem;
  align-items: center;
  flex-shrink: 0;
}

.color-dot {
  --chip-primary: var(--accent);
  --chip-light: rgba(109, 231, 255, 0.34);
  --chip-dark: #143247;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.4rem;
  flex-shrink: 0;
  border: 2px solid transparent;
  background: radial-gradient(circle at 35% 30%, var(--chip-light), var(--chip-primary) 55%, var(--chip-dark));
  cursor: pointer;
  padding: 0;
  transition:
    transform 120ms ease,
    border-color 120ms ease,
    box-shadow 120ms ease;
}

.color-dot:hover {
  transform: scale(1.18);
}

.color-dot.is-selected {
  border-color: #fff8df;
  box-shadow:
    0 0 0 2px var(--chip-primary),
    0 0 16px color-mix(in srgb, var(--chip-primary) 34%, transparent);
}

.setup-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: space-between;
  padding-top: 0.1rem;
}

.primary-button,
.secondary-button,
.ghost-button {
  border: 1px solid transparent;
  border-radius: 0.5rem;
  font: inherit;
  cursor: pointer;
  transition:
    transform 160ms ease,
    opacity 160ms ease,
    background 160ms ease;
}

.primary-button,
.secondary-button {
  padding: 0.9rem 1.4rem;
}

.primary-button {
  border-color: rgba(255, 122, 47, 0.5);
  background:
    radial-gradient(circle at 22% 20%, rgba(255, 229, 138, 0.3), transparent 42%),
    linear-gradient(135deg, var(--neon-orange), var(--neon-magenta));
  color: #06101d;
  font-weight: 800;
  box-shadow: 0 0 24px rgba(255, 122, 47, 0.16);
}

.secondary-button {
  border-color: rgba(93, 232, 255, 0.2);
  background:
    linear-gradient(135deg, rgba(93, 232, 255, 0.1), rgba(5, 12, 30, 0.86));
  color: var(--text-main);
}

.ghost-button {
  padding: 0.4rem 0.55rem;
  background: rgba(93, 232, 255, 0.04);
  color: var(--text-soft);
  border-color: rgba(93, 232, 255, 0.12);
}

.primary-button:hover:not(:disabled),
.secondary-button:hover:not(:disabled),
.ghost-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.primary-button:disabled,
.secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.validation-list {
  display: grid;
  gap: 0.4rem;
  margin: 0;
  padding-left: 1.1rem;
  color: #ffb6bc;
  font-size: 0.9rem;
}

@media (max-width: 840px) {
  .setup-actions {
    justify-content: stretch;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }
}

@media (max-width: 720px), (max-height: 520px) {
  .setup-card {
    gap: 0.95rem;
  }

  .player-card {
    padding: 0.75rem 0.85rem;
  }

  .player-card__body {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  .color-chips-row {
    justify-content: flex-start;
  }

  .setup-actions {
    gap: 0.6rem;
  }

  .primary-button,
  .secondary-button {
    padding: 0.8rem 1.1rem;
  }
}
</style>
