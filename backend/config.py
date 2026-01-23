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
        "pool_size": 10,           # 连接池大小
        "pool_recycle": 3600,      # 1小时回收连接
        "pool_pre_ping": True,     # 使用前ping检测连接有效性
        "pool_timeout": 30,        # 获取连接超时时间
        "max_overflow": 20,        # 最大溢出连接数
    }

    # JWT 配置
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    # n8n 转发配置
    N8N_WEBHOOK_URL = os.environ.get("N8N_WEBHOOK_URL", "")

    # CORS 配置
    CORS_ORIGINS = ["*"]  # 生产环境需收紧
