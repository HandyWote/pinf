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

    # 数据库连接池配置（防止长时间空闲后连接断开）
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": int(os.environ.get("DB_POOL_SIZE", "10")),
        "pool_recycle": int(os.environ.get("DB_POOL_RECYCLE", "600")),
        "pool_pre_ping": True,
        "pool_timeout": int(os.environ.get("DB_POOL_TIMEOUT", "30")),
        "max_overflow": int(os.environ.get("DB_MAX_OVERFLOW", "20")),
        "connect_args": {
            "keepalives": int(os.environ.get("DB_KEEPALIVES", "1")),
            "keepalives_idle": int(os.environ.get("DB_KEEPALIVES_IDLE", "30")),
            "keepalives_interval": int(os.environ.get("DB_KEEPALIVES_INTERVAL", "10")),
            "keepalives_count": int(os.environ.get("DB_KEEPALIVES_COUNT", "5")),
        },
    }

    # JWT 配置
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    # n8n 转发配置
    N8N_WEBHOOK_URL = os.environ.get("N8N_WEBHOOK_URL", "")

    # CORS 配置
    CORS_ORIGINS = ["*"]  # 生产环境需收紧
