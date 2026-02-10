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
    *   备选：若影响超过5个文件或涉及核心底层，必须同时提供“最小侵入性（适配器模式）”方案、未来技术债最小方案供决策。
*   **语言规范**：所有沟通回复必须使用**中文**。

### 5. 跨端交互与账号流程规范（新增）
*   **统一交互层**：业务代码禁止直接调用 `Alert.alert`，统一使用 `Feedback` 抽象（`confirm/notify`），确保 Web 与 App 行为一致。
*   **表单反馈可见性**：关键校验（登录/密码/资料修改）必须提供页面内可见错误文案（如 `formError`），Toast 仅作补充。
*   **危险操作确认**：删除、退出登录等操作必须走统一 `confirm` 弹层，不得依赖平台默认弹窗回调。
*   **设置密码双模式**：`set-password` 必须区分 `init`（首次）与 `change`（修改）两种模式；`init` 禁止退出，`change` 允许退出/返回。
*   **路由守卫一致性**：`needSetPassword=true` 时强制留在设置密码流程，避免误跳转和回环。
*   **用户资料持久化原则**：昵称等资料变更必须先调用后端接口落库，再同步本地 store；禁止仅本地修改冒充成功。
*   **后端字段变更三件套**：新增/调整用户字段时必须同时修改 `model`、`db_migrations`、`to_dict`。
*   **接口与类型同步**：后端返回字段变化后，前端 API 类型定义必须同步更新，避免隐式字段丢失。
*   **图标类型约束**：`IconSymbol` 的 `name` 必须使用受支持的 SF Symbol 名称；涉及图标调整需通过类型检查。
*   **最小验收命令**：前端改动至少通过 `npm run lint`；涉及类型/图标改动需额外通过 `npx tsc --noEmit`；后端改动至少做目标模块语法检查。

### 6. RN UI Token 治理约定（新增）
*   **描边语义单一真源**：边框颜色统一使用 `organicTheme.colors.border.*`（`subtle/light/default/strong/accent/danger`）；禁止在业务页面用 `primary.pale/main` 直接充当描边语义。
*   **核心组件先行**：描边规则优先收敛到 `OrganicCard`、`OrganicButton`、`Input`、`Modal`，业务页仅消费组件状态与 token，不单独发明描边规则。
*   **图标尺寸语义化**：`IconSymbol` 尺寸统一使用 `organicTheme.iconSizes.*`，避免散落 `size={数字}`。
*   **排版语义化**：优先使用 `organicTheme.typography`（含 `fontFamily/letterSpacing/lineHeight`）构建标题、正文、数据值层级，避免页面内临时硬编码。
*   **防回流原则**：若发现旧写法回流（如裸 `borderColor` 或随意图标尺寸），修复时优先替换为 token 引用，不做临时补丁。

### 7. Git 操作约束（新增）
*   **禁止擅自操作**: 除非用户**明确要求**，否则不得执行 `git add`、`git commit`、`git push` 等 Git 操作
*   **代码修改与提交分离**: 代码编辑完成后，等待用户确认后再执行提交操作
*   **变基等危险操作**: 涉及历史重写的操作（rebase、reset --hard、force push）必须先征得用户同意

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

### 移动应用 (app_end/)

- `app/` - Expo Router 页面（文件路由）
  - `(tabs)/` - Tab 导航页面（首页、课堂、问答）
  - `appointments/` - 预约管理
  - `growth/` - 成长记录
  - `class-article/[id].tsx`, `class-video/[id].tsx` - 内容课堂详情页
  - `login.tsx`, `set-password.tsx` - 认证流程
  - `profile.tsx` - 个人中心
- `components/ui/` - 可复用 UI 组件库（OrganicCard, OrganicButton, IconSymbol 等）
- `components/ui/icon-symbol-map.ts` - SF Symbol 到 Ionicons 的映射表
- `constants/` - 设计 Token 和主题配置（organic-tokens.ts, theme.ts）
- `contexts/` - React Context 提供者（ThemeContext, FeedbackContext）
- `services/api/` - API 客户端层（auth, baby, growth, appointment, content）
- `store/` - Zustand 状态管理
- `types/` - TypeScript 类型定义

### Git 工作流注意事项

- **目录历史**: 项目曾使用 `WA/` 作为应用目录，后重命名为 `app_end/`
- **图标映射**: 使用 SF Symbol 风格命名，实际渲染 Ionicons，新增图标需更新 `icon-symbol-map.ts`
- **分支清理**: 变基后需删除临时分支，历史重写后需强制推送（谨慎操作）

### 弃用代码

- `wechat_end/` - **已弃用**的微信小程序，仅供参考

---

## 设计规范

基于 `app_end/constants/organic-tokens.ts` 和 `app_end/constants/theme.ts`：

### Organic 主题 Token

| 分类 | 规格 |
|------|------|
| **颜色** | Primary (蓝色系), Accent (桃色/薄荷色/薰衣草/天空色), Background (奶油色/纸张色) |
| **渐变** | brand, warm, purple, green, sunset, peach |
| **圆角** | comfy (14px), cozy (12px), compact (10px), pill (圆形) |
| **间距** | xs/sm/md/lg/xl/2xl/3xl |
| **字号** | xs/sm/md/lg/xl/2xl/3xl |
| **阴影** | card, frame, small, nav, floating |
| **图标尺寸** | xxs(16)/xs(20)/sm(24)/md(28)/lg(32)/xl(48)/xxl(64) |

### 图标使用规范

- **命名**: 使用 SF Symbol 风格名称（如 `sun.max`, `moon.stars`）
- **映射**: 实际渲染 Ionicons，映射关系在 `components/ui/icon-symbol-map.ts`
- **新增图标**: 先在映射表中添加 SF Symbol → Ionicons 的映射
- **尺寸**: 统一使用 `organicTheme.iconSizes.*`，禁止硬编码数字

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

### TypeScript (app_end/)

- 使用 Organic 主题 Token（`organicTheme.colors.*`, `organicTheme.spacing.*`, 等）
- 优先复用 `components/ui/` 组件（OrganicCard, OrganicButton, Input, Modal）
- API 调用使用 `services/api/` 封装
- 状态管理使用 Zustand store
- 图标使用 IconSymbol 组件，新增图标需更新 `icon-symbol-map.ts`

---

## 已知待办项

**已完成**:
- ✅ 基础框架（Expo Router, Theme Provider, Organic 主题 Token）
- ✅ UI 组件库（OrganicCard, OrganicButton, Input, Modal, IconSymbol 等）
- ✅ API 客户端（含 token 管理和 401 处理）
- ✅ 手机号登录流程
- ✅ 宝宝管理 CRUD
- ✅ 预约管理
- ✅ 成长记录基础功能
- ✅ 内容课堂模块（列表页、文章详情、视频详情）
- ✅ 个人中心页面
- ✅ Feedback 反馈上下文（统一 notify/confirm）

**部分完成**:
- ⚠️ 成长曲线图表渲染（WHO/Fenton 曲线）
- ⚠️ 推送通知（未集成）

**未启动**:
- ❌ AI 聊天界面
- ❌ 离线同步引擎
- ❌ 单元测试和 E2E 测试

---

## Git 提交规范

- 使用简短中文摘要（~72 字符）
- 可按功能添加前缀（如 `auth:`, `feat:`, `fix:`）
- PR 应包含范围、触及的端点/页面、环境/配置说明、测试证据
