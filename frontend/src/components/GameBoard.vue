<script setup lang="ts">
import { computed } from 'vue'

import type { Cell, GamePhase, PlayerConfig } from '@/types/game'

const props = defineProps<{
  board: Cell[][]
  players: PlayerConfig[]
  phase: GamePhase
  isCellPlayable: (row: number, col: number) => boolean
}>()

const emit = defineEmits<{
  (event: 'play-cell', payload: { row: number; col: number }): void
}>()

function getPlayer(owner: number | null): PlayerConfig | null {
  if (owner === null) {
    return null
  }

  return props.players.find((player) => player.id === owner) ?? null
}

const boardColumnCount = computed(() => props.board[0]?.length ?? 0)

function getCellTone(row: number, col: number): 'corner' | 'edge' | 'interior' {
  const atTopOrBottom = row === 0 || row === props.board.length - 1
  const atLeftOrRight = col === 0 || col === (props.board[row]?.length ?? 0) - 1

  if (atTopOrBottom && atLeftOrRight) {
    return 'corner'
  }

  if (atTopOrBottom || atLeftOrRight) {
    return 'edge'
  }

  return 'interior'
}
</script>

<template>
  <section class="board-panel panel">
    <div class="board-stage">
      <div
        class="board-grid"
        :class="{ 'board-grid--idle': phase === 'idle' }"
      >
        <div
          v-for="(row, rowIndex) in board"
          :key="rowIndex"
          class="board-row"
          :style="{ gridTemplateColumns: `repeat(${boardColumnCount || row.length}, minmax(0, 1fr))` }"
        >
          <button
            v-for="cell in row"
            :key="`${cell.row}-${cell.col}`"
            class="board-cell"
            :class="{
              'tone-corner': getCellTone(cell.row, cell.col) === 'corner',
              'tone-edge': getCellTone(cell.row, cell.col) === 'edge',
              'tone-interior': getCellTone(cell.row, cell.col) === 'interior',
              'is-empty': cell.owner === null,
              'is-owned': cell.owner !== null,
              'is-disabled': !isCellPlayable(cell.row, cell.col),
            }"
            :style="
              getPlayer(cell.owner)
                ? {
                    '--cell-primary': getPlayer(cell.owner)?.color.primary,
                    '--cell-light': getPlayer(cell.owner)?.color.light,
                    '--cell-dark': getPlayer(cell.owner)?.color.dark,
                  }
                : undefined
            "
            type="button"
            :disabled="!isCellPlayable(cell.row, cell.col)"
            @click="emit('play-cell', { row: cell.row, col: cell.col })"
          >
            <span
              v-if="cell.owner !== null"
              class="cell-initials"
            >
              {{ getPlayer(cell.owner)?.initials }}
            </span>
            <span class="cell-load">
              {{ cell.load > 0 ? cell.load : '' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.board-panel {
  min-height: 0;
}

.board-stage {
  display: grid;
  place-items: center;
  min-height: 0;
}

.board-grid {
  display: grid;
  gap: 0.26rem;
  inline-size: min(100%, var(--board-size-limit));
  padding: 0.58rem;
  border-radius: 1.25rem;
  background:
    linear-gradient(160deg, rgba(107, 121, 255, 0.18), rgba(14, 23, 53, 0.4)),
    rgba(5, 10, 24, 0.9);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.board-grid--idle {
  opacity: 0.92;
}

.board-row {
  display: grid;
  gap: 0.26rem;
}

.board-cell {
  --cell-primary: var(--accent);
  --cell-light: rgba(109, 231, 255, 0.34);
  --cell-dark: #143247;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  gap: 0.1rem;
  padding: 0.14rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.64rem;
  background:
    radial-gradient(circle at 25% 20%, rgba(255, 255, 255, 0.11), transparent 40%),
    rgba(13, 20, 42, 0.92);
  color: var(--text-main);
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    opacity 160ms ease;
}

.board-cell.tone-corner {
  box-shadow: inset 0 0 0 1px rgba(109, 231, 255, 0.12);
}

.board-cell.tone-edge {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}

.board-cell.tone-interior {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.board-cell:hover:not(:disabled) {
  transform: translateY(-1px) scale(1.01);
  border-color: rgba(109, 231, 255, 0.38);
}

.board-cell.is-owned {
  border-color: color-mix(in srgb, var(--cell-primary) 80%, white);
  background:
    radial-gradient(circle at 30% 25%, var(--cell-light), transparent 35%),
    linear-gradient(160deg, color-mix(in srgb, var(--cell-primary) 72%, #0b1120), var(--cell-dark));
  color: #f7fbff;
}

.board-cell.is-disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.cell-initials {
  font-size: clamp(0.4rem, 0.7vw, 0.56rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cell-load {
  font-size: clamp(0.82rem, 1vw, 1.02rem);
  font-weight: 700;
}

@media (max-height: 860px) {
  .board-grid {
    gap: 0.22rem;
    padding: 0.52rem;
  }

  .board-row {
    gap: 0.22rem;
  }

  .board-cell {
    border-radius: 0.52rem;
  }
}
</style>
