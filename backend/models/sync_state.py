from datetime import datetime

from . import db


class SyncState(db.Model):
    __tablename__ = "sync_states"

    key = db.Column(db.String(100), primary_key=True)
    value = db.Column(db.Text, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
