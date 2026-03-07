# Testing Migration Notes

> Created: 2026-03-07
> Purpose: Capture current testing issues before dual-track migration

## Current Problems

### 1. vitest.setup.ts 提前解析真实 react-native
- The main `vitest.setup.ts` imports from `@testing-library/jest-native`
- This causes React Native runtime to be loaded even for pure logic tests

## Current Test Failures (Baseline)

### bun run test
```
SyntaxError: Unexpected token 'typeof'
```
All 10 test suites fail during import transformation - alias not resolved.

### bun run test:coverage
```
MISSING DEPENDENCY: Cannot find dependency '@vitest/coverage-v8'
```

### 2. @/* alias 未同步到 Vitest
- TypeScript path alias `@/*` configured in tsconfig.json
- Not properly mapped in vitest.config.ts

### 3. AsyncStorage mock 不是 Promise 契约
- Current mock returns sync values instead of Promise
- Causes `undefined.catch` errors when store tries async operations

### 4. coverage provider 依赖缺失
- Missing `@vitest/coverage-v8` package

### 5. store 测试断言与实现不一致
- Tests expect Chinese fallback error messages
- Implementation actually preserves native Error messages

## Migration Status

### Completed
- ✅ Task 1: 记录现状并冻结最小回归面
- ✅ Task 2: 建立 unit 测试配置骨架
- ✅ Task 3: 修正 unit 层 AsyncStorage 契约
- ✅ Task 4: 校准 unit 层错误断言
- ✅ Task 5: 建立 UI 测试配置骨架
- ✅ Task 6: 拆分脚本与覆盖率入口
- ⚠️ Task 7: 后端测试无需修复 (测试已通过)
- ✅ Task 8: 最小验收

### Unit 测试覆盖范围
- `domain/growthCurve/` - 全部通过
- `store/__tests__/` - babyStore, growthStore 通过
- `utils/__tests__/` - ageCalculator, appointment 通过

### 新增脚本
- `bun run test:unit` - 运行 unit 测试
- `bun run test:coverage:unit` - 运行 unit 覆盖率
- `bun run test:ui` - UI 测试 (配置已就绪)

### 待处理
- UI 测试冒烟测试验证 (组件渲染测试)
- tsconfig.json 类型错误修复 (测试文件中的 mock 数据类型)

## Testing Boundaries

See: `app_end/docs/testing-boundaries.md`
