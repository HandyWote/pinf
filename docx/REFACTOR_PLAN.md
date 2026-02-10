# 早护通 APP 重构计划（详版）

本计划基于现有后端接口（`backend/routes`）、原型配色（应用原型.html）、手机号登录主流程、单一用户端（家长）。不复用旧小程序命名，前端采用 React Native Expo + TypeScript。

> 当前应用目录：`app_end/` (原 `WA/`，已重命名)

## 0. 技术栈与规范
- 客户端：React Native Expo，TypeScript，全局状态（Zustand），导航（Expo Router），HTTP（axios 封装，含 token/401 拦截）。
- 推送：优先简单方案——Expo Notifications；若裸 RN，则 FCM（安卓）+ APNs（iOS）路线。
- 设计系统（Organic Theme）：
  - 色板：Primary（蓝色系），Accent（桃色/薄荷色/薰衣草/天空色），Background（奶油色/纸张色）
  - 渐变：brand, warm, purple, green, sunset, peach
  - 圆角：comfy (14px), cozy (12px), compact (10px), pill
  - 阴影：card, frame, small, nav, floating
  - 间距：xs/sm/md/lg/xl/2xl/3xl
  - 字号：xs/sm/md/lg/xl/2xl/3xl
  - 图标：SF Symbol 风格命名，映射到 Ionicons
- 模块命名：`auth`、`babies`、`growth`、`appointments`、`content`、`profile`。
- 本地存储键：`auth.token`、`babies.list`、`growth.<babyId>`、`appointments.all`、`content.cache`。

## 1. 基础框架与基础设施
1.1 **[已完成]** 初始化项目，采用 Expo Router（Tab + Stack）+ ThemeProvider + Organic 主题设计 token。
1.2 **[已完成]** axios 封装已落地（token 拦截、超时/重试、错误提取），API baseURL 已环境化配置（.env + app.config.ts），401 已联动全局登出与路由跳转。
1.3 **[已完成]** 通用组件库（OrganicCard/OrganicButton/OrganicBackground/Input/Modal/IconSymbol）已实装并复用设计 token。
1.4 **[已完成]** FeedbackContext 统一反馈层（notify/confirm），替代 Alert.alert。

## 2. 认证模块（手机号主流程）
2.1 **[已完成]** 登录页：手机号+验证码登录流程已接入 `/auth/phone/code`、`/auth/phone/login`，含倒计时与格式校验。
2.2 **[已完成]** Token 持久化（AsyncStorage），用户信息缓存。
2.3 **[已完成]** 未登录拦截基于 Expo Router `useSegments` 已生效；401 拦截已联动全局登出/路由跳转（通过 `setUnauthorizedHandler` + `_layout.tsx`）。

## 3. 宝宝管理
3.1 **[已完成]** 首页 BabySwitcher + Modal 列表已接入 `GET /babies`，有空态按钮，含刷新/加载状态。
3.2 **[已完成]** 新建/编辑表单与 API 已接入，支持 `name|gender|birthday|dueDate`。
3.3 **[已完成]** 删除已串 `/babies/{id}` 并带确认，带全局刷新与 notify 反馈。
3.4 **[已完成]** 年龄工具：实际/矫正月龄计算 util 已实现并在首页展示，支持详细格式显示。

## 4. 成长记录与曲线
4.1 **[已完成]** 数据接口：`GET/POST /babies/{babyId}/growth`，`PUT/DELETE /growth/{id}`。
4.2 **[已完成]** 记录管理：按宝宝展示列表；新增/编辑/删除记录；下拉刷新同步。
4.3 **[部分完成]** 曲线渲染：前端内置 WHO/Fenton 常量（身高/体重/头围）；X 轴月龄（WHO）或胎龄周（Fenton）；叠加用户数据点/折线。
4.4 **[待优化]** 曲线渲染：点击图表自动放大、更多交互功能。

## 5. 预约（复诊）与提醒
5.1 **[已完成]** 接口：`GET/POST /appointments`，`PUT/DELETE /appointments/{id}`。
5.2 **[已完成]** 创建/编辑：前端复诊提醒功能，展示在首页。
5.3 **[已完成]** 展示：列表按时间排序；卡片显示诊所/科室/日期/状态；删除/完成操作。
5.4 **[未启动]** 推送：集成 Expo Notifications 或 FCM+APNs。
5.5 后端补充需求：实现订阅接口（新建）
- `POST /notifications/subscriptions`、`DELETE /notifications/subscriptions/:id`。

## 6. 内容课堂
6.1 **[已完成]** 列表/搜索：`GET /content/videos`、`GET /content/articles`，支持 `page|per_page|search|category`。
6.2 **[已完成]** 详情：`GET /content/videos/{id}`、`GET /content/articles/{id}`；详情页展示标题/封面/作者/发布日期/正文。
6.3 **[已完成]** UI：课堂页卡片列表、搜索、分类筛选、空态/错误态、详情页跳转。

## 7. 智能问答（AI）
7.1 **[未启动]** 发送：`POST /chat/send`。
7.2 **[未启动]** 历史：`GET /chat/history`。
7.3 **[未启动]** UI：聊天气泡、loading/失败重试。

## 8. 同步与离线
8.1 **[未启动]** SyncEngine：网络监听；队列处理。
8.2 **[未启动]** 重放策略：网络恢复或定时轮询。
8.3 **[未启动]** 缓存失效策略。

## 9. 我的/设置
9.1 **[已完成]** 个人中心页面（profile.tsx）：展示用户信息、退出登录。
9.2 **[已完成]** 退出登录清 token/缓存，带确认弹窗。
9.3 **[未启动]** 通知设置、隐私/关于/反馈入口。

## 10. 推送集成步骤（简要决策）
- **Expo 方案（最简）**：使用 Expo Notifications。
- **FCM+APNs 方案**：配置 Firebase，iOS 配置 APNs 密钥。

## 11. 测试与验收
11.1 **[部分完成]** Lint 检查已集成。
11.2 **[未启动]** 单元测试、集成测试。
11.3 **[未启动]** E2E：Detox/Appium 覆盖核心闭环。

## 12. 交付与迁移
12.1 **[未启动]** 如需导入旧本地数据：提供一次性迁移脚本。
12.2 **[已完成]** 文档：接口映射表、环境配置（Dev/Stage/Prod）。

## 13. 下一步建议
13.1 **优先级高**：成长曲线图表优化、推送通知集成。
13.2 **优先级中**：AI 聊天界面、离线同步引擎。
13.3 **优先级低**：单元测试和 E2E 测试、更多设置选项。
