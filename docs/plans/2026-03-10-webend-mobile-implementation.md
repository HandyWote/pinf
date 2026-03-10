# Webend 移动端响应式与陀螺仪交互实现计划

> **For Claude:** REQUIRED SUB-SKILL: 使用 superpowers:subagent-driven-development 或直接在当前会话实现。

**目标:** 为早护通 APK 下载页添加完善的移动端支持，包括响应式布局优化和陀螺仪 3D 交互。

**架构:** 渐进式增强方案 - PC 端保持鼠标交互，移动端优先使用陀螺仪，必要时回退到触摸滑动。

**技术栈:** Vue 3 + TypeScript + Vite

---

### Task 1: 创建陀螺仪 Composable

**Files:**
- Create: `webend/src/composables/useGyroscope.ts`

**Step 1: 创建 useGyroscope.ts**

```typescript
import { ref, onMounted, onUnmounted } from 'vue'

interface Orientation {
  x: number  // rotateX - beta (前后倾斜)
  y: number  // rotateY - gamma (左右倾斜)
}

export function useGyroscope() {
  const orientation = ref<Orientation>({ x: 0, y: 0 })
  const available = ref(false)
  const needsPermission = ref(false)
  const permissionGranted = ref(false)

  let animationFrameId: number | null = null
  // 平滑过滤参数
  const smoothing = 0.1
  let targetOrientation = { x: 0, y: 0 }

  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.beta === null || event.gamma === null) return

    // beta: -180 到 180 (前后倾斜)
    // gamma: -90 到 90 (左右倾斜)
    // 限制角度范围 ±20 度
    const maxAngle = 20
    targetOrientation.x = Math.max(-maxAngle, Math.min(maxAngle, event.beta - 45)) // 45度为自然握持角度
    targetOrientation.y = Math.max(-maxAngle, Math.min(maxAngle, event.gamma))
  }

  const smoothUpdate = () => {
    orientation.value.x += (targetOrientation.x - orientation.value.x) * smoothing
    orientation.value.y += (targetOrientation.y - orientation.value.y) * smoothing
    animationFrameId = requestAnimationFrame(smoothUpdate)
  }

  const requestPermission = async (): Promise<boolean> => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        permissionGranted.value = permission === 'granted'
        return permissionGranted.value
      } catch (e) {
        console.error('Gyroscope permission error:', e)
        return false
      }
    }
    // 非 iOS 13+ 设备直接可用
    permissionGranted.value = true
    return true
  }

  const start = () => {
    if (!window.DeviceOrientationEvent) {
      available.value = false
      return
    }

    available.value = true
    window.addEventListener('deviceorientation', handleOrientation)
    smoothUpdate()
  }

  const stop = () => {
    window.removeEventListener('deviceorientation', handleOrientation)
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }

  // 检测是否需要请求权限 (iOS 13+)
  const checkPermission = () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      needsPermission.value = true
    }
  }

  onMounted(() => {
    checkPermission()
  })

  onUnmounted(() => {
    stop()
  })

  return {
    orientation,
    available,
    needsPermission,
    permissionGranted,
    requestPermission,
    start,
    stop
  }
}
```

**Step 2: 提交**

```bash
git add webend/src/composables/useGyroscope.ts
git commit -m "feat(webend): 添加陀螺仪 composable"
```

---

### Task 2: 创建触摸滑动 Composable（回退方案）

**Files:**
- Create: `webend/src/composables/useTouchTilt.ts`

**Step 1: 创建 useTouchTilt.ts**

```typescript
import { ref, onMounted, onUnmounted } from 'vue'

interface TouchState {
  x: number
  y: number
}

export function useTouchTilt(elementRef: Ref<HTMLElement | null>) {
  const tilt = ref({ x: 0, y: 0 })
  const isActive = ref(false)

  let startX = 0
  let startY = 0

  const maxAngle = 25

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    isActive.value = true
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isActive.value || !elementRef.value) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    // 映射到倾斜角度
    const rect = elementRef.value.getBoundingClientRect()
    const maxDelta = Math.max(rect.width, rect.height) / 2

    tilt.value = {
      x: -(deltaY / maxDelta) * maxAngle,
      y: (deltaX / maxDelta) * maxAngle
    }
  }

  const handleTouchEnd = () => {
    isActive.value = false
    // 平滑复位
    const animate = () => {
      tilt.value.x *= 0.85
      tilt.value.y *= 0.85

      if (Math.abs(tilt.value.x) > 0.1 || Math.abs(tilt.value.y) > 0.1) {
        requestAnimationFrame(animate)
      } else {
        tilt.value = { x: 0, y: 0 }
      }
    }
    animate()
  }

  const bindEvents = (el: HTMLElement) => {
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchmove', handleTouchMove, { passive: true })
    el.addEventListener('touchend', handleTouchEnd)
  }

  const unbindEvents = (el: HTMLElement) => {
    el.removeEventListener('touchstart', handleTouchStart)
    el.removeEventListener('touchmove', handleTouchMove)
    el.removeEventListener('touchend', handleTouchEnd)
  }

  onMounted(() => {
    if (elementRef.value) {
      bindEvents(elementRef.value)
    }
  })

  onUnmounted(() => {
    if (elementRef.value) {
      unbindEvents(elementRef.value)
    }
  })

  return {
    tilt,
    isActive
  }
}
```

**Step 2: 提交**

```bash
git add webend/src/composables/useTouchTilt.ts
git commit -m "feat(webend): 添加触摸滑动 composable 作为回退方案"
```

---

### Task 3: 更新 App.vue 集成陀螺仪和触摸支持

**Files:**
- Modify: `webend/src/App.vue`

**Step 1: 添加 import 和响应式状态**

在 `<script setup>` 中添加:

```typescript
import { useGyroscope } from './composables/useGyroscope'
import { useTouchTilt } from './composables/useTouchTilt'
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 陀螺仪
const {
  orientation: gyroOrientation,
  available: gyroAvailable,
  needsPermission: gyroNeedsPermission,
  permissionGranted: gyroPermissionGranted,
  requestPermission: requestGyroPermission,
  start: startGyro,
  stop: stopGyro
} = useGyroscope()

// 检测触摸设备
const isTouchDevice = ref('ontouchstart' in window || navigator.maxTouchPoints > 0)

// 触摸滑动回退
const cardRef = ref<HTMLElement | null>(null)
const { tilt: touchTilt, isActive: isTouching } = useTouchTilt(cardRef)

// 确定当前使用的倾斜输入
const currentTilt = computed(() => {
  // 优先使用陀螺仪
  if (gyroAvailable.value && gyroPermissionGranted.value) {
    return gyroOrientation.value
  }
  // 回退到触摸
  return touchTilt.value
})

// 是否显示陀螺仪权限按钮
const showGyroButton = computed(() => {
  return isTouchDevice.value && gyroNeedsPermission.value && !gyroPermissionGranted.value
})

// 请求陀螺仪权限
const handleRequestGyro = async () => {
  const granted = await requestGyroPermission()
  if (granted) {
    startGyro()
  }
}

// 点击立绘时请求权限（iOS）
const handleCardClick = () => {
  if (showGyroButton.value) {
    handleRequestGyro()
  }
}
```

**Step 2: 更新 3D 变换逻辑**

修改模板中的 transform 绑定:

```vue
<div
  class="card-inner"
  :style="{
    transform: `perspective(1200px) rotateX(${currentTilt.x}deg) rotateY(${currentTilt.y}deg) scale(${isClicking ? 0.95 : 1})`
  }"
  @click="handleCardClick"
>
```

**Step 3: 添加陀螺仪权限按钮 UI**

在 info-section 中添加:

```vue
<!-- 陀螺仪权限提示 -->
<p v-if="showGyroButton" class="gyro-hint">
  <button class="gyro-btn" @click="handleRequestGyro">
    启用陀螺仪体验更佳
  </button>
</p>
```

**Step 4: 添加陀螺仪相关样式**

在 `<style scoped>` 中添加:

```css
/* 陀螺仪权限按钮 */
.gyro-hint {
  margin-top: 16px;
}

.gyro-btn {
  background: transparent;
  border: 1px solid #d4a574;
  color: #a89070;
  padding: 8px 16px;
  font-size: 13px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.gyro-btn:hover {
  background: rgba(212, 165, 116, 0.1);
  color: #8b7355;
}
```

**Step 5: 提交**

```bash
git add webend/src/App.vue
git commit -m "feat(webend): 集成陀螺仪和触摸滑动支持"
```

---

### Task 4: 完善响应式布局

**Files:**
- Modify: `webend/src/App.vue` - 更新 CSS

**Step 1: 添加完整的响应式样式**

将现有 CSS 替换为以下更完善的响应式设计:

```css
/* 页面 */
.page {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(165deg, #fdf6ed 0%, #fef8f0 30%, #fff5ee 70%, #ffede0 100%);
}

/* 响应式断点 */
@media (max-width: 767px) {
  .header {
    padding: 28px 20px 16px;
  }

  .logo {
    font-size: 36px;
    letter-spacing: 6px;
  }

  .tagline {
    font-size: 12px;
    letter-spacing: 3px;
  }

  .main {
    padding: 16px 20px 32px;
  }

  .card-wrapper {
    margin-bottom: 28px;
  }

  .character-image {
    max-width: 260px;
  }

  .info-section {
    padding: 0 8px;
  }

  .description {
    font-size: 14px;
    line-height: 1.8;
    margin-bottom: 28px;
  }

  .download-btn {
    padding: 16px 44px;
    font-size: 17px;
    border-radius: 44px;
  }

  .footer {
    padding: 20px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 24px 16px 12px;
  }

  .logo {
    font-size: 30px;
    letter-spacing: 4px;
  }

  .tagline {
    font-size: 11px;
    margin-top: 8px;
    letter-spacing: 2px;
  }

  .main {
    padding: 12px 16px 24px;
  }

  .card-wrapper {
    margin-bottom: 24px;
  }

  .character-image {
    max-width: 220px;
  }

  .card-shadow {
    width: 160px;
    height: 32px;
    bottom: -24px;
  }

  .description {
    font-size: 13px;
    line-height: 1.7;
    margin-bottom: 24px;
  }

  .download-btn {
    padding: 14px 36px;
    font-size: 15px;
    border-radius: 40px;
    min-height: 52px;
    min-width: 180px;
  }

  .info-section {
    max-width: 100%;
  }

  .file-info {
    font-size: 12px;
  }

  .footer {
    padding: 16px;
    font-size: 11px;
  }

  /* 粒子效果在小屏幕调整 */
  .particle {
    font-size: 22px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .download-btn:active:not(:disabled) {
    transform: scale(0.96);
    box-shadow:
      0 6px 24px rgba(232, 184, 109, 0.35),
      0 0 60px rgba(232, 184, 109, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .card {
    cursor: default;
    -webkit-tap-highlight-color: transparent;
  }
}

/* 安全区域支持 - iPhone X+ */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .page {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .footer {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
}
```

**Step 2: 提交**

```bash
git add webend/src/App.vue
git commit -m "feat(webend): 添加完善的响应式布局和触摸优化"
```

---

### Task 5: 测试与验证

**Step 1: 运行开发服务器测试**

```bash
cd webend && bun run dev
```

**Step 2: 验证要点**
- [ ] PC 端鼠标 hover 3D 效果正常
- [ ] Mobile 模拟器布局正确
- [ ] 陀螺仪 API 调用正常（需要在真机测试）

**Step 3: 构建测试**

```bash
cd webend && bun run build
```

确保无 TypeScript 错误。

---

### Task 6: 部署预览（如需要）

如果需要预览，可使用:

```bash
cd webend && bun run preview
```
