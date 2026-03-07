# app_end Bun 包管理收口设计

**背景**

`app_end` 当前同时存在 `bun.lock` 与 `package-lock.json`，并且 Expo CLI 解析路径已经出现顶层与嵌套安装结构不一致的问题，直接导致 `@expo/cli` 模块缺失和 `expo` 解析失败。

**目标**

- 前端目录 `app_end/` 只允许使用 `bun` 安装依赖。
- 消除 `npm`/`bun` 混装导致的锁文件与 `node_modules` 漂移。
- 将 CI 前端安装路径统一到 `bun`。

**方案选型**

1. 只修当前 `node_modules`，不加约束。
缺点是问题高概率复发，技术债最高。

2. 在 `app_end` 内声明并守卫 `bun`，同时统一 CI 与文档。
优点是改动集中、技术债最低、不会误伤根目录工具链。

3. 整个仓库强制全部 Node 工具都迁移到 `bun`。
缺点是范围过大，会影响根目录现有 `eas-cli` 使用习惯。

**采用方案**

采用方案 2。

**设计**

- 在 `app_end/package.json` 增加 `packageManager` 声明和 `preinstall` 守卫。
- 新增 `app_end/scripts/ensure-bun.js`，在非 `bun` 安装时快速失败。
- 新增一个最小 Node 测试文件，覆盖 `bun` 与非 `bun` 两条路径。
- 删除 `app_end/package-lock.json`，保留 `app_end/bun.lock` 作为唯一锁文件。
- 将前端构建工作流里的依赖安装切换为 `bun install --frozen-lockfile`。
- 同步 `AGENTS.md` / `CLAUDE.md` 中前端安装与最小验收说明。

**非目标**

- 不调整 Expo SDK、Router 或业务依赖版本。
- 不改业务代码与运行时配置。
- 不处理根目录 `package-lock.json`。
