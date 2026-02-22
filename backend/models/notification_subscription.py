from datetime import datetime
from . import db


class NotificationSubscription(db.Model):
    __tablename__ = "notification_subscriptions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey("appointments.id"), nullable=True, index=True)
    channel = db.Column(db.String(32), nullable=False, default="push")
    token = db.Column(db.String(512), nullable=True)
    remind_time = db.Column(db.DateTime, nullable=False, index=True)
    status = db.Column(db.String(20), nullable=False, default="pending")  # pending | sent | cancelled | missed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    sent_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "appointmentId": self.appointment_id,
            "userId": self.user_id,
            "channel": self.channel,
            "token": self.token,
            "remindTime": self.remind_time.isoformat() if self.remind_time else None,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "sentAt": self.sent_at.isoformat() if self.sent_at else None,
        }
