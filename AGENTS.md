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

## Git 最佳实践

### Git 操作约束
- **禁止擅自操作**: 除非用户**明确要求**，否则不得执行 `git add`、`git commit`、`git push` 等 Git 操作
- **代码修改与提交分离**: 代码编辑完成后，等待用户确认后再执行提交操作
- **变基等危险操作**: 涉及历史重写的操作（rebase、reset --hard、force push）必须先征得用户同意

### 分支变基与历史整理
- **变基场景**: 当需要将功能分支插入到历史特定位置时，使用 `git rebase --onto <新基准> <旧基准>`
- **历史重写警告**: 变基会改变提交 hash，已推送的分支需要 `git push --force`，需谨慎操作
- **目录重命名处理**: 变基过程中的目录重命名（如 `WA/` → `app_end/`）会自动处理，但新增文件需手动移动
- **备份习惯**: 重大变基前创建备份分支 `git branch backup-$(date +%Y%m%d)`

### 图标管理规范
- **命名规范**: 使用 SF Symbol 风格（如 `sun.max.fill`, `moon.stars`），保持跨平台一致性
- **映射维护**: 所有图标必须在 `icon-symbol-map.ts` 中声明映射，类型系统会自动检查
- **尺寸规范**: 统一使用 `organicTheme.iconSizes.*` token，禁止硬编码数字
- **新增流程**:
  1. 确认 Ionicons 支持该图标
  2. 在映射表中添加 SF Symbol 名称 → Ionicons 名称
  3. 使用 `IconSymbol name="your.icon" />`

## Project Structure & Modules
- `backend/`: Flask API service. Business logic split across `routes/` (blueprints by domain), `models/` (SQLAlchemy models), `utils/`, and `instance/` for local data/config. `app.py` bootstraps the service.
- `app_end/`: React Native Expo 移动应用。使用 Expo Router 文件路由，Zustand 状态管理，Organic 主题设计系统。
- `wechat_end/`: **已弃用**的微信小程序代码，仅供参考/存档，不再维护。
- `mobile_end/`, `web_end/`: 当前为空壳或占位目录。

## Build, Test, and Development Commands
- Backend setup (from repo root):
  ```bash
  cd backend
  python3 -m venv venv && source venv/bin/activate
  pip install -r requirements.txt
  python app.py  # starts on http://localhost:5010
  ```
- Quick smoke check: `curl http://localhost:5010/api/health` should return a healthy status.
- Docker (backend): `docker build -t babysitting-backend ./backend` then `docker run -p 5010:5000 babysitting-backend`. For compose, use `docker-compose -f backend/docker-compose.yml up -d`.
- React Native (app_end/):
  ```bash
  cd app_end
  npm install
  npm start        # 启动开发服务器
  npm run lint     # 代码检查
  npm run ios      # iOS 模拟器
  npm run android  # Android 模拟器/真机
  npm run web      # Web 浏览器
  ```

## Coding Style & Naming Conventions
- Python: follow PEP 8, 4-space indents, `snake_case` functions/variables, `PascalCase` models. Keep responses consistent (`{"status": "...", "message": "...", ...}`) and group routes per blueprint in `routes/`.
- React Native (app_end/):
  - TypeScript: 使用 Organic 主题 Token，优先复用 `components/ui/` 组件
  - 图标: 使用 IconSymbol 组件，SF Symbol 风格命名，映射到 Ionicons
  - 状态管理: Zustand stores (authStore, babyStore, growthStore, appointmentStore)
  - API: 统一使用 `services/api/` 封装的客户端
  - 反馈: 使用 FeedbackContext 的 notify/confirm，不直接调用 Alert.alert
- Configuration: prefer environment variables over hard-coded defaults; add docstrings for non-trivial functions and keep module boundaries clear.

## Testing Guidelines
- No shared suite exists yet; add backend tests alongside features using `pytest` and Flask's test client. Organize under `backend/tests/` with `test_<module>.py`. Example run (after adding pytest to dev deps): `pytest backend/tests -q`.
- React Native: 在 Expo 中手动测试关键流程，使用 `npm run lint` 检查代码规范。包含 UI 变更的 PR 应附上截图或录屏。

## Commit & Pull Request Guidelines
- Git history currently uses short, descriptive Chinese summaries (e.g., “整合先前代码，准备进一步开发”); keep one-line summaries under ~72 chars. If helpful, prefix with feature area (e.g., `auth: ...`).
- PRs should list scope, endpoints or pages touched, env/config notes, and test evidence (commands run or manual checks). Attach screenshots/gif for client-facing changes. Link issues or tasks when available and flag breaking DB or API changes explicitly.

## Security & Configuration Tips
- Do not commit secrets. Override `SECRET_KEY`, `JWT_SECRET_KEY`, database URLs, and WeChat credentials via environment variables or a local `.env` ignored from VCS. Replace placeholder secrets before deploying.
- Be cautious with sample data created in `create_test_data()`; disable or gate it for production deployments and avoid logging sensitive payloads.
