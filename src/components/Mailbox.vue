<script setup>
import { ref, computed, onMounted } from 'vue'
import { Mail, Send, Calendar, User, Heart, Trash2, PenLine, X } from 'lucide-vue-next'
import { getVisitorId } from '../utils/visitor'
import siteConfig from '../../content/site-config.json'

const API_BASE = siteConfig.analytics?.baseApi || ''
const STORAGE_KEY = 'yunbian_mailbox_cards'

const postcards = ref([])
const showCompose = ref(false)
const sender = ref('')
const content = ref('')
const bgType = ref('orange')
const stamp = ref('✉️ 故乡的云')
const message = ref('')
const likedCards = ref({})

const shuffledPostcards = computed(() => {
  const arr = [...postcards.value]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
})

const stampsList = [
  '✉️ 故乡的云',
  '🚜 拖拉机',
  '🌙 晚风轻',
  '🌾 稻麦香',
  '⭐ 满天星',
  '🍊 晚霞橘'
]

const bgOptions = [
  { type: 'orange', label: '晚霞橙' },
  { type: 'yellow', label: '暖黄' },
  { type: 'green', label: '山林绿' },
  { type: 'blue', label: '天空蓝' },
  { type: 'pink', label: '桃花粉' },
  { type: 'purple', label: '暮云紫' }
]

onMounted(async () => {
  try {
    const savedLikes = localStorage.getItem('yunbian_mailbox_likes')
    if (savedLikes) likedCards.value = JSON.parse(savedLikes)
  } catch {}

  try {
    const r = await fetch(`${API_BASE}/api/postcards`)
    if (r.ok) {
      postcards.value = await r.json()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(postcards.value))
      return
    }
  } catch {}

  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    postcards.value = saved ? JSON.parse(saved) : []
  } catch {
    postcards.value = []
  }
})

function updateLocal(updated) {
  postcards.value = updated
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

function openCompose() {
  showCompose.value = true
  message.value = ''
}

function closeCompose() {
  showCompose.value = false
  message.value = ''
}

async function handleSubmit() {
  if (!sender.value.trim() || !content.value.trim()) {
    message.value = '请填齐名字和寄语哦，外婆的邮筒才收得下。'
    return
  }

  const newCard = {
    id: `custom-${Date.now()}`,
    sender: sender.value.trim(),
    content: content.value.trim(),
    date: new Date().toISOString().split('T')[0],
    bgType: bgType.value,
    stamp: stamp.value,
    visitorId: getVisitorId()
  }

  updateLocal([newCard, ...postcards.value])

  try {
    await fetch(`${API_BASE}/api/postcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCard)
    })
  } catch {}

  sender.value = ''
  content.value = ''
  message.value = '寄信成功！邮筒发出叮咚一声，信已送达货架。'

  setTimeout(() => {
    message.value = ''
    showCompose.value = false
  }, 500)
}

function isMine(card) {
  return card.id.startsWith('custom-') && card.visitorId === getVisitorId()
}

async function handleDelete(id) {
  if (!isMine(postcards.value.find(c => c.id === id))) return

  updateLocal(postcards.value.filter(c => c.id !== id))

  try {
    await fetch(`${API_BASE}/api/postcards/${id}`, { method: 'DELETE' })
  } catch {}
}

function toggleLike(id) {
  likedCards.value = { ...likedCards.value, [id]: !likedCards.value[id] }
  localStorage.setItem('yunbian_mailbox_likes', JSON.stringify(likedCards.value))
}
</script>

<template>
  <section class="mailbox">
    <div class="postcards-head">
      <h2>📮 货架上的信件墙</h2>
      <div class="head-right">
        <span class="count-badge">已收录 {{ postcards.length }} 张</span>
        <button class="btn primary compose-trigger" @click="openCompose">
          <PenLine :size="16" aria-hidden="true" />
          <span>留下字条</span>
        </button>
      </div>
    </div>

    <div class="postcards-grid">
      <TransitionGroup name="card-list">
        <article
          v-for="card in shuffledPostcards"
          :key="card.id"
          :class="['postcard', `postcard-${card.bgType}`]"
        >
          <div class="postcard-stamp">
            <div class="stamp-inner">
              <span class="stamp-emoji">{{ card.stamp.split(' ')[0] }}</span>
              <span class="stamp-text">{{ card.stamp.split(' ')[1] }}</span>
            </div>
            <div class="postmark">YUNBIAN 2026</div>
          </div>

          <div class="postcard-content">
            <p class="card-text">{{ card.content }}</p>
          </div>

          <div class="postcard-footer">
            <div class="card-meta">
              <span class="card-sender">From: {{ card.sender }}</span>
              <span class="card-date">
                <Calendar :size="12" aria-hidden="true" />
                {{ card.date }}
              </span>
            </div>
            <div class="card-actions">
              <button
                :class="['action-btn', 'like-btn', { liked: likedCards[card.id] }]"
                title="点赞温情字条"
                @click="toggleLike(card.id)"
              >
                <Heart :size="14" :class="{ 'fill-icon': likedCards[card.id] }" />
              </button>
              <button
                v-if="isMine(card)"
                class="action-btn delete-btn"
                    title="撕掉字条"
                @click="handleDelete(card.id)"
              >
                <Trash2 :size="13" />
              </button>
            </div>
          </div>

          <span class="postcard-watermark"># 云边有个小卖部</span>
        </article>
      </TransitionGroup>

      <div v-if="postcards.length === 0" class="empty-state">
        <Mail :size="48" aria-hidden="true" />
        <p>邮筒空荡荡的，微风正从里面穿过...</p>
            <p class="empty-hint">留下一张字条作为这间小卖部的第一封信吧！</p>
      </div>
    </div>

    <!-- Compose Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCompose" class="modal-overlay" @click.self="closeCompose">
          <div class="modal-dialog card" role="dialog" aria-label="留下字条">
            <div class="modal-head">
              <div class="modal-head-left">
                <Mail :size="18" aria-hidden="true" />
                <h2>留下一张字条</h2>
              </div>
              <button class="modal-close" aria-label="关闭" @click="closeCompose">
                <X :size="20" />
              </button>
            </div>

            <form class="compose-form" @submit.prevent="handleSubmit">
              <div class="field">
                <label>寄信人</label>
                <div class="input-wrap">
                  <User :size="15" aria-hidden="true" />
                  <input
                    v-model="sender"
                    type="text"
                    maxlength="15"
                    placeholder="如：迷路的程序员、十三的猫"
                  />
                </div>
              </div>

              <div class="field">
                <label>字条内容</label>
                <textarea
                  v-model="content"
                  rows="4"
                  maxlength="140"
                  placeholder="邮筒亮着灯，写给路过的人，也写给自己...（140字以内）"
                ></textarea>
              </div>

              <div class="field">
                <label>信纸颜色</label>
                <div class="color-picker">
                  <button
                    v-for="opt in bgOptions"
                    :key="opt.type"
                    type="button"
                    :class="['color-dot', `dot-${opt.type}`, { active: bgType === opt.type }]"
                    :title="opt.label"
                    @click="bgType = opt.type"
                  >
                    <span v-if="bgType === opt.type" class="dot-check">✓</span>
                  </button>
                </div>
              </div>

              <div class="field">
                <label>邮戳邮票</label>
                <div class="stamp-grid">
                  <button
                    v-for="s in stampsList"
                    :key="s"
                    type="button"
                    :class="['stamp-btn', { active: stamp === s }]"
                    @click="stamp = s"
                  >{{ s }}</button>
                </div>
              </div>

              <Transition name="fade">
                <p v-if="message" class="form-message">{{ message }}</p>
              </Transition>

              <button type="submit" class="btn primary submit-btn">
                <Send :size="16" aria-hidden="true" />
                <span>投入云边邮筒</span>
              </button>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.mailbox {
  display: grid;
  gap: clamp(24px, 4vw, 36px);
}

/* ── Postcards Head ── */
.postcards-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.postcards-head h2 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.head-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.count-badge {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: var(--color-accent-light);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
}

.compose-trigger {
  gap: 6px;
  padding: 0 16px;
}

/* ── Postcards Grid ── */
.postcards-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px 16px;
  align-items: start;
  min-height: 200px;
}

/* ── Sticky Note ── */
.postcard {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 210px;
  min-height: 180px;
  padding: 28px 16px 14px;
  border-radius: 2px;
  box-shadow:
    2px 3px 8px rgba(0, 0, 0, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.1);
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  transform-origin: top center;
}

/* round push pin */
.postcard::before {
  content: '';
  position: absolute;
  top: -7px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  background:
    radial-gradient(circle at 38% 35%, rgba(255, 255, 255, 0.7) 0%, transparent 45%),
    radial-gradient(circle at 50% 50%, #ef4444, #b91c1c);
  border-radius: 50%;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.35),
    0 1px 1px rgba(0, 0, 0, 0.2),
    inset 0 -2px 3px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.postcard::after {
  content: '';
  position: absolute;
  top: 7px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 4px;
  background: #6b7280;
  border-radius: 0 0 1px 1px;
  box-shadow: 0 5px 3px -2px rgba(0, 0, 0, 0.12);
  z-index: 1;
}

.postcard:nth-child(6n+1) { transform: rotate(-5deg) translateY(14px); }
.postcard:nth-child(6n+2) { transform: rotate(4.5deg) translateY(-22px) scale(0.97); }
.postcard:nth-child(6n+3) { transform: rotate(-2.5deg) translateY(26px); }
.postcard:nth-child(6n+4) { transform: rotate(6deg) translateY(-12px) scale(1.02); }
.postcard:nth-child(6n+5) { transform: rotate(-5.5deg) translateY(18px); }
.postcard:nth-child(6n+6) { transform: rotate(3.5deg) translateY(-26px) scale(0.98); }
.postcard:nth-child(8n+1) { margin-left: -10px; }
.postcard:nth-child(8n+3) { margin-left: 14px; margin-top: -8px; }
.postcard:nth-child(8n+5) { margin-right: -10px; margin-top: 8px; }
.postcard:nth-child(8n+7) { margin-left: -16px; margin-right: 12px; }
.postcard:nth-child(10n+2) { margin-top: -12px; }
.postcard:nth-child(10n+7) { margin-top: 10px; margin-left: 8px; }

.postcard:hover {
  transform: rotate(0deg) translateY(-6px) scale(1.02);
  box-shadow:
    4px 8px 20px rgba(0, 0, 0, 0.2),
    0 2px 6px rgba(0, 0, 0, 0.12);
  z-index: 2;
}

.postcard-orange {
  background: #fff3e0;
  color: #7c2d12;
}

.postcard-yellow {
  background: #fff9c4;
  color: #713f12;
}

.postcard-green {
  background: #e8f5e9;
  color: #14532d;
}

.postcard-blue {
  background: #e3f2fd;
  color: #1e3a5f;
}

.postcard-pink {
  background: #fce4ec;
  color: #880e4f;
}

.postcard-purple {
  background: #f3e5f5;
  color: #4a148c;
}

/* ── Stamp & Postmark ── */
.postcard-stamp {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}

.stamp-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3px 5px;
  border: 1.5px dashed currentColor;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.55);
  opacity: 0.45;
  transform: rotate(8deg);
  font-size: 8px;
  line-height: 1.2;
  letter-spacing: 0.04em;
}

.stamp-emoji {
  font-size: 12px;
  line-height: 1;
}

.stamp-text {
  font-size: 8px;
}

.postmark {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 40px;
  height: 40px;
  border: 1px dashed currentColor;
  border-radius: 50%;
  opacity: 0.12;
  display: grid;
  place-items: center;
  font-size: 6px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transform: rotate(12deg);
}

/* ── Postcard Content ── */
.postcard-content {
  flex: 1;
  padding-top: 4px;
}

.card-text {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.85;
  letter-spacing: 0.02em;
}

/* ── Postcard Footer ── */
.postcard-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 10px;
  margin-top: 12px;
  border-top: 1px solid currentColor;
  border-color: rgba(0, 0, 0, 0.06);
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-sender {
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.02em;
}

.card-date {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  opacity: 0.5;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  opacity: 0.35;
  cursor: pointer;
  transition: opacity var(--transition-base), background var(--transition-base), color var(--transition-base);
}

.action-btn:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.06);
}

.like-btn.liked {
  opacity: 1;
  color: #e11d48;
}

.like-btn.liked:hover {
  background: rgba(225, 29, 72, 0.08);
}

.fill-icon {
  fill: currentColor;
}

.delete-btn:hover {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
}

.postcard-watermark {
  position: absolute;
  bottom: 3px;
  right: 6px;
  font-size: 7px;
  opacity: 0;
  letter-spacing: 0.04em;
  transition: opacity var(--transition-base);
}

.postcard:hover .postcard-watermark {
  opacity: 0.2;
}

/* ── Empty State ── */
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-10);
  text-align: center;
  color: var(--color-text-tertiary);
}

.empty-state svg {
  color: var(--color-accent);
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.8;
}

.empty-hint {
  font-size: var(--text-xs) !important;
  opacity: 0.7;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--color-overlay);
  backdrop-filter: blur(4px);
}

.modal-dialog {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: calc(100dvh - 48px);
  overflow-y: auto;
  padding: var(--space-6);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.modal-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-head-left svg {
  color: var(--color-accent);
}

.modal-head-left h2 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: background var(--transition-base), color var(--transition-base);
}

.modal-close:hover {
  background: var(--color-accent-light);
  color: var(--color-text-primary);
}

/* ── Compose Form ── */
.compose-form {
  display: grid;
  gap: var(--space-5);
}

.field label {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: 0.02em;
}

.input-wrap {
  position: relative;
}

.input-wrap svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
}

.input-wrap input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(var(--color-bg-secondary-rgb), 0.4);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  transition: border-color var(--transition-base);
}

.input-wrap input:focus {
  outline: none;
  border-color: var(--color-accent);
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: rgba(var(--color-bg-secondary-rgb), 0.4);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  line-height: 1.8;
  resize: none;
  transition: border-color var(--transition-base);
}

textarea::placeholder {
  color: var(--color-text-tertiary);
}

textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

/* ── Color Picker ── */
.color-picker {
  display: flex;
  gap: 12px;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.color-dot:hover {
  transform: scale(1.1);
}

.color-dot.active {
  box-shadow: 0 0 0 2px var(--color-bg-card), 0 0 0 4px var(--color-accent);
  transform: scale(1.12);
}

.dot-check {
  font-size: 11px;
  color: var(--color-text-primary);
  font-weight: 700;
}

.dot-orange { background: #fed7aa; }
.dot-yellow { background: #fde68a; }
.dot-green { background: #a7f3d0; }
.dot-blue { background: #bae6fd; }
.dot-pink { background: #f9a8d4; }
.dot-purple { background: #d8b4fe; }

/* ── Stamp Selector ── */
.stamp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stamp-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 6px;
  border: 1.5px dashed var(--color-border);
  border-radius: 4px;
  background: rgba(var(--color-bg-secondary-rgb), 0.3);
  color: var(--color-text-secondary);
  font-size: 11px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-base);
}

.stamp-btn::before {
  content: '';
  position: absolute;
  inset: 3px;
  border: 1px solid transparent;
  border-radius: 2px;
  transition: border-color var(--transition-base);
}

.stamp-btn:hover {
  background: rgba(var(--color-bg-secondary-rgb), 0.7);
  transform: translateY(-1px);
}

.stamp-btn:hover::before {
  border-color: var(--color-border);
}

.stamp-btn.active {
  border-color: var(--color-accent);
  border-style: solid;
  background: rgba(var(--color-accent-rgb), 0.06);
  color: var(--color-accent);
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(var(--color-accent-rgb), 0.12);
}

.stamp-btn.active::before {
  border-color: rgba(var(--color-accent-rgb), 0.2);
}

/* ── Form Message ── */
.form-message {
  margin: 0;
  padding: 10px 14px;
  border: 1px solid rgba(var(--color-accent-rgb), 0.2);
  border-radius: var(--radius-md);
  background: rgba(var(--color-accent-rgb), 0.06);
  color: var(--color-accent);
  font-size: var(--text-sm);
  font-weight: 500;
  text-align: center;
}

/* ── Submit Button ── */
.submit-btn {
  width: 100%;
  gap: 8px;
}

/* ── Transitions ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.card-list-enter-active {
  transition: all var(--transition-slow);
}
.card-list-leave-active {
  transition: all var(--transition-base);
}
.card-list-enter-from {
  opacity: 0;
  transform: translateY(-16px) scale(0.96);
}
.card-list-leave-to {
  opacity: 0;
  transform: scale(0.94);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-base);
}
.modal-enter-active .modal-dialog,
.modal-leave-active .modal-dialog {
  transition: transform var(--transition-base), opacity var(--transition-base);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-dialog,
.modal-leave-to .modal-dialog {
  opacity: 0;
  transform: translateY(16px) scale(0.97);
}

/* ── Dark mode adjustments ── */
[data-theme="dark"] .postcard-orange {
  background: rgba(255, 243, 224, 0.12);
  color: #fb923c;
}

[data-theme="dark"] .postcard-yellow {
  background: rgba(255, 249, 196, 0.12);
  color: #fbbf24;
}

[data-theme="dark"] .postcard-green {
  background: rgba(232, 245, 233, 0.1);
  color: #34d399;
}

[data-theme="dark"] .postcard-blue {
  background: rgba(227, 242, 253, 0.1);
  color: #60a5fa;
}

[data-theme="dark"] .postcard-pink {
  background: rgba(252, 228, 236, 0.1);
  color: #f472b6;
}

[data-theme="dark"] .postcard-purple {
  background: rgba(243, 229, 245, 0.1);
  color: #c084fc;
}

[data-theme="dark"] .stamp-inner {
  background: rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] .postcard-footer {
  border-color: rgba(255, 255, 255, 0.06);
}

[data-theme="dark"] .postcard::before {
  background:
    radial-gradient(circle at 38% 35%, rgba(255, 255, 255, 0.4) 0%, transparent 45%),
    radial-gradient(circle at 50% 50%, #f87171, #991b1b);
}

[data-theme="dark"] .postcard::after {
  background: #4b5563;
  box-shadow: 0 5px 3px -2px rgba(0, 0, 0, 0.25);
}

/* ── Responsive ── */
@media (max-width: 960px) {
  .postcards-grid {
    gap: 20px 16px;
  }

  .postcard {
    width: 180px;
  }
}

@media (max-width: 600px) {
  .postcards-grid {
    gap: 18px 14px;
  }

  .postcard {
    width: calc(50% - 10px);
    min-width: 150px;
  }

  .modal-overlay {
    padding: 16px;
    align-items: flex-end;
  }

  .modal-dialog {
    max-width: none;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .stamp-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 380px) {
  .postcard {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .postcard:hover {
    transform: none;
  }

  .card-list-enter-active,
  .card-list-leave-active,
  .fade-enter-active,
  .fade-leave-active,
  .modal-enter-active,
  .modal-leave-active {
    transition: none;
  }
}
</style>
