<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDownloadConfig } from './composables/useDownloadConfig'

const { config, loading, error, fetchConfig } = useDownloadConfig()
const isAnimating = ref(false)
const showStars = ref(false)

onMounted(() => {
  fetchConfig()
})

const handleDownload = () => {
  if (config.value?.downloadUrl) {
    // 开始动画
    isAnimating.value = true

    // 1秒后显示星星
    setTimeout(() => {
      showStars.value = true
    }, 1000)

    // 2秒后开始下载
    setTimeout(() => {
      const a = document.createElement('a')
      a.href = config.value!.downloadUrl
      a.download = config.value!.fileName
      a.click()
    }, 2000)

    // 4秒后停止动画
    setTimeout(() => {
      isAnimating.value = false
      showStars.value = false
    }, 4000)
  }
}
</script>

<template>
  <div class="page">
    <!-- 星星容器 -->
    <div v-if="showStars" class="stars-container">
      <div
        v-for="i in 12"
        :key="i"
        class="star"
        :style="{
          left: '50%',
          top: '40%',
          '--tx': `${Math.cos(i * 30 * Math.PI / 180) * 150}px`,
          '--ty': `${Math.sin(i * 30 * Math.PI / 180) * 150}px`,
          animationDelay: `${i * 0.1}s`
        }"
      />
    </div>

    <header class="header">
      <h1 class="logo">早护通</h1>
    </header>

    <main class="main">
      <div class="illustration" :class="{ animating: isAnimating }">
        <svg viewBox="0 0 300 300" class="baby-svg">
          <!-- 母亲 -->
          <g class="mother">
            <!-- 身体 -->
            <path d="M150 280 Q100 280 80 230 Q70 180 90 140 Q100 110 130 100 Q150 95 170 100 Q200 110 210 140 Q230 180 220 230 Q200 280 150 280"
                  fill="#E8D5C4" stroke="#5D4E37" stroke-width="2"/>
            <!-- 头部 -->
            <circle cx="150" cy="70" r="40" fill="#E8D5C4" stroke="#5D4E37" stroke-width="2"/>
            <!-- 头发 -->
            <path d="M110 60 Q150 20 190 60 Q195 80 190 90 Q150 50 110 90 Q105 80 110 60"
                  fill="#5D4E37"/>
            <!-- 眼睛 -->
            <circle cx="135" cy="70" r="3" fill="#5D4E37"/>
            <circle cx="165" cy="70" r="3" fill="#5D4E37"/>
            <!-- 微笑 -->
            <path d="M140 85 Q150 95 160 85" fill="none" stroke="#5D4E37" stroke-width="2"/>
          </g>

          <!-- 婴儿 -->
          <g class="baby-body">
            <!-- 身体 -->
            <ellipse cx="150" cy="180" rx="35" ry="45" fill="#FFE4C4" stroke="#5D4E37" stroke-width="2"/>
            <!-- 头部 -->
            <circle cx="150" cy="145" r="30" fill="#FFE4C4" stroke="#5D4E37" stroke-width="2"/>
            <!-- 脸部 -->
            <circle cx="140" cy="145" r="2" fill="#5D4E37"/>
            <circle cx="160" cy="145" r="2" fill="#5D4E37"/>
            <!-- 婴儿被子 -->
            <path d="M115 180 Q150 220 185 180 Q185 210 150 240 Q115 210 115 180"
                  fill="#87CEEB" stroke="#5D4E37" stroke-width="2"/>
          </g>
        </svg>
      </div>

      <div class="info">
        <h2 class="app-name">早护通 <span class="version">v{{ config?.version || '1.0.0' }}</span></h2>
        <p class="description">
          记录早产儿生长曲线，提供医疗 AI 助手，早产儿呵护课堂
        </p>
      </div>

      <button
        class="download-btn"
        :class="{ downloading: isAnimating }"
        :disabled="loading || !config || isAnimating"
        @click="handleDownload"
      >
        <span v-if="loading">加载中...</span>
        <span v-else-if="error">配置错误</span>
        <span v-else-if="isAnimating">准备下载...</span>
        <span v-else>下载 APK</span>
      </button>

      <p v-if="error" class="error-msg">{{ error }}</p>
    </main>

    <footer class="footer">
      <p>© 2026 早护通</p>
    </footer>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #FFF8E7 0%, #FDF6E3 100%);
}

.header {
  padding: 24px;
  text-align: center;
}

.logo {
  font-size: 24px;
  font-weight: 600;
  color: #5D4E37;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
}

.illustration {
  width: 280px;
  height: 280px;
  margin-bottom: 32px;
}

.baby-svg {
  width: 100%;
  height: 100%;
}

.info {
  text-align: center;
  margin-bottom: 40px;
}

.app-name {
  font-size: 32px;
  font-weight: 700;
  color: #5D4E37;
  margin-bottom: 12px;
}

.version {
  font-size: 18px;
  font-weight: 400;
  color: #A89070;
  margin-left: 8px;
}

.description {
  font-size: 16px;
  line-height: 1.6;
  color: #8B7355;
  max-width: 300px;
}

.download-btn {
  background: #E8B86D;
  color: #5D4E37;
  border: none;
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 32px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-btn:hover:not(:disabled) {
  background: #D4A55D;
  transform: scale(1.05);
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-btn.downloading {
  animation: glow 0.5s ease-in-out infinite;
  background: #D4A55D;
}

.error-msg {
  color: #D85454;
  margin-top: 16px;
  font-size: 14px;
}

.footer {
  padding: 24px;
  text-align: center;
  color: #A89070;
  font-size: 14px;
}

/* 摇晃动画 - 手绘逐帧感 */
@keyframes shake {
  0%, 100% { transform: rotate(0deg) translateY(0); }
  10% { transform: rotate(-2deg) translateY(-2px); }
  20% { transform: rotate(2deg) translateY(1px); }
  30% { transform: rotate(-1deg) translateY(-1px); }
  40% { transform: rotate(1deg) translateY(0); }
  50% { transform: rotate(-1deg) translateY(-1px); }
  60% { transform: rotate(1deg) translateY(1px); }
  70% { transform: rotate(0deg) translateY(0); }
  80% { transform: rotate(-1deg) translateY(-1px); }
  90% { transform: rotate(1deg) translateY(1px); }
}

/* 发光效果 */
@keyframes glow {
  0% { filter: drop-shadow(0 0 0 rgba(255, 220, 100, 0)); }
  50% { filter: drop-shadow(0 0 20px rgba(255, 220, 100, 0.8)); }
  100% { filter: drop-shadow(0 0 40px rgba(255, 220, 100, 0)); }
}

/* 星星散开 - 水彩风格 */
@keyframes star-burst {
  0% {
    transform: scale(0) translate(0, 0);
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: scale(1) translate(var(--tx), var(--ty));
    opacity: 0;
  }
}

/* 动画类 */
.illustration.animating .baby-svg {
  animation: shake 2s ease-in-out infinite;
  transform-origin: center bottom;
}

.illustration.animating .baby-body {
  animation: glow 2s ease-in-out infinite;
}

/* 星星粒子容器 */
.stars-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;
}

.star {
  position: absolute;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, #FFE4B5 0%, #FFD700 50%, transparent 70%);
  border-radius: 50%;
  animation: star-burst 1.5s ease-out forwards;
  filter: blur(2px);
}
</style>
