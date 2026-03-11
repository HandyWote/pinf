from datetime import datetime
from zoneinfo import ZoneInfo

from models import db
from models.appointment import Appointment

APPOINTMENT_TIMEZONE = ZoneInfo("Asia/Shanghai")


def to_local_naive(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value
    return value.astimezone(APPOINTMENT_TIMEZONE).replace(tzinfo=None)


def now_local_naive() -> datetime:
    return datetime.now(APPOINTMENT_TIMEZONE).replace(tzinfo=None)


def mark_overdue_appointments(user_id: int | None = None, now: datetime | None = None) -> int:
    overdue_deadline = to_local_naive(now) if now is not None else now_local_naive()

    query = Appointment.query.filter(
        Appointment.status == "pending",
        Appointment.scheduled_at < overdue_deadline,
    )
    if user_id is not None:
        query = query.filter(Appointment.user_id == user_id)

    overdue_items = query.order_by(Appointment.scheduled_at.asc()).all()
    if not overdue_items:
        return 0

    for item in overdue_items:
        item.status = "overdue"

    db.session.commit()
    return len(overdue_items)
