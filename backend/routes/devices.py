from flask import Blueprint, request, jsonify
from models import db
from models.device_token import DeviceToken
from models.appointment import Appointment
from utils.auth import token_required, validate_request_data

devices_bp = Blueprint("devices", __name__)


@devices_bp.route("/devices", methods=["GET"])
@token_required
def list_devices(current_user):
    rows = DeviceToken.query.filter_by(user_id=current_user.id).all()
    return jsonify({"status": "success", "data": [r.to_dict() for r in rows]})


@devices_bp.route("/devices", methods=["POST"])
@token_required
@validate_request_data([
    {"name": "token", "type": str},
    {"name": "platform", "type": str},
])
def register_device(current_user, data):
    token = data.get("token")
    platform = data.get("platform")
    existing = DeviceToken.query.filter_by(token=token).first()
    try:
        if existing:
            # update owner or last_seen
            existing.user_id = current_user.id
            existing.platform = platform or existing.platform
            existing.last_seen_at = db.func.now()
            db.session.add(existing)
            db.session.commit()
            return jsonify({"status": "success", "message": "device updated", "data": existing.to_dict()})

        d = DeviceToken(user_id=current_user.id, token=token, platform=platform)
        db.session.add(d)
        db.session.commit()
        return jsonify({"status": "success", "message": "device registered", "data": d.to_dict()})
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"register failed: {exc}"}), 500


@devices_bp.route("/devices/<int:device_id>", methods=["DELETE"])
@token_required
def unregister_device(current_user, device_id):
    d = DeviceToken.query.filter_by(id=device_id, user_id=current_user.id).first()
    if not d:
        return jsonify({"status": "error", "message": "device not found"}), 404
    try:
        db.session.delete(d)
        db.session.commit()
        return jsonify({"status": "success", "message": "device unregistered"})
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"unregister failed: {exc}"}), 500
