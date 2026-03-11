import time
import requests
from requests.auth import HTTPBasicAuth
from flask import current_app


class N8nClientError(Exception):
    """n8n 调用错误。"""


def send_to_n8n(payload, timeout=None, retry=1):
    """调用 n8n webhook，返回 (data, error_message)。"""

    webhook_url = current_app.config.get("N8N_WEBHOOK_URL")
    if not webhook_url:
        return None, "N8N_WEBHOOK_URL 未配置"
    if timeout is None:
        timeout = current_app.config.get("N8N_TIMEOUT_SECONDS", 120)

    last_exc = None
    auth = None
    user = current_app.config.get("N8N_BASIC_AUTH_USER")
    password = current_app.config.get("N8N_BASIC_AUTH_PASSWORD")
    if user and password:
        auth = HTTPBasicAuth(user, password)

    for attempt in range(retry + 1):
        try:
            response = requests.post(webhook_url, json=payload, auth=auth, timeout=timeout)
            if response.status_code >= 400:
                return None, f"AI 返回错误状态码: {response.status_code}"
            try:
                return response.json(), None
            except ValueError:
                return None, "AI 响应格式错误"
        except requests.RequestException as exc:
            last_exc = exc
            if attempt < retry:
                time.sleep(0.5)
            else:
                return None, f"调用AI失败: {exc}"
    return None, f"调用AI失败: {last_exc}"  # 理论上不会到达
