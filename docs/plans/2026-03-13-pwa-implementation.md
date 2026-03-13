# PWA 基础功能实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 pinf (早护通) 实现基础 PWA 功能，支持离线访问和添加到主屏幕

**Architecture:** 使用 Expo SDK 54 内置的 Metro + Workbox 配置 PWA，无需额外依赖

**Tech Stack:** Expo SDK 54, Metro Bundler, Workbox (内置)

---

## 概述

本计划采用 TDD 思想，但适配 Expo PWA 上下文：
- "测试" = 验证 build 输出包含正确的 manifest 和 Service Worker
- "实现" = 配置 app.json 和相关文件

### Task 1: 更新 app.json PWA 配置

**Files:**
- Modify: `app_end/app.json`

**Step 1: 添加 PWA 配置**

在 `app.json` 的 `expo.web` 中添加 PWA 相关配置：

```json
{
  "expo": {
    "web": {
      "output": "static",
      "favicon": "./assets/images/withbackground.png",
      "name": "早护通",
      "short_name": "早护通",
      "theme_color": "#E6F4FE",
      "background_color": "#E6F4FE",
      "orientation": "portrait",
      "display": "standalone",
      "start_url": "/",
      "icons": {
        "icon_192": "./assets/images/withbackground.png",
        "icon_512": "./assets/images/withbackground.png"
      },
      "experiments": {
        "pwa": true
      }
    }
  }
}
```

**Step 2: 验证配置生效**

Run: `cd app_end && npx expo export:web --platform web --output-dir ./dist 2>&1 | head -30`
Expected: 导出成功，生成 static 资源

---

### Task 2: 配置 Service Worker

**Files:**
- Modify: `app_end/app.json`
- Create: `app_end/web/serve.json` (可选)

**Step 1: 在 app.json 中添加 SW 配置**

```json
{
  "expo": {
    "web": {
      "bundler": "metro",
      "serviceWorker": {
        "unregister": false,
        "createSwSettings": {
          "cacheStartUrl": true,
          "runtimeCaching": [
            {
              "urlPattern": "^https://fonts\\.googleapis\\.com/.*",
              "handler": "CacheFirst",
              "options": {
                "cacheName": "google-fonts-cache",
                "expiration": {
                  "maxEntries": 10,
                  "maxAgeSeconds": 60 * 60 * 24 * 365
                }
              }
            },
            {
              "urlPattern": "^https://fonts\\.gstatic\\.com/.*",
              "handler": "CacheFirst",
              "options": {
                "cacheName": "gstatic-fonts-cache",
                "expiration": {
                  "maxEntries": 10,
                  "maxAgeSeconds": 60 * 60 * 24 * 365
                }
              }
            },
            {
              "urlPattern": "\\.(?:png|jpg|jpeg|svg|gif|webp)$",
              "handler": "CacheFirst",
              "options": {
                "cacheName": "image-cache",
                "expiration": {
                  "maxEntries": 50,
                  "maxAgeSeconds": 60 * 60 * 24 * 30
                }
              }
            },
            {
              "urlPattern": "/api/.*",
              "handler": "NetworkFirst",
              "options": {
                "cacheName": "api-cache",
                "expiration": {
                  "maxEntries": 100,
                  "maxAgeSeconds": 60 * 60 * 24
                },
                "networkTimeoutSeconds": 10
              }
            }
          ]
        }
      }
    }
  }
}
```

**Step 2: 验证配置**

Run: `cd app_end && npx expo export:web --platform web --output-dir ./dist 2>&1 | head -50`
Expected: 导出成功，无报错

---

### Task 3: 验证 PWA 功能

**Step 1: 启动 web 服务器**

Run: `cd app_end && bun run web &`
Expected: 服务启动在 http://localhost:8081

**Step 2: 检查 manifest**

在浏览器访问 `http://localhost:8081`，打开 DevTools → Application → Manifest
Expected: 看到 PWA 配置（名称、主题色、图标）

**Step 3: 检查 Service Worker**

在浏览器 DevTools → Application → Service Workers
Expected: SW 已注册，状态为 activated

**Step 4: 测试离线功能**

1. 勾选 "Offline" 模拟离线
2. 刷新页面
Expected: 之前访问过的页面仍可显示

---

### Task 4: Lighthouse 验证（可选）

**Step 1: 运行 Lighthouse**

在 Chrome DevTools 中运行 Lighthouse PWA 测试
Expected: PWA 基础分数 > 90

---

### Task 5: 提交代码

**Step 1: 提交更改**

```bash
cd /home/handy/pinf
git add app_end/app.json
git commit -m "feat: 添加 PWA 基础配置

- 添加 manifest 配置（名称、主题色、图标）
- 配置 Service Worker 离线缓存策略
- 支持添加到主屏幕

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## 验收标准

- [ ] `app.json` 包含完整的 PWA 配置
- [ ] Web build 成功生成静态资源
- [ ] Chrome DevTools 可以看到 PWA Manifest
- [ ] Service Worker 成功注册
- [ ] 离线模式下可以访问已缓存的页面

## 风险与限制

- iOS Safari 对 PWA 支持有限（无推送通知、SW 限制）
- 需要 HTTPS 环境才能在生产环境使用 Service Worker
- 纯静态导出模式（`output: "static"`）的 SW 配置可能需要额外处理
