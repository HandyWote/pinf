# Dual-Track Testing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 `app_end` 建立“纯逻辑测试”和“RN/UI 测试”双轨测试架构，消除 React Native 运行时对 domain/store/utils 测试的污染，并让覆盖率、别名解析、AsyncStorage mock 与 UI matcher 各归其位。

**Architecture:** 采用两份独立的 `Vitest` 配置：`unit` 面向 `domain/`、`store/`、`services/`、`utils/`，保持轻量、无 RN matcher；`ui` 面向 React Native 组件与页面，集中承接 `react-native`、Expo、`@testing-library/react-native` 相关 setup。先用最小迁移跑通一条 unit 测试链路和一条 UI 冒烟链路，再逐步迁移现有测试。

**Tech Stack:** Expo 54, React Native, TypeScript, Vitest 4, React Native Testing Library, AsyncStorage, Bun

---

### Task 1: 记录现状并冻结最小回归面

**Files:**
- Modify: `app_end/package.json:1`
- Create: `docs/plans/testing-migration-notes.md`

**Step 1: 写一个最小现状说明文档**

在 `docs/plans/testing-migration-notes.md` 记录当前问题：

- `vitest.setup.ts` 提前解析真实 `react-native`
- `@/*` alias 未同步到 Vitest
- AsyncStorage mock 不是 Promise 契约
- coverage provider 依赖缺失
- store 测试断言与实现不一致

**Step 2: 运行当前失败命令并记录失败现象**

Run: `cd app_end && bun run test`
Expected: FAIL，且失败原因包含 setup/alias/mock 问题之一

**Step 3: 运行覆盖率命令并记录失败现象**

Run: `cd app_end && bun run test:coverage`
Expected: FAIL，提示缺少 `@vitest/coverage-v8` 或 setup 相关错误

**Step 4: 提交**

```bash
git add docs/plans/testing-migration-notes.md
git commit -m "docs: capture testing migration baseline"
```

### Task 2: 建立 unit 测试配置骨架

**Files:**
- Create: `app_end/vitest.config.unit.ts`
- Create: `app_end/vitest.setup.unit.ts`
- Modify: `app_end/package.json:1`
- Test: `app_end/domain/growthCurve/engine.test.ts`

**Step 1: 为纯逻辑测试写一个会失败的入口验证**

如果 `app_end/domain/growthCurve/engine.test.ts` 已存在，则直接用它作为红灯用例；否则补一个最小测试，要求能导入 `@/utils/fentonData` 相关链路。

```ts
import { describe, it, expect } from 'vitest';
import { someEngineExport } from './engine';

describe('growth engine unit bootstrap', () => {
  it('loads unit modules through @ alias', () => {
    expect(someEngineExport).toBeDefined();
  });
});
```

**Step 2: 跑 unit 配置验证它先红**

Run: `cd app_end && bunx vitest --config vitest.config.unit.ts run app_end/domain/growthCurve/engine.test.ts`
Expected: FAIL，原因是配置文件尚不存在或 alias 未配置完整

**Step 3: 写最小 unit 配置**

在 `app_end/vitest.config.unit.ts` 中：

- `environment: 'node'`
- `setupFiles: ['./vitest.setup.unit.ts']`
- `include` 只覆盖 `domain/`、`store/`、`services/`、`utils/`
- `resolve.alias` 至少包含：
  - `@` -> `app_end` 根目录
  - `react-native` -> `react-native-web`（仅在必要时）
- `coverage.provider = 'v8'`

在 `app_end/vitest.setup.unit.ts` 中：

- 不引入 `@testing-library/jest-native/extend-expect`
- 仅保留纯逻辑测试需要的轻量 mock

**Step 4: 跑 unit 用例验证变绿**

Run: `cd app_end && bunx vitest --config vitest.config.unit.ts run domain/growthCurve/engine.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add app_end/vitest.config.unit.ts app_end/vitest.setup.unit.ts app_end/package.json app_end/domain/growthCurve/engine.test.ts
git commit -m "test: add unit vitest config"
```

### Task 3: 修正 unit 层 AsyncStorage 契约

**Files:**
- Modify: `app_end/vitest.setup.unit.ts:1`
- Modify: `app_end/store/__tests__/babyStore.test.ts:1`
- Test: `app_end/store/__tests__/babyStore.test.ts`

**Step 1: 先写会失败的 Promise 契约测试**

在 `app_end/store/__tests__/babyStore.test.ts` 增加两类断言：

- `selectBaby()` 调用后不会触发 `undefined.catch`
- `_loadFromStorage()` 能从 `multiGet()` 返回的二维元组正确恢复数据

```ts
it('persists selected baby id through AsyncStorage promise API', async () => {
  const baby = { id: 1, name: 'Test', birthday: '2024-01-01', createdAt: '2024-01-01' };
  useBabyStore.setState({ babies: [baby] });

  expect(() => useBabyStore.getState().selectBaby(1)).not.toThrow();
});
```

**Step 2: 跑单测确认先红**

Run: `cd app_end && bunx vitest --config vitest.config.unit.ts run store/__tests__/babyStore.test.ts`
Expected: FAIL，出现 `undefined.catch` 或 `is not iterable`

**Step 3: 最小实现 Promise 形状 mock**

在 `app_end/vitest.setup.unit.ts` 中统一 mock：

- `setItem: vi.fn().mockResolvedValue(undefined)`
- `getItem: vi.fn().mockResolvedValue(null)`
- `multiGet: vi.fn().mockResolvedValue([])`
- `removeItem: vi.fn().mockResolvedValue(undefined)`

如单测需要，可在测试内部对 `multiGet` 做单次覆写，返回：

```ts
[
  ['babies.list', '[{"id":1,"name":"Test"}]'],
  ['babies.currentId', '1'],
]
```

**Step 4: 再跑单测确认变绿**

Run: `cd app_end && bunx vitest --config vitest.config.unit.ts run store/__tests__/babyStore.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add app_end/vitest.setup.unit.ts app_end/store/__tests__/babyStore.test.ts
git commit -m "test: align async storage mock with promise contract"
```

### Task 4: 校准 unit 层错误断言

**Files:**
- Modify: `app_end/store/__tests__/babyStore.test.ts:1`
- Modify: `app_end/store/__tests__/growthStore.test.ts:1`
- Test: `app_end/store/__tests__/babyStore.test.ts`
- Test: `app_end/store/__tests__/growthStore.test.ts`

**Step 1: 先写红灯，明确两类错误分支**

每个 store 都补两类测试：

- 抛 `new Error('Network error')` 时，断言状态里是 `Network error`
- 抛非 `Error` 时，断言状态里是兜底中文文案

```ts
it('keeps native Error message on fetch failure', async () => {
  vi.mocked(growthApi.listGrowth).mockRejectedValue(new Error('Network error'));

  await expect(useGrowthStore.getState().fetch(1)).rejects.toThrow();

  expect(useGrowthStore.getState().error).toBe('Network error');
});
```

**Step 2: 跑两个测试文件确认先红**

Run: `cd app_end && bunx vitest --config vitest.config.unit.ts run store/__tests__/babyStore.test.ts store/__tests__/growthStore.test.ts`
Expected: FAIL，旧断言仍在期待中文兜底文案

**Step 3: 最小修改断言**

只调整测试，不改生产实现，确保测试反映现有正确行为。

**Step 4: 跑测试确认变绿**

Run: `cd app_end && bunx vitest --config vitest.config.unit.ts run store/__tests__/babyStore.test.ts store/__tests__/growthStore.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add app_end/store/__tests__/babyStore.test.ts app_end/store/__tests__/growthStore.test.ts
git commit -m "test: align store error assertions with implementation"
```

### Task 5: 建立 UI 测试配置骨架

**Files:**
- Create: `app_end/vitest.config.ui.ts`
- Create: `app_end/vitest.setup.ui.ts`
- Modify: `app_end/package.json:1`
- Create: `app_end/components/__tests__/ui-smoke.test.tsx`

**Step 1: 先写一个最小 UI 冒烟测试**

优先复用项目已有 UI 组件，禁止重新造轮子。选择最轻量的现有组件，例如 `components/ui/` 下无导航依赖的按钮、卡片或文本组件。

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react-native';
import { SomeExistingComponent } from '@/components/ui/SomeExistingComponent';

describe('ui smoke', () => {
  it('renders existing ui component', () => {
    const screen = render(<SomeExistingComponent />);
    expect(screen.toJSON()).toBeTruthy();
  });
});
```

**Step 2: 跑 UI 配置确认先红**

Run: `cd app_end && bunx vitest --config vitest.config.ui.ts run components/__tests__/ui-smoke.test.tsx`
Expected: FAIL，原因是 UI 配置或 matcher 尚未建立

**Step 3: 写最小 UI 配置**

在 `app_end/vitest.config.ui.ts` 中：

- 为 UI 测试单独配置 `include`
- 绑定 `setupFiles: ['./vitest.setup.ui.ts']`
- 同步 `@/*` alias

在 `app_end/vitest.setup.ui.ts` 中：

- 只在 UI 配置下引入 `@testing-library/jest-native/extend-expect`
- 集中 mock `react-native`、Expo、AsyncStorage
- 保持与项目现有组件依赖一致

**Step 4: 跑 UI 冒烟测试确认变绿**

Run: `cd app_end && bunx vitest --config vitest.config.ui.ts run components/__tests__/ui-smoke.test.tsx`
Expected: PASS

**Step 5: 提交**

```bash
git add app_end/vitest.config.ui.ts app_end/vitest.setup.ui.ts app_end/package.json app_end/components/__tests__/ui-smoke.test.tsx
git commit -m "test: add ui vitest config"
```

### Task 6: 拆分脚本与覆盖率入口

**Files:**
- Modify: `app_end/package.json:1`

**Step 1: 先写一个脚本存在性检查**

在计划执行时，先运行不存在的新命令，确认当前仓库还没有双轨脚本。

Run: `cd app_end && bun run test:unit`
Expected: FAIL，提示脚本不存在

**Step 2: 最小修改脚本**

在 `app_end/package.json` 中增加：

- `test:unit`: `vitest --config vitest.config.unit.ts`
- `test:ui`: `vitest --config vitest.config.ui.ts`
- `test:coverage:unit`: `vitest --config vitest.config.unit.ts --coverage`

保留原 `test`，但将其改为聚合脚本或明确指向 `test:unit`，避免默认入口再误载入 UI setup。

**Step 3: 跑脚本确认变绿**

Run: `cd app_end && bun run test:unit`
Expected: PASS

Run: `cd app_end && bun run test:coverage:unit`
Expected: PASS

**Step 4: 提交**

```bash
git add app_end/package.json
git commit -m "build: split unit and ui test scripts"
```

### Task 7: 修复后端测试夹具与前端迁移边界

**Files:**
- Modify: `backend/conftest.py:1`
- Modify: `backend/tests/...`（若已有与 `sample_baby` 相关测试则复用）
- Create: `app_end/docs/testing-boundaries.md`

**Step 1: 先写一个会失败的后端夹具测试**

优先复用现有后端测试目录；如果没有，再补最小测试：

```python
def test_sample_baby_fixture_uses_python_date(sample_baby):
    assert sample_baby.birthday.isoformat() == "2024-01-15"
```

**Step 2: 跑测试确认先红**

Run: `cd backend && uv run pytest -q tests/path/to/sample_baby_test.py`
Expected: FAIL，提示 SQLite Date type only accepts Python date objects

**Step 3: 最小修改 fixture**

在 `backend/conftest.py` 中：

- 引入 `date`
- 将 `birthday="2024-01-15"` 改为 `birthday=date(2024, 1, 15)`

在 `app_end/docs/testing-boundaries.md` 中记录规则：

- `domain/`、`store/`、`utils/` 测试禁止依赖 RN matcher
- UI matcher 只允许在 `vitest.setup.ui.ts` 中出现
- 新增纯逻辑测试优先进入 unit 通道

**Step 4: 跑后端测试确认变绿**

Run: `cd backend && uv run pytest -q tests/path/to/sample_baby_test.py`
Expected: PASS

**Step 5: 提交**

```bash
git add backend/conftest.py backend/tests app_end/docs/testing-boundaries.md
git commit -m "test: fix sample baby fixture and document testing boundaries"
```

### Task 8: 最小验收与收尾

**Files:**
- Modify: `docs/plans/testing-migration-notes.md`

**Step 1: 跑前端 unit 验收**

Run: `cd app_end && bun run test:unit`
Expected: PASS

**Step 2: 跑前端 UI 冒烟验收**

Run: `cd app_end && bun run test:ui`
Expected: PASS

**Step 3: 跑前端类型检查**

Run: `cd app_end && npx tsc --noEmit`
Expected: PASS

**Step 4: 跑前端覆盖率**

Run: `cd app_end && bun run test:coverage:unit`
Expected: PASS

**Step 5: 跑后端目标验收**

Run: `cd backend && uv run pytest -q tests/path/to/sample_baby_test.py`
Expected: PASS

**Step 6: 更新迁移记录**

在 `docs/plans/testing-migration-notes.md` 追加：

- 已迁入 unit 的测试类别
- 已建立的 UI 冒烟测试入口
- 尚未迁移的组件测试清单

**Step 7: 提交**

```bash
git add docs/plans/testing-migration-notes.md
git commit -m "docs: record dual-track testing rollout status"
```

