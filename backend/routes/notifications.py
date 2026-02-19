from datetime import datetime
from flask import Blueprint, request, jsonify
from models import db
from models.notification_subscription import NotificationSubscription
from models.appointment import Appointment
from utils.auth import token_required, validate_request_data
from utils.notification_sender import send_expo_push

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.route("/notifications/subscriptions", methods=["GET"])
@token_required
def list_subscriptions(current_user):
    subs = NotificationSubscription.query.filter_by(user_id=current_user.id).order_by(NotificationSubscription.remind_time.asc()).all()
    data = [s.to_dict() for s in subs]
    return jsonify({"status": "success", "data": data})


@notifications_bp.route("/notifications/subscriptions", methods=["POST"])
@token_required
@validate_request_data([
    {"name": "appointmentId", "type": int},
    {"name": "remindTime", "type": str},
])
def create_subscription(current_user, data):
    try:
        remind_time = datetime.fromisoformat(data["remindTime"])
    except ValueError:
        return jsonify({"status": "error", "message": "remindTime 格式错误，需 ISO8601"}), 400

    # 校验 appointment 属于用户（若提供）
    appointment = Appointment.query.filter_by(id=data["appointmentId"], user_id=current_user.id).first()
    if not appointment:
        return jsonify({"status": "error", "message": "预约不存在或无权限"}), 404

    sub = NotificationSubscription(
        user_id=current_user.id,
        appointment_id=appointment.id,
        remind_time=remind_time,
        channel=data.get("channel", "push"),
        token=data.get("token"),
    )

    try:
        # 若请求中包含 device token，同时在 device_tokens 做幂等注册（便于后续管理）
        token_val = data.get("token")
        if token_val:
            from models.device_token import DeviceToken
            existing = DeviceToken.query.filter_by(token=token_val).first()
            if existing:
                existing.user_id = current_user.id
                existing.last_seen_at = db.func.now()
                db.session.add(existing)
            else:
                db.session.add(DeviceToken(user_id=current_user.id, token=token_val, platform=None))

        db.session.add(sub)
        db.session.commit()

        # 若提醒时间已经到或在过去，尝试立即发送（若 token 可用）
        now = datetime.utcnow()
        if sub.remind_time <= now:
            try:
                if sub.token:
                    from utils.notification_sender import send_expo_push
                    title = f"预约提醒（ID:{sub.appointment_id}）"
                    body = "您的预约即将到来，请按时就诊。"
                    send_expo_push(sub.token, title, body, {"subscriptionId": sub.id})
                sub.status = "sent"
                sub.sent_at = datetime.utcnow()
                db.session.add(sub)
                db.session.commit()
            except Exception:
                db.session.rollback()

        return jsonify({"status": "success", "message": "订阅创建成功", "data": sub.to_dict()})
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"创建失败: {exc}"}), 500


@notifications_bp.route("/notifications/subscriptions/<int:subscription_id>", methods=["DELETE"])
@token_required
def cancel_subscription(current_user, subscription_id):
    sub = NotificationSubscription.query.filter_by(id=subscription_id, user_id=current_user.id).first()
    if not sub:
        return jsonify({"status": "error", "message": "订阅不存在或无权限"}), 404
    try:
        # 直接删除以便 demo 易回滚；若需保留历史可改为 status='cancelled'
        db.session.delete(sub)
        db.session.commit()
        return jsonify({"status": "success", "message": "订阅已取消"})
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"取消失败: {exc}"}), 500


@notifications_bp.route("/notifications/test-send", methods=["POST"])
@token_required
@validate_request_data([{"name": "subscriptionId", "type": int}])
def test_send(current_user, data):
    sub = NotificationSubscription.query.filter_by(id=data["subscriptionId"], user_id=current_user.id).first()
    if not sub:
        return jsonify({"status": "error", "message": "订阅不存在或无权限"}), 404

    try:
        # 尝试通过 Expo Push 发送（若已绑定 token），否则兼容性回退为仅记录 sent
        if sub.token:
            title = f"预约提醒（ID:{sub.appointment_id}）"
            body = "您的预约即将到来，请按时就诊。"
            ok = send_expo_push(sub.token, title, body, {"subscriptionId": sub.id})
            if not ok:
                return jsonify({"status": "error", "message": "推送发送失败"}), 500

        # 更新状态（兼容旧 demo）
        sub.status = "sent"
        sub.sent_at = datetime.utcnow()
        db.session.commit()
        return jsonify({"status": "success", "message": "发送已记录", "data": sub.to_dict()})
    except Exception as exc:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"测试发送失败: {exc}"}), 500
