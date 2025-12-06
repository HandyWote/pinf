from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db
from models.child import Child, GrowthRecord
from utils.auth import token_required, validate_request_data

child_bp = Blueprint('child', __name__)

@child_bp.route('/getChildInfo', methods=['GET'])
@token_required
def get_child_info(current_user):
    """获取儿童信息接口"""
    try:
        children = Child.query.filter_by(user_openid=current_user.openid).all()
        childinfo = [child.to_dict() for child in children]
        
        return jsonify({
            'success': True,
            'childinfo': childinfo
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取儿童信息失败: {str(e)}'
        }), 500

@child_bp.route('/addChild', methods=['POST'])
@token_required
@validate_request_data(['name', 'birthDate', 'gender', 'gestationalAge'])
def add_child(current_user, data):
    """添加儿童信息"""
    try:
        # 解析出生日期
        birth_date = datetime.strptime(data['birthDate'], '%Y-%m-%d').date()
        
        # 创建儿童记录
        child = Child(
            user_openid=current_user.openid,
            name=data['name'],
            birth_date=birth_date,
            gender=data['gender'],
            gestational_age=data['gestationalAge']
        )
        
        db.session.add(child)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '儿童信息添加成功',
            'childInfo': child.to_dict()
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': '日期格式错误，请使用YYYY-MM-DD格式'
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'添加儿童信息失败: {str(e)}'
        }), 500

@child_bp.route('/addGrowthRecord', methods=['POST'])
@token_required
@validate_request_data(['childId', 'date', 'ageInMonths', 'ageInWeeks', 'height', 'weight', 'headCircumference'])
def add_growth_record(current_user, data):
    """添加生长记录"""
    try:
        child_id = data['childId']
        
        # 验证儿童是否属于当前用户
        child = Child.query.filter_by(
            id=child_id, 
            user_openid=current_user.openid
        ).first()
        
        if not child:
            return jsonify({
                'success': False,
                'message': '儿童信息不存在或无权限'
            }), 404
        
        # 解析记录日期
        record_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
        # 创建生长记录
        growth_record = GrowthRecord(
            child_id=child_id,
            date=record_date,
            age_in_months=data['ageInMonths'],
            age_in_weeks=data['ageInWeeks'],
            height=data['height'],
            weight=data['weight'],
            head_circumference=data['headCircumference']
        )
        
        db.session.add(growth_record)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '生长记录添加成功',
            'growthRecord': growth_record.to_dict()
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': '日期格式错误，请使用YYYY-MM-DD格式'
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'添加生长记录失败: {str(e)}'
        }), 500