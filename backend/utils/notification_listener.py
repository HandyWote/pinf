"""PostgreSQL LISTEN/NOTIFY 监听器."""
import logging
import select
from datetime import datetime, timedelta

from models import db
from models.notification_subscription import NotificationSubscription
from models.appointment import Appointment

logger = logging.getLogger(__name__)

# 递进间隔（秒）: 2h, 4h, 8h, 16h
RETRY_INTERVALS = [7200, 14400, 28800, 57600]


def _drain_notifies(conn):
    """拉取并清空 psycopg2 通知队列."""
    conn.poll()
    notifications = []
    while conn.notifies:
        notifications.append(conn.notifies.pop(0))
    return notifications


def _wait_for_notify(conn, timeout=5, select_fn=select.select):
    """阻塞等待连接可读，避免忙轮询."""
    readable, _, _ = select_fn([conn], [], [], timeout)
    return bool(readable)


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
        notifications = _drain_notifies(conn)
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
                    if not _wait_for_notify(conn):
                        continue
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
