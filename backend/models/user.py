from datetime import datetime
from . import db

class User(db.Model):
    __tablename__ = 'users'
    
    openid = db.Column(db.String(100), primary_key=True)
    session_key = db.Column(db.String(100))
    role = db.Column(db.String(20), default='user')  # 'user' 或 'doctor'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关联关系
    children = db.relationship('Child', backref='parent', lazy=True, cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', backref='user', lazy=True, cascade='all, delete-orphan')
    chat_messages = db.relationship('ChatMessage', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'openid': self.openid,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }