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
- 文档沉淀范围偏好：`AGENTS.md`/`CLAUDE.md` 仅记录全局规则、长期有效架构决策与用户稳定偏好；单次排障与易解小问题默认不入库，每次加入记得要缩减一下沉淀内容增加信息熵。
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
- 若 CI runner 缺少 `yarn`，避免使用默认依赖 `yarn` 安装路径的 EAS action；可直接 `npm install -g eas-cli`。
- `Skipped installing expo-cli: 'expo-version' not provided` 属信息提示，不是失败根因；关键失败信号是后续 executable not found。
- `punycode` deprecation warning 通常不阻塞构建，可先聚焦致命错误处理。
- 云构建模式下不要使用 `--output`；官方限制该参数仅用于本地构建（`--local`）。
- 兼容官方 CI 的简化方案：`eas build --non-interactive --wait --json` 后从 JSON 提取 `artifacts.buildUrl` 下载产物。
- 为兼容不同 CLI 返回结构，解析产物地址时应同时兼容数组与对象两种 JSON 形态。
- Expo 构建显示的项目名来自 `app.json` 的 `expo.name/slug/scheme`，`app.config.ts` 若透传这些字段会以其为准。
- Android 首次 EAS 构建前必须配置 `expo.android.package`，否则会在构建前置校验阶段直接失败。
- 模板初始化后应优先完成 `name/slug/scheme/package` 品牌化收敛，避免后续 EAS 项目绑定混乱。
- 在 Gitea 环境下，发布步骤应优先调用 Gitea Release API，避免依赖 GitHub 专用 release action。
- Release Token 优先使用 `secrets.GITEA_TOKEN`，可回退到兼容变量 `secrets.GITHUB_TOKEN`。
- 发布链路建议支持“tag 已存在 release”场景：创建失败后按 tag 查询并复用 release 再上传附件。
- 成长曲线用户线绘制应遵循“仅在真实记录区间内插值、区间外置 NaN”，避免无数据区间被渲染为假趋势。
- 成长曲线交互可采用“点按数据点后自动进入全屏并聚焦滚动到该年龄位置”的轻量方案，兼顾体验与改动成本。
- 成长图表宽度应基于 `useWindowDimensions` 动态计算，避免旋转/分屏导致的宽度失真。
- 成长页与图表组件的描边语义统一使用 `organicTheme.colors.border.*`，避免 `primary.*` 充当描边回流。
- 成长记录“补录时间”交互建议采用二级弹层：主表单点按时间字段后拉起独立时间选择弹层，避免在主表单内挤占布局。
- iOS 时间选择优先 `DateTimePicker(mode=\"datetime\", display=\"spinner\")`；Android 采用 `date + time` 双轮盘组合并统一“取消/确认”收口。
- 外部技能安装优先遵循官方 `INSTALL.md`，避免自行猜测目录结构。
- `superpowers` 在 Codex 环境的标准链路为：克隆到 `~/.codex/superpowers`，软链 `~/.agents/skills/superpowers -> ~/.codex/superpowers/skills`。
- 若安装后技能未生效，优先检查软链目标是否误指向仓库根目录而非 `skills` 子目录。
- Fenton 用户点横轴必须与标准曲线同口径（PMA 周龄），禁止直接复用“距预产期周数”作为 Fenton 绘图横轴。
- 生长曲线评估需区分“无记录”与“当前标准下无有效点”，避免把过滤后的 0 点误报为“数据不足”。
- 早产儿自动标准判定可在 `gestationalWeeks` 缺失时回退 `dueDate` 路径，避免错误退回 WHO 导致口径漂移。
- `react-native-chart-kit` Web 端对 `NaN` 极敏感，`datasets.data` 中出现 `NaN` 会触发 `<path>/<circle>` 渲染错误并导致曲线不可见。
- 生长曲线数据入图前应做 `Number.isFinite` 清洗，非法 `value` 记录必须在引擎层过滤，不能带入图表组件。
- 生长页建议在图表下方提供“按周龄排序的原始记录明细”，用于快速核对数据库记录与入图结果是否一致。

## 会话沉淀：预约推送 / 消息订阅（2026-02-15）
- 决定：采用 demo-first 增量实现预约推送/订阅，先在 `main` 完成后端订阅接口与 demo 页面，推送通道可后续接入。
- 实现要点：新增 `NotificationSubscription` 表（持久化），`remind_time` 以 UTC 存储；后端遵循 model + migration + to_dict 三件套。
- 前端为独立可移除的调试页 `app_end/app/test-notifications.tsx`，并在 `appointmentStore` 暴露 subscribe/unsubscribe 接口，保证易回滚。
- 验收：支持创建/删除订阅、模拟（或手动触发）发送；后续接入 Expo/FCM/APNs 时无需改动业务逻辑。
- 已追加（最小侵入）实现：前端新增 `registerForPushNotificationsAsync` 并在 Demo 页面获取 Expo token；创建订阅时将 `token` 一并传给后端。
- 后端新增 `utils/notification_sender.py`（Expo Push 最小实现），并在 `test-send` 与调度器中尝试调用真实推送，发送成功后回写 `sent_at`/`status`。
- 保持兼容：若设备未注册 token，旧的本地 mock 与标记为 `sent` 的行为不变，便于回滚与验证。

## 会话沉淀（2026-02-21）
- APK 闪退优先检查 `expo-notifications` 插件是否缺失，缺失会导致原生配置未注入。
- 生产包 API 基址必须通过 `API_BASE_URL` 注入 `app.config.ts`，避免运行时报错。
- Gitea 构建可在 workflow 顶层 `env` 注入 `API_BASE_URL`，与应用配置解耦。
- Web 端需避免静态导入 `expo-notifications`，用平台守卫 + 动态导入防止解析失败。
- 发布前可用“验证码登录 -> JWT -> 全路由 smoke”快速做接口健康检查，并在脚本末尾清理测试数据。
- `chat/send` 依赖 n8n，可接受 `502` 作为上游不可用信号，但前端必须落到页面可见错误而非崩溃。
- 微信内容相关接口返回 `400 unauthorized` 多由公众号权限/配置导致，应与“接口 500 异常”分开判定。
- `API_BASE_URL` 建议在构建时与运行时双重规范化（trim、协议校验、去尾斜杠），避免格式脏值进入客户端。

## 会话沉淀（2026-02-22 通知 token 排障）
- Android 端建议先创建通知渠道，再请求权限并获取 Expo token，减少 Android 13+ 权限/渠道时序问题。
- 获取 Expo token 时优先使用 projectId，失败后可回退无参调用以兼容历史配置。
- 通知测试页应展示 token 获取失败诊断信息（reason/projectId/permission），避免只能看“获取失败”黑盒状态。
- 后端订阅与调度链路应禁止“无 token 也标记 sent”，无 token 统一落为 missed。
- test-send 失败应返回错误状态码，不再返回 200 伪成功。

## 会话沉淀（2026-02-22 通知最小测试页）
- 若目标是先验证通知链路，可先提供独立按钮流：获取 Push Token -> 发送本地通知，不强耦合预约业务。
- 通知测试页应保留 reason/projectId/permission 诊断信息，便于定位 token 获取失败根因。
- 本地通知测试建议复用 expo-notifications，并统一走权限申请与 Android 通知渠道初始化。
- 在“真机最小闭环”阶段，页面可禁用无 token 的发送按钮，避免误判功能可用性。

## 会话沉淀（2026-02-22 本地打包流水线）
- `app-build-local.yml` 必须使用顶层 `jobs:`，不能把 job 缩进到 `env:` 下。
- 本地打包流水线建议保留 `workflow_dispatch`，用于单独手动验证。
- 若 `app-build-local.yml` 与 `app-build.yml` 监听同一 tag，打 tag 会并发触发两条流水线。
- `workflow_dispatch` 用于“仅验证构建”时，发布步骤需加 `if` 限制为 tag push 事件。
- 流水线产物路径优先使用 `${GITHUB_WORKSPACE}` 子目录，避免依赖 runner 私有挂载路径（如 `/output`）。
- 本地打包工作流可保留 tag 发布能力，同时通过条件语句与手动测试场景解耦。
- `act_runner` 容器设置代理不等于 job 容器自动继承，workflow 需显式透传 `HTTP_PROXY/HTTPS_PROXY/NO_PROXY`。
- EAS 本地 Android 构建遇到 Gradle wrapper 网络抖动时，优先增加 `GRADLE_OPTS` 超时参数并为 `eas build --local` 增加重试。
- 使用 `socks5h` 代理时，建议在构建脚本显式注入 JVM `socksProxyHost/socksProxyPort`，避免 Java 链路绕过代理。
- 若网络环境稳定且团队接受明文配置，可在 CI workflow 顶层 `env` 直接硬编码代理地址，避免变量注入缺失。
- `socks5h` 场景下建议同时保留 JVM socks 参数注入，确保 Gradle wrapper 下载链路走代理。
- 代理硬编码后应评估运维变更成本，变更代理地址需同步修改 workflow 文件。
- Gradle/JVM 出现 `hs_err_pid` 崩溃时，可先尝试 `JAVA_TOOL_OPTIONS=-XX:-UsePerfData` 规避 PerfData 采样相关 native 崩溃。
- 本地构建稳定性可通过 `-Dorg.gradle.daemon=false` 降低守护进程带来的容器内不确定性。
- CI 中应在失败后自动采集 `hs_err_pid*.log` 前 200 行，便于快速定位 JVM 崩溃点。
- 本地 EAS 构建建议在 workflow 顶层统一设置缓存目录：`GRADLE_USER_HOME`、`NPM_CONFIG_CACHE`、`CCACHE_DIR`、`EAS_LOCAL_BUILD_WORKINGDIR`。
- 依赖安装阶段可开启 `npm prefer-offline` 并关闭 `fund/audit`，减少网络抖动对安装耗时影响。
- `eas.json` 的 `build.<profile>.cache.paths` 应显式配置（如 `node_modules/.expo/.npm/android/.gradle`），避免本地构建 payload 中 `cache.paths` 为空。
- 若目标是本地链路性能优先，`app-build-local` 可从 `eas build --local` 切换为 `./gradlew :app:assembleRelease` 直构模式。
- 直构模式下需在 CI 里动态写入 `android/local.properties` 的 `sdk.dir`，避免 `SDK location not found`。
- APK 产物路径应固定为 `android/app/build/outputs/apk/release`，避免沿用 EAS 本地构建的 `build/` 目录假设。
- 当 `runs-on: ubuntu-latest` 无自定义镜像时，APK 流水线应显式加入 `setup-java`、`setup-node` 与 Android SDK commandline-tools 安装步骤。
- Expo SDK 54 / RN 0.81 链路建议在 CI 安装 `platforms;android-36`、`build-tools;36.0.0`、`ndk;27.1.12297006`，与项目配置对齐。
- 普通 runner 下缓存目录建议落在 `${{ github.workspace }}`，避免写入根目录导致权限问题。
- `actions/setup-java` 开启 `cache: gradle` 时要求仓库已存在 Gradle 依赖描述文件；若 Android 工程是 CI 动态生成，应关闭该缓存选项。
- Expo managed 项目在未提交 `android/` 目录时，CI 需先执行 `npx expo prebuild -p android` 再跑 `gradlew`。
- 仅在 `android/` 不存在时触发 prebuild 可避免每次重生工程带来的额外耗时。
## 会话沉淀（2026-02-23 Node 初始化）
- 发布流水线 `app-build.yml` 也应统一为 `nvm install/use`，避免 `setup-node` 在代理隧道下载阶段失败。
- 日志中的 `punycode` deprecation 多为提示，优先排查 `tunneling socket could not be established`/`socket hang up`。
- Node 初始化后应写入 `GITHUB_PATH` 并打印 `node --version`、`npm --version` 便于验收。

## 会话沉淀（2026-02-23 Android SDK 代理）
- `sdkmanager` 不支持把 `socks5h://` 直接放在 `HTTP_PROXY/HTTPS_PROXY`，会触发 `MalformedURLException: unknown protocol: socks5h`。
- Android SDK 安装步骤建议改为显式 `sdkmanager --proxy=socks --proxy_host --proxy_port`，并在该步骤内 `unset HTTP_PROXY/HTTPS_PROXY`。
- Gradle 仍可通过 JVM 参数 `-DsocksProxyHost/-DsocksProxyPort` 走 SOCKS 代理，避免与全局代理变量耦合。
