from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db
from models.chat import ChatMessage
from utils.auth import token_required, validate_request_data
import time
import uuid

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/sendMessage', methods=['POST'])
@token_required
@validate_request_data(['content', 'messageId'])
def send_message(current_user, data):
    """发送聊天消息"""
    try:
        # 保存用户消息
        user_message = ChatMessage(
            user_openid=current_user.openid,
            message_id=data['messageId'],
            type='user',
            content=data['content'],
            timestamp=int(time.time() * 1000),  # 毫秒时间戳
            status='sent'
        )
        
        db.session.add(user_message)
        
        # 生成AI回复（这里是模拟回复，实际项目中可以接入真实的AI服务）
        ai_response = generate_ai_response(data['content'])
        ai_message_id = str(uuid.uuid4())
        
        ai_message = ChatMessage(
            user_openid=current_user.openid,
            message_id=ai_message_id,
            type='ai',
            content=ai_response,
            timestamp=int(time.time() * 1000) + 1000,  # AI回复稍晚一点
            status='sent'
        )
        
        db.session.add(ai_message)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '消息发送成功',
            'userMessage': user_message.to_dict(),
            'aiMessage': ai_message.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'发送消息失败: {str(e)}'
        }), 500

@chat_bp.route('/getChatHistory', methods=['GET'])
@token_required
def get_chat_history(current_user):
    """获取聊天历史记录"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        # 按时间戳倒序获取消息（最新的在前）
        messages = ChatMessage.query.filter_by(
            user_openid=current_user.openid
        ).order_by(
            ChatMessage.timestamp.desc()
        ).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # 转换为前端需要的格式，并反转顺序（最旧的在前）
        message_list = [msg.to_dict() for msg in reversed(messages.items)]
        
        return jsonify({
            'success': True,
            'messages': message_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': messages.total,
                'pages': messages.pages,
                'has_next': messages.has_next,
                'has_prev': messages.has_prev
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取聊天历史失败: {str(e)}'
        }), 500

@chat_bp.route('/clearChatHistory', methods=['DELETE'])
@token_required
def clear_chat_history(current_user):
    """清空聊天历史记录"""
    try:
        # 删除用户的所有聊天记录
        ChatMessage.query.filter_by(
            user_openid=current_user.openid
        ).delete()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '聊天历史已清空'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'清空聊天历史失败: {str(e)}'
        }), 500

@chat_bp.route('/deleteMessage/<message_id>', methods=['DELETE'])
@token_required
def delete_message(current_user, message_id):
    """删除指定消息"""
    try:
        # 查找消息
        message = ChatMessage.query.filter_by(
            message_id=message_id,
            user_openid=current_user.openid
        ).first()
        
        if not message:
            return jsonify({
                'success': False,
                'message': '消息不存在或无权限删除'
            }), 404
        
        db.session.delete(message)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': '消息删除成功'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'删除消息失败: {str(e)}'
        }), 500

@chat_bp.route('/getQuickReplies', methods=['GET'])
@token_required
def get_quick_replies(current_user):
    """获取快捷回复选项"""
    try:
        # 预定义的快捷回复选项
        quick_replies = [
            {
                'id': 1,
                'text': '宝宝发烧怎么办？',
                'category': 'health'
            },
            {
                'id': 2,
                'text': '如何给新生儿洗澡？',
                'category': 'care'
            },
            {
                'id': 3,
                'text': '宝宝不爱吃饭怎么办？',
                'category': 'feeding'
            },
            {
                'id': 4,
                'text': '宝宝睡眠不好怎么调理？',
                'category': 'sleep'
            },
            {
                'id': 5,
                'text': '什么时候开始添加辅食？',
                'category': 'feeding'
            },
            {
                'id': 6,
                'text': '宝宝疫苗接种时间表',
                'category': 'health'
            }
        ]
        
        return jsonify({
            'success': True,
            'quickReplies': quick_replies
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取快捷回复失败: {str(e)}'
        }), 500

def generate_ai_response(user_message):
    """生成AI回复（模拟）"""
    # 这里是模拟的AI回复逻辑，实际项目中可以接入真实的AI服务
    responses = {
        '发烧': '宝宝发烧时，首先要测量体温。如果体温超过38.5°C，可以给宝宝使用退烧药。同时要多给宝宝喝水，保持室内通风。如果持续高烧不退，建议及时就医。',
        '洗澡': '给新生儿洗澡要注意水温控制在37-40°C，准备好毛巾、婴儿沐浴露等用品。洗澡时间不宜过长，一般5-10分钟即可。洗完后要及时擦干并保暖。',
        '不吃饭': '宝宝不爱吃饭可能是因为没有饥饿感、食物不合口味或者身体不适。建议定时定量喂养，营造良好的用餐环境，适当增加户外活动。',
        '睡眠': '建立规律的作息时间，创造安静舒适的睡眠环境。睡前可以给宝宝洗澡、按摩，避免过度兴奋的活动。',
        '辅食': '一般建议在宝宝4-6个月时开始添加辅食。首先从米粉开始，逐渐添加蔬菜泥、水果泥等。要注意观察宝宝的反应，避免过敏。',
        '疫苗': '宝宝的疫苗接种要按照国家免疫程序进行。出生后24小时内接种乙肝疫苗和卡介苗，之后按月龄接种相应疫苗。建议保留好疫苗接种记录。'
    }
    
    # 简单的关键词匹配
    for keyword, response in responses.items():
        if keyword in user_message:
            return response
    
    # 默认回复
    return '感谢您的咨询！我是早护通AI助手，专门为您提供婴幼儿护理建议。如果您有具体的问题，请详细描述，我会尽力为您解答。您也可以浏览我们的视频课程和文章获取更多专业知识。'