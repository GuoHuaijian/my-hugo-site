<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const canvas = ref(null)
let animation = 0
let particles = []
let pointer = { x: -9999, y: -9999 }

function getAccentRgb() {
  const val = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-rgb').trim()
  return val || '91, 106, 191'
}

function resize(ctx) {
  const ratio = window.devicePixelRatio || 1
  const rect = canvas.value.getBoundingClientRect()
  canvas.value.width = rect.width * ratio
  canvas.value.height = rect.height * ratio
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
}

function makeParticles() {
  const rect = canvas.value.getBoundingClientRect()
  particles = Array.from({ length: 24 }, () => ({
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    r: 2 + Math.random() * 4,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    phase: Math.random() * Math.PI * 2
  }))
}

function draw(ctx) {
  const rect = canvas.value.getBoundingClientRect()
  ctx.clearRect(0, 0, rect.width, rect.height)
  const rgb = getAccentRgb()
  particles.forEach((p, index) => {
    const dx = p.x - pointer.x
    const dy = p.y - pointer.y
    const dist = Math.hypot(dx, dy)
    if (dist < 130) {
      p.x += (dx / Math.max(dist, 1)) * 0.6
      p.y += (dy / Math.max(dist, 1)) * 0.6
    }
    p.x += p.vx
    p.y += p.vy
    if (p.x < 0 || p.x > rect.width) p.vx *= -1
    if (p.y < 0 || p.y > rect.height) p.vy *= -1
    const alpha = 0.28 + Math.sin(Date.now() / 1200 + p.phase) * 0.16
    ctx.beginPath()
    ctx.fillStyle = `rgba(${rgb}, ${alpha})`
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
    for (let j = index + 1; j < particles.length; j += 1) {
      const other = particles[j]
      const gap = Math.hypot(p.x - other.x, p.y - other.y)
      if (gap < 120) {
        ctx.strokeStyle = `rgba(${rgb}, ${0.08 * (1 - gap / 120)})`
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(other.x, other.y)
        ctx.stroke()
      }
    }
  })
  animation = requestAnimationFrame(() => draw(ctx))
}

function onPointerMove(event) {
  const rect = canvas.value.getBoundingClientRect()
  pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

onMounted(() => {
  const ctx = canvas.value.getContext('2d')
  resize(ctx)
  makeParticles()
  draw(ctx)
  window.addEventListener('resize', () => {
    resize(ctx)
    makeParticles()
  })
})

onUnmounted(() => cancelAnimationFrame(animation))
</script>

<template>
  <canvas ref="canvas" class="particles" aria-hidden="true" @pointermove="onPointerMove"></canvas>
</template>

<style scoped>
.particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
