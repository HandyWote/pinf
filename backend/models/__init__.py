from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# 导入所有模型
from .user import User
from .baby import Baby
from .growth import GrowthRecord
from .content import Article
from .appointment import Appointment
from .chat import ChatMessage
from .verification_code import VerificationCode
from .sync_state import SyncState
