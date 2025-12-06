from datetime import datetime
from flask import Blueprint, request, jsonify
from models import db
from models.appointment import Appointment
from models.baby import Baby
from utils.auth import token_required, validate_request_data

appointment_bp = Blueprint("appointment", __name__)


def _parse_datetime(value, field):
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        raise ValueError(f"{field} 格式错误，需 ISO8601 时间")


def _find_appointment(user_id, appointment_id):
    return Appointment.query.filter_by(id=appointment_id, user_id=user_id).first()


@appointment_bp.route("/appointments", methods=["GET"])
@token_required
def list_appointments(current_user):
    status = request.args.get("status")
    query = Appointment.query.filter_by(user_id=current_user.id)
    if status:
        query = query.filter_by(status=status)
    appointments = query.order_by(Appointment.scheduled_at.asc()).all()

    data = []
    for item in appointments:
        entry = item.to_dict()
        if item.baby:
            entry["baby"] = item.baby.to_dict()
        data.append(entry)
    return jsonify({"status": "success", "data": data})


@appointment_bp.route("/appointments", methods=["POST"])
@token_required
@validate_request_data([
    {"name": "clinic", "type": str},
    {"name": "department", "type": str},
    {"name": "scheduledAt", "type": str},
])
def create_appointment(current_user, data):
    try:
        scheduled_at = _parse_datetime(data["scheduledAt"], "scheduledAt")
        remind_at = _parse_datetime(data["remindAt"], "remindAt") if data.get("remindAt") else None

        baby = None
        if data.get("babyId"):
            baby = Baby.query.filter_by(id=data["babyId"], user_id=current_user.id).first()
            if not baby:
                return jsonify({"status": "error", "message": "宝宝不存在或无权限"}), 404

        appointment = Appointment(
            user_id=current_user.id,
            baby_id=baby.id if baby else None,
            clinic=data["clinic"],
            department=data["department"],
            scheduled_at=scheduled_at,
            remind_at=remind_at,
            status=data.get("status", "pending"),
            note=data.get("note"),
        )
        db.session.add(appointment)
        db.session.commit()

        payload = appointment.to_dict()
        if baby:
            payload["baby"] = baby.to_dict()
        return jsonify({"status": "success", "message": "创建成功", "data": payload})
    except ValueError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400
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
            appointment.clinic = data["clinic"]
        if "department" in data:
            appointment.department = data["department"]
        if "scheduledAt" in data:
            appointment.scheduled_at = _parse_datetime(data["scheduledAt"], "scheduledAt")
        if "remindAt" in data:
            appointment.remind_at = _parse_datetime(data["remindAt"], "remindAt") if data["remindAt"] else None
        if "status" in data:
            appointment.status = data["status"]
        if "note" in data:
            appointment.note = data.get("note")
        if "babyId" in data:
            if data["babyId"]:
                baby = Baby.query.filter_by(id=data["babyId"], user_id=current_user.id).first()
                if not baby:
                    return jsonify({"status": "error", "message": "宝宝不存在或无权限"}), 404
                appointment.baby_id = baby.id
            else:
                appointment.baby_id = None
        db.session.commit()

        payload = appointment.to_dict()
        if appointment.baby:
            payload["baby"] = appointment.baby.to_dict()
        return jsonify({"status": "success", "message": "更新成功", "data": payload})
    except ValueError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400
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
        appointment.status = data["status"]
        db.session.commit()
        return jsonify({"status": "success", "message": "状态已更新", "data": appointment.to_dict()})
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"更新失败: {exc}"}), 500
