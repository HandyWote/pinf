# Web Warnings Foundation Design

**日期：** 2026-03-07

## 背景

Expo Web 开发环境当前存在多类告警，其中一部分来自第三方图表库，另一部分来自项目自有基础组件。当前任务范围限定为先处理“真实缺陷 + 自有组件可干净修复的 Web 兼容问题”，避免把问题扩大为图表库替换或大面积页面重写。

## 目标

在不重造现有 UI 组件体系的前提下，修复以下基础问题：

- `OrganicCard` 在 Web 下出现 `Unexpected text node` 相关错误。
- `Button` 使用旧式 `shadow*` 样式，触发 React Native Web 废弃告警。
- `Modal` 在 Web 下使用 `useNativeDriver`，触发降级告警。
- 保持现有页面调用方式不变，尽量把兼容逻辑收敛在组件内部。

## 非目标

- 不处理 `react-native-chart-kit` / `react-native-svg` 带来的 responder 与 DOM 属性告警。
- 不替换图表库。
- 不大规模调整页面结构或视觉样式。

## 方案候选

### 方案 A：最小补丁

只修 `OrganicCard`、`Button`、`Modal` 的最直接问题。

优点：

- 改动小，见效快。

缺点：

- 基础兼容策略不够集中，后续同类问题容易再次出现。

### 方案 B：基础组件层治理（采用）

在不改变外部 API 的前提下，将 Web 特定兼容逻辑收敛到基础组件内部，必要时补一个非常轻量的基础工具函数。

优点：

- 技术债最低。
- 页面层无需逐个修补。
- 后续扩展时更容易复用。

缺点：

- 比最小补丁多一些实现与验证工作。

### 方案 C：页面逐点止血

只修当前触发告警的页面调用点，不动组件内部实现。

优点：

- 表面上最直接。

缺点：

- 重复劳动。
- 新页面仍会继续命中同类问题。

## 采用设计

采用方案 B，保持组件公共接口稳定。

### OrganicCard

- 检查卡片内容容器与 overlay 结构。
- 避免任何会在 Web 中形成裸文本节点的渲染形式。
- 将仅 Web 可用或仅浏览器支持的视觉能力做安全降级，避免继续引入新的 DOM 兼容问题。

### Button

- 保留现有 theme token。
- 阴影改为跨平台安全的样式生成方式：Web 走 `boxShadow` 或降级实现，Native 保持原有视觉。
- 外部 `Button` props 与调用代码不变。

### Modal

- 保留现有动画结构与交互行为。
- 将 `useNativeDriver` 按平台切换：Web 关闭，Native 保持开启。
- 不修改现有业务组件的 `Modal` 使用方式。

## 测试策略

仓库当前未提供现成前端测试脚手架，因此本次采用“最小可运行测试”策略：

- 优先为可提取的纯函数或样式构建逻辑写测试。
- 对无法直接建立运行测试的 React 组件变更，使用 TypeScript 校验与 ESLint 作为最小验收。
- 所有修复都需至少经过目标文件静态验证。

## 验收标准

- 登录页中的 `OrganicCard` 不再触发 `Unexpected text node` 报错。
- `Button` 不再触发 `shadow* style props are deprecated`。
- 自定义 `Modal` 不再触发 `useNativeDriver` Web 降级告警。
- 前端静态校验通过或明确记录无法完成的项及原因。
