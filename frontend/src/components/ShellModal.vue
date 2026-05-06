<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    title?: string
    eyebrow?: string
    description?: string
    dismissible?: boolean
    closeOnBackdrop?: boolean
  }>(),
  {
    title: undefined,
    eyebrow: 'Game Flow',
    description: undefined,
    dismissible: true,
    closeOnBackdrop: true,
  },
)

const emit = defineEmits<{
  (event: 'close'): void
}>()

const panelRef = ref<HTMLElement | null>(null)
const previousFocusedElement = ref<HTMLElement | null>(null)
const eyebrowId = `modal-eyebrow-${Math.random().toString(36).slice(2, 8)}`
const titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`
const descriptionId = `modal-description-${Math.random().toString(36).slice(2, 8)}`
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function requestClose() {
  if (props.dismissible) {
    emit('close')
  }
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget && props.dismissible && props.closeOnBackdrop) {
    emit('close')
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    trapFocus(event)
    return
  }

  if (event.key === 'Escape' && props.dismissible) {
    event.preventDefault()
    emit('close')
  }
}

function isFocusable(element: HTMLElement): boolean {
  return (
    !element.hasAttribute('disabled') &&
    element.getAttribute('aria-hidden') !== 'true' &&
    element.getClientRects().length > 0
  )
}

function getFocusableElements(): HTMLElement[] {
  if (!panelRef.value) {
    return []
  }

  return Array.from(panelRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isFocusable)
}

function focusInitialTarget() {
  const [firstFocusableElement] = getFocusableElements()

  if (firstFocusableElement) {
    firstFocusableElement.focus()
    return
  }

  panelRef.value?.focus()
}

function trapFocus(event: KeyboardEvent) {
  const focusableElements = getFocusableElements()
  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null

  if (focusableElements.length === 0) {
    event.preventDefault()
    panelRef.value?.focus()
    return
  }

  const firstFocusableElement = focusableElements[0]
  const lastFocusableElement = focusableElements[focusableElements.length - 1]
  const focusIsInsidePanel = activeElement !== null && panelRef.value?.contains(activeElement)

  if (event.shiftKey) {
    if (!focusIsInsidePanel || activeElement === firstFocusableElement) {
      event.preventDefault()
      lastFocusableElement.focus()
    }

    return
  }

  if (!focusIsInsidePanel || activeElement === lastFocusableElement) {
    event.preventDefault()
    firstFocusableElement.focus()
  }
}

onMounted(() => {
  previousFocusedElement.value = document.activeElement instanceof HTMLElement ? document.activeElement : null

  nextTick(() => {
    focusInitialTarget()
  })
})

onUnmounted(() => {
  previousFocusedElement.value?.focus()
})
</script>

<template>
  <div
    class="modal-overlay"
    role="presentation"
    @click="handleBackdropClick"
    @keydown="handleKeydown"
  >
    <section
      ref="panelRef"
      class="modal-panel panel"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="title ? titleId : eyebrow ? eyebrowId : undefined"
      :aria-describedby="description ? descriptionId : undefined"
      tabindex="-1"
    >
      <header class="modal-header">
        <div class="modal-copy">
          <p
            v-if="eyebrow"
            :id="eyebrowId"
            class="eyebrow"
          >
            {{ eyebrow }}
          </p>
          <h2
            v-if="title"
            :id="titleId"
          >
            {{ title }}
          </h2>
          <p
            v-if="description"
            :id="descriptionId"
            class="modal-description"
          >
            {{ description }}
          </p>
        </div>

        <button
          v-if="dismissible"
          class="close-button"
          type="button"
          aria-label="Close dialog"
          @click="requestClose"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <div class="modal-content">
        <slot />
      </div>
    </section>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding:
    max(1rem, calc(var(--safe-top) + 0.4rem))
    max(1rem, calc(var(--safe-right) + 0.5rem))
    max(1rem, calc(var(--safe-bottom) + 0.5rem))
    max(1rem, calc(var(--safe-left) + 0.5rem));
  background:
    radial-gradient(circle at 50% 24%, rgba(93, 232, 255, 0.12), transparent 38%),
    rgba(1, 3, 10, 0.78);
  backdrop-filter: blur(18px) saturate(1.15);
}

.modal-panel {
  width: min(100%, 52rem);
  max-height: min(100%, 56rem);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 1rem;
  overflow: hidden;
  border-color: rgba(93, 232, 255, 0.3);
  box-shadow:
    0 26px 78px rgba(0, 0, 0, 0.56),
    0 0 42px rgba(93, 232, 255, 0.12),
    0 0 54px rgba(255, 91, 215, 0.08),
    inset 0 0 28px rgba(39, 136, 255, 0.06);
}

.modal-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
}

.modal-copy {
  display: grid;
  gap: 0.45rem;
}

.eyebrow {
  margin: 0;
  color: var(--accent);
  font-size: 0.78rem;
  letter-spacing: 0;
  text-transform: uppercase;
  text-shadow: 0 0 12px rgba(93, 232, 255, 0.18);
}

h2,
p {
  margin: 0;
}

h2 {
  font-size: clamp(1.45rem, 2.4vw, 2rem);
}

.modal-description {
  color: var(--text-soft);
  line-height: 1.5;
}

.close-button {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid rgba(93, 232, 255, 0.22);
  border-radius: 0.45rem;
  background:
    linear-gradient(135deg, rgba(93, 232, 255, 0.1), rgba(255, 91, 215, 0.07)),
    rgba(5, 12, 30, 0.9);
  color: var(--text-main);
  font-size: 1.35rem;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.close-button:hover,
.close-button:focus-visible {
  transform: translateY(-1px);
  border-color: rgba(255, 229, 138, 0.58);
  box-shadow: 0 0 22px rgba(255, 122, 47, 0.14);
}

.modal-content {
  min-height: 0;
  display: grid;
  overflow: auto;
  padding-right: 0.2rem;
}

.modal-content :deep(.setup-card) {
  height: 100%;
  min-height: 0;
}

.modal-content :deep(.warning-dialog) {
  overflow: auto;
}

@media (max-width: 720px) {
  .modal-overlay {
    padding: 0.65rem;
  }

  .modal-panel {
    gap: 0.85rem;
  }

  .close-button {
    width: 2.3rem;
    height: 2.3rem;
  }
}

@media (max-width: 720px), (max-height: 520px) {
  .modal-overlay {
    padding:
      max(0.65rem, calc(var(--safe-top) + 0.35rem))
      max(0.65rem, calc(var(--safe-right) + 0.4rem))
      max(0.65rem, calc(var(--safe-bottom) + 0.4rem))
      max(0.65rem, calc(var(--safe-left) + 0.4rem));
  }

  .modal-panel {
    gap: 0.75rem;
  }

  .modal-copy {
    gap: 0.35rem;
  }

  h2 {
    font-size: clamp(1.2rem, 3vw, 1.6rem);
  }

  .modal-description {
    font-size: 0.92rem;
    line-height: 1.45;
  }

  .modal-content {
    padding-right: 0.12rem;
  }
}
</style>
