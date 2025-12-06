import requests
from flask import current_app

def get_wechat_user_info(code):
    """
    通过微信code获取用户openid和session_key
    """
    app_id = current_app.config['WECHAT_APP_ID']
    app_secret = current_app.config['WECHAT_APP_SECRET']
    
    # 微信登录API地址
    url = 'https://api.weixin.qq.com/sns/jscode2session'
    
    params = {
        'appid': app_id,
        'secret': app_secret,
        'js_code': code,
        'grant_type': 'authorization_code'
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if 'errcode' in data:
            return None, f"微信登录失败: {data.get('errmsg', '未知错误')}"
        
        return {
            'openid': data.get('openid'),
            'session_key': data.get('session_key'),
            'unionid': data.get('unionid')  # 可选
        }, None
        
    except requests.RequestException as e:
        return None, f"网络请求失败: {str(e)}"
    except Exception as e:
        return None, f"处理失败: {str(e)}"