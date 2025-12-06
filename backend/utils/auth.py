from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models.user import User


def token_required(f):
    """JWT token 验证装饰器。"""

    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()

            user = User.query.get(current_user_id)
            if not user:
                return jsonify({"status": "error", "message": "用户不存在"}), 401

            return f(current_user=user, *args, **kwargs)

        except Exception as exc:  # pragma: no cover - 简单认证异常处理
            return jsonify({"status": "error", "message": f"认证失败: {exc}"}), 401

    return decorated


def _check_field(field, data):
    if isinstance(field, str):
        name = field
        definition = {"name": field}
    else:
        name = field.get("name")
        definition = field

    if name not in data or data[name] is None:
        return False, f"缺少必要参数: {name}"

    expected_type = definition.get("type")
    if expected_type and not isinstance(data[name], expected_type):
        expected = (
            ", ".join(t.__name__ for t in expected_type)
            if isinstance(expected_type, tuple)
            else expected_type.__name__
        )
        return False, f"参数 {name} 类型错误，期望 {expected}"

    allowed = definition.get("allowed")
    if allowed and data[name] not in allowed:
        return False, f"参数 {name} 仅支持: {', '.join(map(str, allowed))}"

    return True, None


def validate_request_data(required_fields):
    """请求数据验证装饰器，支持字符串或包含 type/allowed 的字典配置。"""

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            data = request.get_json()
            if data is None:
                return jsonify({"status": "error", "message": "请求数据不能为空"}), 400

            for field in required_fields:
                ok, error_msg = _check_field(field, data)
                if not ok:
                    return jsonify({"status": "error", "message": error_msg}), 400

            return f(data=data, *args, **kwargs)

        return decorated

    return decorator


