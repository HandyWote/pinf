from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models.user import User

def token_required(f):
    """
    JWT token验证装饰器
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_openid = get_jwt_identity()
            
            # 验证用户是否存在
            user = User.query.get(current_user_openid)
            if not user:
                return jsonify({
                    'success': False,
                    'message': '用户不存在'
                }), 401
            
            # 将用户信息传递给路由函数
            return f(current_user=user, *args, **kwargs)
            
        except Exception as e:
            return jsonify({
                'success': False,
                'message': f'认证失败: {str(e)}'
            }), 401
    
    return decorated

def validate_request_data(required_fields):
    """
    请求数据验证装饰器
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            data = request.get_json()
            if not data:
                return jsonify({
                    'success': False,
                    'message': '请求数据不能为空'
                }), 400
            
            missing_fields = []
            for field in required_fields:
                if field not in data or data[field] is None:
                    missing_fields.append(field)
            
            if missing_fields:
                return jsonify({
                    'success': False,
                    'message': f'缺少必要参数: {", ".join(missing_fields)}'
                }), 400
            
            return f(data=data, *args, **kwargs)
        return decorated
    return decorator


