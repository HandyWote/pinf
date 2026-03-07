# app_end Bun Package Manager Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 `app_end` 前端依赖安装统一到 `bun`，阻止 `npm` 混装，并同步 CI 与文档。

**Architecture:** 在 `app_end` 增加一个轻量包管理守卫脚本，通过 `preinstall` 在错误包管理器下快速失败；保留 `bun.lock` 作为唯一锁文件；CI 和文档只暴露 `bun` 安装路径。

**Tech Stack:** Bun, Node.js, Expo, GitHub/Gitea Actions YAML

---

### Task 1: 写包管理守卫测试

**Files:**
- Create: `app_end/scripts/ensure-bun.test.js`
- Test: `app_end/scripts/ensure-bun.test.js`

**Step 1: Write the failing test**

编写两个测试用例：
- 当 `npm_config_user_agent=bun/...` 时脚本退出码为 0。
- 当 `npm_config_user_agent=npm/...` 时脚本退出码非 0，且输出提示只能使用 bun。

**Step 2: Run test to verify it fails**

Run: `node --test ./scripts/ensure-bun.test.js`
Expected: FAIL，因为守卫脚本尚未实现。

**Step 3: Write minimal implementation**

新增 `app_end/scripts/ensure-bun.js`，只判断 `npm_config_user_agent` 是否以 `bun/` 开头。

**Step 4: Run test to verify it passes**

Run: `node --test ./scripts/ensure-bun.test.js`
Expected: PASS

### Task 2: 将 app_end 收口到 bun

**Files:**
- Modify: `app_end/package.json`
- Delete: `app_end/package-lock.json`

**Step 1: Write the failing test**

在 `package.json` 中预期新增：
- `packageManager`
- `preinstall`
- 用于手工验证的 `test:package-manager`

**Step 2: Run test to verify it fails**

Run: `npm install`
Expected: FAIL，并提示只能使用 bun。

**Step 3: Write minimal implementation**

更新 `app_end/package.json` 并删除 `app_end/package-lock.json`。

**Step 4: Run test to verify it passes**

Run: `bun install --frozen-lockfile`
Expected: PASS

### Task 3: 统一 CI 与文档

**Files:**
- Modify: `.github/workflows/app-build-local.yml`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`

**Step 1: Write the failing test**

确认 CI 当前仍会根据 `package-lock.json` 走 `npm ci`/`npm install`，与设计冲突。

**Step 2: Run test to verify it fails**

Run: `rg -n 'npm ci|npm install|package-lock.json' .github/workflows/app-build-local.yml AGENTS.md CLAUDE.md`
Expected: 能检出旧路径。

**Step 3: Write minimal implementation**

把 CI 前端安装切换到 bun，并把文档中的前端安装与最小验收表述改为 bun 流程。

**Step 4: Run test to verify it passes**

Run: `rg -n 'bun install|bun run lint|package-lock.json' .github/workflows/app-build-local.yml AGENTS.md CLAUDE.md`
Expected: 只剩 bun 路径，且不再鼓励前端使用 `package-lock.json`。
