from datetime import datetime
from . import db


class GrowthRecord(db.Model):
    __tablename__ = "growth_records"

    id = db.Column(db.Integer, primary_key=True)
    baby_id = db.Column(db.Integer, db.ForeignKey("babies.id"), nullable=False, index=True)
    metric = db.Column(db.String(50), nullable=False)
    value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(20), nullable=False)
    recorded_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.Index("ix_growth_baby_metric_time", "baby_id", "metric", "recorded_at"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "metric": self.metric,
            "value": self.value,
            "unit": self.unit,
            "recordedAt": self.recorded_at.isoformat() if self.recorded_at else None,
            "note": self.note,
        }
