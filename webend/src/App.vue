<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useDownloadConfig } from './composables/useDownloadConfig'

const { config, loading, error, fetchConfig } = useDownloadConfig()

// 3D 倾斜状态
const cardRef = ref<HTMLElement | null>(null)
const tilt = ref({ x: 0, y: 0 })
const isHovering = ref(false)
const isClicking = ref(false)

// 粒子效果
const particles = ref<Array<{ id: number; emoji: string; x: number; y: number; delay: number }>>([])
let particleId = 0

// 下载状态
const isDownloading = ref(false)
const showParticles = ref(false)

onMounted(() => {
  fetchConfig()
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

const handleMouseMove = (e: MouseEvent) => {
  if (!cardRef.value || !isHovering.value) return

  const rect = cardRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  // 更大的倾斜角度
  const maxTilt = 25
  const x = (e.clientX - centerX) / (rect.width / 2)
  const y = (e.clientY - centerY) / (rect.height / 2)

  tilt.value = {
    x: -y * maxTilt,
    y: x * maxTilt
  }
}

const handleMouseEnter = () => {
  isHovering.value = true
}

const handleMouseLeave = () => {
  isHovering.value = false
  // 平滑复位
  tilt.value = { x: 0, y: 0 }
}

const handleDownload = () => {
  if (!config.value?.downloadUrl || isDownloading.value) return

  isDownloading.value = true
  isClicking.value = true

  // 爆发动画
  showParticles.value = true
  const emojis = ['✨', '💖', '🌟', '💝', '⭐', '❤️', '🧚', '💫', '🫧', '🌸']
  for (let i = 0; i < 25; i++) {
    const angle = (Math.PI * 2 * i) / 25 + Math.random() * 0.5
    const distance = 120 + Math.random() * 100
    particles.value.push({
      id: particleId++,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      delay: Math.random() * 0.3
    })
  }

  // 2秒后开始下载
  setTimeout(() => {
    const a = document.createElement('a')
    a.href = config.value!.downloadUrl
    a.download = config.value!.fileName
    a.click()
  }, 1000)

  setTimeout(() => {
    showParticles.value = false
    particles.value = []
    isDownloading.value = false
    isClicking.value = false
  }, 2500)
}
</script>

<template>
  <div class="page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="floating-decor d1">✦</div>
      <div class="floating-decor d2">✧</div>
      <div class="floating-decor d3">◈</div>
    </div>

    <header class="header">
      <h1 class="logo">早护通</h1>
      <p class="tagline">守护每一个小天使</p>
    </header>

    <main class="main">
      <!-- 3D 异形立绘 -->
      <div class="card-wrapper">
        <div
          ref="cardRef"
          class="card"
          :class="{ hovering: isHovering, clicking: isClicking }"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
          @mousemove="handleMouseMove"
        >
          <div
            class="card-inner"
            :style="{
              transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isClicking ? 0.95 : 1})`
            }"
          >
            <!-- 异形立绘图片 -->
            <img
              src="/mother.png"
              alt="母亲抱婴儿"
              class="character-image"
            />

            <!-- 立绘的光晕效果 -->
            <div class="card-glow"></div>
          </div>

          <!-- 异形阴影 - 会跟随 3D 变换 -->
          <div
            class="card-shadow"
            :style="{
              transform: `perspective(1200px) rotateX(${tilt.x * 0.5}deg) rotateY(${tilt.y * 0.5}deg) translateY(20px) scale(${isHovering ? 1.1 : 1})`,
              opacity: isHovering ? 0.4 : 0.25
            }"
          ></div>

          <!-- 粒子爆发 -->
          <div v-if="showParticles" class="particles">
            <span
              v-for="p in particles"
              :key="p.id"
              class="particle"
              :style="{
                '--x': `${p.x}px`,
                '--y': `${p.y}px`,
                animationDelay: `${p.delay}s`
              }"
            >
              {{ p.emoji }}
            </span>
          </div>
        </div>
      </div>

      <!-- 信息区域 -->
      <div class="info-section">
        <p class="description">
          记录早产儿生长曲线<br/>
          专业医疗 AI 助手<br/>
          科学育儿知识课堂
        </p>

        <button
          class="download-btn"
          :class="{ downloading: isDownloading }"
          :disabled="loading || !config || isDownloading"
          @click="handleDownload"
        >
          <span v-if="loading" class="btn-content">
            <span class="spinner"></span>
            加载中...
          </span>
          <span v-else-if="error" class="btn-content">⚠️ 配置错误</span>
          <span v-else-if="isDownloading" class="btn-content">
            <span class="pulse"></span>
            准备下载...
          </span>
          <span v-else class="btn-content">
            下载 APK
          </span>
        </button>

        <p v-if="error" class="error-msg">{{ error }}</p>
        <p class="file-info" v-if="config && !error">{{ config.fileName }}</p>
      </div>
    </main>

    <footer class="footer">
      <p>© 2026 早护通 · 守护每一个小生命</p>
    </footer>
  </div>
</template>

<style scoped>
/* 页面 */
.page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(165deg, #fdf6ed 0%, #fef8f0 30%, #fff5ee 70%, #ffede0 100%);
}

/* 背景装饰 */
.bg-decoration {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: orb-float 25s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #ffe4ec 0%, #fff0f5 50%, transparent 70%);
  top: -150px;
  right: -100px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #e8f5e9 0%, #f0fff4 50%, transparent 70%);
  bottom: 5%;
  left: -100px;
  animation-delay: -8s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #e3f2fd 0%, #f5f0ff 50%, transparent 70%);
  top: 40%;
  right: 5%;
  animation-delay: -15s;
}

@keyframes orb-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -40px) scale(1.05); }
  66% { transform: translate(-30px, 30px) scale(0.95); }
}

.floating-decor {
  position: absolute;
  font-size: 20px;
  color: #d4a574;
  opacity: 0.25;
  animation: float-decor 12s ease-in-out infinite;
}

.d1 { top: 20%; left: 8%; animation-delay: 0s; }
.d2 { top: 55%; right: 12%; animation-delay: -4s; }
.d3 { bottom: 25%; left: 15%; animation-delay: -8s; }

@keyframes float-decor {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
  50% { transform: translateY(-25px) rotate(15deg); opacity: 0.4; }
}

/* 头部 */
.header {
  position: relative;
  z-index: 10;
  padding: 36px 24px 20px;
  text-align: center;
}

.logo {
  font-size: 44px;
  font-weight: 700;
  color: #5d4e37;
  letter-spacing: 8px;
  text-shadow: 0 4px 20px rgba(139, 111, 92, 0.25);
}

.tagline {
  font-size: 14px;
  color: #a89070;
  margin-top: 10px;
  letter-spacing: 4px;
}

/* 主要内容 */
.main {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 24px 40px;
}

/* 3D 异形立绘容器 */
.card-wrapper {
  perspective: 1200px;
  margin-bottom: 40px;
}

.card {
  position: relative;
  cursor: pointer;
  /* 关键：让子元素保持 3D */
  transform-style: preserve-3d;
}

.card-inner {
  position: relative;
  transition: transform 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  /* 确保图片有正确的渲染 */
  will-change: transform;
}

/* 异形立绘图片 */
.character-image {
  display: block;
  max-width: 320px;
  height: auto;
  /* 使用 drop-shadow 跟随异形边界 */
  filter: drop-shadow(0 20px 40px rgba(139, 111, 92, 0.25));
  transition: filter 0.3s ease;
}

.card.hovering .character-image {
  filter: drop-shadow(0 30px 60px rgba(139, 111, 92, 0.35));
}

.card.clicking .character-image {
  filter: drop-shadow(0 10px 20px rgba(139, 111, 92, 0.2));
}

/* 立绘光晕 */
.card-glow {
  position: absolute;
  inset: -20%;
  background: radial-gradient(ellipse at center, rgba(255, 220, 240, 0.3) 0%, transparent 60%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card.hovering .card-glow {
  opacity: 1;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

/* 异形阴影 - 使用 SVG filter 实现 */
.card-shadow {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 40px;
  background: radial-gradient(ellipse at center, rgba(139, 111, 92, 0.3) 0%, transparent 70%);
  filter: blur(15px);
  transition: all 0.15s ease-out;
  pointer-events: none;
}

/* 粒子爆发 */
.particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.particle {
  position: absolute;
  font-size: 28px;
  animation: particle-blast 1.8s ease-out forwards;
  animation-delay: var(--delay);
}

@keyframes particle-blast {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
  }
  20% {
    opacity: 1;
    transform: translate(calc(-50% + var(--x) * 0.4), calc(-50% + var(--y) * 0.4)) scale(1.3) rotate(20deg);
  }
  100% {
    opacity: 0;
    transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0.4) rotate(180deg);
  }
}

/* 信息区域 */
.info-section {
  text-align: center;
  max-width: 400px;
}

.app-name {
  font-size: 38px;
  font-weight: 700;
  color: #5d4e37;
  margin-bottom: 14px;
}

.version {
  font-size: 18px;
  font-weight: 400;
  color: #a89070;
  margin-left: 12px;
}

.description {
  font-size: 16px;
  line-height: 1.9;
  color: #8b7355;
  margin-bottom: 36px;
}

/* 下载按钮 */
.download-btn {
  background: linear-gradient(135deg, #e8b86d 0%, #d4a55d 100%);
  color: #5d4e37;
  border: none;
  padding: 20px 68px;
  font-size: 20px;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow:
    0 10px 40px rgba(232, 184, 109, 0.45),
    0 0 80px rgba(232, 184, 109, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  position: relative;
  overflow: hidden;
}

.download-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  transition: left 0.6s ease;
}

.download-btn:hover:not(:disabled)::before {
  left: 100%;
}

.download-btn:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.03);
  box-shadow:
    0 20px 50px rgba(232, 184, 109, 0.55),
    0 0 100px rgba(232, 184, 109, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.download-btn:active:not(:disabled) {
  transform: translateY(1px) scale(0.98);
}

.download-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.download-btn.downloading {
  background: linear-gradient(135deg, #c49a5a 0%, #b88a4a 100%);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.icon {
  font-size: 22px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(93, 78, 55, 0.3);
  border-top-color: #5d4e37;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.pulse {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 2px solid #5d4e37;
  border-radius: 50%;
  animation: pulse-anim 1s ease-out infinite;
}

@keyframes pulse-anim {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.8); opacity: 0; }
}

.error-msg {
  color: #d85454;
  margin-top: 18px;
  font-size: 14px;
}

.file-info {
  margin-top: 16px;
  font-size: 13px;
  color: #a89070;
}

.footer {
  position: relative;
  z-index: 10;
  padding: 24px;
  text-align: center;
  color: #a89070;
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 480px) {
  .logo {
    font-size: 34px;
    letter-spacing: 4px;
  }

  .character-image {
    max-width: 260px;
  }

  .app-name {
    font-size: 30px;
  }

  .download-btn {
    padding: 18px 52px;
    font-size: 18px;
  }
}
</style>
