import logging
from datetime import datetime

from models.notification_subscription import NotificationSubscription
from models import db

_SCHEDULER = None


def start_notification_scheduler(app):
    """启动一个轻量级的 background scheduler（如果启用且 APScheduler 可用），
    用于扫描到期的订阅并执行“模拟发送”（当前阶段仅记录 sent 状态）。
    """
    global _SCHEDULER
    if _SCHEDULER is not None:
        return _SCHEDULER

    if not app.config.get("NOTIFICATIONS_ENABLED"):
        app.logger.info("通知调度未启用（NOTIFICATIONS_ENABLED=false 或未设置）")
        return None

    try:
        from apscheduler.schedulers.background import BackgroundScheduler
    except Exception as exc:
        app.logger.warning("未安装 APScheduler，跳过通知调度: %s", exc)
        return None

    interval_minutes = max(int(app.config.get("NOTIFICATIONS_SCAN_INTERVAL_MINUTES") or 1), 1)

    scheduler = BackgroundScheduler(timezone="UTC")

    def _run_job():
        with app.app_context():
            try:
                now = datetime.utcnow()
                pending = (
                    NotificationSubscription.query
                    .filter_by(status="pending")
                    .filter(NotificationSubscription.remind_time <= now)
                    .limit(100)
                    .all()
                )

                if not pending:
                    return

                from utils.notification_sender import send_expo_push

                for sub in pending:
                    try:
                        # 若订阅绑定了 token，尝试通过 Expo Push 发送；否则保留兼容行为（仍标记为 sent）
                        if sub.token:
                            title = f"预约提醒（ID:{sub.appointment_id}）"
                            body = "您的预约即将到来，请按时就诊。"
                            sent_ok = send_expo_push(sub.token, title, body, {"subscriptionId": sub.id})
                            if not sent_ok:
                                db.session.rollback()
                                app.logger.warning("推送发送失败，subscription_id=%s", sub.id)
                                continue

                        # 标记为已发送（兼容旧 demo）
                        sub.status = "sent"
                        sub.sent_at = datetime.utcnow()
                        db.session.add(sub)
                        db.session.commit()
                        app.logger.info("通知已发送/标记：subscription_id=%s user_id=%s", sub.id, sub.user_id)
                    except Exception:
                        db.session.rollback()
                        logging.exception("处理订阅发送失败: %s", sub.id)
            except Exception:
                logging.exception("通知扫描任务失败")

    scheduler.add_job(
        _run_job,
        trigger="interval",
        minutes=interval_minutes,
        id="notification_scan_job",
        replace_existing=True,
        next_run_time=datetime.utcnow(),
    )
    scheduler.start()
    _SCHEDULER = scheduler
    app.logger.info("通知调度已启动，扫描间隔 %s 分钟（UTC）", interval_minutes)
    return scheduler
