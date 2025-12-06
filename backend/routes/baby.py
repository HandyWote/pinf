from datetime import datetime
from flask import Blueprint, jsonify, request
from models import db
from models.baby import Baby
from utils.auth import token_required, validate_request_data

baby_bp = Blueprint("baby", __name__)


def _parse_date(value, field):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError(f"{field} 格式错误，需 YYYY-MM-DD")


@baby_bp.route("/babies", methods=["GET"])
@token_required
def list_babies(current_user):
    babies = Baby.query.filter_by(user_id=current_user.id).order_by(Baby.created_at.desc()).all()
    return jsonify({"status": "success", "data": [baby.to_dict() for baby in babies]})


@baby_bp.route("/babies", methods=["POST"])
@token_required
@validate_request_data([
    {"name": "name", "type": str},
    {"name": "birthday", "type": str},
])
def create_baby(current_user, data):
    try:
        birthday = _parse_date(data["birthday"], "birthday")
        due_date = None
        if data.get("dueDate"):
            due_date = _parse_date(data["dueDate"], "dueDate")

        baby = Baby(
            user_id=current_user.id,
            name=data["name"],
            birthday=birthday,
            due_date=due_date,
            gestational_weeks=data.get("gestationalWeeks"),
            note=data.get("note"),
        )
        db.session.add(baby)
        db.session.commit()
        return jsonify({"status": "success", "message": "创建成功", "data": baby.to_dict()})
    except ValueError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"创建失败: {exc}"}), 500


@baby_bp.route("/babies/<int:baby_id>", methods=["GET"])
@token_required
def get_baby(current_user, baby_id):
    baby = Baby.query.filter_by(id=baby_id, user_id=current_user.id).first()
    if not baby:
        return jsonify({"status": "error", "message": "宝宝不存在或无权限"}), 404
    return jsonify({"status": "success", "data": baby.to_dict()})


@baby_bp.route("/babies/<int:baby_id>", methods=["PUT"])
@token_required
def update_baby(current_user, baby_id):
    baby = Baby.query.filter_by(id=baby_id, user_id=current_user.id).first()
    if not baby:
        return jsonify({"status": "error", "message": "宝宝不存在或无权限"}), 404

    data = request.get_json() or {}
    try:
        if "name" in data:
            baby.name = data["name"]
        if "birthday" in data:
            baby.birthday = _parse_date(data["birthday"], "birthday")
        if "dueDate" in data:
            baby.due_date = _parse_date(data["dueDate"], "dueDate") if data["dueDate"] else None
        if "gestationalWeeks" in data:
            baby.gestational_weeks = data.get("gestationalWeeks")
        if "note" in data:
            baby.note = data.get("note")
        db.session.commit()
        return jsonify({"status": "success", "message": "更新成功", "data": baby.to_dict()})
    except ValueError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"更新失败: {exc}"}), 500


@baby_bp.route("/babies/<int:baby_id>", methods=["DELETE"])
@token_required
def delete_baby(current_user, baby_id):
    baby = Baby.query.filter_by(id=baby_id, user_id=current_user.id).first()
    if not baby:
        return jsonify({"status": "error", "message": "宝宝不存在或无权限"}), 404
    try:
        db.session.delete(baby)
        db.session.commit()
        return jsonify({"status": "success", "message": "删除成功"})
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"删除失败: {exc}"}), 500
