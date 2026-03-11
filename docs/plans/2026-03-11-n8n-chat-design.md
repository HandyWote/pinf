# AI对话接口对接n8n设计文档

**日期**: 2026-03-11

## 背景

后端需要对接n8n的AI对话服务，当前已有基础实现，但需要：
1. 修改URL为 `https://flows.pinf.top/webhook/chat`
2. 添加Basic认证
3. 简化发送参数，只传 user_id 和 message

## 设计方案

### 1. 配置修改 (`backend/config.py`)

添加n8n认证配置项：
- `N8N_BASIC_AUTH_USER` - Basic认证用户名
- `N8N_BASIC_AUTH_PASSWORD` - Basic认证密码

### 2. n8n客户端修改 (`backend/utils/n8n_client.py`)

使用 `requests.auth.HTTPBasicAuth` 添加认证支持：
- 当配置了用户名和密码时，添加到请求头
- 保持现有的timeout和retry机制

### 3. Payload简化 (`backend/routes/chat.py`)

修改 `_build_payload` 函数，只保留：
- `user_id` - 用户ID
- `message` - 消息内容

### 4. 环境变量

```
N8N_WEBHOOK_URL=https://flows.pinf.top/webhook/chat
N8N_BASIC_AUTH_USER=<用户名>
N8N_BASIC_AUTH_PASSWORD=<密码>
```

## 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `backend/config.py` | 添加N8N认证配置 |
| `backend/utils/n8n_client.py` | 添加Basic认证支持 |
| `backend/routes/chat.py` | 简化payload |
| `backend/.env.example` | 更新配置说明 |

## 风险与注意事项

- 认证凭据只存在环境变量，不提交到代码库
- 确保.env文件在.gitignore中
