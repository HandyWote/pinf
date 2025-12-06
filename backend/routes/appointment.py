from flask import Blueprint, request, jsonify
from datetime import datetime, date
from models import db
from models.appointment import Appointment
from models.child import Child
from utils.auth import token_required, validate_request_data
import uuid

appointment_bp = Blueprint('appointment', __name__)

@appointment_bp.route('/getAppointments', methods=['GET'])
@token_required
def get_appointments(current_user):
    """获取用户的预约列表"""
    try:
        status = request.args.get('status', 'all')  # all, pending, completed
        show_loading = request.args.get('showLoading', 'false').lower() == 'true'
        
        # 构建查询
        query = Appointment.query.filter_by(user_openid=current_user.openid)
        
        # 按状态筛选
        if status != 'all':
            query = query.filter_by(status=status)
        
        # 按预约日期排序
        query = query.order_by(Appointment.appointment_date.asc())
        
        # 获取所有符合条件的预约
        appointments = query.all()
        
        # 获取预约详情（包含儿童信息）
        appointment_list = []
        for appointment in appointments:
            appointment_dict = appointment.to_dict()
            # 获取关联的儿童信息
            child = Child.query.get(appointment.child_id)
            if child:
                appointment_dict['childInfo'] = {
                    'id': child.id,
                    'name': child.name,
                    'birthDate': child.birth_date.isoformat() if child.birth_date else None
                }
            appointment_list.append(appointment_dict)
        
        return jsonify({
            'success': True,
            'appointments': appointment_list
        })
        
    except Exception as e:
        error_msg = f'同步预约信息失败: {str(e)}'
        if show_loading:
            error_msg = '同步预约信息失败，请稍后重试'
        return jsonify({
            'success': False,
            'message': error_msg
        }), 500

@appointment_bp.route('/addAppointment', methods=['POST'])
@token_required
@validate_request_data(['childId', 'hospitalName', 'department', 'appointmentDate'])
def add_appointment(current_user, data):
    """添加预约"""
    try:
        # 验证儿童是否属于当前用户
        child = Child.query.filter_by(
            id=data['childId'], 
            user_openid=current_user.openid
        ).first()
        
        if not child:
            return jsonify({
                'success': False,
                'message': '儿童信息不存在或无权限访问'
            }), 400
        
        # 解析预约日期
        try:
            appointment_date = datetime.strptime(data['appointmentDate'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'success': False,
                'message': '预约日期格式错误，请使用YYYY-MM-DD格式'
            }), 400
        
        # 检查预约日期是否为未来日期
        if appointment_date <= date.today():
            return jsonify({
                'success': False,
                'message': '预约日期必须是未来日期'
            }), 400
        
        # 生成预约ID
        appointment_id = str(uuid.uuid4())
        
        # 创建预约记录
        appointment = Appointment(
            id=appointment_id,
            user_openid=current_user.openid,
            child_id=data['childId'],
            hospital_name=data['hospitalName'],
            department=data['department'],
            appointment_date=appointment_date,
            reminder_days=data.get('reminderDays', 1),
            notes=data.get('notes', ''),
            status='pending'
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        # 返回创建的预约信息
        appointment_dict = appointment.to_dict()
        appointment_dict['childInfo'] = {
            'id': child.id,
            'name': child.name,
            'birthDate': child.birth_date.isoformat() if child.birth_date else None
        }
        
        return jsonify({
            'success': True,
            'message': '预约添加成功',
            'appointment': appointment_dict
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'添加预约失败: {str(e)}'
        }), 500

@appointment_bp.route('/updateAppointment/<appointment_id>', methods=['PUT'])
@token_required
@validate_request_data(['hospitalName', 'department', 'appointmentDate'])
def update_appointment(current_user, appointment_id, data):
    """更新预约信息"""
    try:
        # 查找预约记录
        appointment = Appointment.query.filter_by(
            id=appointment_id,
            user_openid=current_user.openid
        ).first()
        
        if not appointment:
            return jsonify({
                'success': False,
                'message': '预约不存在或无权限访问'
            }), 404
        
        # 解析预约日期
        try:
            appointment_date = datetime.strptime(data['appointmentDate'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({
                'success': False,
                'message': '预约日期格式错误，请使用YYYY-MM-DD格式'
            }), 400
        
        # 检查预约日期是否为未来日期
        if appointment_date <= date.today():
            return jsonify({
                'success': False,
                'message': '预约日期必须是未来日期'
            }), 400
        
        # 更新预约信息
        appointment.hospital_name = data['hospitalName']
        appointment.department = data['department']
        appointment.appointment_date = appointment_date
        appointment.reminder_days = data.get('reminderDays', appointment.reminder_days)
        appointment.notes = data.get('notes', appointment.notes)
        
        db.session.commit()
        
        # 获取儿童信息
        child = Child.query.get(appointment.child_id)
        appointment_dict = appointment.to_dict()
        if child:
            appointment_dict['childInfo'] = {
                'id': child.id,
                'name': child.name,
                'birthDate': child.birth_date.isoformat() if child.birth_date else None
            }
        
        return jsonify({
            'success': True,
            'message': '预约更新成功',
            'appointment': appointment_dict
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'更新预约失败: {str(e)}'
        }), 500

@appointment_bp.route('/deleteAppointment/<appointment_id>', methods=['DELETE'])
@token_required
def delete_appointment(current_user, appointment_id):
    """删除预约"""
    try:
        # 查找预约记录
        appointment = Appointment.query.filter_by(
            id=appointment_id,
            user_openid=current_user.openid
        ).first()
        
        if not appointment:
            return jsonify({
                'success': False,
                'message': '预约不存在或无权限访问'
            }), 404
        
        db.session.delete(appointment)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '预约删除成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'删除预约失败: {str(e)}'
        }), 500

@appointment_bp.route('/completeAppointment/<appointment_id>', methods=['PUT'])
@token_required
def complete_appointment(current_user, appointment_id):
    """标记预约为已完成"""
    try:
        # 查找预约记录
        appointment = Appointment.query.filter_by(
            id=appointment_id,
            user_openid=current_user.openid
        ).first()
        
        if not appointment:
            return jsonify({
                'success': False,
                'message': '预约不存在或无权限访问'
            }), 404
        
        # 更新状态为已完成
        appointment.status = 'completed'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '预约已标记为完成'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'更新预约状态失败: {str(e)}'
        }), 500

@appointment_bp.route('/getUpcomingAppointments', methods=['GET'])
@token_required
def get_upcoming_appointments(current_user):
    """获取即将到来的预约（用于提醒）"""
    try:
        from datetime import timedelta
        
        # 获取未来7天内的预约
        today = date.today()
        next_week = today + timedelta(days=7)
        
        appointments = Appointment.query.filter(
            Appointment.user_openid == current_user.openid,
            Appointment.status == 'pending',
            Appointment.appointment_date >= today,
            Appointment.appointment_date <= next_week
        ).order_by(Appointment.appointment_date.asc()).all()
        
        # 获取预约详情（包含儿童信息）
        appointment_list = []
        for appointment in appointments:
            appointment_dict = appointment.to_dict()
            # 计算距离预约日期的天数
            days_until = (appointment.appointment_date - today).days
            appointment_dict['daysUntil'] = days_until
            
            # 获取关联的儿童信息
            child = Child.query.get(appointment.child_id)
            if child:
                appointment_dict['childInfo'] = {
                    'id': child.id,
                    'name': child.name,
                    'birthDate': child.birth_date.isoformat() if child.birth_date else None
                }
            appointment_list.append(appointment_dict)
        
        return jsonify({
            'success': True,
            'appointments': appointment_list,
            'total': len(appointment_list)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取即将到来的预约失败: {str(e)}'
        }), 500
