from datetime import datetime
from . import db
import json


def _parse_tags(raw):
    if not raw:
        return []
    try:
        return json.loads(raw)
    except ValueError:
        return []


class Article(db.Model):
    __tablename__ = "articles"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    wechat_article_id = db.Column(db.String(128), index=True)
    source_url = db.Column(db.String(1000))
    cover_url = db.Column(db.String(500))
    author = db.Column(db.String(100))
    category = db.Column(db.String(50), index=True)
    publish_date = db.Column(db.Date, default=datetime.utcnow)
    tags = db.Column(db.Text)  # JSON 格式标签
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "wechatArticleId": self.wechat_article_id,
            "sourceUrl": self.source_url,
            "coverUrl": self.cover_url,
            "author": self.author,
            "category": self.category,
            "publishDate": self.publish_date.isoformat() if self.publish_date else None,
            "tags": _parse_tags(self.tags),
        }
