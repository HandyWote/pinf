# 早护通 APP - 快速开始指南

基于 React Native Expo 的早产儿护理应用。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm start
```

### 3. 在模拟器/设备上运行

- **iOS**: `npm run ios`
- **Android**: `npm run android`
- **Web**: `npm run web`

## 项目结构

```
app/                    # 页面路由（Expo Router）
├── _layout.tsx        # 根布局
└── (tabs)/            # Tab 导航页面
components/            # 组件
└── ui/               # UI 组件库（Button, Card, Input, Modal, etc.）
constants/            # 常量配置
├── tokens.ts         # 设计 Token（颜色、间距、字号等）
└── theme.ts          # 主题配置
contexts/             # React Context（ThemeContext）
services/             # 服务层
└── api/             # API 客户端（axios 封装）
store/               # 全局状态管理（Zustand）
```

## 核心功能

### UI 组件库

已完成 7 个基础 UI 组件，严格遵循设计规范：

- **Button**: 4 种变体（primary/secondary/outline/text），3 种尺寸
- **Card**: 3 种样式（default/elevated/outlined）
- **Input**: 支持标签、图标、错误提示
- **Modal**: 底部滑出动画，可配置高度
- **Tag**: 4 种颜色变体
- **ListItem**: 支持左右内容区域
- **ChartContainer**: 图表容器组件

### 使用示例

```tsx
import { Button, Card, Input } from '@/components/ui';
import { theme } from '@/constants/theme';

<Card>
  <Input
    label="宝宝姓名"
    placeholder="请输入"
    required
  />
  <Button
    title="保存"
    onPress={handleSave}
    variant="primary"
  />
</Card>
```

### API 客户端

```tsx
import { api } from '@/services/api';

// 自动携带 token，401 自动登出
const response = await api.get('/babies');
const result = await api.post('/auth/phone/login', data);
```

### 全局状态

```tsx
import { useAuthStore } from '@/store';

const { user, isAuthenticated, login, logout } = useAuthStore();
```

## 设计规范

基于 `应用原型.html` 的设计规范：

- **主色**: #6B9AC4（治愈蓝）
- **强调色**: #FF9F89（温暖粉）
- **背景色**: #F0F4F8
- **圆角**: 卡片 20px，组件 14px/10px
- **间距**: 8/12/16/20/24px
- **字号**: 12/14/16/20px

## 开发指南

详细文档请查看：
- [FRAMEWORK_SETUP.md](FRAMEWORK_SETUP.md) - 基础框架实施报告
- [../REFACTOR_PLAN.md](../REFACTOR_PLAN.md) - 完整重构计划

## 下一步

- [ ] 实现认证模块（手机号登录）
- [ ] 实现宝宝管理功能
- [ ] 实现生长记录与曲线
- [ ] 实现预约与提醒
- [ ] 实现内容课堂
- [ ] 实现智能问答

## 参考资料

- [Expo 文档](https://docs.expo.dev/)
- [React Native 文档](https://reactnative.dev/)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)
