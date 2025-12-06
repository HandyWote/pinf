from datetime import datetime
from . import db

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.String(100), primary_key=True)  # 使用字符串ID
    user_openid = db.Column(db.String(100), db.ForeignKey('users.openid'), nullable=False)
    child_id = db.Column(db.Integer, db.ForeignKey('children.id'), nullable=False)
    hospital_name = db.Column(db.String(200), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    appointment_date = db.Column(db.Date, nullable=False)
    reminder_days = db.Column(db.Integer, default=1)
    notes = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # 'pending' 或 'completed'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'hospitalName': self.hospital_name,
            'department': self.department,
            'appointmentDate': self.appointment_date.isoformat() if self.appointment_date else None,
            'reminderDays': self.reminder_days,
            'notes': self.notes,
            'status': self.status
        }