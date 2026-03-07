# 项目今日日志（2026-02-11）
## 0. 文档说明

本文件用于记录 **2026-02-11** 当天在当前仓库中的全部改动（基于当前工作区未提交变更快照），不限定于单一需求。
统计口径：
1. 基于 `git status --short` 与 `git diff`。
2. 不区分作者，仅记录“今天这批改动”。
3. 若后续继续修改，请在本文末尾追加更新记录。

---

## 1. 今日改动总览

截至当前，工作区变更如下：
1. 已修改文件（M）：6 个。
2. 新增文档（??）：1 个（本文件）。
3. 主要涉及模块：
   - 小课堂 UI 风格同步（列表页 + 视频详情 + 文章详情）
   - 前端配置（API 地址读取策略）
   - 依赖清理（移除 `react-native-svg-charts` 及相关锁文件条目）

---

## 2. 文件级改动清单

### 2.1 前端页面（视觉/样式）

1. `app_end/app/(tabs)/class.tsx`
   - 课堂列表页从旧 `theme` 风格迁移到 `organicTheme` 温暖风格。
   - 引入并使用 `OrganicBackground`、`OrganicCard`、`OrganicButton`、`OrganicChipButton`。
   - 统一刷新态、加载态、空态、错误态、列表卡片/按钮视觉语义。

2. `app_end/app/class-video/[id].tsx`
   - 视频详情页迁移到 `organicTheme`。
   - 页面容器改为 `OrganicBackground`，错误态与信息块改为 `OrganicCard`。
   - 分类展示改为 `OrganicChipButton`，返回按钮与文本层级对齐 Organic token。

3. `app_end/app/class-article/[id].tsx`
   - 文章详情页迁移到 `organicTheme`。
   - 页面容器改为 `OrganicBackground`，错误态改为 `OrganicCard`。
   - 分类展示改为 `OrganicChipButton`，标题、元信息、正文排版统一 token。

### 2.2 前端配置

1. `app_end/app.config.ts`
   - `apiBaseUrl` 从“带本地默认值”改为“仅读取环境变量”：
   - 旧：`process.env.API_BASE_URL || 'http://localhost:5010/api'`
   - 新：`process.env.API_BASE_URL`
   - note: 模拟器用新的，web 用旧的？

### 2.3 依赖与锁文件

1. `app_end/package.json`
   - 移除依赖：`react-native-svg-charts`

2. `app_end/package-lock.json`
   - 同步移除 `react-native-svg-charts` 及其相关依赖树条目（如 d3 相关包）。
   - 锁文件中少量依赖标记（`dev`）发生联动更新。

---

## 3. 今日改动明细（按主题）

### 3.1 主题一：小课堂温暖风格同步

目标：
1. 与首页 Tab 的 Organic 视觉统一。
2. 优先使用 `organicTheme` token 与 Organic 组件。

结果：
1. 课堂 3 页面已完成风格迁移。
2. 业务逻辑（API、缓存、分页、路由）未改，仅改 UI 视觉与样式结构。

### 3.2 主题二：配置与依赖收敛

目标：
1. 收敛 API 地址来源，避免隐式默认值。
2. 清理未使用或计划移除的图表依赖。

结果：
1. `app.config.ts` 已改为严格环境变量来源。
2. `react-native-svg-charts` 已从依赖和锁文件中移除。

---

## 4. 验证记录

已执行：
1. `cd app_end && npm run lint`：通过。
2. `cd app_end && npx tsc --noEmit`：通过。

备注：
1. 本次验证以前端静态检查为主。
2. 未涉及后端逻辑变更。

---

## 5. 风险与注意事项

1. `app_end/app.config.ts` 去掉默认 API 地址后，开发环境必须显式配置 `API_BASE_URL`，否则请求地址可能为空。
2. 移除 `react-native-svg-charts` 后，若仍有历史页面隐式依赖该库，需要在后续联调中确认无运行时引用。
3. 当前为未提交状态，建议提交前再次执行一次完整前端启动验证（`npm start` + 关键页面手测）。

---

## 6. 回滚指引（按改动组）

仅回滚课堂风格同步：

```bash
git restore "app_end/app/(tabs)/class.tsx" "app_end/app/class-video/[id].tsx" "app_end/app/class-article/[id].tsx"
```

仅回滚配置与依赖改动：

```bash
git restore "app_end/app.config.ts" "app_end/package.json" "app_end/package-lock.json"
```

---

## 7. 后续追加记录区

如今天后续继续改动，请按下面模板追加：

```md
### [HH:mm] 变更标题
- 文件：
- 改动类型：
- 影响范围：
- 验证结果：
```

### [新增] 小课堂内容链路重构（去假数据 + URL 跳转 + App 内嵌浏览）
- 文件：
  - `backend/routes/content.py`
  - `backend/models/content.py`
  - `backend/utils/db_migrations.py`
  - `app_end/types/content.ts`
  - `app_end/app/(tabs)/class.tsx`
  - `app_end/app/class-video/[id].tsx`
  - `app_end/app/class-article/[id].tsx`
  - `app_end/app/_layout.tsx`
  - `app_end/app/webview.tsx`（新增）
  - `app_end/utils/open-external-url.ts`（新增）
  - `app_end/components/home/OrganicHomeScreen.tsx`
  - `app_end/package.json`
  - `app_end/package-lock.json`
- 改动类型：功能增强 + 数据清理 + 字段扩展 + 路由新增
- 影响范围：
  1. 后端废除课堂自动写入假数据（移除 seed 执行路径）。
  2. 后端为 `videos/articles` 新增 `source_url` 字段并返回 `sourceUrl`。
  3. 迁移新增：字段补齐 + 历史 seed 数据清理。
  4. 前端课堂列表/详情点击链接时，优先进入 App 内嵌 WebView 浏览，减少跳转感。
  5. WebView 页支持加载态、错误态、重试、外部打开兜底。
  6. 首页内容课堂入口去掉 `mockContent`，改为真实入口卡片。
- 验证结果：
  - `python -m py_compile backend/routes/content.py backend/models/content.py backend/utils/db_migrations.py` 通过
  - `cd app_end && npm run lint` 通过
  - `cd app_end && npx tsc --noEmit` 通过

### [新增] 课堂链接数据入库（人工给定 URL）
- 数据写入结果：
  1. 文章：`【课堂加油站】早产儿为什么要随访呢？`
     - `source_url=https://mp.weixin.qq.com/s/tCozl05v7c-gtJcFJH828w`
     - `article_inserted_id=4`
  2. 视频：`【每日技能】坐姿母乳喂养`
     - `source_url=https://mp.weixin.qq.com/s/j1gdtXxUqMhM3jwMchs7Og`
     - `video_inserted_id=3`
- 说明：
  - 文章链接已规范化为主链接（去追踪参数）。
  - 写入逻辑为幂等（同链接重复执行时更新，不重复新增）。

### [新增] 回滚参考（本轮新增能力）
- 仅回滚 App 内嵌浏览相关：
```bash
git restore "app_end/app/_layout.tsx" "app_end/app/(tabs)/class.tsx" "app_end/app/class-video/[id].tsx" "app_end/app/class-article/[id].tsx" "app_end/package.json" "app_end/package-lock.json"
git clean -f "app_end/app/webview.tsx" "app_end/utils/open-external-url.ts"
```
- 仅回滚后端 source_url 字段与清理迁移：
```bash
git restore "backend/models/content.py" "backend/routes/content.py" "backend/utils/db_migrations.py" "app_end/types/content.ts"
```

### [新增] AI 问答页面实装（对话主视图 + 真实接口接入）
- 修改文件：
  - `app_end/app/(tabs)/qa.tsx`
  - `app_end/services/api/chat.ts`（新增）
  - `app_end/types/chat.ts`（新增）
  - `app_end/services/api/index.ts`
- 主要改动：
  - 问答页改为“对话框主视图”，移除快捷提示功能区。
  - 删除页面中“演示/示例/实例”等文案，改为真实使用表达。
  - 接入现有后端聊天接口：`GET /chat/history`、`POST /chat/send`、`DELETE /chat/history`。
  - 增加发送中/失败状态展示；清空会话走统一 `Feedback.confirm`，错误走 `notify` + 页面内错误文案。
  - 会话维度按当前宝宝 `babyId` 传参；无宝宝时使用通用会话。
- 验证结果：
  - `cd app_end && npm run lint` 通过
  - `cd app_end && npx tsc --noEmit` 通过
- 回滚参考：
```bash
git restore "app_end/app/(tabs)/qa.tsx" "app_end/services/api/index.ts"
git clean -f "app_end/services/api/chat.ts" "app_end/types/chat.ts"
```
