from flask import Blueprint, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from models import db
from models.user import User
from models.verification_code import VerificationCode
from utils.wechat import get_wechat_user_info
from utils.auth import validate_request_data, token_required
import re

auth_bp = Blueprint("auth", __name__)


def validate_phone(phone: str) -> bool:
    """验证手机号格式（中国大陆）"""
    pattern = r'^1[3-9]\d{9}$'
    return bool(re.match(pattern, phone))


def validate_password(password: str) -> bool:
    """密码规则：8-16 位，必须包含字母和数字。"""
    pattern = r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$'
    return bool(re.match(pattern, password))


@auth_bp.route("/auth/phone/code", methods=["POST"])
@validate_request_data(["phone"])
def send_phone_code(data):
    """
    发送手机验证码
    因无第三方短信服务，验证码存储在数据库中
    开发环境下会在响应中返回验证码（生产环境不应返回）
    """
    phone = data["phone"]
    
    # 验证手机号格式
    if not validate_phone(phone):
        return jsonify({"status": "error", "message": "手机号格式不正确"}), 400
    
    # 生成并存储验证码
    code = VerificationCode.create_code(phone, valid_minutes=5)
    
    # 开发环境返回验证码（生产环境应该通过短信发送）
    response_data = {"message": "验证码已发送，5分钟内有效"}
    if __debug__:  # 仅在开发模式下返回
        response_data["code"] = code
        response_data["debug"] = "开发模式：验证码已在响应中返回"
    
    return jsonify({
        "status": "success", 
        "message": "验证码已发送",
        "data": response_data
    })


@auth_bp.route("/auth/phone/login", methods=["POST"])
@validate_request_data([
    {"name": "phone", "type": str},
    {"name": "code", "type": str},
])
def phone_login(data):
    """
    手机号验证码登录
    验证成功后自动注册新用户或登录已有用户
    """
    phone = data["phone"]
    code = data["code"]
    
    # 验证手机号格式
    if not validate_phone(phone):
        return jsonify({"status": "error", "message": "手机号格式不正确"}), 400
    
    # 验证验证码
    if not VerificationCode.verify_code(phone, code):
        return jsonify({"status": "error", "message": "验证码错误或已过期"}), 400

    # 查找或创建用户
    user = User.query.filter_by(phone=phone).first()
    if not user:
        user = User(phone=phone, role="user")
        db.session.add(user)
        db.session.commit()

    # 生成 JWT token (identity 必须是字符串)
    token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "status": "success", 
        "message": "登录成功", 
        "data": {
            "token": token, 
            "user": user.to_dict(),
            "need_set_password": user.password_hash is None,
        }
    })


@auth_bp.route("/auth/password/setup", methods=["POST"])
@validate_request_data([{"name": "password", "type": str}])
@token_required
def setup_password(data, current_user):
    """
    设置登录密码（验证码登录后直接设置）
    """
    password = data["password"]

    if not validate_password(password):
        return jsonify({
            "status": "error",
            "message": "密码需为8-16位字母+数字组合",
        }), 400

    current_user.password_hash = generate_password_hash(password)
    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "密码设置成功",
        "data": {"user": current_user.to_dict()},
    })


@auth_bp.route("/auth/password/login", methods=["POST"])
@validate_request_data([
    {"name": "phone", "type": str},
    {"name": "password", "type": str},
])
def password_login(data):
    """
    手机号 + 密码登录
    """
    phone = data["phone"]
    password = data["password"]

    if not validate_phone(phone):
        return jsonify({"status": "error", "message": "手机号格式不正确"}), 400

    if not validate_password(password):
        return jsonify({"status": "error", "message": "密码需为8-16位字母+数字组合"}), 400

    user = User.query.filter_by(phone=phone).first()
    if not user or not user.password_hash:
        return jsonify({"status": "error", "message": "用户未设置密码，请使用验证码登录"}), 400

    if not check_password_hash(user.password_hash, password):
        return jsonify({"status": "error", "message": "手机号或密码错误"}), 400

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "status": "success",
        "message": "登录成功",
        "data": {
            "token": token,
            "user": user.to_dict(),
            "need_set_password": False,
        },
    })


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
