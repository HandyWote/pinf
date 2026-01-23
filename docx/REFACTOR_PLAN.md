# 早护通 APP 重构计划（详版）

本计划基于现有后端接口（`backend/routes`）、原型配色（应用原型.html）、手机号登录主流程、单一用户端（家长）。不复用旧小程序命名，前端预计采用 React Native Expo + TypeScript。

## 0. 技术栈与规范
- 客户端：React Native Expo ，TypeScript，全局状态（Zustand/Redux Toolkit），导航（React Navigation），HTTP（axios 封装，含 token/401 拦截）。
- 推送：优先简单方案——Expo Notifications（若用 Expo）；若裸 RN，则 FCM（安卓）+ APNs（iOS）路线。
- 设计 Token（取自应用原型.html）：  
  - 色板：`primary #6B9AC4`，`primaryLight #EBF4FA`，`accent #FF9F89`，`bgBody #dfe6e9`（机身背景）/`#F0F4F8`（内容背景），`textMain #2D3436`，`textSub #8B9BB4`，`surface #FFFFFF`，`frameBorder #2D3436`。  
  - 渐变：`brandGrad linear(135deg, #6B9AC4, #86B3D1)`，`warmGrad linear(135deg, #FF9A9E, #FECFEF)`，`purpleGrad linear(135deg, #a18cd1, #fbc2eb)`，`greenGrad linear(135deg, #84fab0, #8fd3f4)`，`sunsetGrad linear(135deg, #fccb90, #d57eeb)`。  
  - 中性色：`mutedBg #F0F0F0`，`mutedText #999`，`divider #ddd`，`iconMute #ccc`，`tagBg #eee`。  
  - 圆角：卡片 20，组件 14/10；阴影：`cardShadow 0 10px 30px rgba(107,154,196,0.15)`；机身阴影：`0 0 0 12px #2d3436, 0 20px 50px rgba(0,0,0,0.3)`。  
  - 间距：24/20/16/12/8；字号：20/16/14/12；字体：`'PingFang SC', 'Helvetica Neue', sans-serif`。
- 模块命名：`auth`、`babies`、`growth`、`visits`（预约）、`content`、`assistant`、`profile`、`sync`。
- 本地存储键：`auth.token`、`user.profile`、`babies.list`、`growth.<babyId>`、`visits.<babyId>`、`content.cache`、`assistant.history`、`sync.queue`、`sync.lastRun`。

## 1. 基础框架与基础设施
1.1 **[已完成]** 初始化 WA（./WA）项目，采用 Expo Router（Tab + Stack）+ ThemeProvider + 设计 token。
1.2 **[已完成]** axios 封装已落地（token 拦截、超时/重试、错误提取），API baseURL 已环境化配置（支持 .env + app.config.ts），401 已联动全局登出与路由跳转。
1.3 **[已完成]** 通用组件库（Button/Card/Input/Modal/Tag/ListItem/ChartContainer）已实装并复用设计 token。

## 2. 认证模块（手机号主流程）
2.1 **[已完成]** 登录页：手机号+验证码登录流程已接入 `/auth/phone/code`、`/auth/phone/login`，含倒计时与格式校验。
2.2 **[已完成]** Token 持久化（AsyncStorage），用户信息缓存 `user.profile`。
2.3 **[已完成]** 未登录拦截基于 Expo Router `useSegments` 已生效；401 拦截已联动全局登出/路由跳转（通过 `setUnauthorizedHandler` + `_layout.tsx`）。

## 3. 宝宝管理
3.1 **[部分完成]** 首页 BabySwitcher+Modal 列表已接入 `GET /babies`，有空态按钮，缺刷新/加载状态提示。
3.2 **[部分完成]** 新建/编辑表单与 API 已接入，但仅覆盖 `name|gender|birthday|dueDate`，尚未支持 `gestationalWeeks|note`。
3.3 **[部分完成]** 删除已串 `/babies/{id}` 并带确认，缺全局刷新与错误提示优化。
3.4 **[已完成]** 年龄工具：实际/矫正月龄计算 util 已实现并在首页展示。

## 4. 成长记录与曲线
4.1 **[部分完成]** 数据接口：`GET/POST /babies/{babyId}/growth`，`PUT/DELETE /growth/{id}`；字段 `metric(height|weight|head|bmi)|value|unit|recordedAt|note?`。
4.2 **[部分完成]** 记录管理：按宝宝展示列表；新增/编辑/删除记录；本地缓存 `growth.<babyId>`，下拉刷新同步。
4.3 **[部分完成]** 曲线渲染：前端内置 WHO/Fenton 常量（身高/体重/头围）；X 轴月龄（WHO）或胎龄周（Fenton）；叠加用户数据点/折线；支持性别切换。
4.4 **[未启动]** 曲线渲染待优化如：点击图表自动放大

## 5. 预约（复诊）与提醒
5.1 **[完成]** 接口：`GET/POST /appointments`，`PUT/DELETE /appointments/{id}`；字段 `clinic|department|scheduledAt|remindAt?|status|note?|babyId?`。
5.2 **[完成]** 创建/编辑：前端计算 `remindAt` = `scheduledAt` - N 天 09:00；状态 pending/completed/overdue。
5.3 **[完成]** 展示：列表按时间排序；卡片显示诊所/科室/日期/状态；删除/完成操作。
5.4 **[未启动]** 推送：集成 Expo Notifications 或 FCM+APNs；落地应用图标红点、应用内红点；本地通知兜底。
5.5 后端补充需求：实现订阅接口（新建）
- `POST /notifications/subscriptions`（payload: deviceToken, platform, locale；user 从 JWT），`DELETE /notifications/subscriptions/:id`，`POST /notifications/test`（可选）。
- 后台 job 按 `remindAt` 推送预约提醒。

## 6. 内容课堂
6.1 **[已完成]** 列表/搜索：`GET /content/videos`，`GET /content/articles`，query 支持 `page|per_page|search|category`；缓存 1h；前端接入分页/搜索/分类。
6.2 **[已完成]** 详情：`GET /content/videos/{id}`（增加 view 计数）、`GET /content/articles/{id}`；详情页展示标题/封面/作者/发布日期/简介或正文。
6.3 **[已完成]** UI：课堂页卡片列表、手动刷新、空态/错误态、详情页跳转。
6.x **[已完成]** 本地联调辅助：`CONTENT_SEED=1` 时注入示例内容（默认关闭，不影响生产）。

## 7. 智能问答（AI）
7.1 **[未启动]** 发送：`POST /chat/send`，传 `content`，可选 `babyId`、`messageId`、`history`（AI 端控制格式）；前端维持本地 `assistant.history`。
7.2 **[未启动]** 历史：`GET /chat/history`（分页）；清空：`DELETE /chat/history`（可选 babyId）。
7.3 **[未启动]** UI：聊天气泡、loading/失败重试、上下文开关（前端可选是否携带 history）。

## 8. 同步与离线
8.1 **[未启动]** SyncEngine：网络监听；队列项 `{id,type,payload,createdAt}`，type 覆盖 baby/growth/appointment/chat（可扩展）。
8.2 **[未启动]** 重放策略：网络恢复或定时轮询 `sync.queue`；`Promise.allSettled` 成功即移除，失败保留重试。
8.3 **[未启动]** 缓存失效：内容 1h，列表 10min，可配置；手动刷新入口。

## 9. 我的/设置
9.1 **[部分完成]** 退出登录清 token/缓存已实现；账户信息展示页未落地。
9.2 **[未启动]** 通知设置：开关推送（绑定订阅接口）、本地红点/提醒开关。
9.3 **[未启动]** 其他：隐私/关于/反馈入口。

## 10. 推送集成步骤（简要决策）
- **Expo 方案（最简）**：使用 Expo Notifications，获取 push token，注册到 `/notifications/subscriptions`；服务端用 Expo Push API 发送。
- **FCM+APNs 方案**：配置 Firebase（安卓直接）、iOS 配置 APNs 密钥；前端获取 device token，注册到 `/notifications/subscriptions`；后端使用 FCM server 发送；Badge/红点在通知 payload 控制。

## 11. 测试与验收
11.1 **[未启动]** 单元：axios 封装、年龄计算、SyncEngine 队列处理、`remindAt` 计算。
11.2 **[未启动]** 集成：登录→建宝宝→加成长记录→看曲线→建预约→触发提醒→内容查看→AI 问答。
11.3 **[未启动]** E2E：Detox/Appium 覆盖核心闭环；离线→上线重放队列验证。

## 12. 交付与迁移
12.1 **[未启动]** 如需导入旧本地数据：提供一次性迁移脚本读取旧键写入新键。
12.2 **[未启动]** 文档：接口映射表、状态机、存储键、推送配置步骤、环境配置（Dev/Stage/Prod 域名与 key）。

## 13. WA 端下一步建议（基于现有进度）
13.1 ~~打通认证与后端环境配置：API baseURL 环境化（区分 Android 模拟器/真机/iOS），补全 401 触发全局登出与跳转逻辑。~~ **[已完成]**
13.2 完善宝宝管理闭环：新增宝宝列表/详情/编辑/删除流程，统一成功/失败提示；首页"添加宝宝"改为完整表单流程。
13.3 成长记录模块：列表/新增/编辑/删除接入后端，并完成 WHO/Fenton 曲线渲染与年龄维度切换。
13.4 复诊与提醒模块：预约 CRUD、提醒时间计算、本地通知先落地（Expo Notifications）。
13.5 课堂/问答接入真实接口：替换 mock 数据，补齐加载/空态/错误态与分页/刷新。
