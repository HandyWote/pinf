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



## 全局强约束（Baseline）
- 默认技术决策：优先“未来技术债最少”方案；若成本或风险过高，再给最小侵入备选。
- 会话收尾约定：每次对话结束，将可复用结论以 3-8 条短句同步写入 `AGENTS.md` 与 `CLAUDE.md`。
- 语言：中文。
- Git：未获明确指令，不执行 `git add/commit/push`。

## Frontend 全局规范
- 统一 Organic 设计语言：颜色/间距/字号/圆角/阴影优先使用 token。
- 禁止页面层硬编码视觉值（特别是 `borderColor`、图标尺寸、排版层级）。
- 描边只用 `organicTheme.colors.border.*`；图标只用 `IconSymbol` + SF Symbol 命名。
- 新图标必须补 `app_end/components/ui/icon-symbol-map.ts` 映射；图标尺寸使用 `organicTheme.iconSizes.*`。
- 反馈统一 `Feedback`（`notify/confirm`），禁止直接 `Alert.alert`。
- 关键表单错误必须页面内可见，Toast 仅补充。
- `set-password` 必须区分 `init/change`，并与 `needSetPassword` 路由守卫保持一致。
- 资料修改必须先后端落库再同步本地 store。
- 验收基线：`npm run lint`；类型/图标/API 字段变化时追加 `npx tsc --noEmit`。

## Backend 全局规范
- 字段变更必须三件套：`model` + `db_migrations` + `to_dict`。
- 配置与密钥仅通过环境变量提供，禁止硬编码。
- 路由按蓝图领域拆分，接口响应结构保持一致。
- 数据库以 PostgreSQL 为默认方案，不依赖 SQLite 回退路径。
- 后端返回字段变更后，必须同步前端 API 类型。
- 后端改动至少完成目标模块语法检查与最小链路验证。

## Docker/部署基线
- 统一从根目录 `docker-compose.yml` 启动。
- `backend/n8n/pgvector` 同网互联，服务名可互访。
- `backend` 显式读取 `env_file: ./backend/.env`。
- 卷目录统一至 `docker/`；PostgreSQL 场景不保留 `instance` 相关挂载与创建。

## 项目架构与模块职责
- 架构：`app_end`（Expo RN）通过 HTTP/HTTPS 调用 `backend`（Flask API），认证采用 JWT。
- `backend/app.py`：应用入口，注册蓝图与健康检查。
- `backend/routes/`：按领域拆分（auth/baby/growth/appointment/content/chat）。
- `backend/models/`：SQLAlchemy 模型层；字段变更遵循三件套。
- `backend/utils/`：迁移、同步调度、通用工具。
- `app_end/app/`：Expo Router 页面与流程编排。
- `app_end/components/ui/`：可复用 UI 组件（优先复用，不在业务页重复实现）。
- `app_end/services/api/`：API 客户端封装；`app_end/store/`：Zustand 状态管理。
- `wechat_end/`：已弃用，仅参考。

## 环境与配置基线
- 后端必需：`SECRET_KEY`、`JWT_SECRET_KEY`、`DATABASE_URL`。
- 联动配置：`N8N_WEBHOOK_URL`、微信公众号相关 `WECHAT_*`。
- 环境变量优先级：运行时环境 > `backend/.env` > 代码默认值。
- 生产环境禁止提交密钥与真实凭证，使用环境注入。

## 测试与验收基线
- 前端最小验收：`npm run lint`；类型/图标/API 字段变化追加 `npx tsc --noEmit`。
- 后端最小验收：目标模块语法检查 + 关键链路最小可运行验证（如健康检查/关键接口）。
- 涉及 UI 的改动应至少做一轮关键流程手测（登录、资料、核心业务路径）。

## Git 与交付基线
- 未获明确要求，不做 `git add/commit/push`。
- 提交信息使用简短中文摘要，可加功能前缀（如 `auth:`、`content:`）。
- 涉及接口或字段变更，交付说明中必须写明前后端同步点与迁移影响。

## 高频命令
- 后端启动：`cd backend && uv run app.py`
- 健康检查：`curl http://localhost:5010/api/health`
- Docker 编排：`docker compose up -d`
- 前端 lint：`cd app_end && npm run lint`
- TS 类型检查：`cd app_end && npx tsc --noEmit`

## 最近沉淀（2026-02-11）
- 公众号内容同步已接入官方接口，并完成幂等落库。
- 同步任务支持“启动即跑 + 周期执行”，由环境变量开关控制。
- `40164 invalid ip` 需配置公众号接口白名单。
- Compose 已迁移到根目录，三服务互联，`backend` 显式读取 `./backend/.env`。
- 卷目录收敛到 `docker/`，`instance` 相关已移除。
- 文档维护偏好：`TOP RULES` 视为稳定区，常规更新不改其原文与编号。
- 文档形态偏好：保留“完整基线信息”（全局约束、架构、配置、测试、命令），不做过度精简。
- 会话收尾偏好：对话结束时自动将可复用结论简短沉淀到 `AGENTS.md` 与 `CLAUDE.md`。
- 方案偏好：默认优先技术债最少方案，同时提供最小侵入备选以便快速决策。
