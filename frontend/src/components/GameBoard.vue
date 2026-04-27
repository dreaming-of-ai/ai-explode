<script setup lang="ts">
import { computed } from 'vue'

import type { Cell, GamePhase, LastMoveIndicator, PlayerColor, PlayerConfig } from '@/types/game'

const props = withDefaults(
  defineProps<{
    board: Cell[][]
    players: PlayerConfig[]
    phase: GamePhase
    lastMoveIndicator: LastMoveIndicator | null
    explodingCells?: Set<string>
    isCellPlayable: (row: number, col: number) => boolean
  }>(),
  {
    explodingCells: () => new Set<string>(),
  },
)

const emit = defineEmits<{
  (event: 'play-cell', payload: { row: number; col: number }): void
}>()

type DotPosition = readonly [number, number]

const DOT_LAYOUTS: Record<number, readonly DotPosition[]> = {
  1: [[0.5, 0.5]],
  2: [
    [0.3, 0.5],
    [0.7, 0.5],
  ],
  3: [
    [0.5, 0.25],
    [0.25, 0.72],
    [0.75, 0.72],
  ],
  4: [
    [0.28, 0.28],
    [0.72, 0.28],
    [0.28, 0.72],
    [0.72, 0.72],
  ],
  5: [
    [0.28, 0.28],
    [0.72, 0.28],
    [0.5, 0.5],
    [0.28, 0.72],
    [0.72, 0.72],
  ],
  6: [
    [0.28, 0.22],
    [0.72, 0.22],
    [0.28, 0.5],
    [0.72, 0.5],
    [0.28, 0.78],
    [0.72, 0.78],
  ],
  7: [
    [0.5, 0.15],
    [0.2, 0.35],
    [0.8, 0.35],
    [0.35, 0.6],
    [0.65, 0.6],
    [0.2, 0.82],
    [0.8, 0.82],
  ],
  8: [
    [0.22, 0.18],
    [0.78, 0.18],
    [0.5, 0.32],
    [0.18, 0.5],
    [0.82, 0.5],
    [0.5, 0.68],
    [0.22, 0.82],
    [0.78, 0.82],
  ],
}

function getPlayer(owner: number | null): PlayerConfig | null {
  if (owner === null) {
    return null
  }

  return props.players.find((player) => player.id === owner) ?? null
}

function getDotColor(color: PlayerColor | null): string {
  return color ? color.light : 'rgba(109, 231, 255, 0.9)'
}

function getDotGlow(color: PlayerColor | null): string {
  return color ? color.primary : 'rgba(109, 231, 255, 0.5)'
}

function getDotRadius(load: number): number {
  if (load <= 3) {
    return 0.085
  }
  if (load <= 6) {
    return 0.075
  }
  return 0.065
}

function getDotPositions(load: number): readonly DotPosition[] {
  const clamped = Math.min(Math.max(load, 0), 8)
  return DOT_LAYOUTS[clamped] ?? []
}

const boardColumnCount = computed(() => props.board[0]?.length ?? 0)
const lastMovePlayer = computed(() =>
  props.lastMoveIndicator ? getPlayer(props.lastMoveIndicator.playerId) : null,
)

function isLastMoveCell(cell: Cell): boolean {
  return (
    props.lastMoveIndicator?.row === cell.row &&
    props.lastMoveIndicator?.col === cell.col
  )
}

function isExplodingCell(cell: Cell): boolean {
  return props.explodingCells.has(`${cell.row}-${cell.col}`)
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
              'is-empty': cell.owner === null,
              'is-owned': cell.owner !== null,
              'is-disabled': !isCellPlayable(cell.row, cell.col),
              'is-playable': isCellPlayable(cell.row, cell.col),
              'is-last-move': isLastMoveCell(cell),
              'is-exploding': isExplodingCell(cell),
            }"
            :style="
              {
                ...(getPlayer(cell.owner)
                  ? {
                      '--cell-primary': getPlayer(cell.owner)?.color.primary,
                      '--cell-light': getPlayer(cell.owner)?.color.light,
                      '--cell-dark': getPlayer(cell.owner)?.color.dark,
                    }
                  : {}),
                ...(isLastMoveCell(cell) && lastMovePlayer
                  ? {
                      '--last-move-primary': lastMovePlayer.color.primary,
                      '--last-move-light': lastMovePlayer.color.light,
                    }
                  : {}),
              }
            "
            type="button"
            :disabled="!isCellPlayable(cell.row, cell.col)"
            @click="emit('play-cell', { row: cell.row, col: cell.col })"
          >
            <span
              v-if="isLastMoveCell(cell)"
              class="last-move-ring"
              aria-hidden="true"
            />
            <span
              v-if="isExplodingCell(cell)"
              class="explosion-burst"
              aria-hidden="true"
            />
            <svg
              v-if="cell.load > 0"
              class="load-dots"
              viewBox="0 0 1 1"
              aria-hidden="true"
            >
              <circle
                v-for="([cx, cy], dotIndex) in getDotPositions(cell.load)"
                :key="dotIndex"
                :cx="cx"
                :cy="cy"
                :r="getDotRadius(cell.load)"
                :fill="getDotColor(getPlayer(cell.owner)?.color ?? null)"
                :style="{
                  filter: `drop-shadow(0 0 0.04px ${getDotGlow(getPlayer(cell.owner)?.color ?? null)})`,
                }"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.board-panel {
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  padding: clamp(0.75rem, 1.3vw, 1.1rem);
  overflow: hidden;
}

.board-stage {
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  container-type: size;
  display: flex;
  align-items: center;
  justify-content: center;
}

.board-grid {
  --board-grid-gap: 0.26rem;
  --board-grid-padding: 0.65rem;
  display: grid;
  grid-auto-rows: 1fr;
  gap: var(--board-grid-gap);
  padding: var(--board-grid-padding);
  width: min(100cqw, 100cqh, var(--board-size-limit, 46rem));
  height: min(100cqw, 100cqh, var(--board-size-limit, 46rem));
  border-radius: 1.35rem;
  background:
    linear-gradient(160deg, rgba(80, 100, 220, 0.14), rgba(14, 23, 53, 0.5)),
    rgba(4, 8, 20, 0.96);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.07),
    inset 0 0 60px rgba(60, 80, 180, 0.08);
  transition: opacity 300ms ease;
}

.board-grid--idle {
  opacity: 0.9;
}

.board-row {
  display: grid;
  gap: var(--board-grid-gap);
}

.board-cell {
  --cell-primary: var(--accent);
  --cell-light: rgba(109, 231, 255, 0.34);
  --cell-dark: #143247;
  --last-move-primary: var(--accent);
  --last-move-light: rgba(109, 231, 255, 0.34);
  aspect-ratio: 1;
  position: relative;
  isolation: isolate;
  display: grid;
  place-items: center;
  min-inline-size: 1.8rem;
  min-block-size: 1.8rem;
  border: 1px solid rgba(255, 255, 255, 0.055);
  border-radius: 0.7rem;
  overflow: hidden;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.07), transparent 55%),
    rgba(10, 16, 36, 0.88);
  color: var(--text-main);
  cursor: pointer;
  transition:
    transform 140ms ease,
    border-color 140ms ease,
    box-shadow 140ms ease,
    opacity 140ms ease;
}

.board-cell.is-playable:hover {
  transform: translateY(-1px) scale(1.04);
  border-color: rgba(109, 231, 255, 0.42);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(109, 231, 255, 0.08);
  background:
    radial-gradient(circle at 30% 20%, rgba(109, 231, 255, 0.07), transparent 55%),
    rgba(12, 20, 44, 0.95);
}

.board-cell.is-owned {
  border-color: color-mix(in srgb, var(--cell-primary) 55%, transparent);
  background:
    radial-gradient(circle at 25% 20%, color-mix(in srgb, var(--cell-light) 55%, transparent), transparent 58%),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--cell-primary) 22%, #0b1120),
      color-mix(in srgb, var(--cell-dark) 80%, #050a14)
    );
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--cell-light) 28%, transparent),
    0 0 10px color-mix(in srgb, var(--cell-primary) 10%, transparent);
}

.board-cell.is-owned.is-playable:hover {
  border-color: color-mix(in srgb, var(--cell-primary) 85%, white);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--cell-light) 40%, transparent),
    0 4px 18px color-mix(in srgb, var(--cell-primary) 20%, transparent);
}

.board-cell.is-disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.board-cell.is-exploding {
  animation: cell-explode 220ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.load-dots {
  position: relative;
  z-index: 2;
  width: 64%;
  height: 64%;
  overflow: visible;
}

.last-move-ring {
  position: absolute;
  inset: 0.15rem;
  z-index: 1;
  border-radius: calc(0.7rem - 0.1rem);
  border: 2px solid color-mix(in srgb, var(--last-move-primary) 90%, white);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.2),
    0 0 14px color-mix(in srgb, var(--last-move-primary) 55%, transparent),
    inset 0 0 8px color-mix(in srgb, var(--last-move-light) 28%, transparent);
  pointer-events: none;
  animation: last-move-ring-intro 280ms cubic-bezier(0.24, 1.35, 0.38, 1) both;
}

.explosion-burst {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.28), transparent 60%);
  pointer-events: none;
  animation: burst-fade 260ms ease-out both;
}

@keyframes last-move-ring-intro {
  0% {
    transform: scale(0.78);
    opacity: 0;
  }

  72% {
    transform: scale(1.06);
    opacity: 1;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes burst-fade {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@keyframes cell-explode {
  0% {
    transform: scale(0.88);
    filter: brightness(1.8) saturate(1.4);
  }

  55% {
    transform: scale(1.1);
    filter: brightness(1.3) saturate(1.2);
  }

  100% {
    transform: scale(1);
    filter: brightness(1) saturate(1);
  }
}

@media (max-height: 860px) {
  .board-grid {
    --board-grid-gap: 0.22rem;
    --board-grid-padding: 0.52rem;
  }
}

@media (max-width: 720px), (max-height: 520px) {
  .board-panel {
    padding: 0.55rem;
  }

  .board-grid {
    --board-grid-gap: 0.2rem;
    --board-grid-padding: 0.42rem;
    border-radius: 1.1rem;
  }

  .board-cell {
    border-radius: 0.5rem;
  }

  .last-move-ring {
    inset: 0.14rem;
    border-radius: calc(0.5rem - 0.1rem);
  }
}
</style>
