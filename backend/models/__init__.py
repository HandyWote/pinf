from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# 导入所有模型
from .user import User
from .child import Child, GrowthRecord
from .content import Video, Article
from .appointment import Appointment
from .chat import ChatMessage