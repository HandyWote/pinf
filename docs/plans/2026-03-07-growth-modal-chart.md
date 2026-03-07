# Growth Modal And Chart Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复成长记录弹窗空白和成长图表黑底问题，并为这两个回归点补上最小测试。

**Architecture:** 保持现有组件体系不变，只抽出可测试的纯辅助函数。`Modal` 继续作为通用组件复用，图表继续使用 `react-native-chart-kit`，仅补足原生端透明背景参数。

**Tech Stack:** React Native, Expo, TypeScript, Jest, @testing-library/react-native

---

### Task 1: Modal Auto Height Layout

**Files:**
- Create: `app_end/components/ui/modalLayout.ts`
- Create: `app_end/components/ui/__tests__/modalLayout.test.ts`
- Modify: `app_end/components/ui/Modal.tsx`

**Step 1: Write the failing test**

写一个测试，要求 `height="auto"` 时不再给 `ScrollView` 注入 `flex: 1`。

**Step 2: Run test to verify it fails**

Run: `jest app_end/components/ui/__tests__/modalLayout.test.ts`

**Step 3: Write minimal implementation**

提取纯函数，根据 `isAutoHeight` 决定是否拼接拉伸样式。

**Step 4: Run test to verify it passes**

Run: `jest app_end/components/ui/__tests__/modalLayout.test.ts`

### Task 2: Growth Chart Transparent Background

**Files:**
- Create: `app_end/components/growth/chartPresentation.ts`
- Create: `app_end/components/growth/__tests__/chartPresentation.test.ts`
- Modify: `app_end/components/growth/GrowthChartView.tsx`

**Step 1: Write the failing test**

写一个测试，要求成长图表展示配置返回 `transparent: true`。

**Step 2: Run test to verify it fails**

Run: `jest app_end/components/growth/__tests__/chartPresentation.test.ts`

**Step 3: Write minimal implementation**

抽出图表展示配置，并在 `LineChart` 上展开使用。

**Step 4: Run test to verify it passes**

Run: `jest app_end/components/growth/__tests__/chartPresentation.test.ts`

### Task 3: Minimal Jest Setup

**Files:**
- Create: `app_end/jest.config.js`

**Step 1: Add minimal test runner config**

使用 `jest-expo` 作为 preset，并补上 `@/` 别名映射。

**Step 2: Run targeted tests**

Run: `jest modalLayout.test.ts chartPresentation.test.ts`

