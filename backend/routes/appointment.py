from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request

from models import db
from models.appointment import Appointment
from models.baby import Baby
from models.notification_subscription import NotificationSubscription
from utils.appointment_status import mark_overdue_appointments, now_local_naive, to_local_naive
from utils.auth import token_required, validate_request_data

appointment_bp = Blueprint("appointment", __name__)

ALLOWED_APPOINTMENT_STATUS = {"pending", "completed", "overdue"}


def _parse_datetime(value, field):
    try:
        normalized = value.strip()
        if normalized.endswith("Z"):
            normalized = normalized[:-1] + "+00:00"

        parsed = datetime.fromisoformat(normalized)
        return to_local_naive(parsed)
    except ValueError as exc:
        raise ValueError(f"{field} 格式错误，需要 ISO8601 时间") from exc


def _validate_text_field(value, label, max_length):
    if not isinstance(value, str):
        raise ValueError(f"{label} 类型错误")

    normalized = value.strip()
    if not normalized:
        raise ValueError(f"{label} 不能为空")
    if len(normalized) > max_length:
        raise ValueError(f"{label} 长度不能超过 {max_length} 个字符")
    return normalized


def _validate_note(value):
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError("note 类型错误")

    normalized = value.strip()
    if len(normalized) > 1000:
        raise ValueError("备注长度不能超过 1000 个字符")
    return normalized or None


def _validate_status(status):
    normalized = (status or "pending").strip()
    if normalized not in ALLOWED_APPOINTMENT_STATUS:
        raise ValueError("status 仅支持 pending, completed, overdue")
    return normalized


def _serialize_appointment(appointment):
    payload = appointment.to_dict()
    if appointment.baby:
        payload["baby"] = appointment.baby.to_dict()
    return payload


def _find_appointment(user_id, appointment_id):
    return Appointment.query.filter_by(id=appointment_id, user_id=user_id).first()


def _resolve_baby(current_user, baby_id):
    if baby_id is None:
        return None
    if not isinstance(baby_id, int):
        raise ValueError("babyId 类型错误")

    baby = Baby.query.filter_by(id=baby_id, user_id=current_user.id).first()
    if not baby:
        raise LookupError("宝宝不存在或无权限")
    return baby
@appointment_bp.route("/appointments", methods=["GET"])
@token_required
def list_appointments(current_user):
    mark_overdue_appointments(current_user.id)

    status = request.args.get("status")
    query = Appointment.query.filter_by(user_id=current_user.id)
    if status:
        query = query.filter_by(status=status)

    appointments = query.order_by(Appointment.scheduled_at.asc()).all()
    return jsonify({"status": "success", "data": [_serialize_appointment(item) for item in appointments]})


@appointment_bp.route("/appointments/summary", methods=["GET"])
@token_required
def get_appointment_summary(current_user):
    try:
        window_days = int(request.args.get("windowDays", 3))
    except ValueError:
        return jsonify({"status": "error", "message": "windowDays 必须是数字"}), 400

    if window_days < 1 or window_days > 30:
        return jsonify({"status": "error", "message": "windowDays 需在 1-30 之间"}), 400

    mark_overdue_appointments(current_user.id)

    now = now_local_naive()
    start_of_today = datetime(now.year, now.month, now.day)
    start_of_tomorrow = start_of_today + timedelta(days=1)
    upcoming_deadline = start_of_today + timedelta(days=window_days + 1)

    base_query = Appointment.query.filter_by(user_id=current_user.id, status="pending")
    today_items = (
        base_query.filter(
            Appointment.scheduled_at >= start_of_today,
            Appointment.scheduled_at < start_of_tomorrow,
        )
        .order_by(Appointment.scheduled_at.asc())
        .all()
    )
    upcoming_items = (
        base_query.filter(
            Appointment.scheduled_at >= start_of_tomorrow,
            Appointment.scheduled_at < upcoming_deadline,
        )
        .order_by(Appointment.scheduled_at.asc())
        .all()
    )

    return jsonify(
        {
            "status": "success",
            "data": {
                "today": [_serialize_appointment(item) for item in today_items],
                "upcoming": [_serialize_appointment(item) for item in upcoming_items],
                "counts": {
                    "today": len(today_items),
                    "upcoming": len(upcoming_items),
                    "total": len(today_items) + len(upcoming_items),
                },
                "windowDays": window_days,
                "generatedAt": now.isoformat(),
            },
        }
    )


@appointment_bp.route("/appointments", methods=["POST"])
@token_required
@validate_request_data(
    [
        {"name": "clinic", "type": str},
        {"name": "department", "type": str},
        {"name": "scheduledAt", "type": str},
    ]
)
def create_appointment(current_user, data):
    try:
        clinic = _validate_text_field(data["clinic"], "就诊机构", 200)
        department = _validate_text_field(data["department"], "科室/医生", 100)
        scheduled_at = _parse_datetime(data["scheduledAt"], "scheduledAt")
        remind_at = _parse_datetime(data["remindAt"], "remindAt") if data.get("remindAt") else None
        if remind_at and remind_at > scheduled_at:
            return jsonify({"status": "error", "message": "remindAt 不能晚于 scheduledAt"}), 400

        note = _validate_note(data.get("note"))
        status = _validate_status(data.get("status", "pending"))
        baby = _resolve_baby(current_user, data.get("babyId")) if "babyId" in data else None

        appointment = Appointment(
            user_id=current_user.id,
            baby_id=baby.id if baby else None,
            clinic=clinic,
            department=department,
            scheduled_at=scheduled_at,
            remind_at=remind_at,
            status=status,
            note=note,
        )
        db.session.add(appointment)
        db.session.commit()
        return jsonify({"status": "success", "message": "创建成功", "data": _serialize_appointment(appointment)})
    except ValueError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400
    except LookupError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 404
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"创建失败: {exc}"}), 500


@appointment_bp.route("/appointments/<int:appointment_id>", methods=["PUT"])
@token_required
def update_appointment(current_user, appointment_id):
    appointment = _find_appointment(current_user.id, appointment_id)
    if not appointment:
        return jsonify({"status": "error", "message": "预约不存在或无权限"}), 404

    data = request.get_json() or {}
    try:
        if "clinic" in data:
            appointment.clinic = _validate_text_field(data["clinic"], "就诊机构", 200)
        if "department" in data:
            appointment.department = _validate_text_field(data["department"], "科室/医生", 100)
        if "scheduledAt" in data:
            appointment.scheduled_at = _parse_datetime(data["scheduledAt"], "scheduledAt")
        if "remindAt" in data:
            appointment.remind_at = _parse_datetime(data["remindAt"], "remindAt") if data["remindAt"] else None
        if appointment.remind_at and appointment.remind_at > appointment.scheduled_at:
            return jsonify({"status": "error", "message": "remindAt 不能晚于 scheduledAt"}), 400
        if "status" in data:
            appointment.status = _validate_status(data["status"])
        if "note" in data:
            appointment.note = _validate_note(data.get("note"))
        if "babyId" in data:
            baby = _resolve_baby(current_user, data["babyId"]) if data["babyId"] else None
            appointment.baby_id = baby.id if baby else None

        db.session.commit()
        return jsonify({"status": "success", "message": "更新成功", "data": _serialize_appointment(appointment)})
    except ValueError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400
    except LookupError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 404
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"更新失败: {exc}"}), 500


@appointment_bp.route("/appointments/<int:appointment_id>", methods=["DELETE"])
@token_required
def delete_appointment(current_user, appointment_id):
    appointment = _find_appointment(current_user.id, appointment_id)
    if not appointment:
        return jsonify({"status": "error", "message": "预约不存在或无权限"}), 404
    try:
        db.session.delete(appointment)
        db.session.commit()
        return jsonify({"status": "success", "message": "删除成功"})
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"删除失败: {exc}"}), 500


@appointment_bp.route("/appointments/<int:appointment_id>/status", methods=["PATCH"])
@token_required
@validate_request_data([{"name": "status", "type": str}])
def update_status(current_user, appointment_id, data):
    appointment = _find_appointment(current_user.id, appointment_id)
    if not appointment:
        return jsonify({"status": "error", "message": "预约不存在或无权限"}), 404
    try:
        appointment.status = _validate_status(data["status"])
        # 当预约状态更新为 completed 时，取消所有待发送的提醒
        if appointment.status == 'completed':
            NotificationSubscription.query.filter_by(
                appointment_id=appointment.id,
                status='pending'
            ).update({'status': 'cancelled'})
        db.session.commit()
        return jsonify({"status": "success", "message": "状态已更新", "data": _serialize_appointment(appointment)})
    except ValueError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"更新失败: {exc}"}), 500
