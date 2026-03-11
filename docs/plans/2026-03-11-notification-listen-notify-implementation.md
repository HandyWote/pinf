# PostgreSQL LISTEN/NOTIFY 通知调度实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将预约提醒从定时轮询改为 PostgreSQL LISTEN/NOTIFY 实时触发，并支持递进间隔重复提醒。

**Architecture:** 使用 PostgreSQL 触发器 + NOTIFY 实现实时通知，保留 APScheduler 定时扫描作为兜底补偿。递进间隔：2h→4h→8h→16h。

**Tech Stack:** Flask, PostgreSQL (LISTEN/NOTIFY), psycopg2, APScheduler

---

## Task 1: 数据库迁移 - 添加新字段

**Files:**
- Modify: `backend/utils/db_migrations.py`
- Test: 手动验证字段添加成功

**Step 1: 添加数据库迁移**

在 `_MIGRATIONS` 列表末尾添加新迁移：

```python
{
    "id": "2026_03_11_add_notification_retry_fields",
    "sql": (
        "ALTER TABLE notification_subscriptions ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0; "
        "ALTER TABLE notification_subscriptions ADD COLUMN IF NOT EXISTS max_retries INTEGER NOT NULL DEFAULT 4; "
        "ALTER TABLE notification_subscriptions ADD COLUMN IF NOT EXISTS next_retry_interval INTEGER; "
        "CREATE INDEX IF NOT EXISTS idx_notification_subscriptions_status_remind_time ON notification_subscriptions(status, remind_time);"
    ),
},
```

**Step 2: 验证迁移**

Run: `cd backend && uv run python -c "from utils.db_migrations import run_migrations; from models import db; from app import create_app; app = create_app(); run_migrations(db)"`
Expected: 无错误输出

**Step 3: 提交**

```bash
git add backend/utils/db_migrations.py
git commit -m "feat(notification): add retry fields for progressive reminder"
```

---

## Task 2: 更新 NotificationSubscription 模型

**Files:**
- Modify: `backend/models/notification_subscription.py:1-30`

**Step 1: 更新模型定义**

在 `NotificationSubscription` 类中添加新字段：

```python
class NotificationSubscription(db.Model):
    __tablename__ = "notification_subscriptions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey("appointments.id"), nullable=True, index=True)
    channel = db.Column(db.String(32), nullable=False, default="push")
    token = db.Column(db.String(512), nullable=True)
    remind_time = db.Column(db.DateTime, nullable=False, index=True)
    status = db.Column(db.String(20), nullable=False, default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    sent_at = db.Column(db.DateTime, nullable=True)
    # 新增字段
    retry_count = db.Column(db.Integer, nullable=False, default=0)
    max_retries = db.Column(db.Integer, nullable=False, default=4)
    next_retry_interval = db.Column(db.Integer, nullable=True)  # 下次重试间隔（秒）

    def to_dict(self):
        return {
            "id": self.id,
            "appointmentId": self.appointment_id,
            "userId": self.user_id,
            "channel": self.channel,
            "token": self.token,
            "remindTime": self.remind_time.isoformat() if self.remind_time else None,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "sentAt": self.sent_at.isoformat() if self.sent_at else None,
            "retryCount": self.retry_count,
            "maxRetries": self.max_retries,
            "nextRetryInterval": self.next_retry_interval,
        }
```

**Step 2: 验证模型同步**

Run: `cd backend && uv run python -c "from models.notification_subscription import NotificationSubscription; print('Model OK')"`
Expected: 无错误输出

**Step 3: 提交**

```bash
git add backend/models/notification_subscription.py
git commit -m "feat(notification): add retry_count and max_retries fields"
```

---

## Task 3: 创建 PostgreSQL 触发器

**Files:**
- Modify: `backend/utils/db_migrations.py`

**Step 1: 添加触发器迁移**

在 `_MIGRATIONS` 列表中添加：

```python
{
    "id": "2026_03_11_add_notification_trigger",
    "sql": (
        "CREATE OR REPLACE FUNCTION notification_ready_trigger() "
        "RETURNS TRIGGER AS $$ "
        "BEGIN "
        "  IF OLD.status = 'pending' AND NEW.status = 'pending' AND NEW.remind_time <= NOW() THEN "
        "    PERFORM pg_notify('notification_ready', NEW.id::TEXT); "
        "  END IF; "
        "  RETURN NEW; "
        "END; "
        "$$ LANGUAGE plpgsql; "
        "DROP TRIGGER IF EXISTS notification_ready_trigger ON notification_subscriptions; "
        "CREATE TRIGGER notification_ready_trigger "
        "  AFTER INSERT OR UPDATE ON notification_subscriptions "
        "  FOR EACH ROW "
        "  WHEN (NEW.status = 'pending' AND NEW.remind_time <= NOW()) "
        "  EXECUTE FUNCTION notification_ready_trigger();"
    ),
},
```

**Step 2: 执行迁移**

Run: `cd backend && uv run python -c "from utils.db_migrations import run_migrations; from models import db; from app import create_app; app = create_app(); run_migrations(db)"`
Expected: 无错误输出

**Step 3: 验证触发器创建**

Run: `cd backend && uv run python -c "from sqlalchemy import text; from app import create_app; from models import db; app = create_app(); with app.app_context(): result = db.session.execute(text(\"SELECT tgname FROM pg_trigger WHERE tgname='notification_ready_trigger'\")).fetchone(); print('Trigger exists:', result is not None)"`
Expected: Trigger exists: True

**Step 4: 提交**

```bash
git add backend/utils/db_migrations.py
git commit -m "feat(notification): add PostgreSQL trigger for real-time notification"
```

---

## Task 4: 实现 LISTEN/NOTIFY 监听器

**Files:**
- Create: `backend/utils/notification_listener.py`
- Modify: `backend/app.py`

**Step 1: 创建通知监听器**

```python
"""PostgreSQL LISTEN/NOTIFY 监听器."""
import logging
from datetime import datetime, timedelta

from models import db
from models.notification_subscription import NotificationSubscription
from models.appointment import Appointment

logger = logging.getLogger(__name__)

# 递进间隔（秒）: 2h, 4h, 8h, 16h
RETRY_INTERVALS = [7200, 14400, 28800, 57600]


def start_notification_listener(app):
    """启动 PostgreSQL NOTIFY 监听器."""
    if not app.config.get('NOTIFICATIONS_ENABLED'):
        app.logger.info('通知功能未启用（NOTIFICATIONS_ENABLED=false 或未设置）')
        return None

    try:
        import psycopg2
        from psycopg2 import extensions
    except Exception as exc:
        app.logger.warning('未安装 psycopg2，跳过通知监听: %s', exc)
        return None

    def _handle_notify(conn):
        """处理 NOTIFY 事件."""
        conn.poll()
        notifications = conn.notifies()
        for notify in notifications:
            app.logger.info('收到 NOTIFY: %s', notify.payload)
            try:
                _process_notification(app, int(notify.payload))
            except Exception:
                logging.exception('处理 NOTIFY 失败: %s', notify.payload)

    def _process_notification(app, subscription_id):
        """处理单条通知."""
        with app.app_context():
            sub = NotificationSubscription.query.get(subscription_id)
            if not sub or sub.status != 'pending':
                app.logger.warning('订阅不存在或状态非 pending: id=%s status=%s', subscription_id, sub.status if sub else None)
                return

            # 检查关联的预约状态
            if sub.appointment_id:
                appointment = Appointment.query.get(sub.appointment_id)
                if appointment and appointment.status == 'completed':
                    sub.status = 'completed'
                    db.session.add(sub)
                    db.session.commit()
                    app.logger.info('预约已就诊，停止提醒: subscription_id=%s', subscription_id)
                    return

            # 检查是否超过最大重试次数
            if sub.retry_count >= sub.max_retries:
                sub.status = 'expired'
                db.session.add(sub)
                db.session.commit()
                app.logger.info('提醒次数已达上限，标记为 expired: subscription_id=%s', subscription_id)
                return

            # 发送推送
            from utils.notification_sender import send_expo_push
            title = f'预约提醒（ID:{sub.appointment_id}）'
            body = '您的预约即将到来，请按时就诊。'
            sent_ok = send_expo_push(sub.token, title, body, {'subscriptionId': sub.id})

            if not sent_ok:
                app.logger.warning('推送发送失败，稍后重试: subscription_id=%s', subscription_id)
                return

            # 更新发送状态
            sub.status = 'sent'
            sub.sent_at = datetime.utcnow()
            sub.retry_count += 1

            # 计算下次重试间隔
            if sub.retry_count < sub.max_retries:
                interval_seconds = RETRY_INTERVALS[sub.retry_count - 1] if sub.retry_count <= len(RETRY_INTERVALS) else RETRY_INTERVALS[-1]
                sub.next_retry_interval = interval_seconds
                sub.remind_time = datetime.utcnow() + timedelta(seconds=interval_seconds)
                sub.status = 'pending'  # 重置为 pending 以便下次触发
            else:
                sub.status = 'completed'

            db.session.add(sub)
            db.session.commit()
            app.logger.info('通知发送成功，创建下次提醒: subscription_id=%s retry=%s next_interval=%s',
                          subscription_id, sub.retry_count, sub.next_retry_interval)

    def _run_listener():
        """后台监听循环."""
        while True:
            try:
                conn = psycopg2.connect(app.config.get('SQLALCHEMY_DATABASE_URI'))
                conn.set_isolation_level(extensions.ISOLATION_LEVEL_AUTOCOMMIT)
                cur = conn.cursor()
                cur.execute("LISTEN notification_ready")
                app.logger.info('PostgreSQL LISTEN notification_ready 已启动')

                while True:
                    _handle_notify(conn)

            except Exception:
                logging.exception('LISTEN 连接断开，3秒后重连...')
                import time
                time.sleep(3)

    import threading
    listener_thread = threading.Thread(target=_run_listener, daemon=True)
    listener_thread.start()
    app.logger.info('通知监听器已启动')
    return listener_thread
```

**Step 2: 修改 app.py 集成监听器**

在 `backend/app.py` 中找到 `start_notification_scheduler` 调用附近，添加：

```python
from utils.notification_listener import start_notification_listener

# 在 create_app() 函数中，scheduler 启动后添加：
start_notification_listener(app)
```

**Step 3: 验证监听器启动**

Run: `cd backend && uv run python -c "from app import create_app; app = create_app(); print('Listener started')"`
Expected: 无错误输出，日志中应显示 "通知监听器已启动"

**Step 4: 提交**

```bash
git add backend/utils/notification_listener.py backend/app.py
git commit -m "feat(notification): add LISTEN/NOTIFY listener with progressive retry"
```

---

## Task 5: 保留兜底定时扫描（可选，确认是否需要）

**Files:**
- Modify: `backend/utils/notification_scheduler.py`

**Step 1: 修改兜底扫描逻辑**

修改 `_run_job` 函数，增加对 NOTIFY 丢失情况的补偿处理：

```python
def _run_job():
    with app.app_context():
        try:
            now = datetime.utcnow()
            # 兜底扫描：处理 NOTIFY 丢失的情况
            pending = (
                NotificationSubscription.query
                .filter_by(status='pending')
                .filter(NotificationSubscription.remind_time <= now)
                .limit(100)
                .all()
            )

            if not pending:
                return

            from utils.notification_sender import send_expo_push
            from utils.notification_listener import RETRY_INTERVALS

            for sub in pending:
                try:
                    # 检查关联预约状态
                    if sub.appointment_id:
                        appointment = Appointment.query.get(sub.appointment_id)
                        if appointment and appointment.status == 'completed':
                            sub.status = 'completed'
                            db.session.add(sub)
                            db.session.commit()
                            continue

                    # 检查重试次数
                    if sub.retry_count >= sub.max_retries:
                        sub.status = 'expired'
                        db.session.add(sub)
                        db.session.commit()
                        continue

                    if not sub.token:
                        sub.status = 'missed'
                        db.session.add(sub)
                        db.session.commit()
                        continue

                    title = f'预约提醒（ID:{sub.appointment_id}）'
                    body = '您的预约即将到来，请按时就诊。'
                    sent_ok = send_expo_push(sub.token, title, body, {'subscriptionId': sub.id})

                    if not sent_ok:
                        db.session.rollback()
                        app.logger.warning('推送发送失败，稍后重试: subscription_id=%s', sub.id)
                        continue

                    sub.status = 'sent'
                    sub.sent_at = datetime.utcnow()
                    sub.retry_count += 1

                    if sub.retry_count < sub.max_retries:
                        interval_seconds = RETRY_INTERVALS[sub.retry_count - 1] if sub.retry_count <= len(RETRY_INTERVALS) else RETRY_INTERVALS[-1]
                        sub.next_retry_interval = interval_seconds
                        sub.remind_time = datetime.utcnow() + timedelta(seconds=interval_seconds)
                        sub.status = 'pending'
                    else:
                        sub.status = 'completed'

                    db.session.add(sub)
                    db.session.commit()
                    app.logger.info('兜底扫描发送成功: subscription_id=%s', sub.id)
                except Exception:
                    db.session.rollback()
                    logging.exception('处理订阅发送失败: %s', sub.id)
        except Exception:
            logging.exception('通知扫描任务失败')
```

**Step 2: 添加 timedelta 导入**

确保文件顶部有：

```python
from datetime import datetime, timedelta
```

**Step 3: 提交**

```bash
git add backend/utils/notification_scheduler.py
git commit -m "fix(notification): update fallback scheduler with retry logic"
```

---

## Task 6: 更新预约状态变更时的提醒停止逻辑

**Files:**
- Modify: `backend/routes/appointments.py`

**Step 1: 找到更新预约状态的路由**

搜索 `update_status` 或类似函数。

**Step 2: 在状态更新后取消相关提醒**

在预约状态更新为 `completed` 后，添加：

```python
# 取消该预约的所有待发送提醒
NotificationSubscription.query.filter_by(
    appointment_id=appointment.id,
    status='pending'
).update({'status': 'cancelled'})
db.session.commit()
```

**Step 3: 提交**

```bash
git add backend/routes/appointments.py
git commit -m "fix(notification): cancel pending reminders when appointment completed"
```

---

## Task 7: 手动测试验证

**Step 1: 启动后端**

Run: `cd backend && uv run python app.py`

**Step 2: 创建测试预约和提醒**

使用 curl 或 Postman：
1. 创建预约 `POST /api/appointments`
2. 创建提醒 `POST /api/notifications/subscriptions`（设置 remind_time 为未来1小时）

**Step 3: 手动触发提醒**

直接更新数据库触发 NOTIFY：
```sql
UPDATE notification_subscriptions
SET remind_time = NOW() - interval '1 second'
WHERE status = 'pending';
```

**Step 4: 检查日志**

Expected: 日志显示 "收到 NOTIFY" 和 "通知发送成功"

**Step 5: 验证递进间隔**

等待2小时后检查是否创建了新的 remind_time（+2小时）

**Step 6: 标记已就诊**

调用 `PATCH /api/appointments/:id/status` 设置为 completed

**Step 7: 验证提醒停止**

检查该预约的 notification_subscriptions 状态应为 'cancelled' 或 'completed'

---

## 总结

| Task | 描述 |
|------|------|
| 1 | 数据库迁移添加新字段 |
| 2 | 更新 SQLAlchemy 模型 |
| 3 | 创建 PostgreSQL 触发器 |
| 4 | 实现 LISTEN/NOTIFY 监听器 |
| 5 | 更新兜底定时扫描（可选） |
| 6 | 预约完成时停止提醒 |
| 7 | 手动测试验证 |
