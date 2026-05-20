<script setup>
import {
  BookOpen,
  BriefcaseBusiness,
  Github,
  Headphones,
  Heart,
  Mail,
  MapPin,
  Moon,
  Sparkles,
  Twitter
} from 'lucide-vue-next'

import portraitImage from '../assets/images/portrait.webp'

const profileTags = ['全栈开发', '云边小卖部', '夜晚写代码']

const profileNotes = [
  ['常驻时段', '夜里'],
  ['偏爱工具', 'IDEA / Claude Code'],
  ['最近状态', '慢慢搭建']
]

const introLead =
    '我不是刘十三，只是一个在现实里认真生活、在代码里慢慢搭建自己世界的人。平时写代码、看书、发呆，也会在忙碌的间隙想一想，什么才是自己真正想去的远方。'

const introParagraphs = [
  '搭建这个博客的时候，我正在读《云边有个小卖部》。书里有个外婆叫王莺莺。开着拖拉机，抽烟，打麻将，守着山边那间小卖部。读着读着，我想起了自己的外婆。不是因为外婆像王莺莺，而是外婆离开后，我才明白——原来每个人心里，都有一个再也回不去的“云边”。',
  '外婆一辈子节约。中学时家里困难，外婆靠卖菜接济我读书。天不亮下山，背篓装满蔬菜，走很远的山路到街上。蹲一整天，舍不得买一口吃的，饿着肚子，直到下午才走回家吃饭。一张张皱巴巴的纸币，攒够了就偷偷塞给我妈，变成我的学费、生活费。后来外婆病了，她怕花钱，一直不肯去医院。高二那年，外婆化作云朵走了。',
  '后来我也像刘十三一样，从小镇到城市，念书，工作，写代码。再回去，小镇还是那个小镇，老屋还是那间老屋，只是推开门，外婆不在了。',
  '所以我愿意把这里叫作云边小卖部。安静、缓慢、永远亮着灯。这里装着外婆教会我的东西，装着那条卖菜的山路，装着旧木门前昏黄的灯光，也装着不肯熄灭的一点念想。'
]

const techStack = [
  'Java',
  'Vue 3',
  'Python',
  'Markdown',
  'MySQL',
  'Spring '
]

const logs = [
  ['2026 - Present', '云边小卖部 2.0 装修完毕，引入全新的极简主义设计系统。'],
  ['2020 - 2025', '深耕后端领域，参与多个企业级项目架构与开发，积攒了第一批"货源"。'],
  ['2019', '敲下第一行 Hello World，小卖部正式拿到营业执照。']
]

const hobbies = [
  { icon: BookOpen, title: '读书', text: '在故事里找路，也在技术书里找答案。' },
  { icon: Headphones, title: '音乐', text: '非主流、民谣，或者凌晨两点的播放列表。' },
  { icon: Moon, title: '夜晚写代码', text: '夜深以后，世界安静，思路偶尔也会变清楚。' }
]

const contacts = [
  {
    icon: Github,
    label: 'GitHub',
    value: 'github.com',
    href: 'https://github.com/GuoHuaijian',
    external: true
  },
  {
    icon: Twitter,
    label: 'Twitter',
    value: 'twitter.com',
    href: 'https://twitter.com',
    external: true
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'guohuaijian9527@gmail.com',
    href: 'mailto:guohuaijian9527@gmail.com',
    external: false
  }
]
</script>

<template>
  <section class="page-shell about">
    <header class="page-heading hero-heading">
      <p class="eyebrow">ABOUT</p>
      <h1>刘十三</h1>
      <p class="subtitle">在云边镇写代码的人</p>
    </header>

    <section class="intro-block">
      <aside class="intro-aside">
        <div class="portrait-frame" aria-hidden="true">
          <div class="portrait">
            <img :src="portraitImage" alt="头像" />
          </div>
        </div>

        <div class="profile-tags">
          <span v-for="tag in profileTags" :key="tag">{{ tag }}</span>
        </div>

        <dl class="profile-notes">
          <div v-for="[label, value] in profileNotes" :key="label" class="profile-row">
            <dt>{{ label }}</dt>
            <dd>{{ value }}</dd>
          </div>
        </dl>
      </aside>

      <div class="intro-main">
        <p class="section-kicker">关于小卖部 · 与外婆</p>
        <h2>你好呀，欢迎来到我的小卖部。</h2>
        <p class="intro-lead">{{ introLead }}</p>

        <div class="intro-columns">
          <p v-for="(paragraph, index) in introParagraphs" :key="index">
            {{ paragraph }}
          </p>
        </div>

        <blockquote class="story-quote">
          <p>
            无论身在何方，我们终将在云边重逢。<br />
            山这边是刘十三的童年，山那边是外婆的海。<br />
            我不是刘十三，但我也有自己的云边、自己的外婆、自己的小卖部。<br />
            这里装着我的来处，也装着我正在走向的远方；装着少年时的想象，也装着长大以后仍然不肯熄灭的一点微光。
          </p>
          <footer>—— 写给来处，也写给所有心里有“云边”的人</footer>
        </blockquote>
      </div>
    </section>

    <section class="facts-strip" aria-label="个人侧写">
      <article class="fact-item">
        <span class="fact-icon">
          <Moon :size="18" aria-hidden="true" />
        </span>
        <div class="fact-copy">
          <strong>写代码最高效</strong>
          <span>凌晨两点</span>
        </div>
      </article>

      <article class="fact-item">
        <span class="fact-icon">
          <Headphones :size="18" aria-hidden="true" />
        </span>
        <div class="fact-copy">
          <strong>写代码必听</strong>
          <span>民谣 / 纯音乐</span>
        </div>
      </article>

      <article class="fact-item">
        <span class="fact-icon">
          <BookOpen :size="18" aria-hidden="true" />
        </span>
        <div class="fact-copy">
          <strong>书架最厚</strong>
          <span>《算法导论》，翻得最少</span>
        </div>
      </article>

      <article class="fact-item">
        <span class="fact-icon">
          <Sparkles :size="18" aria-hidden="true" />
        </span>
        <div class="fact-copy">
          <strong>座右铭</strong>
          <span>希望和悲伤，都是一缕光。</span>
        </div>
      </article>
    </section>

    <section class="about-grid">
      <section class="about-section section-log">
        <div class="section-head">
          <MapPin :size="20" aria-hidden="true" />
          <div class="section-head-copy">
            <h2>经营日志</h2>
            <p>从 2019 到现在，慢慢进货，也慢慢装修。</p>
          </div>
        </div>

        <div class="timeline">
          <div v-for="[year, text] in logs" :key="year" class="timeline-item">
            <strong>{{ year }}</strong>
            <span>{{ text }}</span>
          </div>
        </div>
      </section>

      <section class="about-section section-tech">
        <div class="section-head">
          <BriefcaseBusiness :size="20" aria-hidden="true" />
          <div class="section-head-copy">
            <h2>技术栈</h2>
            <p>不追求堆满，只保留长期顺手的几样工具。</p>
          </div>
        </div>

        <div class="skill-list">
          <div v-for="skill in techStack" :key="skill" class="skill-item">
            <span class="skill-dot"></span>
            <span class="skill-name">{{ skill }}</span>
          </div>
        </div>
      </section>

      <section class="about-section section-hobby">
        <div class="section-head">
          <Heart :size="20" aria-hidden="true" />
          <div class="section-head-copy">
            <h2>爱好</h2>
            <p>不全和技术有关，但都和生活有关。</p>
          </div>
        </div>

        <div class="hobby-list">
          <article v-for="hobby in hobbies" :key="hobby.title" class="hobby-item">
            <component :is="hobby.icon" :size="20" aria-hidden="true" />
            <div class="hobby-copy">
              <h3>{{ hobby.title }}</h3>
              <p>{{ hobby.text }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="about-section section-contact">
        <div class="section-head">
          <Mail :size="20" aria-hidden="true" />
          <div class="section-head-copy">
            <h2>联系</h2>
            <p>如果你也路过云边，可以给我留封信。</p>
          </div>
        </div>

        <div class="contact-list">
          <a
              v-for="contact in contacts"
              :key="contact.label"
              :href="contact.href"
              :target="contact.external ? '_blank' : undefined"
              :rel="contact.external ? 'noreferrer' : undefined"
              :aria-label="contact.label"
              class="contact-link"
          >
            <div class="contact-main">
              <component :is="contact.icon" :size="18" aria-hidden="true" />
              <div class="contact-copy">
                <span class="contact-label">{{ contact.label }}</span>
                <span class="contact-value">{{ contact.value }}</span>
              </div>
            </div>
            <span class="contact-arrow">↗</span>
          </a>
        </div>
      </section>
    </section>

    <div class="closing-section">
      <div class="closing-line">
        <span></span>
        <p>无论身在何方，我们终将在云边重逢。</p>
        <span></span>
      </div>
      <p class="ending">如果你也迷路了，就来云边小卖部坐坐吧。</p>
    </div>
  </section>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  gap: clamp(48px, 7vw, 72px);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

.hero-heading {
  margin-bottom: 0;
}

.subtitle {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 1.8;
}

/* Intro */
.intro-block {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: clamp(32px, 5vw, 64px);
  align-items: start;
  padding-top: 40px;
  border-top: 1px solid var(--color-border);
  animation: fadeUp 400ms var(--transition-base) both;
}

.intro-aside {
  display: grid;
  gap: 24px;
  align-content: start;
}

.portrait-frame {
  width: 160px;
  padding: 8px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(var(--color-accent-rgb), 0.18), rgba(var(--color-accent-rgb), 0.12));
  box-shadow: var(--color-shadow);
}

.portrait {
  width: 144px;
  height: 144px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--color-bg-card);
}

.portrait img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  max-width: 220px;
}

.profile-tags span {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-accent-light);
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.6;
}

.profile-notes {
  display: grid;
  gap: 12px;
  margin: 0;
  padding-top: 4px;
}

.profile-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--color-border);
}

.profile-row dt {
  margin: 0;
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.04em;
}

.profile-row dd {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: 1.7;
}

.intro-main {
  min-width: 0;
}

.section-kicker {
  margin: 0 0 12px;
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.intro-main h2 {
  margin: 0 0 20px;
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: 0.02em;
}

/* 统一三部分的宽度 */
.intro-lead,
.intro-columns,
.story-quote {
  max-width: 680px;
}

.intro-lead {
  margin: 0 0 24px;
  color: var(--color-text-primary);
  font-size: 1.0625rem;
  line-height: 2;
  letter-spacing: 0.02em;
}

.story-quote {
  margin: 32px 0 0 0;
  padding: 24px 28px;
  border-left: 3px solid var(--color-accent);
  border-radius: 0 16px 16px 0;
  background: linear-gradient(
      180deg,
      var(--color-bg-secondary) 0%,
      rgba(var(--color-bg-secondary-rgb), 0.6) 100%
  );
  animation: fadeUp 400ms var(--transition-base) both;
  animation-delay: 120ms;
}

.story-quote p {
  margin: 0;
  color: var(--color-text-quote);
  font-size: 1rem;
  line-height: 2.1;
  letter-spacing: 0.04em;
}

.story-quote footer {
  margin-top: 14px;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  letter-spacing: 0.06em;
}

.intro-columns {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.intro-columns p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 2.1;
  letter-spacing: 0.02em;
}

/* Facts */
.facts-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0 28px;
  padding: 12px 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(
      180deg,
      rgba(var(--color-bg-secondary-rgb), 0.86) 0%,
      rgba(var(--color-bg-secondary-rgb), 0.46) 100%
  );
  animation: fadeUp 400ms var(--transition-base) both;
  animation-delay: 100ms;
}

.fact-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
  padding: 20px 0;
  border-right: 1px solid var(--color-border);
}

.fact-item:last-child {
  border-right: 0;
}

.fact-icon {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-accent-light);
  color: var(--color-accent);
  flex-shrink: 0;
}

.fact-copy {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.fact-copy strong {
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: 600;
  line-height: 1.7;
  letter-spacing: 0.02em;
}

.fact-copy span {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: 1.7;
}

/* Grid */
.about-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: clamp(40px, 6vw, 64px) clamp(28px, 4vw, 48px);
  align-items: start;
}

.about-section {
  display: grid;
  gap: var(--space-6);
  min-width: 0;
  padding-top: 28px;
  border-top: 1px solid var(--color-border);
  animation: fadeUp 400ms var(--transition-base) both;
}

.about-section:nth-child(1) { animation-delay: 180ms; }
.about-section:nth-child(2) { animation-delay: 260ms; }
.about-section:nth-child(3) { animation-delay: 340ms; }
.about-section:nth-child(4) { animation-delay: 420ms; }

.section-log { grid-column: span 7; }
.section-tech { grid-column: span 5; }
.section-hobby { grid-column: span 7; }
.section-contact { grid-column: span 5; }

.section-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.section-head svg,
.hobby-item svg,
.contact-main svg {
  color: var(--color-accent);
  flex-shrink: 0;
  margin-top: 3px;
}

.section-head-copy {
  display: grid;
  gap: 6px;
}

.section-head-copy h2 {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: 0.02em;
}

.section-head-copy p {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  line-height: 1.8;
  letter-spacing: 0.04em;
}

/* Timeline */
.timeline {
  display: grid;
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 24px;
  padding: 16px 0 16px 20px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 23px;
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
}

.timeline-item::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 31px;
  bottom: -16px;
  width: 1px;
  background: var(--color-border);
}

.timeline-item:last-child::after {
  display: none;
}

.timeline-item strong {
  color: var(--color-accent);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.7;
  letter-spacing: 0.04em;
}

.timeline-item span {
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 2.1;
  letter-spacing: 0.02em;
}

/* Skills */
.skill-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 32px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 50px;
  padding: 12px 0;
  border-bottom: 1px dashed var(--color-border);
  color: var(--color-text-secondary);
  transition:
      color 250ms var(--transition-base),
      transform 250ms var(--transition-base);
}

.skill-item:hover {
  color: var(--color-accent-hover);
  transform: translateY(-2px);
}

.skill-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  opacity: 0.9;
  flex-shrink: 0;
}

.skill-name {
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}

/* Hobby */
.hobby-list {
  display: grid;
}

.hobby-item {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 18px;
  padding: 18px 0;
  border-bottom: 1px solid var(--color-border);
}

.hobby-item:last-child {
  border-bottom: 0;
}

.hobby-copy h3 {
  margin: 0 0 8px;
  font-size: var(--text-lg);
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: 0.02em;
}

.hobby-copy p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 2;
  letter-spacing: 0.02em;
}

/* Contact */
.contact-list {
  display: grid;
}

.contact-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 0 -16px;
  padding: 16px 16px;
  border-radius: 10px;
  color: var(--color-text-secondary);
  transition:
      background-color 250ms var(--transition-base),
      color 250ms var(--transition-base),
      transform 250ms var(--transition-base);
}

.contact-link + .contact-link {
  border-top: 1px solid var(--color-border);
}

.contact-link:hover {
  background: var(--color-accent-light);
  color: var(--color-accent-hover);
  transform: translateY(-2px);
}

.contact-main {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.contact-copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.contact-label {
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  line-height: 1.7;
  letter-spacing: 0.02em;
}

.contact-value {
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
  line-height: 1.7;
}

.contact-arrow {
  color: var(--color-text-tertiary);
  transition:
      transform 250ms var(--transition-base),
      color 250ms var(--transition-base);
}

.contact-link:hover .contact-arrow {
  color: var(--color-accent-hover);
  transform: translate(3px, -3px);
}

/* Closing */
.closing-section {
  display: grid;
  gap: 28px;
  padding-top: 8px;
  animation: fadeUp 400ms var(--transition-base) both;
  animation-delay: 500ms;
}

.closing-line {
  display: flex;
  align-items: center;
  gap: 24px;
}

.closing-line span {
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.closing-line p {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.ending {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: 1rem;
  text-align: center;
  letter-spacing: 0.06em;
  line-height: 2;
}

/* Motion */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .intro-block {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .intro-aside {
    grid-template-columns: 160px minmax(0, 1fr);
    gap: 24px 28px;
    align-items: start;
  }

  .profile-notes {
    grid-column: 1 / -1;
  }

  .facts-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .fact-item {
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }

  .fact-item:nth-last-child(-n + 2) {
    border-bottom: 0;
  }

  .section-log,
  .section-tech,
  .section-hobby,
  .section-contact {
    grid-column: span 12;
  }

  .skill-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .intro-aside {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .profile-tags {
    max-width: none;
  }

  .facts-strip {
    grid-template-columns: 1fr;
    gap: 0;
    padding: 4px 0;
  }

  .fact-item {
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
    padding: 16px 0;
  }

  .fact-item:last-child {
    border-bottom: 0;
  }

  .intro-columns p {
    line-height: 1.9;
  }

  .timeline-item {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .skill-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .closing-line {
    gap: 16px;
  }

  .closing-line p {
    white-space: normal;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .skill-list {
    grid-template-columns: 1fr;
  }

  .closing-line span {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .intro-block,
  .facts-strip,
  .about-section,
  .closing-section,
  .ending {
    animation: none;
  }

  .skill-item,
  .contact-link,
  .contact-arrow {
    transition: none;
  }
}
</style>
