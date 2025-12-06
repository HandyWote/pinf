from flask import Blueprint, jsonify
from flask_jwt_extended import create_access_token
from models import db
from models.user import User
from utils.wechat import get_wechat_user_info
from utils.auth import validate_request_data

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/auth/phone/code", methods=["POST"])
@validate_request_data(["phone"])
def send_phone_code(data):
    """发送手机验证码（mock）。"""
    return jsonify({"status": "success", "message": "验证码已发送(模拟)", "data": {"code": "123456"}})


@auth_bp.route("/auth/phone/login", methods=["POST"])
@validate_request_data([
    {"name": "phone", "type": str},
    {"name": "code", "type": str},
])
def phone_login(data):
    """手机号登录，验证码校验为模拟。"""
    phone = data["phone"]
    code = data["code"]

    if code != "123456":
        return jsonify({"status": "error", "message": "验证码错误"}), 400

    user = User.query.filter_by(phone=phone).first()
    if not user:
        user = User(phone=phone, role="user")
        db.session.add(user)
        db.session.commit()

    token = create_access_token(identity=user.id)
    return jsonify({"status": "success", "message": "登录成功", "data": {"token": token, "user": user.to_dict()}})


@auth_bp.route("/auth/wechat", methods=["POST"])
@validate_request_data(["code"])
def wechat_login(data):
    """微信登录（保留，可选）。"""
    code = data["code"]
    info, error = get_wechat_user_info(code)
    if error:
        return jsonify({"status": "error", "message": error}), 400

    openid = info.get("openid")
    user = User.query.filter_by(wx_openid=openid).first()
    if not user:
        user = User(wx_openid=openid, role="user")
        db.session.add(user)
        db.session.commit()

    token = create_access_token(identity=user.id)
    return jsonify({"status": "success", "message": "登录成功", "data": {"token": token, "user": user.to_dict()}})
