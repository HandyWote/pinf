from datetime import datetime, timedelta

from flask_jwt_extended import create_access_token

from models import db
from models.appointment import Appointment
from routes import appointment as appointment_route
from routes.appointment import appointment_bp


def _register_blueprint_once(app):
    if "appointment" not in app.blueprints:
        app.register_blueprint(appointment_bp, url_prefix="/api")


def _auth_headers(app, user_id):
    with app.app_context():
        token = create_access_token(identity=str(user_id))
    return {"Authorization": f"Bearer {token}"}


def test_list_appointments_marks_expired_pending_as_overdue(app, client, sample_user):
    _register_blueprint_once(app)

    with app.app_context():
        overdue = Appointment(
            user_id=sample_user.id,
            clinic="Test Clinic",
            department="Child Care",
            scheduled_at=datetime.utcnow() - timedelta(hours=2),
            status="pending",
        )
        upcoming = Appointment(
            user_id=sample_user.id,
            clinic="Future Clinic",
            department="Pediatrics",
            scheduled_at=datetime.utcnow() + timedelta(days=1),
            status="pending",
        )
        db.session.add_all([overdue, upcoming])
        db.session.commit()

        overdue_id = overdue.id
        upcoming_id = upcoming.id

    response = client.get(
        "/api/appointments",
        headers=_auth_headers(app, sample_user.id),
    )

    assert response.status_code == 200
    payload = response.get_json()
    rows = {item["id"]: item for item in payload["data"]}

    assert rows[overdue_id]["status"] == "overdue"
    assert rows[upcoming_id]["status"] == "pending"

    with app.app_context():
        refreshed = db.session.get(Appointment, overdue_id)
        assert refreshed.status == "overdue"


def test_update_status_allows_marking_appointment_completed(app, client, sample_user):
    _register_blueprint_once(app)

    with app.app_context():
        appointment = Appointment(
            user_id=sample_user.id,
            clinic="Recovery Clinic",
            department="Neonatal",
            scheduled_at=datetime.utcnow() - timedelta(days=1),
            status="overdue",
        )
        db.session.add(appointment)
        db.session.commit()
        appointment_id = appointment.id

    response = client.patch(
        f"/api/appointments/{appointment_id}/status",
        headers=_auth_headers(app, sample_user.id),
        json={"status": "completed"},
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["data"]["status"] == "completed"

    with app.app_context():
        refreshed = db.session.get(Appointment, appointment_id)
        assert refreshed.status == "completed"


def test_parse_datetime_normalizes_timezone_to_shanghai_local():
    parsed = appointment_route._parse_datetime("2026-03-07T02:00:00Z", "scheduledAt")
    assert parsed == datetime(2026, 3, 7, 10, 0, 0)
