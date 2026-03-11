# N8N AI对话接口对接实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修改后端AI对话接口，添加Basic认证并简化发送参数

**Architecture:** 修改config配置、n8n客户端认证、简化payload三项

**Tech Stack:** Flask, Python requests, HTTPBasicAuth

---

### Task 1: 添加N8N认证配置

**Files:**
- Modify: `backend/config.py`

**Step 1: 添加认证配置项**

在 config.py 第42行 `N8N_WEBHOOK_URL` 后添加：

```python
# n8n 转发配置
N8N_WEBHOOK_URL = os.environ.get("N8N_WEBHOOK_URL", "")
N8N_BASIC_AUTH_USER = os.environ.get("N8N_BASIC_AUTH_USER", "")
N8N_BASIC_AUTH_PASSWORD = os.environ.get("N8N_BASIC_AUTH_PASSWORD", "")
```

---

### Task 2: 修改n8n客户端添加Basic认证

**Files:**
- Modify: `backend/utils/n8n_client.py`

**Step 1: 导入HTTPBasicAuth**

在文件顶部添加：

```python
from requests.auth import HTTPBasicAuth
```

**Step 2: 修改send_to_n8n函数**

在第20行 `requests.post(webhook_url, json=payload, timeout=timeout)` 修改为：

```python
auth = None
user = current_app.config.get("N8N_BASIC_AUTH_USER")
password = current_app.config.get("N8N_BASIC_AUTH_PASSWORD")
if user and password:
    auth = HTTPBasicAuth(user, password)

response = requests.post(webhook_url, json=payload, auth=auth, timeout=timeout)
```

---

### Task 3: 简化chat路由payload

**Files:**
- Modify: `backend/routes/chat.py`

**Step 1: 修改_build_payload函数**

替换 `_build_payload` 函数（第13-28行）为：

```python
def _build_payload(user_id, content):
    return {
        "user_id": user_id,
        "message": content
    }
```

**Step 2: 修改send_message函数中调用_build_payload的位置**

第58行附近，修改为：

```python
payload = _build_payload(current_user.id, data["content"])
```

---

### Task 4: 更新环境变量示例

**Files:**
- Modify: `backend/.env.example`

**Step 1: 更新N8N配置说明**

修改 `.env.example` 第10行：

```
# n8n AI对话配置
N8N_WEBHOOK_URL=https://flows.pinf.top/webhook/chat
N8N_BASIC_AUTH_USER=你的用户名
N8N_BASIC_AUTH_PASSWORD=你的密码
```

---

### Task 5: 验证修改

**Step 1: 语法检查**

```bash
cd /home/handy/pinf/backend && source .venv/bin/activate && python -c "from config import Config; from utils.n8n_client import send_to_n8n; from routes.chat import chat_bp; print('OK')"
```

**Step 2: 提交代码**

```bash
git add backend/config.py backend/utils/n8n_client.py backend/routes/chat.py backend/.env.example
git commit -m "feat(chat): 对接n8n添加Basic认证并简化参数"
```
