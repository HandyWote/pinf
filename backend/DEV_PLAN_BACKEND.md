# 后端开发计划（Flask + PostgreSQL + n8n 转发）

> 目标：弃用旧功能/旧数据结构，服务 WAend；数据库切换 PostgreSQL，使用 `db.create_all()` 完成初始化（不引入 Alembic 迁移）；AI 对话转发至 n8n webhook，确保上下文充足。使用uv管理py环境

## 阶段 0：准备与依赖
- 安装依赖：`psycopg2-binary`、`python-dotenv`（如未安装）；requirements 更新。
- `.env` 提供：`DATABASE_URL`（PostgreSQL）、`SECRET_KEY`、`JWT_SECRET_KEY`、`N8N_WEBHOOK_URL`、`N8N_API_KEY?`、`WECHAT_APP_ID/SECRET?`。
- Docker/Postgres 已部署；确认网络连通。

## 阶段 1：配置与启动流程（✅ 已完成）
- `config.py` 仅读取 `.env`，移除 SQLite 默认；保留 `db.create_all()` 仅用于初始化空库（不做 schema 迁移）。
- 启动时仅做数据库连通性检测（不做 schema 变更）；记录日志。
- `health` 接口返回 DB 连接状态（不包含迁移版本字段）。

## 阶段 2：模型（✅ 已完成）
- 统一主键 `id`（自增），手机号唯一索引；openid 可选字段，无兼容旧数据要求。
- 模型列表：
  - `User(id, phone?, wx_openid?, role, created_at)`
  - `Baby(id, user_id, name, birthday, due_date?, gestational_weeks?, note)`
  - `GrowthRecord(id, baby_id, metric, value, unit, recorded_at, note)`
  - `Appointment(id, user_id, baby_id?, clinic, department, scheduled_at, remind_at?, status, note)`
  - `Video/Article` 维持，补充 category/tag 索引
  - `ChatMessage(id, user_id, baby_id?, role, message_id, content, timestamp, status)`
- 通过 `db.create_all()` 完成初始化；移除启动时自动 seed，改用独立 seed 脚本（可选）。

## 阶段 3：服务层与适配（✅ 基础返回格式与校验扩展已完成）
- 重写服务/DAO 层（如有）：统一返回格式 `{"status": "...", "message": "...", "data": ...}`。
- 建立 DTO 校验（`validate_request_data` 扩展），错误返回一致化。

## 阶段 4：业务路由重构（✅ 已完成）
- `auth`: 手机号验证码/微信登录（mock 短信可选），返回 JWT + 用户信息；刷新 token 接口可选。
- `child`: 宝宝档案 CRUD，返回矫正月龄计算结果；删除需权限校验。
- `growth`: 按宝宝+指标查询（分页/时间过滤），创建/更新/删除。
- `appointment`: 列表、创建、删除、状态更新，含倒计时/提醒字段。
- `content`: 列表（搜索/筛选）、详情；预留 CMS 接口。
- `chat`: 重写 send/history/clear，使用 n8n 客户端；历史分页。

## 阶段 5：n8n 集成（✅ 已完成基础转发）
- 新建 `utils/n8n_client.py`：封装 webhook 调用，超时/重试/错误处理。
- 请求体建议：
  ```json
  {
    "message_id": "uuid",
    "content": "...",
    "user": {"id": 1, "role": "user", "phone": "...", "wx_openid": "..."},
    "baby": {"id": 1, "name": "...", "birthday": "...", "due_date": "...", "gestational_weeks": 34, "corrected_age": "...", "actual_age": "..."},
    "context": {"locale": "zh-CN", "app": "WAend", "platform": "mobile"},
    "history": [{"role": "user|ai|system", "content": "...", "message_id": "...", "timestamp": 1700000000}],
    "metadata": {"trace_id": "...", "client_version": "..."},
    "params": {"temperature": 0.7, "top_p": 0.9, "max_tokens": 1024}
  }
  ```
- 响应体建议：`{ "answer": "...", "message_id": "...", "suggestions": [], "extra": {}, "usage": {} }`。
- `POST /api/chat/send` 流程：校验 → 落库用户消息 → 调 n8n → 成功落库 AI 消息；失败则标记用户消息 failed，返回可重试提示。

## 阶段 6：初始化与工具（⏳ seed 脚本可选，未实现）
- 提供（可选）简单 seed 脚本，初始化示例数据；不包含迁移命令。
- 初始化脚本：仅检测数据库连通性并在空库时创建表；日志提示。
- 日志：统一记录请求 trace_id、用户 id、n8n 调用耗时/失败原因。

## 阶段 7：测试与文档（部分完成）
- 集成测试（pytest + Flask test client）：auth、child、growth、appointment、chat（含 n8n 失败/超时 mock）。【未完成】
- 更新 README/API 文档：环境变量、启动、n8n 字段约定、健康检查。【已完成】

## 阶段 8：交付与后续（进行中）
- 验收：健康检查 OK，迁移无误，核心接口 200 且返回格式统一，n8n 通路正常。
- 后续：接入真实短信/微信登录、接 CMS、补监控（日志采集/告警）、加速缓存策略（如 Redis）可按需要规划。
