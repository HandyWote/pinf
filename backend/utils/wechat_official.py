import time
import logging

import requests
from flask import current_app


TOKEN_URL = "https://api.weixin.qq.com/cgi-bin/token"
FREE_PUBLISH_BATCHGET_URL = "https://api.weixin.qq.com/cgi-bin/freepublish/batchget"
FREE_PUBLISH_GET_ARTICLE_URL = "https://api.weixin.qq.com/cgi-bin/freepublish/getarticle"

_TOKEN_CACHE = {
    "access_token": "",
    "expires_at": 0.0,
}
logger = logging.getLogger(__name__)


class WechatOfficialError(Exception):
    """微信公众号接口调用失败。"""


def _get_required_config():
    app_id = (current_app.config.get("WECHAT_APP_ID") or "").strip()
    app_secret = (current_app.config.get("WECHAT_APP_SECRET") or "").strip()
    timeout = int(current_app.config.get("WECHAT_API_TIMEOUT") or 10)

    if not app_id or not app_secret:
        raise WechatOfficialError("未配置 WECHAT_APP_ID / WECHAT_APP_SECRET")
    return app_id, app_secret, timeout


def get_access_token(force_refresh=False):
    app_id, app_secret, timeout = _get_required_config()

    now = time.time()
    if (
        not force_refresh
        and _TOKEN_CACHE["access_token"]
        and _TOKEN_CACHE["expires_at"] > now
    ):
        logger.debug("使用缓存 access_token，过期时间戳: %s", int(_TOKEN_CACHE["expires_at"]))
        return _TOKEN_CACHE["access_token"]

    params = {
        "grant_type": "client_credential",
        "appid": app_id,
        "secret": app_secret,
    }
    try:
        response = requests.get(TOKEN_URL, params=params, timeout=timeout)
        payload = response.json()
    except requests.RequestException as exc:
        raise WechatOfficialError(f"获取 access_token 网络失败: {exc}") from exc
    except ValueError as exc:
        raise WechatOfficialError("获取 access_token 响应解析失败") from exc

    if payload.get("errcode"):
        raise WechatOfficialError(
            f"获取 access_token 失败: {payload.get('errcode')} {payload.get('errmsg', '')}".strip()
        )

    access_token = payload.get("access_token")
    expires_in = int(payload.get("expires_in") or 0)
    if not access_token or expires_in <= 0:
        raise WechatOfficialError("获取 access_token 失败: 返回字段不完整")

    _TOKEN_CACHE["access_token"] = access_token
    _TOKEN_CACHE["expires_at"] = now + max(expires_in - 120, 60)
    logger.info("微信公众号 access_token 获取成功，expires_in=%s", expires_in)
    return access_token


def _post_wechat_json(url, body, access_token=None):
    _, _, timeout = _get_required_config()
    token = access_token or get_access_token()
    query = {"access_token": token}

    logger.info("调用微信接口: %s", url)
    try:
        response = requests.post(url, params=query, json=body, timeout=timeout)
        payload = response.json()
    except requests.RequestException as exc:
        raise WechatOfficialError(f"调用微信接口网络失败: {exc}") from exc
    except ValueError as exc:
        raise WechatOfficialError("微信接口响应解析失败") from exc

    if payload.get("errcode"):
        if payload.get("errcode") == 40001:
            logger.warning("access_token 失效，尝试刷新后重试接口: %s", url)
            refreshed_token = get_access_token(force_refresh=True)
            if refreshed_token != token:
                return _post_wechat_json(url, body, access_token=refreshed_token)
        raise WechatOfficialError(
            f"微信接口调用失败: {payload.get('errcode')} {payload.get('errmsg', '')}".strip()
        )
    logger.info("微信接口调用成功: %s", url)
    return payload


def get_publication_records(offset=0, count=20, no_content=1):
    body = {
        "offset": max(int(offset), 0),
        "count": min(max(int(count), 1), 20),
        "no_content": 1 if int(no_content) else 0,
    }
    return _post_wechat_json(FREE_PUBLISH_BATCHGET_URL, body)


def get_article_by_id(article_id):
    article_id = (article_id or "").strip()
    if not article_id:
        raise WechatOfficialError("article_id 不能为空")
    return _post_wechat_json(FREE_PUBLISH_GET_ARTICLE_URL, {"article_id": article_id})
