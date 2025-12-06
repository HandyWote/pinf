from datetime import datetime
from . import db
import json

class Video(db.Model):
    __tablename__ = 'videos'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    video_url = db.Column(db.String(500), nullable=False)
    cover_url = db.Column(db.String(500))
    views = db.Column(db.Integer, default=0)
    publish_date = db.Column(db.Date, default=datetime.utcnow)
    tags = db.Column(db.Text)  # JSON格式存储标签数组
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'videoUrl': self.video_url,
            'coverUrl': self.cover_url,
            'views': self.views,
            'publishDate': self.publish_date.isoformat() if self.publish_date else None,
            'tags': json.loads(self.tags) if self.tags else []
        }

class Article(db.Model):
    __tablename__ = 'articles'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)  # HTML格式内容
    cover_url = db.Column(db.String(500))
    author = db.Column(db.String(100))
    publish_date = db.Column(db.Date, default=datetime.utcnow)
    tags = db.Column(db.Text)  # JSON格式存储标签数组
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'coverUrl': self.cover_url,
            'author': self.author,
            'publishDate': self.publish_date.isoformat() if self.publish_date else None,
            'tags': json.loads(self.tags) if self.tags else []
        }