"""Minimal notification sender (Expo Push)."""
import logging
from typing import Dict, Optional

import requests

EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'


def send_expo_push(token: str, title: str, body: str, data: Optional[Dict] = None) -> bool:
    """Send one push message via Expo and return success status.

    Note:
    - Expo may return HTTP 200 while carrying business-level errors.
    - This function checks both HTTP status and payload status.
    """
    if not token:
        logging.warning('send_expo_push called without token')
        return False

    payload = {
        'to': token,
        'title': title,
        'body': body,
        'data': data or {},
    }

    try:
        resp = requests.post(EXPO_PUSH_URL, json=payload, timeout=10)
        resp.raise_for_status()

        try:
            response_payload = resp.json()
        except ValueError:
            logging.error('Expo push response is not JSON: status=%s body=%s', resp.status_code, resp.text)
            return False

        rows = response_payload.get('data') if isinstance(response_payload, dict) else None
        if not isinstance(rows, list) or not rows:
            logging.error('Expo push response missing data rows: payload=%s', response_payload)
            return False

        failed_row = next((row for row in rows if row.get('status') != 'ok'), None)
        if failed_row:
            details = failed_row.get('details') or {}
            message = failed_row.get('message') or 'unknown error'
            logging.error('Expo push rejected: message=%s details=%s payload=%s', message, details, response_payload)
            return False

        logging.info('Expo push sent: status=%s payload=%s', resp.status_code, response_payload)
        return True
    except requests.RequestException as exc:  # pragma: no cover - network/IO
        logging.exception('Failed to send Expo push: %s', exc)
        return False
