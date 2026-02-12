# Repository Guidelines

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
*   **图标映射管理**：新增图标时需在 `app_end/components/ui/icon-symbol-map.ts` 中添加 SF Symbol → Ionicons 映射，确保类型安全。



## 全局强约束（Baseline）
- 默认技术决策：优先“未来技术债最少”方案；若成本或风险明显过高，再给最小侵入备选。
- 会话收尾约定：每次对话结束，将可复用结论以 3-8 条短句同步写入 `AGENTS.md` 与 `CLAUDE.md`。
- 语言：全程中文。
- Git：未获明确指令，不执行 `git add/commit/push`。

## Frontend 全局规范
- UI 设计语言必须遵循 Organic 体系：颜色、间距、字号、圆角、阴影均优先使用 token。
- 禁止在业务页散落硬编码视觉值（尤其 `borderColor`、图标尺寸、标题字重/行高）。
- 描边语义只允许 `organicTheme.colors.border.*`；禁止用 `primary.*` 直接替代描边语义。
- 图标必须使用 `IconSymbol` 与 SF Symbol 命名；新增图标必须更新 `app_end/components/ui/icon-symbol-map.ts` 映射。
- 图标尺寸必须走 `organicTheme.iconSizes.*`，禁止 `size={数字}` 回流。
- 交互反馈统一走 `Feedback`（`notify/confirm`），禁止直接调用 `Alert.alert`。
- 关键表单（登录/密码/资料）必须提供页面内可见错误文案（如 `formError`），Toast 仅补充。
- 密码流程必须区分 `init/change`；`needSetPassword=true` 时必须留在设置密码流程。
- 资料修改必须先后端落库，再同步本地 store，不允许仅本地伪成功。
- 前端最小验收：`npm run lint`；涉及类型/图标/API 字段变化时必须追加 `npx tsc --noEmit`。

## Backend 全局规范
- 后端字段新增/调整必须同步三件套：`model` + `db_migrations` + `to_dict`。
- 配置与密钥只走环境变量，禁止硬编码到代码。
- 路由按领域蓝图组织，响应结构保持一致（`status/message/data` 风格）。
- 数据库默认 PostgreSQL 方案，避免隐式回退到本地 SQLite 习惯。
- 与前端联动的接口字段变更后，必须提醒并推动前端类型同步。
- 后端改动至少做目标模块语法检查；涉及关键链路需补充最小可运行验证。

## Docker/部署基线
- Compose 统一使用根目录 `docker-compose.yml`。
- 服务编排：`backend`、`n8n`、`pgvector` 位于同一网络，服务名可互访。
- `backend` 必须显式读取 `env_file: ./backend/.env`。
- 持久化卷统一挂载到根目录 `docker/`（如 `docker/n8n`、`docker/pgvector`）。
- PostgreSQL 场景下不保留 `instance` 挂载与相关镜像创建步骤。

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

## 常用命令
- 后端本地：`cd backend && uv run app.py`
- 健康检查：`curl http://localhost:5010/api/health`
- 根目录编排：`docker compose up -d`
- 前端检查：`cd app_end && npm run lint`
- 类型检查：`cd app_end && npx tsc --noEmit`

## 近期关键沉淀（2026-02-11）
- 公众号同步链路：`access_token` + `freepublish/batchget` + `freepublish/getarticle`，按 `wechat_article_id/source_url` 幂等写入。
- 自动同步：启动立即执行一次 + 按 `WECHAT_SYNC_INTERVAL_MINUTES` 周期执行，受 `WECHAT_SYNC_ENABLED` 控制。
- 微信 `40164 invalid ip`：需在公众号后台配置服务出口公网 IP 白名单。
- Compose 已迁移到根目录并完成三服务互联；`backend` 显式读取 `./backend/.env`。
- 卷目录统一到 `docker/`；`instance` 相关挂载与创建已清理。
- 文档维护偏好：`TOP RULES` 为稳定区，后续更新默认不改动其原文与编号结构。
- 文档形态偏好：采用“完整基线版”（全局约束 + 项目架构 + 配置 + 测试 + 命令），避免过度精简导致基础能力信息缺失。
- 交互偏好：用户常在会话末尾要求“把有用结论简短写入 AGENTS/CLAUDE”，应默认主动执行该收尾动作。
- 决策偏好：评审与方案默认优先技术债最少路径，同时保留最小侵入备选供权衡。
- 文档沉淀范围偏好：`AGENTS.md`/`CLAUDE.md` 仅记录全局规则、长期有效架构决策与用户稳定偏好；单次排障与易解小问题默认不入库。
- CI 脚本中多层 `if/else` 必须逐层补全 `fi`，避免 runner 出现 `unexpected end of file`。
- Expo EAS 在 CI 里应优先用 `eas build --json --no-wait` 获取本次 `BUILD_ID`，再轮询 `eas build:view <id>`，避免 `build:list --limit=1` 取错并发任务。
- APK 下载步骤需与构建步骤保持同一 `APP_PATH` 工作目录；Release 附件路径应显式指向该目录产物。
- EAS 构建产物地址解析优先读取 `.artifacts.buildUrl`，并兼容 `.artifacts.applicationArchiveUrl` 作为回退。
- Expo SDK 54 场景下，`eas.json` 需使用 profile 结构：`build.<profile>.android.buildType`，不能再用 `build.android.type`。
- CI 中建议使用 `expo/expo-github-action@v8` 初始化 EAS，优先避免手动全局安装带来的版本漂移。
- 构建命令应显式指定 profile（如 `--profile production`），避免默认 profile 变化导致配置解析失败。
- 若目标是“最简单可用”的 APK 发布链路，优先使用 `eas build --non-interactive --output <apk-path>` 同步下载产物。
- 异步 `BUILD_ID` 轮询方案更稳健但更复杂，可作为构建队列拥堵时的备选。
- Release 附件路径应与 `--output` 实际落地路径保持一致，避免上传阶段找不到文件。
