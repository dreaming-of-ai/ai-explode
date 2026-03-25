<script setup lang="ts">
import type { PlayerColor, SetupPlayer, SetupValidation } from '@/types/game'

defineProps<{
  players: SetupPlayer[]
  validation: SetupValidation
  canAddPlayer: boolean
  canRemovePlayer: boolean
  getAvailableColors: (playerId: number) => PlayerColor[]
}>()

const emit = defineEmits<{
  (event: 'update-name', payload: { playerId: number; name: string }): void
  (event: 'update-color', payload: { playerId: number; colorId: string }): void
  (event: 'add-player'): void
  (event: 'remove-player', payload: { playerId: number }): void
  (event: 'start-game'): void
}>()
</script>

<template>
  <section class="setup-card panel">
    <div class="section-header">
      <p class="eyebrow">Phase 1</p>
      <h2>Assemble the player lineup</h2>
      <p class="lede">
        Set up two to four commanders, lock in unique colors, and launch the first playable board.
      </p>
    </div>

    <div class="setup-grid">
      <article
        v-for="(player, index) in players"
        :key="player.id"
        class="player-card"
      >
        <div class="player-card__top">
          <div>
            <p class="player-label">Player {{ index + 1 }}</p>
            <h3>Ready for orbit</h3>
          </div>

          <button
            v-if="canRemovePlayer"
            class="ghost-button"
            type="button"
            @click="emit('remove-player', { playerId: player.id })"
          >
            Remove
          </button>
        </div>

        <label class="field">
          <span>Name</span>
          <input
            :value="player.name"
            type="text"
            maxlength="18"
            placeholder="Captain Nova"
            @input="
              emit('update-name', {
                playerId: player.id,
                name: ($event.target as HTMLInputElement).value,
              })
            "
          />
        </label>

        <div class="field">
          <span>Color</span>
          <div class="color-grid">
            <button
              v-for="color in getAvailableColors(player.id)"
              :key="color.id"
              class="color-chip"
              :class="{ 'is-selected': player.colorId === color.id }"
              type="button"
              :style="{
                '--chip-primary': color.primary,
                '--chip-light': color.light,
                '--chip-dark': color.dark,
              }"
              @click="emit('update-color', { playerId: player.id, colorId: color.id })"
            >
              <span class="color-swatch"></span>
              <span>{{ color.name }}</span>
            </button>
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
  gap: 1.75rem;
}

.section-header {
  display: grid;
  gap: 0.75rem;
}

.eyebrow {
  margin: 0;
  color: var(--accent);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.8rem);
  line-height: 1;
}

.lede {
  margin: 0;
  max-width: 38rem;
  color: var(--text-soft);
  font-size: 1.02rem;
  line-height: 1.6;
}

.setup-grid {
  display: grid;
  gap: 1rem;
}

.player-card {
  display: grid;
  gap: 1rem;
  padding: 1.2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.2rem;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)),
    rgba(6, 10, 25, 0.78);
}

.player-card__top {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.player-label {
  margin: 0 0 0.25rem;
  color: var(--text-soft);
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h3 {
  margin: 0;
  font-size: 1.15rem;
}

.field {
  display: grid;
  gap: 0.7rem;
}

.field span {
  color: var(--text-soft);
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.95rem;
  background: rgba(9, 16, 36, 0.75);
  color: var(--text-main);
  font: inherit;
}

input:focus {
  outline: 2px solid rgba(109, 231, 255, 0.4);
  outline-offset: 1px;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.7rem;
}

.color-chip {
  --chip-primary: var(--accent);
  --chip-light: rgba(109, 231, 255, 0.34);
  --chip-dark: #143247;
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem 0.95rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: rgba(10, 16, 35, 0.88);
  color: var(--text-main);
  font: inherit;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}

.color-chip:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--chip-primary) 70%, white);
}

.color-chip.is-selected {
  border-color: var(--chip-primary);
  background: linear-gradient(120deg, var(--chip-dark), rgba(10, 16, 35, 0.96));
}

.color-swatch {
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, var(--chip-light), var(--chip-primary) 60%, var(--chip-dark));
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.08);
}

.setup-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  justify-content: space-between;
}

.primary-button,
.secondary-button,
.ghost-button {
  border: none;
  border-radius: 999px;
  font: inherit;
  cursor: pointer;
  transition:
    transform 160ms ease,
    opacity 160ms ease,
    background 160ms ease;
}

.primary-button,
.secondary-button {
  padding: 0.95rem 1.4rem;
}

.primary-button {
  background: linear-gradient(135deg, #6de7ff, #8bffd4);
  color: #06101d;
  font-weight: 700;
}

.secondary-button {
  background: rgba(255, 255, 255, 0.07);
  color: var(--text-main);
}

.ghost-button {
  padding: 0.55rem 0.9rem;
  background: transparent;
  color: var(--text-soft);
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
  gap: 0.45rem;
  margin: 0;
  padding-left: 1.1rem;
  color: #ffb6bc;
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
</style>
