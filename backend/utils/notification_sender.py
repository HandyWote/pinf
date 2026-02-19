"""Minimal notification sender (Expo Push) — 最小侵入实现。
此模块只负责向 Expo Push API 发送单条推送并返回成功/失败。
生产环境建议替换为可插拔的 sender（支持 FCM/APNs）、重试和结果回写策略。
"""
import logging
from typing import Optional, Dict

import requests

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def send_expo_push(token: str, title: str, body: str, data: Optional[Dict] = None) -> bool:
    """向 Expo Push 发送一条通知；返回 True 表示成功。

    备注：这是最小侵入实现——不做复杂的重试/回退，方便 demo 与本地验证。
    """
    if not token:
        logging.warning("send_expo_push called without token")
        return False

    payload = {
        "to": token,
        "title": title,
        "body": body,
        "data": data or {},
    }

    try:
        resp = requests.post(EXPO_PUSH_URL, json=payload, timeout=10)
        resp.raise_for_status()
        logging.info("Expo push sent: status=%s body=%s", resp.status_code, resp.text)
        return True
    except Exception as exc:  # pragma: no cover - network/IO
        logging.exception("Failed to send Expo push: %s", exc)
        return False
