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

    # JWT 配置
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    # 微信小程序配置（可选）
    WECHAT_APP_ID = os.environ.get("WECHAT_APP_ID", "")
    WECHAT_APP_SECRET = os.environ.get("WECHAT_APP_SECRET", "")

    # n8n 转发配置
    N8N_WEBHOOK_URL = os.environ.get("N8N_WEBHOOK_URL", "")

    # CORS 配置
    CORS_ORIGINS = ["*"]  # 生产环境需收紧
