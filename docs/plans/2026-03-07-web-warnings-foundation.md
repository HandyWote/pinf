# Web Warnings Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复自有基础组件中的 Web 兼容告警与一个真实渲染错误，同时保持现有页面调用接口不变。

**Architecture:** 变更集中在基础组件层，不在业务页面散落 Web 特判。优先通过小型纯函数和平台分支收敛兼容逻辑，再用静态校验验证整体稳定性。

**Tech Stack:** Expo Router, React Native, React Native Web, TypeScript, ESLint

---

### Task 1: 提取跨平台阴影样式构建

**Files:**
- Create: `app_end/components/ui/__tests__/shadowStyle.test.js`
- Create: `app_end/components/ui/shadowStyle.ts`
- Modify: `app_end/components/ui/Button.tsx`
- Test: `app_end/components/ui/__tests__/shadowStyle.test.js`

**Step 1: Write the failing test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');

const { buildShadowStyle } = require('../shadowStyle');

test('buildShadowStyle returns boxShadow on web', () => {
  const result = buildShadowStyle('web', {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  });

  assert.equal(typeof result.boxShadow, 'string');
  assert.equal('shadowColor' in result, false);
});
```

**Step 2: Run test to verify it fails**

Run: `python3 --version`
Then run: `python3 - <<'PY'\nprint('placeholder')\nPY`

Expected: 当前仓库缺少可直接执行 TS 单测脚手架，因此先确认可用运行环境；随后使用 Node 兼容测试文件执行失败，表现为模块不存在或函数未定义。

**Step 3: Write minimal implementation**

```ts
export function buildShadowStyle(platform: 'web' | 'native', shadow: ShadowTokens) {
  if (platform === 'web') {
    return {
      boxShadow: `${shadow.shadowOffset.width}px ${shadow.shadowOffset.height}px ${shadow.shadowRadius}px rgba(0, 0, 0, ${shadow.shadowOpacity})`,
    };
  }

  return shadow;
}
```

**Step 4: Run test to verify it passes**

Run: `node app_end/components/ui/__tests__/shadowStyle.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add app_end/components/ui/__tests__/shadowStyle.test.js app_end/components/ui/shadowStyle.ts app_end/components/ui/Button.tsx
git commit -m "fix: normalize button shadow styles for web"
```

### Task 2: 修复 OrganicCard 的 Web 渲染结构

**Files:**
- Modify: `app_end/components/ui/OrganicCard.tsx`
- Test: `app_end/components/ui/__tests__/organicCardStructure.test.js`
- Create: `app_end/components/ui/__tests__/organicCardStructure.test.js`

**Step 1: Write the failing test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeCardChildren } = require('../OrganicCard.helpers');

test('normalizeCardChildren removes standalone whitespace text nodes', () => {
  const result = normalizeCardChildren([' ', '\n', '内容']);
  assert.equal(result.length, 1);
});
```

**Step 2: Run test to verify it fails**

Run: `node app_end/components/ui/__tests__/organicCardStructure.test.js`
Expected: FAIL with module not found

**Step 3: Write minimal implementation**

```ts
export function normalizeCardChildren(children: React.ReactNode) {
  return React.Children.toArray(children).filter((child) => {
    return typeof child !== 'string' || child.trim().length > 0;
  });
}
```

并在 `OrganicCard.tsx` 中统一使用归一化后的 children 渲染内容容器。

**Step 4: Run test to verify it passes**

Run: `node app_end/components/ui/__tests__/organicCardStructure.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add app_end/components/ui/__tests__/organicCardStructure.test.js app_end/components/ui/OrganicCard.tsx app_end/components/ui/OrganicCard.helpers.ts
git commit -m "fix: normalize organic card children on web"
```

### Task 3: 修复 Modal 的 Web 动画驱动配置

**Files:**
- Create: `app_end/components/ui/__tests__/modalAnimationConfig.test.js`
- Create: `app_end/components/ui/modalAnimation.ts`
- Modify: `app_end/components/ui/Modal.tsx`
- Test: `app_end/components/ui/__tests__/modalAnimationConfig.test.js`

**Step 1: Write the failing test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');

const { getUseNativeDriver } = require('../modalAnimation');

test('getUseNativeDriver disables native driver on web', () => {
  assert.equal(getUseNativeDriver('web'), false);
  assert.equal(getUseNativeDriver('ios'), true);
});
```

**Step 2: Run test to verify it fails**

Run: `node app_end/components/ui/__tests__/modalAnimationConfig.test.js`
Expected: FAIL with module not found

**Step 3: Write minimal implementation**

```ts
export function getUseNativeDriver(platform: string) {
  return platform !== 'web';
}
```

并在 `Modal.tsx` 中替换所有 `useNativeDriver: true`。

**Step 4: Run test to verify it passes**

Run: `node app_end/components/ui/__tests__/modalAnimationConfig.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add app_end/components/ui/__tests__/modalAnimationConfig.test.js app_end/components/ui/modalAnimation.ts app_end/components/ui/Modal.tsx
git commit -m "fix: disable native driver for modal animations on web"
```

### Task 4: 静态验证

**Files:**
- Modify: `app_end/components/ui/Button.tsx`
- Modify: `app_end/components/ui/OrganicCard.tsx`
- Modify: `app_end/components/ui/Modal.tsx`

**Step 1: Run targeted static checks**

Run: `cd app_end && npx tsc --noEmit`
Expected: PASS

**Step 2: Run lint**

Run: `cd app_end && bun run lint`
Expected: PASS

**Step 3: Manual verification note**

在 Web 开发环境打开登录页与首页，确认以下告警消失：

- `Unexpected text node`
- `shadow* style props are deprecated`
- `useNativeDriver is not supported`

**Step 4: Commit**

```bash
git add app_end/components/ui/Button.tsx app_end/components/ui/OrganicCard.tsx app_end/components/ui/Modal.tsx
git commit -m "fix: clean up foundational web warnings"
```
