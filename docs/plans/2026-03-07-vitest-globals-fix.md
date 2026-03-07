# Vitest Globals Type Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复 `app_end` 中 Vitest 全局类型未生效导致的 TypeScript 验收失败。

**Architecture:** 保持现有测试写法不变，只修正 TypeScript 类型入口。使用 `npx tsc --noEmit` 作为红绿灯验证，不扩大改动面。

**Tech Stack:** TypeScript, Vitest, Expo

---

### Task 1: 修复 Vitest 全局类型入口

**Files:**
- Modify: `app_end/tsconfig.json:6`

**Step 1: 运行失败的类型检查**

Run: `cd app_end && npx tsc --noEmit`
Expected: FAIL，出现 `Cannot find name 'describe'` 或类似全局测试 API 缺失错误

**Step 2: 最小修改配置**

将 `app_end/tsconfig.json` 中 `compilerOptions.types` 的 `vitest` 改为 `vitest/globals`。

**Step 3: 重新运行类型检查**

Run: `cd app_end && npx tsc --noEmit`
Expected: PASS
