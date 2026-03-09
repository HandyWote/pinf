# Webend APK 下载页实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 创建一个 Vue + Vite 的 APK 下载落地页，带有手绘水彩风格动画

**Architecture:**
- Vue 3 + Vite + TypeScript
- 纯 CSS 实现手绘水彩动画
- 动态读取 public/downloads/ 目录配置下载源

**Tech Stack:** Vue 3, Vite, TypeScript, CSS Animation

---

## Task 1: 初始化 Vue + Vite 项目

**Files:**
- Create: `webend/package.json`
- Create: `webend/vite.config.ts`
- Create: `webend/index.html`
- Create: `webend/src/main.ts`
- Create: `webend/src/App.vue`
- Create: `webend/src/style.css`
- Create: `webend/tsconfig.json`

**Step 1: 初始化项目**

```bash
cd /home/handy/projects/pinf/webend

# 创建 package.json
cat > package.json << 'EOF'
{
  "name": "webend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0"
  }
}
EOF
```

**Step 2: 创建 Vite 配置**

```bash
# 创建 vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
})
EOF
```

**Step 3: 创建 tsconfig.json**

```bash
# 创建 tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# 创建 tsconfig.node.json
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF
```

**Step 4: 创建入口文件**

```bash
# 创建 index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>早护通 - 下载</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
EOF
```

**Step 5: 创建 src 目录和入口文件**

```bash
mkdir -p /home/handy/projects/pinf/webend/src

# 创建 src/main.ts
cat > src/main.ts << 'EOF'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')
EOF
```

**Step 6: 创建基础 App.vue**

```bash
# 创建 src/App.vue
cat > src/App.vue << 'EOF'
<script setup lang="ts">
</script>

<template>
  <div class="container">
    <h1>早护通</h1>
  </div>
</template>

<style scoped>
.container {
  background: #FDF6E3;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
EOF
```

**Step 7: 创建基础样式**

```bash
# 创建 src/style.css
cat > src/style.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #FDF6E3;
  color: #5D4E37;
}

#app {
  min-height: 100vh;
}
EOF
```

**Step 8: 安装依赖并验证**

```bash
# 安装依赖
bun install

# 运行 dev 确认基础框架正常
timeout 5s bun run dev || true
```

**Step 9: Commit**

```bash
git add webend/
git commit -m "feat(webend): 初始化 Vue + Vite 项目结构"
```

---

## Task 2: 实现下载配置读取逻辑

**Files:**
- Create: `webend/src/composables/useDownloadConfig.ts`

**Step 1: 创建下载配置 composable**

```typescript
// src/composables/useDownloadConfig.ts
import { ref } from 'vue'

export interface DownloadConfig {
  version: string
  downloadUrl: string
  fileName: string
}

export function useDownloadConfig() {
  const config = ref<DownloadConfig | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchConfig = async () => {
    loading.value = true
    error.value = null

    try {
      // 尝试读取版本号
      const versionResponse = await fetch('/downloads/version.txt')
      const version = versionResponse.ok ? await versionResponse.text() : '1.0.0'

      // 检查是否有 link.txt
      const linkResponse = await fetch('/downloads/link.txt')
      if (linkResponse.ok) {
        const link = (await linkResponse.text()).trim()
        config.value = {
          version: version.trim(),
          downloadUrl: link,
          fileName: link.split('/').pop() || 'zaohutong.apk'
        }
      } else {
        // 检查是否有 APK 文件
        const apkResponse = await fetch('/downloads/zaohutong.apk')
        if (apkResponse.ok) {
          config.value = {
            version: version.trim(),
            downloadUrl: '/downloads/zaohutong.apk',
            fileName: 'zaohutong.apk'
          }
        } else {
          // 没有找到任何配置
          error.value = '未找到下载配置，请确保 downloads 目录存在'
        }
      }
    } catch (e) {
      error.value = '读取配置失败'
    } finally {
      loading.value = false
    }
  }

  return {
    config,
    loading,
    error,
    fetchConfig
  }
}
```

**Step 2: Commit**

```bash
git add webend/src/composables/useDownloadConfig.ts
git commit -m "feat(webend): 添加下载配置读取逻辑"
```

---

## Task 3: 实现页面布局和样式

**Files:**
- Modify: `webend/src/App.vue`

**Step 1: 更新 App.vue 实现完整布局**

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useDownloadConfig } from './composables/useDownloadConfig'

const { config, loading, error, fetchConfig } = useDownloadConfig()

onMounted(() => {
  fetchConfig()
})

const handleDownload = () => {
  if (config.value?.downloadUrl) {
    const a = document.createElement('a')
    a.href = config.value.downloadUrl
    a.download = config.value.fileName
    a.click()
  }
}
</script>

<template>
  <div class="page">
    <header class="header">
      <h1 class="logo">早护通</h1>
    </header>

    <main class="main">
      <div class="illustration">
        <!-- 手绘母亲抱着婴儿的 SVG 插画 -->
        <svg viewBox="0 0 300 300" class="baby-svg">
          <!-- 母亲轮廓 -->
          <path d="M150 280
                   Q100 280 80 230
                   Q70 180 90 140
                   Q100 110 130 100
                   Q150 95 170 100
                   Q200 110 210 140
                   Q230 180 220 230
                   Q200 280 150 280"
                fill="#E8D5C4" stroke="#5D4E37" stroke-width="2"/>
          <!-- 母亲头部 -->
          <circle cx="150" cy="70" r="40" fill="#E8D5C4" stroke="#5D4E37" stroke-width="2"/>
          <!-- 母亲头发 -->
          <path d="M110 60 Q150 20 190 60 Q195 80 190 90 Q150 50 110 90 Q105 80 110 60"
                fill="#5D4E37"/>
          <!-- 婴儿 -->
          <ellipse cx="150" cy="180" rx="35" ry="45" fill="#FFE4C4" stroke="#5D4E37" stroke-width="2"/>
          <!-- 婴儿头部 -->
          <circle cx="150" cy="145" r="30" fill="#FFE4C4" stroke="#5D4E37" stroke-width="2"/>
          <!-- 婴儿被子 -->
          <path d="M115 180 Q150 220 185 180 Q185 210 150 240 Q115 210 115 180"
                fill="#87CEEB" stroke="#5D4E37" stroke-width="2"/>
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
        :disabled="loading || !config"
        @click="handleDownload"
      >
        <span v-if="loading">加载中...</span>
        <span v-else-if="error">配置错误</span>
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
</style>
```

**Step 2: Commit**

```bash
git add webend/src/App.vue
git commit -m "feat(webend): 实现页面布局和样式"
```

---

## Task 4: 实现手绘水彩风格动画

**Files:**
- Modify: `webend/src/App.vue`

**Step 1: 添加动画 CSS**

在现有的 style 中添加动画效果：

```css
/* 添加以下样式到 App.vue 的 <style> 中 */

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

/* 水彩晕染效果 */
@keyframes watercolor-blur {
  0% {
    filter: blur(0px);
    opacity: 0.8;
  }
  100% {
    filter: blur(8px);
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
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
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
```

**Step 2: 更新模板添加动画状态**

```vue
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
```

**Step 3: 更新样式添加按钮动画效果**

```css
.download-btn.downloading {
  animation: glow 0.5s ease-in-out infinite;
  background: #D4A55D;
}
```

**Step 4: Commit**

```bash
git add webend/src/App.vue
git commit -m "feat(webend): 添加手绘水彩风格动画"
```

---

## Task 5: 创建示例配置文件

**Files:**
- Create: `webend/public/downloads/version.txt`
- Create: `webend/public/downloads/link.txt` (示例)

**Step 1: 创建配置文件**

```bash
mkdir -p webend/public/downloads

# 创建版本号文件
echo "1.0.0" > webend/public/downloads/version.txt

# 创建示例链接文件
echo "https://example.com/zaohutong.apk" > webend/public/downloads/link.txt
```

**Step 2: Commit**

```bash
git add webend/public/
git commit -m "feat(webend): 添加示例下载配置文件"
```

---

## Task 6: 构建和验证

**Step 1: 运行 TypeScript 检查和构建**

```bash
cd webend
npx vue-tsc --noEmit
bun run build
```

**Step 2: 预览构建结果**

```bash
bun run preview
```

**Step 3: Commit**

```bash
git add .
git commit -m "feat(webend): 完成 APK 下载页开发"
```

---

## Task 7: 验收

**验收标准:**
- [ ] 页面正确显示 App 名称、版本号、简介
- [ ] 点击下载按钮触发动画
- [ ] 动画为手绘水彩风格（母亲摇晃婴儿→光芒→星星散开）
- [ ] 下载功能正常工作
- [ ] 动态读取配置目录
- [ ] 页面视觉符合暖黄色调

---

**Plan complete and saved to `docs/plans/2026-03-09-webend-apk-download-page-implementation.md`.**

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
