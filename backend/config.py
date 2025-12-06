import os
from datetime import timedelta

class Config:
    # 基础配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or ''
    
    # 数据库配置
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///database.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT配置
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # 微信小程序配置
    WECHAT_APP_ID = os.environ.get('WECHAT_APP_ID') or 'wxae8e4d15e58a0178'
    WECHAT_APP_SECRET = os.environ.get('WECHAT_APP_SECRET') or '1344bb4c86e9cdbbdbe4088e15847eec'
    
    # CORS配置
    CORS_ORIGINS = ['*']  # 生产环境需要限制具体域名