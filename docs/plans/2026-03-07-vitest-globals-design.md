# Vitest Globals Type Fix Design

**Problem:** `app_end/tsconfig.json` 使用了 `vitest` 类型入口，未注入 `describe`、`it`、`expect` 的全局声明，导致 `npx tsc --noEmit` 在测试文件上失败。

**Decision:** 采用最小修复方案，只将 `app_end/tsconfig.json` 中的 `vitest` 替换为 `vitest/globals`，不批量修改测试文件，也不引入额外的测试专用 `tsconfig`。

**Why:** 这是直接命中 review 的修复方式，改动最小，风险最低，并且与现有依赖 Vitest globals 的测试写法一致。
