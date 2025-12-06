from datetime import datetime
from flask import Blueprint, jsonify, request
from models import db
from models.baby import Baby
from models.growth import GrowthRecord
from utils.auth import token_required, validate_request_data

growth_bp = Blueprint("growth", __name__)


def _parse_datetime(value, field):
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        raise ValueError(f"{field} 格式错误，需 ISO8601 时间")


def _check_baby(baby_id, user_id):
    return Baby.query.filter_by(id=baby_id, user_id=user_id).first()


@growth_bp.route("/babies/<int:baby_id>/growth", methods=["GET"])
@token_required
def list_growth(current_user, baby_id):
    baby = _check_baby(baby_id, current_user.id)
    if not baby:
        return jsonify({"status": "error", "message": "宝宝不存在或无权限"}), 404

    metric = request.args.get("metric")
    start = request.args.get("start")
    end = request.args.get("end")

    try:
        query = GrowthRecord.query.filter_by(baby_id=baby_id)
        if metric:
            query = query.filter_by(metric=metric)
        if start:
            query = query.filter(GrowthRecord.recorded_at >= _parse_datetime(start, "start"))
        if end:
            query = query.filter(GrowthRecord.recorded_at <= _parse_datetime(end, "end"))

        records = query.order_by(GrowthRecord.recorded_at.desc()).all()
        return jsonify({"status": "success", "data": [r.to_dict() for r in records]})
    except ValueError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400


@growth_bp.route("/babies/<int:baby_id>/growth", methods=["POST"])
@token_required
@validate_request_data([
    {"name": "metric", "type": str},
    {"name": "value", "type": (int, float)},
    {"name": "unit", "type": str},
])
def create_growth(current_user, baby_id, data):
    baby = _check_baby(baby_id, current_user.id)
    if not baby:
        return jsonify({"status": "error", "message": "宝宝不存在或无权限"}), 404

    try:
        recorded_at = datetime.utcnow()
        if data.get("recordedAt"):
            recorded_at = _parse_datetime(data["recordedAt"], "recordedAt")

        record = GrowthRecord(
            baby_id=baby.id,
            metric=data["metric"],
            value=float(data["value"]),
            unit=data["unit"],
            recorded_at=recorded_at,
            note=data.get("note"),
        )
        db.session.add(record)
        db.session.commit()
        return jsonify({"status": "success", "message": "创建成功", "data": record.to_dict()})
    except ValueError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"创建失败: {exc}"}), 500


@growth_bp.route("/growth/<int:record_id>", methods=["PUT"])
@token_required
def update_growth(current_user, record_id):
    record = (
        GrowthRecord.query.join(Baby, Baby.id == GrowthRecord.baby_id)
        .filter(GrowthRecord.id == record_id, Baby.user_id == current_user.id)
        .first()
    )
    if not record:
        return jsonify({"status": "error", "message": "记录不存在或无权限"}), 404

    data = request.get_json() or {}
    try:
        if "metric" in data:
            record.metric = data["metric"]
        if "value" in data:
            record.value = float(data["value"])
        if "unit" in data:
            record.unit = data["unit"]
        if "recordedAt" in data:
            record.recorded_at = _parse_datetime(data["recordedAt"], "recordedAt")
        if "note" in data:
            record.note = data.get("note")
        db.session.commit()
        return jsonify({"status": "success", "message": "更新成功", "data": record.to_dict()})
    except ValueError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"更新失败: {exc}"}), 500


@growth_bp.route("/growth/<int:record_id>", methods=["DELETE"])
@token_required
def delete_growth(current_user, record_id):
    record = (
        GrowthRecord.query.join(Baby, Baby.id == GrowthRecord.baby_id)
        .filter(GrowthRecord.id == record_id, Baby.user_id == current_user.id)
        .first()
    )
    if not record:
        return jsonify({"status": "error", "message": "记录不存在或无权限"}), 404
    try:
        db.session.delete(record)
        db.session.commit()
        return jsonify({"status": "success", "message": "删除成功"})
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"删除失败: {exc}"}), 500
