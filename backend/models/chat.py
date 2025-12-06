from datetime import datetime
from . import db

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    user_openid = db.Column(db.String(100), db.ForeignKey('users.openid'), nullable=False)
    message_id = db.Column(db.String(100), nullable=False)  # 前端生成的消息ID
    type = db.Column(db.String(10), nullable=False)  # 'user' 或 'ai'
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.BigInteger, nullable=False)  # 时间戳
    status = db.Column(db.String(20), default='sent')  # 'sent' 或 'failed'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.message_id,
            'type': self.type,
            'content': self.content,
            'time': self.timestamp,
            'status': self.status
        }