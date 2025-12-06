from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import db
from models.user import User
from models.child import Child
from utils.wechat import get_wechat_user_info
from utils.auth import validate_request_data

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
@validate_request_data(['code'])
def login(data):
    """微信登录接口"""
    try:
        code = data['code']
        
        # 调用微信API获取用户信息
        wechat_info, error = get_wechat_user_info(code)
        if error:
            return jsonify({
                'success': False,
                'message': error
            }), 400
        
        openid = wechat_info['openid']
        session_key = wechat_info['session_key']
        
        # 查找或创建用户
        user = User.query.get(openid)
        if not user:
            user = User(
                openid=openid,
                session_key=session_key,
                role='user'
            )
            db.session.add(user)
        else:
            # 更新session_key
            user.session_key = session_key
        
        db.session.commit()
        
        # 获取用户的儿童信息
        children = Child.query.filter_by(user_openid=openid).all()
        childinfo = [child.to_dict() for child in children]
        
        # 生成JWT token
        token = create_access_token(identity=openid)
        
        return jsonify({
            'success': True,
            'userinfo': user.to_dict(),
            'role': user.role,
            'openid': user.openid,
            'session_key': user.session_key,
            'childinfo': childinfo,
            'token': token
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'登录失败: {str(e)}'
        }), 500

# 在文件末尾添加测试登录路由
@auth_bp.route('/test-login', methods=['POST'])
@validate_request_data(['openid'])
def test_login(data):
    """测试登录接口（仅用于开发测试）"""
    try:
        openid = data['openid']
        
        # 查找或创建测试用户
        user = User.query.get(openid)
        if not user:
            user = User(
                openid=openid,
                session_key='test_session_key',
                role='user'
            )
            db.session.add(user)
            db.session.commit()
        
        # 获取用户的儿童信息
        children = Child.query.filter_by(user_openid=openid).all()
        childinfo = [child.to_dict() for child in children]
        
        # 生成JWT token
        token = create_access_token(identity=openid)
        
        return jsonify({
            'success': True,
            'userinfo': user.to_dict(),
            'role': user.role,
            'openid': user.openid,
            'session_key': user.session_key,
            'childinfo': childinfo,
            'token': token
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'测试登录失败: {str(e)}'
        }), 500