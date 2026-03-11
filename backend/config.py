import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    """应用基础配置，依赖 .env 提供敏感信息。"""

    # 基础配置
    SECRET_KEY = os.environ.get("SECRET_KEY", "")

    # 数据库配置（PostgreSQL 推荐）
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # 数据库连接池配置（仅 PostgreSQL 使用 keepalive 相关参数）
    _db_uri = SQLALCHEMY_DATABASE_URI.lower()
    if not _db_uri.startswith(("postgresql://", "postgresql+", "postgres://")):
        raise RuntimeError("DATABASE_URL 必须使用 PostgreSQL 连接串（postgresql://...）")
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
    if _db_uri.startswith(("postgresql://", "postgresql+", "postgres://")):
        SQLALCHEMY_ENGINE_OPTIONS.update({
            "pool_size": int(os.environ.get("DB_POOL_SIZE", "10")),
            "pool_recycle": int(os.environ.get("DB_POOL_RECYCLE", "600")),
            "pool_timeout": int(os.environ.get("DB_POOL_TIMEOUT", "30")),
            "max_overflow": int(os.environ.get("DB_MAX_OVERFLOW", "20")),
            "connect_args": {
                "keepalives": int(os.environ.get("DB_KEEPALIVES", "1")),
                "keepalives_idle": int(os.environ.get("DB_KEEPALIVES_IDLE", "30")),
                "keepalives_interval": int(os.environ.get("DB_KEEPALIVES_INTERVAL", "10")),
                "keepalives_count": int(os.environ.get("DB_KEEPALIVES_COUNT", "5")),
            },
        })

    # JWT 配置
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    # n8n 转发配置
    N8N_WEBHOOK_URL = os.environ.get("N8N_WEBHOOK_URL", "")
    N8N_BASIC_AUTH_USER = os.environ.get("N8N_BASIC_AUTH_USER", "")
    N8N_BASIC_AUTH_PASSWORD = os.environ.get("N8N_BASIC_AUTH_PASSWORD", "")
    N8N_TIMEOUT_SECONDS = int(os.environ.get("N8N_TIMEOUT_SECONDS", "120"))

    # 微信公众号配置
    WECHAT_APP_ID = os.environ.get("WECHAT_APP_ID", "")
    WECHAT_APP_SECRET = os.environ.get("WECHAT_APP_SECRET", "")
    WECHAT_API_TIMEOUT = int(os.environ.get("WECHAT_API_TIMEOUT", "10"))
    WECHAT_SYNC_ENABLED = os.environ.get("WECHAT_SYNC_ENABLED", "false").lower() in ("1", "true", "yes")
    WECHAT_SYNC_INTERVAL_MINUTES = int(os.environ.get("WECHAT_SYNC_INTERVAL_MINUTES", "60"))
    WECHAT_SYNC_MAX_PAGES = int(os.environ.get("WECHAT_SYNC_MAX_PAGES", "5"))
    WECHAT_SYNC_PAGE_SIZE = int(os.environ.get("WECHAT_SYNC_PAGE_SIZE", "20"))
    WECHAT_SYNC_RETRY = int(os.environ.get("WECHAT_SYNC_RETRY", "3"))
    # 通知/订阅调度（用于本地 demo 与后续推送接入）
    NOTIFICATIONS_ENABLED = os.environ.get("NOTIFICATIONS_ENABLED", "false").lower() in ("1", "true", "yes")
    NOTIFICATIONS_SCAN_INTERVAL_MINUTES = int(os.environ.get("NOTIFICATIONS_SCAN_INTERVAL_MINUTES", "60"))
    # CORS 配置
    CORS_ORIGINS = ["*"]  # 生产环境需收紧
