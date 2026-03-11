from datetime import timedelta

from models import db
from models.appointment import Appointment
from utils.appointment_status import mark_overdue_appointments, now_local_naive


def test_mark_overdue_appointments_updates_database(app, sample_user):
    with app.app_context():
        current = now_local_naive()
        overdue = Appointment(
            user_id=sample_user.id,
            clinic="Test Clinic",
            department="Child Care",
            scheduled_at=current - timedelta(hours=2),
            status="pending",
        )
        future = Appointment(
            user_id=sample_user.id,
            clinic="Future Clinic",
            department="Pediatrics",
            scheduled_at=current + timedelta(hours=2),
            status="pending",
        )
        db.session.add_all([overdue, future])
        db.session.commit()

        updated = mark_overdue_appointments()

        db.session.refresh(overdue)
        db.session.refresh(future)

        assert updated == 1
        assert overdue.status == "overdue"
        assert future.status == "pending"
