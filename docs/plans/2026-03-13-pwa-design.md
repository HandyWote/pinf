# PWA 基础功能设计方案

**日期**: 2026-03-13
**项目**: pinf (早护通)
**目标**: 实现基础 PWA 功能

---

## 1. 需求概述

实现基础 PWA 功能，使应用可以：
- 离线访问已缓存的静态内容
- 添加到主屏幕作为独立应用
- 提供完整的 manifest 配置

**约束条件**：
- 只读离线策略（不包含数据提交）
- 独立应用模式（standalone）
- 使用 Expo 官方 PWA 方案

---

## 2. 技术方案

### 2.1 核心依赖

使用 `@expo/metro-config` 内置的 Workbox 支持（Expo SDK 54 已集成）

### 2.2 Manifest 配置

在 `app.json` 的 `expo.web` 中配置：
- `name`: 应用名称
- `short_name`: 短名称（主屏幕显示）
- `theme_color`: 主题色
- `background_color`: 启动画面背景色
- `display`: standalone（独立应用）
- `orientation`: portrait（竖屏）
- `icons`: 应用图标

### 2.3 Service Worker 配置

使用 Metro 内置的 Workbox：
- **预缓存**: 静态资源（JS/CSS/图片字体）
- **运行时缓存**: 访问过的页面（Cache First 策略）
- **网络优先**: API 请求（Network First 策略）

### 2.4 目录结构

无需新增目录，配置在现有文件中完成。

---

## 3. 实现计划

### Step 1: 配置 Manifest
- 修改 `app.json` 的 `expo.web` 部分
- 添加 PWA 相关字段

### Step 2: 配置 Service Worker
- 创建/修改 `app_end/web/manifest.json`（如需要）
- 配置 Metro 的 Workbox 选项

### Step 3: 添加 PWA 图标资源
- 确保有 192x192 和 512x512 的图标

### Step 4: 测试验证
- 本地测试 PWA 功能
- 验证离线访问

### Step 5: 部署
- 更新部署配置（如需要）

---

## 4. 验收标准

- [ ] 应用可以添加到主屏幕
- [ ] 离线状态下可以访问已缓存的页面
- [ ] Manifest 配置正确（名称、图标、主题色）
- [ ] Service Worker 正常注册
- [ ] Lighthouse PWA 基础分数 > 90

---

## 5. 风险与限制

- 仅支持静态内容离线（符合需求）
- 需要 https 环境才能使用 Service Worker（生产环境已满足）
- 部分 PWA API 在 iOS Safari 上支持有限
