from datetime import datetime
from . import db


class Appointment(db.Model):
    __tablename__ = "appointments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    baby_id = db.Column(db.Integer, db.ForeignKey("babies.id"), nullable=True, index=True)
    clinic = db.Column(db.String(200), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    scheduled_at = db.Column(db.DateTime, nullable=False, index=True)
    remind_at = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(20), default="pending", nullable=False)
    note = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "clinic": self.clinic,
            "department": self.department,
            "scheduledAt": self.scheduled_at.isoformat() if self.scheduled_at else None,
            "remindAt": self.remind_at.isoformat() if self.remind_at else None,
            "status": self.status,
            "note": self.note,
        }
