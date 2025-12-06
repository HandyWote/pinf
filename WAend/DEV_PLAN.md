# WAend 实施计划（方案 C：victory-native 图表）

> 目标：在保留前端与数据层解耦的前提下，按功能步进完成移动端（RN）实现，图表用 `victory-native` + `react-native-svg`，暂不依赖旧后端。

## 阶段 0：环境与依赖
- 确认 RN 0.82 工程可运行（`yarn start` / `yarn android` / `yarn ios`）。
- 安装依赖：`react-native-svg`、`victory-native`、`@react-native-async-storage/async-storage`、`@react-native-community/netinfo`、`@react-navigation/native` + stack/bottom-tabs。可选：`react-native-gesture-handler`（提升手势体验）。
- iOS 执行 `cd ios && pod install`（若需）。验证示例页可正常显示。

## 阶段 1：架构骨架
- 搭建导航：BottomTab（Home/Growth/Content/Chat/Profile）+ Stack（Auth、Onboarding、Appointments、BabyProfile、ContentDetail、ChatHistory）。
- 主题：主色 `#009688`、辅色 `#ff8a65`、浅灰背景卡片阴影；封装 ThemeProvider 或常量。
- 公共组件：卡片、按钮、胶囊切换、空态占位（渐变）、加载骨架。

## 阶段 2：数据层与缓存
- 定义服务接口与适配层（mock 实现）：`services/api/*.ts`；实体模型 `User`、`Baby`、`GrowthRecord`、`Appointment`、`ContentItem`、`ChatMessage`。
- Store：Context + reducer；持久化策略（AsyncStorage）；NetInfo 监听离线提示。
- 参考曲线服务：本地内置 WHO/Fenton 关键点，按指标/周龄切片返回。

## 阶段 3：认证与引导
- 登录/注册页：微信按钮 + 手机号验证码；写 token 到 store/cache（mock）。
- 引导/资料采集：多步骤表单（家长→宝宝→妊娠/预产期→提醒偏好），实时显示矫正月龄预览；首次无宝宝强制进入。

## 阶段 4：首页概览
- 顶部日期 + 宝宝卡（实际/矫正月龄、切换/新增入口）。
- 快捷入口（生长记录、预约、内容）+ 复诊提醒卡片/倒计时。
- 网络状态条（离线提示、重试按钮）。

## 阶段 5：宝宝档案
- 列表 + 当前宝宝标识；新增/编辑/删除/切换。
- 表单字段：姓名、生日、预产期、胎龄周、备注；矫正月龄实时计算；删除二次确认。

## 阶段 6：生长记录与图表
- 封装 `<GrowthChart metric="weight|height|head" data={...} reference={...} />`（VictoryChart+Voronoi tooltip，主线+参考线+数据点高亮）。
- 页面：指标胶囊切换、宝宝过滤、空态占位、历史记录列表（可编辑/删除）。
- “+记录”表单：日期、数值、备注，提交后写入 store/cache。

## 阶段 7：预约提醒
- 列表卡片：时间、科室/医院、备注、提醒开关、倒计时标签。
- 创建/删除/开关更新本地数据；空态提示。

## 阶段 8：内容中心
- Tab（文章/视频）+ 搜索/筛选；卡片显示标签、时长/阅读量。
- 详情页（预留 WebView 或原生渲染）；收藏/分享入口预留。

## 阶段 9：问答/客服
- 对话气泡列表、输入框、发送按钮；“清空历史”。
- 预留“选择宝宝上下文”入口；消息存本地（最多 50 条）。

## 阶段 10：设置与维护
- Profile：提醒开关、缓存清理、退出登录。
- 数据同步策略预留：离线写入队列接口（待新后端时接管）。

## 阶段 11：验收与后端切换预案
- 自测：关键页面可导航；图表显示 mock 数据与参考曲线；记录/预约/档案的增删改查在本地生效；离线提示正常。
- 后端切换：仅改 `services/api` 适配层，保持 UI/store 不变；对接时补接口错误处理与重试。
