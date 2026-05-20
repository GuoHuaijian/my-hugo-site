<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const active = ref(false)
const src = ref('')
const alt = ref('')
const touchStartY = ref(0)

function openImage(imgSrc, imgAlt) {
  src.value = imgSrc
  alt.value = imgAlt || ''
  active.value = true
  document.body.style.overflow = 'hidden'
}

function close() {
  active.value = false
  src.value = ''
  document.body.style.overflow = ''
}

function onKeyDown(e) {
  if (e.key === 'Escape' && active.value) close()
}

function onLightboxEvent(e) {
  openImage(e.detail.src, e.detail.alt)
}

function onTouchStart(e) {
  touchStartY.value = e.touches[0].clientY
}

function onTouchEnd(e) {
  const deltaY = e.changedTouches[0].clientY - touchStartY.value
  // Swipe down more than 80px → close
  if (deltaY > 80) close()
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('open-lightbox', onLightboxEvent)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('open-lightbox', onLightboxEvent)
  document.body.style.overflow = ''
})

defineExpose({ openImage })
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div v-if="active" class="lightbox-overlay" @click.self="close" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd" role="dialog" aria-modal="true" aria-label="图片预览">
        <button class="lightbox-close" type="button" aria-label="关闭预览" @click="close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <img :src="src" :alt="alt" class="lightbox-image" @click.self="close" />
        <p v-if="alt" class="lightbox-caption">{{ alt }}</p>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  padding: 48px 24px;
}

.lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-image {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
}

.lightbox-caption {
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: var(--text-sm);
  text-align: center;
  max-width: 600px;
}

/* Transitions */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 250ms ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-active .lightbox-image,
.lightbox-leave-active .lightbox-image {
  transition: transform 250ms ease;
}

.lightbox-enter-from .lightbox-image,
.lightbox-leave-to .lightbox-image {
  transform: scale(0.92);
}
</style>
