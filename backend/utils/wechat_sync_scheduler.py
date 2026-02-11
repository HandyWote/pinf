import logging
from datetime import datetime

from utils.wechat_content_sync import sync_wechat_articles


_SCHEDULER = None


def start_wechat_sync_scheduler(app):
    global _SCHEDULER
    if _SCHEDULER is not None:
        return _SCHEDULER

    if not app.config.get("WECHAT_SYNC_ENABLED"):
        app.logger.info("微信公众号自动同步未启用（WECHAT_SYNC_ENABLED=false）")
        return None

    try:
        from apscheduler.schedulers.background import BackgroundScheduler
    except Exception as exc:
        app.logger.warning("未安装 APScheduler，跳过自动同步: %s", exc)
        return None

    interval_minutes = max(int(app.config.get("WECHAT_SYNC_INTERVAL_MINUTES") or 60), 1)
    max_pages = max(int(app.config.get("WECHAT_SYNC_MAX_PAGES") or 5), 1)
    page_size = min(max(int(app.config.get("WECHAT_SYNC_PAGE_SIZE") or 20), 1), 20)
    retry = max(int(app.config.get("WECHAT_SYNC_RETRY") or 3), 1)

    scheduler = BackgroundScheduler(timezone="Asia/Shanghai")

    def _run_job():
        with app.app_context():
            try:
                result = sync_wechat_articles(
                    max_pages=max_pages,
                    count=page_size,
                    retry=retry,
                    force_full=False,
                )
                app.logger.info("微信公众号自动同步完成: %s", result)
            except Exception as exc:
                logging.exception("微信公众号自动同步失败: %s", exc)

    scheduler.add_job(
        _run_job,
        trigger="interval",
        minutes=interval_minutes,
        id="wechat_content_sync_job",
        replace_existing=True,
        next_run_time=datetime.now(),
    )
    scheduler.start()
    _SCHEDULER = scheduler
    app.logger.info("微信公众号自动同步已启动，间隔 %s 分钟", interval_minutes)
    return scheduler
