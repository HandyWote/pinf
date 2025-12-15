from flask import Blueprint, jsonify
from flask_jwt_extended import create_access_token
from models import db
from models.user import User
from models.verification_code import VerificationCode
from utils.wechat import get_wechat_user_info
from utils.auth import validate_request_data
import re

auth_bp = Blueprint("auth", __name__)


def validate_phone(phone: str) -> bool:
    """验证手机号格式（中国大陆）"""
    pattern = r'^1[3-9]\d{9}$'
    return bool(re.match(pattern, phone))


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

    # 生成 JWT token
    token = create_access_token(identity=user.id)
    
    return jsonify({
        "status": "success", 
        "message": "登录成功", 
        "data": {
            "token": token, 
            "user": user.to_dict()
        }
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
