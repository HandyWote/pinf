# CLAUDE.md

## TOP RULES

### 1. 核心工作流：双阶段开发协议 (Two-Stage Development Protocol)
为了避免无效的代码产出，所有非原子性任务必须严格遵循以下两个阶段：

*   **Phase 1: 方案商议阶段 (Design & Consensus)**
    *   **行为约束**：在此阶段，禁止输出任何实现代码（Code Blocks）。
    *   **聚焦内容**：
        *   **What**: 确认核心需求边界。
        *   **Why**: 阐述设计动机与利弊分析。
        *   **How (High-level)**：使用自然语言、Mermaid 流程图、目录结构树或纯文本逻辑步骤来描述方案。
    *   **状态保持**：持续处于商议模式，直到收到你的**显式指令**（如：“方案可行，开始写代码”、“确认”或“Go”）。

*   **Phase 2: 编码执行阶段 (Implementation)**
    *   只有在收到显式指令后，方可进入此阶段输出具体代码。

### 2. 豁免条款：原子级修改 (Atomic Fixes)
*   **定义**：仅涉及单文件、无架构风险、显而易见的修改（如：文案修正、拼写错误、增加一行日志、简单的类型定义修复）。
*   **流程**：此类任务不受“双阶段协议”限制，可直接提供代码实现。

### 3. 复用与架构原则
*   **严禁重复造轮子**：严格优先复用项目现有的组件、工具类和架构模式。
    *   *探针动作*：若不确定现有组件位置，必须先询问：“项目中是否已有处理 [功能X] 的组件？”，而非直接编写新代码。

### 4. 冲突处理与代码质量
*   **兼容性策略**：
    *   首选：暴露问题，提出彻底改进方案。
    *   备选：若影响超过5个文件或涉及核心底层，必须同时提供“最小侵入性（适配器模式）”方案、未来技术债最小方案供决策
*   **语言规范**：所有沟通回复必须使用**中文**。

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

早护通是一个专为婴幼儿护理设计的综合服务平台，包含后端 API 服务（Flask）和 React Native Expo 移动应用。

**架构**: 移动端 (WA/) 通过 HTTP/HTTPS 与后端 (backend/) 通信，使用 JWT 认证。

```
┌─────────────────┐      HTTP/HTTPS      ┌─────────────────────┐
│  React Native   │ ──────────────────► │   Flask REST API    │
│     (WA/)       │     JWT Bearer Token │    (backend/)       │
│   Expo + TS     │                      │  SQLAlchemy + PG    │
└─────────────────┘                      └─────────────────────┘
```

---

## 关键工作流规则

### 双阶段开发协议（Two-Stage Development Protocol）

**所有非原子性修改必须严格遵循以下两个阶段：**

1. **Phase 1: 方案商议阶段** - 禁止输出代码，仅讨论设计方案（What/Why/How），使用自然语言、流程图或结构化描述，直到收到显式确认指令（如"方案可行"、"开始写代码"、"确认"）
2. **Phase 2: 编码执行阶段** - 收到确认后才开始输出代码

**豁免条款**: 仅涉及单文件、无架构风险的显而易见修改（如文案修正、拼写错误、简单类型修复）可直接提供代码。

### 复用原则

**严禁重复造轮子**。在编写新代码前，必须确认项目中是否已有现成的组件或工具类。

**核心复用资源**:
- **UI 组件库**: `WA/components/ui/` - Button, Card, Input, Modal, Tag, ListItem, ChartContainer
- **设计 Token**: `WA/constants/tokens.ts` - 颜色、间距、字号、阴影、渐变
- **API 客户端**: `WA/services/api/client.ts` - Axios 封装，含 token 管理、401 处理、重试策略
- **Zustand Store**: `WA/store/` - authStore, babyStore, growthStore, appointmentStore

### 语言规范

**所有沟通必须使用中文**。

---

## 开发命令

### 后端 (backend/)

```bash
cd backend

# 本地开发
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python app.py  # 启动在 http://localhost:5010

# 健康检查
curl http://localhost:5010/api/health

# Docker
docker build -t babysitting-backend .
docker run -p 5010:5000 babysitting-backend
docker-compose -f docker-compose.yml up -d
```

### 移动应用 (WA/)

```bash
cd WA

# 安装依赖
npm install

# 启动开发服务器
npm start

# 运行平台
npm run ios      # iOS 模拟器
npm run android  # Android 模拟器/真机
npm run web      # Web 浏览器

# Lint
npm run lint
```

---

## 项目架构

### 后端 (backend/)

- `app.py` - Flask 应用入口，注册蓝图
- `config.py` - 环境配置
- `models/` - SQLAlchemy ORM 模型（user, baby, growth, appointment, chat, content, verification_code）
- `routes/` - Flask 蓝图（按领域划分）：auth, baby, growth, appointment, content, chat
- `utils/` - 工具函数、数据库迁移
- `instance/` - 本地数据库存储

**API 路由前缀**: `/api`

| 模块 | 路由 | 功能 |
|------|------|------|
| Auth | `/api/auth/phone/code`, `/api/auth/phone/login` | 手机验证码登录 |
| Babies | `/api/babies` | 宝宝档案 CRUD |
| Growth | `/api/babies/<id>/growth`, `/api/growth/<id>` | 成长记录管理 |
| Appointments | `/api/appointments`, `/api/appointments/<id>/status` | 医疗预约管理 |
| Content | `/api/content/videos`, `/api/content/articles` | 内容课堂 |
| Chat | `/api/chat/send`, `/api/chat/history` | AI 聊天（转发 n8n） |

### 移动应用 (WA/)

- `app/` - Expo Router 页面（文件路由）
  - `(tabs)/` - Tab 导航页面（首页、课堂、问答）
  - `appointments/` - 预约管理
  - `growth/` - 成长记录
  - `login.tsx`, `set-password.tsx` - 认证流程
- `components/ui/` - 可复用 UI 组件库
- `constants/` - 设计 Token 和主题配置
- `services/api/` - API 客户端层（auth, baby, growth, appointment）
- `store/` - Zustand 状态管理
- `contexts/` - React Context 提供者
- `types/` - TypeScript 类型定义

### 弃用代码

- `wechat_end/` - **已弃用**的微信小程序，仅供参考

---

## 设计规范

基于 `WA/constants/tokens.ts`：

| 分类 | 规格 |
|------|------|
| **颜色** | Primary #6B9AC4, Accent #FF9B73, Background #F0F4F8 |
| **渐变** | brand, warm, purple, green, sunset |
| **圆角** | 小 10px, 中 14px, 大 20px |
| **间距** | 8/12/16/20/24px |
| **字号** | 12/14/16/20px |
| **阴影** | card, frame, small, nav, fab |

---

## 环境配置

### 后端必需环境变量

```env
SECRET_KEY=              # Flask secret key
JWT_SECRET_KEY=          # JWT 签名密钥
DATABASE_URL=            # PostgreSQL 连接串
N8N_WEBHOOK_URL=         # AI 聊天转发地址
WECHAT_APP_ID=           # 可选：微信 AppID
WECHAT_APP_SECRET=       # 可选：微信 AppSecret
FLASK_ENV=               # development/production
```

### 移动应用环境

```env
API_BASE_URL=            # 后端 API 地址（通过 app.config.ts 配置）
```

**开发环境注意**:
- Android 模拟器使用 `10.0.2.2` 访问宿主机 localhost
- Android 真机使用局域网 IP（如 WSL2 的 `172.21.x.x`）
- iOS 模拟器使用 `localhost` 或 `127.0.0.1`

---

## 代码规范

### Python (backend/)

- PEP 8，4 空格缩进
- `snake_case` 函数/变量，`PascalCase` 模型类
- 统一响应格式: `{"status": "...", "message": "...", ...}`
- 按蓝图组织路由

### TypeScript (WA/)

- 使用设计 Token（不要硬编码颜色、间距）
- 优先复用 `components/ui/` 组件
- API 调用使用 `services/api/` 封装
- 状态管理使用 Zustand store

---

## 已知待办项

基于 `docx/REFACTOR_PLAN.md`：

**已完成**:
- ✅ 基础框架（Expo Router, Theme Provider, 设计 Token）
- ✅ UI 组件库（7 个组件）
- ✅ API 客户端（含 token 管理和 401 处理）
- ✅ 手机号登录流程
- ✅ 宝宝管理 CRUD
- ✅ 预约管理
- ✅ 成长记录基础功能

**部分完成**:
- ⚠️ 401 处理未触发全局登出/路由跳转
- ⚠️ API baseURL 需环境化配置
- ⚠️ 成长曲线图表渲染（WHO/Fenton 曲线）
- ⚠️ 表单字段不完整（gestationalWeeks, note）

**未启动**:
- ❌ 内容课堂模块
- ❌ AI 聊天界面
- ❌ 推送通知（Expo Notifications 或 FCM+APNs）
- ❌ 离线同步引擎
- ❌ 个人中心/设置页面
- ❌ 单元测试和 E2E 测试

---

## Git 提交规范

- 使用简短中文摘要（~72 字符）
- 可按功能添加前缀（如 `auth:`, `feat:`, `fix:`）
- PR 应包含范围、触及的端点/页面、环境/配置说明、测试证据
