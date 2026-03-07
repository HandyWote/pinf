# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
## Top Rules

always reply in chinese 
use superpower skill
use TDD to guide programing(RED: red-eddit-green)
always reuse existing components in the project; refuse to reinvent the wheel.
always provide many solutions to help me brain-storming and also need to give me one with the least technical debt in the future

## 项目概述

早护通 (pinf) - 新生儿/早产儿健康管理移动应用，包含 React Native + Expo 前端和 Flask 后端 API。

## 常用命令

### 前端开发
```bash
cd app_end

# 启动 Expo 开发服务器
bun start

# 运行 Web 版
bun run web

# 代码检查
bun run lint                    # ESLint 检查
npx tsc --noEmit               # TypeScript 类型检查
```

### 后端开发
```bash
cd backend

# 本地运行
uv run app.py

# 健康检查
curl http://localhost:5010/api/health
```

### Docker 部署
```bash
# 启动全部服务
docker compose up -d

# 服务端口
# - backend: 5010
# - n8n: 5678
# - pgvector: 5432
```

## 架构概览

### 前端 (app_end/)
- **框架**: React Native + Expo SDK 54 + TypeScript
- **路由**: Expo Router (文件路由)，页面在 `app/` 目录
- **状态管理**: Zustand，位于 `store/`
- **API 客户端**: Axios 封装，位于 `services/api/`
- **UI 组件**: Organic 体系，位于 `components/ui/`

### 后端 (backend/)
- **框架**: Flask 2.3.3 + Python 3.11+
- **数据库**: PostgreSQL + pgvector
- **认证**: JWT (Flask-JWT-Extended)
- **路由**: 按领域蓝图组织 (auth/baby/growth/appointment/content/chat/notifications)

### 核心规范 (来自 AGENTS.md)

1. **双阶段开发协议**: 非原子任务必须先方案商议，确认后再编码
2. **UI Token 体系**: 使用 Organic 主题 token（颜色/间距/字号/圆角/阴影）
3. **图标规范**: IconSymbol + SF Symbol 命名，新增图标需更新映射
4. **交互反馈**: 统一使用 `Feedback` 抽象 (`notify/confirm`)，禁止直接调用 `Alert.alert`
5. **后端三件套**: 字段变更必须同步修改 `model` + `db_migrations` + `to_dict`
6. **最小验收**: 前端 `npm run lint` + `npx tsc --noEmit`；后端做目标模块语法检查

## 关键配置

- 前端: `app_end/app.json`, `app_end/app.config.ts`, `app_end/eas.json`
- 后端: `backend/config.py`, `backend/.env.example`
- 部署: 根目录 `docker-compose.yml`

## Gitea Actions 工作流

- `app-build-local.yml`: 本地 Android APK 构建
- `app-build.yml`: Expo EAS 云端构建
- `backend-deploy.yml`: 后端部署到服务器
