from datetime import datetime
from . import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(20), unique=True, nullable=True)
    wx_openid = db.Column(db.String(100), unique=True, nullable=True)
    role = db.Column(db.String(20), default="user", nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    babies = db.relationship("Baby", backref="user", lazy=True, cascade="all, delete-orphan")
    appointments = db.relationship("Appointment", backref="user", lazy=True, cascade="all, delete-orphan")
    chat_messages = db.relationship("ChatMessage", backref="user", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "phone": self.phone,
            "wxOpenid": self.wx_openid,
            "role": self.role,
            "needSetPassword": self.password_hash is None,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
