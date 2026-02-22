import logging
from datetime import datetime, timezone

from flask import Blueprint, jsonify

from models import db
from models.appointment import Appointment
from models.notification_subscription import NotificationSubscription
from utils.auth import token_required, validate_request_data
from utils.notification_sender import send_expo_push

notifications_bp = Blueprint('notifications', __name__)
logger = logging.getLogger(__name__)


def _parse_iso_to_utc_naive(value: str) -> datetime:
    """Parse ISO8601 datetime and normalize to naive UTC for DB consistency."""
    normalized = value.strip()
    if normalized.endswith('Z'):
        normalized = normalized[:-1] + '+00:00'

    parsed = datetime.fromisoformat(normalized)
    if parsed.tzinfo is None:
        return parsed

    return parsed.astimezone(timezone.utc).replace(tzinfo=None)


@notifications_bp.route('/notifications/subscriptions', methods=['GET'])
@token_required
def list_subscriptions(current_user):
    subs = (
        NotificationSubscription.query.filter_by(user_id=current_user.id)
        .order_by(NotificationSubscription.remind_time.asc())
        .all()
    )
    return jsonify({'status': 'success', 'data': [s.to_dict() for s in subs]})


@notifications_bp.route('/notifications/subscriptions', methods=['POST'])
@token_required
@validate_request_data([
    {'name': 'appointmentId', 'type': int},
    {'name': 'remindTime', 'type': str},
])
def create_subscription(current_user, data):
    try:
        remind_time = _parse_iso_to_utc_naive(data['remindTime'])
    except ValueError:
        return jsonify({'status': 'error', 'message': 'remindTime 格式错误，需要 ISO8601'}), 400

    appointment = Appointment.query.filter_by(id=data['appointmentId'], user_id=current_user.id).first()
    if not appointment:
        return jsonify({'status': 'error', 'message': '预约不存在或无权限'}), 404

    channel = (data.get('channel') or 'push').strip().lower()
    token_val = (data.get('token') or '').strip() or None

    if channel == 'push' and not token_val:
        return jsonify({'status': 'error', 'message': '创建推送订阅必须携带 token'}), 400

    existing = NotificationSubscription.query.filter_by(
        user_id=current_user.id,
        appointment_id=appointment.id,
        remind_time=remind_time,
        channel=channel,
        status='pending',
    ).first()
    if existing:
        if token_val and existing.token != token_val:
            existing.token = token_val
            db.session.add(existing)
            db.session.commit()
        return jsonify({'status': 'success', 'message': '订阅已存在', 'data': existing.to_dict()})

    sub = NotificationSubscription(
        user_id=current_user.id,
        appointment_id=appointment.id,
        remind_time=remind_time,
        channel=channel,
        token=token_val,
    )

    try:
        if token_val:
            from models.device_token import DeviceToken

            existing_token = DeviceToken.query.filter_by(token=token_val).first()
            if existing_token:
                existing_token.user_id = current_user.id
                existing_token.last_seen_at = db.func.now()
                db.session.add(existing_token)
            else:
                db.session.add(DeviceToken(user_id=current_user.id, token=token_val, platform=None))

        db.session.add(sub)
        db.session.commit()

        now = datetime.utcnow()
        if sub.remind_time <= now:
            logger.info('subscription remind_time already passed: sub_id=%s user_id=%s', sub.id, current_user.id)
            if not sub.token:
                sub.status = 'missed'
                db.session.add(sub)
                db.session.commit()
                return jsonify({'status': 'success', 'message': '提醒时间已过，订阅标记为 missed', 'data': sub.to_dict()})

            title = f'预约提醒（ID:{sub.appointment_id}）'
            body = '您的预约即将到来，请按时就诊。'
            ok = send_expo_push(sub.token, title, body, {'subscriptionId': sub.id})
            if ok:
                sub.status = 'sent'
                sub.sent_at = datetime.utcnow()
                db.session.add(sub)
                db.session.commit()
                return jsonify({'status': 'success', 'message': '订阅创建成功并已立即发送', 'data': sub.to_dict()})

            logger.warning('immediate push failed after create: sub_id=%s', sub.id)
            return jsonify({'status': 'error', 'message': '订阅已创建，但即时发送失败', 'data': sub.to_dict()}), 502

        return jsonify({'status': 'success', 'message': '订阅创建成功', 'data': sub.to_dict()})
    except Exception as exc:
        db.session.rollback()
        logger.exception('create subscription failed')
        return jsonify({'status': 'error', 'message': f'创建失败: {exc}'}), 500


@notifications_bp.route('/notifications/subscriptions/<int:subscription_id>', methods=['DELETE'])
@token_required
def cancel_subscription(current_user, subscription_id):
    sub = NotificationSubscription.query.filter_by(id=subscription_id, user_id=current_user.id).first()
    if not sub:
        return jsonify({'status': 'error', 'message': '订阅不存在或无权限'}), 404
    try:
        db.session.delete(sub)
        db.session.commit()
        return jsonify({'status': 'success', 'message': '订阅已取消'})
    except Exception as exc:
        db.session.rollback()
        logger.exception('cancel subscription failed')
        return jsonify({'status': 'error', 'message': f'取消失败: {exc}'}), 500


@notifications_bp.route('/notifications/test-send', methods=['POST'])
@token_required
@validate_request_data([{'name': 'subscriptionId', 'type': int}])
def test_send(current_user, data):
    sub = NotificationSubscription.query.filter_by(id=data['subscriptionId'], user_id=current_user.id).first()
    if not sub:
        return jsonify({'status': 'error', 'message': '订阅不存在或无权限'}), 404

    if not sub.token:
        return jsonify({'status': 'error', 'message': '订阅缺少 token，无法发送推送'}), 400

    try:
        title = f'预约提醒（ID:{sub.appointment_id}）'
        body = '您的预约即将到来，请按时就诊。'
        ok = send_expo_push(sub.token, title, body, {'subscriptionId': sub.id})
        if not ok:
            return jsonify({'status': 'error', 'message': '推送发送失败'}), 502

        sub.status = 'sent'
        sub.sent_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'status': 'success', 'message': '测试发送成功', 'data': sub.to_dict()})
    except Exception as exc:
        db.session.rollback()
        logger.exception('test send failed')
        return jsonify({'status': 'error', 'message': f'测试发送失败: {exc}'}), 500
