import time
import uuid
from flask import Blueprint, request, jsonify
from models import db
from models.chat import ChatMessage
from models.baby import Baby
from utils.auth import token_required, validate_request_data
from utils.n8n_client import send_to_n8n

chat_bp = Blueprint("chat", __name__)


def _build_payload(current_user, baby, data, history):
    return {
        "message_id": data.get("messageId") or str(uuid.uuid4()),
        "content": data["content"],
        "user": {
            "id": current_user.id,
            "role": current_user.role,
            "phone": current_user.phone,
            "wx_openid": current_user.wx_openid,
        },
        "baby": baby.to_dict() if baby else None,
        "context": {"locale": "zh-CN", "app": "WAend", "platform": "mobile"},
        "history": history,
        "metadata": data.get("metadata", {}),
        "params": data.get("params", {}),
    }


@chat_bp.route("/chat/send", methods=["POST"])
@token_required
@validate_request_data([
    {"name": "content", "type": str},
])
def send_message(current_user, data):
    baby = None
    if data.get("babyId"):
        baby = Baby.query.filter_by(id=data["babyId"], user_id=current_user.id).first()
        if not baby:
            return jsonify({"status": "error", "message": "宝宝不存在或无权限"}), 404

    message_id = data.get("messageId") or str(uuid.uuid4())
    timestamp = int(time.time() * 1000)
    user_message = ChatMessage(
        user_id=current_user.id,
        baby_id=baby.id if baby else None,
        role="user",
        message_id=message_id,
        content=data["content"],
        timestamp=timestamp,
        status="sent",
    )
    db.session.add(user_message)
    db.session.flush()

    history_payload = data.get("history") or []
    payload = _build_payload(current_user, baby, {**data, "messageId": message_id}, history_payload)

    n8n_response, error = send_to_n8n(payload)
    if error:
        user_message.status = "failed"
        db.session.commit()
        return jsonify({"status": "error", "message": f"AI 服务暂时不可用: {error}", "data": {"userMessage": user_message.to_dict()}}), 502

    ai_message_id = n8n_response.get("message_id") or str(uuid.uuid4()) if isinstance(n8n_response, dict) else str(uuid.uuid4())
    ai_content = n8n_response.get("answer") if isinstance(n8n_response, dict) else ""
    ai_message = ChatMessage(
        user_id=current_user.id,
        baby_id=baby.id if baby else None,
        role="ai",
        message_id=ai_message_id,
        content=ai_content,
        timestamp=int(time.time() * 1000),
        status="sent",
    )
    db.session.add(ai_message)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "消息发送成功",
        "data": {"userMessage": user_message.to_dict(), "aiMessage": ai_message.to_dict()},
    })


@chat_bp.route("/chat/history", methods=["GET"])
@token_required
def chat_history(current_user):
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)
    baby_id = request.args.get("babyId", type=int)

    query = ChatMessage.query.filter_by(user_id=current_user.id)
    if baby_id:
        query = query.filter_by(baby_id=baby_id)
    messages = query.order_by(ChatMessage.timestamp.desc()).paginate(page=page, per_page=per_page, error_out=False)
    message_list = [msg.to_dict() for msg in reversed(messages.items)]
    return jsonify({
        "status": "success",
        "data": message_list,
        "pagination": {
            "page": page,
            "perPage": per_page,
            "total": messages.total,
            "pages": messages.pages,
            "hasNext": messages.has_next,
            "hasPrev": messages.has_prev,
        },
    })


@chat_bp.route("/chat/history", methods=["DELETE"])
@token_required
def clear_history(current_user):
    baby_id = request.args.get("babyId", type=int)
    try:
        query = ChatMessage.query.filter_by(user_id=current_user.id)
        if baby_id:
            query = query.filter_by(baby_id=baby_id)
        query.delete()
        db.session.commit()
        return jsonify({"status": "success", "message": "聊天历史已清空"})
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"清空失败: {exc}"}), 500
