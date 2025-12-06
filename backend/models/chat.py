from datetime import datetime
from . import db


class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    baby_id = db.Column(db.Integer, db.ForeignKey("babies.id"), nullable=True, index=True)
    role = db.Column(db.String(10), nullable=False)  # user/ai/system
    message_id = db.Column(db.String(100), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.BigInteger, nullable=False)
    status = db.Column(db.String(20), default="sent")  # sent/failed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.Index("ix_chat_user_time", "user_id", "timestamp"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "messageId": self.message_id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp,
            "status": self.status,
        }
