from datetime import datetime
from . import db


class Baby(db.Model):
    __tablename__ = "babies"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    name = db.Column(db.String(50), nullable=False)
    birthday = db.Column(db.Date, nullable=False)
    due_date = db.Column(db.Date, nullable=True)
    gestational_weeks = db.Column(db.Integer, nullable=True)
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    growth_records = db.relationship(
        "GrowthRecord", backref="baby", lazy=True, cascade="all, delete-orphan"
    )
    appointments = db.relationship(
        "Appointment", backref="baby", lazy=True, cascade="all, delete-orphan"
    )
    chat_messages = db.relationship("ChatMessage", backref="baby", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "birthday": self.birthday.isoformat() if self.birthday else None,
            "dueDate": self.due_date.isoformat() if self.due_date else None,
            "gestationalWeeks": self.gestational_weeks,
            "note": self.note,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
