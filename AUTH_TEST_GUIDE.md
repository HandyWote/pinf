# 认证模块手动测试方案

## 测试前准备

### 1. 启动后端服务

```powershell
# 进入后端目录
cd D:\pinf\backend

# 激活虚拟环境（如果有）
# .\venv\Scripts\Activate.ps1

# 启动服务
python app.py
```

服务启动后应该显示：
```
* Running on http://127.0.0.1:5010
```

### 2. 启动前端应用

```powershell
# 进入 WA 目录
cd D:\pinf\WA

# 启动 Expo
npx expo start
```

---

## 后端接口测试

### 方式一：使用测试脚本（推荐）

```powershell
cd D:\pinf\backend
python test_auth.py
```

**预期结果**：
- ✅ 健康检查通过
- ✅ 无效手机号被拒绝（返回 400）
- ✅ 成功发送验证码并返回6位数字码
- ✅ 错误验证码被拒绝（返回 400）
- ✅ 正确验证码登录成功，返回 token 和用户信息

### 方式二：使用 PowerShell 手动测试

#### 1. 测试健康检查

```powershell
Invoke-RestMethod -Uri http://localhost:5010/api/health -Method GET
```

**预期输出**：
```json
{
  "status": "ok",
  "message": "API服务正常",
  "data": {
    "database": "ok"
  }
}
```

#### 2. 发送验证码

```powershell
$response = Invoke-RestMethod -Uri http://localhost:5010/api/auth/phone/code -Method POST -Body (@{phone="13912345678"} | ConvertTo-Json) -ContentType "application/json"
$response | ConvertTo-Json -Depth 10
```

**预期输出**（开发模式会显示验证码）：
```json
{
  "status": "success",
  "message": "验证码已发送",
  "data": {
    "message": "验证码已发送，5分钟内有效",
    "code": "123456",  // 6位随机数字
    "debug": "开发模式：验证码已在响应中返回"
  }
}
```

**📝 记下验证码！**

#### 3. 测试无效手机号

```powershell
Invoke-RestMethod -Uri http://localhost:5010/api/auth/phone/code -Method POST -Body (@{phone="12345"} | ConvertTo-Json) -ContentType "application/json"
```

**预期输出**：
```json
{
  "status": "error",
  "message": "手机号格式不正确"
}
```

#### 4. 登录

```powershell
# 使用上一步获取的验证码
$code = "123456"  # 替换为实际验证码
$loginResponse = Invoke-RestMethod -Uri http://localhost:5010/api/auth/phone/login -Method POST -Body (@{phone="13912345678"; code=$code} | ConvertTo-Json) -ContentType "application/json"
$loginResponse | ConvertTo-Json -Depth 10
```

**预期输出**：
```json
{
  "status": "success",
  "message": "登录成功",
  "data": {
    "token": "eyJhbGci...",  // JWT token
    "user": {
      "id": 1,
      "phone": "13912345678",
      "role": "user",
      "createdAt": "2025-12-15T...",
      "updatedAt": "2025-12-15T...",
      "wxOpenid": null
    }
  }
}
```

#### 5. 测试错误验证码

```powershell
Invoke-RestMethod -Uri http://localhost:5010/api/auth/phone/login -Method POST -Body (@{phone="13912345678"; code="000000"} | ConvertTo-Json) -ContentType "application/json"
```

**预期输出**：
```json
{
  "status": "error",
  "message": "验证码错误或已过期"
}
```

---

## 前端应用测试

### 测试流程

#### 1. 启动应用

```powershell
cd D:\pinf\WA
npx expo start
```

选择一个运行方式：
- **Web**: 按 `w` 在浏览器中打开
- **Android**: 按 `a` 在模拟器中打开
- **iOS**: 按 `i` 在模拟器中打开（仅 macOS）
- **扫码**: 在 Expo Go 应用中扫描二维码

#### 2. 测试登录页面

**步骤**：
1. 应用启动后应该自动跳转到登录页（因为未登录）
2. 查看登录页面 UI：
   - ✅ 显示 Logo 和应用名称"早护通"
   - ✅ 手机号输入框
   - ✅ 验证码输入框
   - ✅ "获取验证码"按钮
   - ✅ "登录"按钮

#### 3. 测试无效手机号

**操作**：
1. 输入无效手机号：`12345`
2. 点击"获取验证码"

**预期结果**：
- ✅ 显示提示："请输入正确的手机号"

#### 4. 测试发送验证码

**操作**：
1. 输入有效手机号：`13912345678`
2. 点击"获取验证码"

**预期结果**：
- ✅ 显示加载状态（按钮变为 Loading）
- ✅ 弹出 Alert 显示验证码（开发模式）
- ✅ 在蓝色虚线框中显示验证码
- ✅ "获取验证码"按钮变为倒计时"60s", "59s", ...
- ✅ 倒计时期间按钮禁用

#### 5. 测试错误验证码登录

**操作**：
1. 输入错误验证码：`000000`
2. 点击"登录"

**预期结果**：
- ✅ 显示错误提示："验证码错误或已过期"

#### 6. 测试正确验证码登录

**操作**：
1. 输入正确验证码（从 Alert 或蓝色框中复制）
2. 点击"登录"

**预期结果**：
- ✅ 显示加载状态
- ✅ 登录成功后自动跳转到首页（Tab 导航）
- ✅ 可以看到首页内容

#### 7. 测试登录状态持久化

**操作**：
1. 登录成功后
2. 刷新应用（热重载或完全重启）

**预期结果**：
- ✅ 应用启动后直接显示首页（不需要重新登录）
- ✅ 用户信息被保留

#### 8. 测试退出登录

**操作**：
1. 在首页右上角点击"个人图标"（圆形按钮）
2. 在弹出的确认对话框中点击"确定"

**预期结果**：
- ✅ 弹出确认对话框："确定要退出登录吗？"
- ✅ 点击确定后跳转到登录页
- ✅ 用户信息和 token 被清除

#### 9. 测试未登录拦截

**操作**：
1. 退出登录后
2. 尝试手动导航到首页（如果可能）

**预期结果**：
- ✅ 自动重定向到登录页
- ✅ 无法访问受保护的页面

---

## 核心功能检查清单

### 后端 ✅

- [x] 验证码模型创建成功
- [x] 手机号格式验证（中国大陆 11 位）
- [x] 验证码生成（6 位随机数字）
- [x] 验证码有效期（5 分钟）
- [x] 验证码一次性使用（使用后标记为已用）
- [x] 旧验证码自动失效（同一手机号）
- [x] 用户不存在时自动注册
- [x] JWT token 生成
- [x] 开发模式下返回验证码

### 前端 ✅

- [x] 登录页面 UI 完整
- [x] 手机号格式验证
- [x] 验证码倒计时功能
- [x] 开发模式显示验证码
- [x] 登录成功跳转
- [x] Token 持久化存储
- [x] 用户信息持久化
- [x] 登录状态初始化
- [x] 路由守卫（未登录重定向）
- [x] 退出登录功能
- [x] 错误提示友好

---

## 测试数据

### 测试手机号

可以使用任意符合格式的手机号（1 开头，11 位数字）：

- `13912345678`
- `15800000000`
- `18600000001`

### 无效手机号示例

- `12345` - 不足 11 位
- `21234567890` - 不是 1 开头
- `abc12345678` - 包含非数字

---

## 常见问题排查

### 1. 后端服务无法启动

```powershell
# 检查端口是否被占用
Get-NetTCPConnection -LocalPort 5010 -ErrorAction SilentlyContinue

# 停止占用进程
Stop-Process -Id <进程ID> -Force
```

### 2. 前端无法连接后端

检查 `WA/services/api/client.ts` 中的 `API_BASE_URL`：

```typescript
const API_BASE_URL = __DEV__ ? 'http://localhost:5010/api' : 'https://api.example.com/api';
```

### 3. 数据库错误

后端日志会显示具体错误。常见问题：
- 数据库文件不存在 → 会自动创建
- 数据库权限问题 → 检查 `backend/instance` 目录权限

### 4. Token 过期

默认 token 有效期为 7 天。如果测试时 token 过期：
- 后端会返回 401
- 前端会自动清除 token 并跳转到登录页

---

## 性能指标参考

- 发送验证码：< 500ms
- 登录验证：< 300ms
- 页面跳转：< 200ms
- Token 存储：< 100ms

---

## 下一步建议

1. **生产环境配置**：
   - 接入真实短信服务（阿里云、腾讯云等）
   - 不在响应中返回验证码
   - 配置生产环境的 API URL

2. **安全增强**：
   - 添加图形验证码（防止机器人）
   - 限制验证码发送频率（同一手机号 1 分钟内只能发送一次）
   - 添加 IP 限流

3. **用户体验优化**：
   - 添加手机号记忆功能
   - 支持一键登录（如果在移动端）
   - 优化加载动画

---

## 联系与反馈

如果测试过程中遇到问题，请检查：

1. **后端日志**：查看终端输出
2. **前端日志**：查看浏览器控制台或 Expo 日志
3. **网络请求**：使用浏览器开发者工具的 Network 标签

测试完成！🎉
