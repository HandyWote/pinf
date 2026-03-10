# Webend 移动端响应式与陀螺仪交互设计

## 1. 项目概述

为早护通 APK 下载页添加完善的移动端支持，包括响应式布局优化和陀螺仪 3D 交互。

## 2. 设计目标

- 移动端布局美观、触摸友好
- PC 端保持现有鼠标 3D 交互
- 移动端优先使用陀螺仪控制 3D 卡片，无权限或不可用时回退到触摸滑动

## 3. 方案：渐进式增强

### 3.1 响应式布局

#### 断点设计
- **Desktop**: >= 768px（保持现有布局）
- **Tablet**: 481px - 767px（中等屏幕优化）
- **Mobile**: <= 480px（手机端全面适配）

#### 移动端布局调整

| 元素 | Desktop | Mobile |
|------|---------|--------|
| Logo 字号 | 44px | 32px |
| 立绘宽度 | 320px | 240px |
| 按钮内边距 | 20px 68px | 16px 48px |
| 按钮字号 | 20px | 16px |
| 间距 | 24px | 16px |
| 页面内边距 | 24px | 16px |

#### 触摸优化
- 按钮增加触摸反馈（active 状态缩放）
- 移除需要 hover 的交互提示
- 增加触摸区域（至少 44px）

### 3.2 陀螺仪交互

#### 检测逻辑
```typescript
// 检测是否支持陀螺仪
if (window.DeviceOrientationEvent) {
  // 需要请求权限（iOS 13+）
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    // 请求权限
  } else {
    // 直接使用
  }
}
```

#### 倾斜映射
- **alpha** (左右旋转): 映射到 rotateY
- **beta** (前后倾斜): 映射到 rotateX
- 添加平滑过滤，避免抖动
- 限制最大倾斜角度 ±20°

#### 回退机制
1. 陀螺仪可用 → 使用陀螺仪
2. 陀螺仪不可用/无权限 → 使用触摸滑动
3. 无触摸支持 → 静态展示

### 3.3 权限处理

- iOS 13+ 需要用户点击按钮请求陀螺仪权限
- 显示友好的权限请求 UI
- 权限拒绝后优雅回退到触摸

## 4. 技术实现

### 4.1 响应式 CSS

```css
/* 基础响应式 */
@media (max-width: 767px) {
  /* Tablet */
}

@media (max-width: 480px) {
  /* Mobile */
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  /* 触摸设备专用样式 */
}
```

### 4.2 陀螺仪 Composable

```typescript
// useGyroscope.ts
export function useGyroscope() {
  // 状态
  const orientation = ref({ x: 0, y: 0 })
  const available = ref(false)
  const needsPermission = ref(false)

  // 方法
  const requestPermission = () => Promise<boolean>
  const start = () => void
  const stop = () => void
}
```

### 4.3 触摸滑动回退

```typescript
// useTouchTilt.ts
export function useTouchTilt() {
  // 触摸滑动映射到倾斜角度
  // 左右滑动 -> rotateY
  // 上下滑动 -> rotateX
}
```

## 5. 组件结构

```
App.vue
├── useGyroscope (composable)
├── useTouchTilt (composable)
└── Card3D (组件)
    ├── 3D 变换逻辑
    ├── 陀螺仪/触摸/鼠标输入
    └── 粒子效果
```

## 6. 验收标准

### 响应式
- [ ] Mobile (375px) 布局正确，无横向滚动
- [ ] 按钮触摸区域 >= 44px
- [ ] 字体、间距在移动端显示合适

### 陀螺仪
- [ ] iOS Safari 可正常请求权限
- [ ] Android Chrome 陀螺仪正常工作
- [ ] 倾斜角度平滑，无抖动
- [ ] 权限拒绝后回退到触摸

### 兼容性
- [ ] PC 端鼠标交互保持正常
- [ ] 无陀螺仪设备回退到触摸/静态
