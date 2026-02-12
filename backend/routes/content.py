import time
import logging

from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from models.content import Article
from utils.auth import token_required
from utils.wechat_official import (
    WechatOfficialError,
    get_article_by_id,
    get_publication_records,
)
from utils.wechat_content_sync import sync_wechat_articles

content_bp = Blueprint("content", __name__)
logger = logging.getLogger(__name__)

_CACHE_TTL_SECONDS = 60 * 60
_CACHE = {}


def _cache_get(key):
    entry = _CACHE.get(key)
    if not entry:
        return None
    cached_at, payload = entry
    if time.time() - cached_at > _CACHE_TTL_SECONDS:
        _CACHE.pop(key, None)
        return None
    return payload


def _cache_set(key, payload):
    _CACHE[key] = (time.time(), payload)


def _normalize_page(value, default=1, minimum=1):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    if parsed < minimum:
        return minimum
    return parsed


def _normalize_per_page(value, default=10, minimum=1, maximum=50):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    if parsed < minimum:
        return minimum
    if parsed > maximum:
        return maximum
    return parsed


def _paginate(query, page, per_page):
    pager = query.paginate(page=page, per_page=per_page, error_out=False)
    return {
        "items": [item.to_dict() for item in pager.items],
        "pagination": {
            "page": page,
            "perPage": per_page,
            "total": pager.total,
            "pages": pager.pages,
            "hasNext": pager.has_next,
            "hasPrev": pager.has_prev,
        },
    }


@content_bp.route("/content/articles", methods=["GET"])
@token_required
def get_articles(current_user):
    page = _normalize_page(request.args.get("page"), 1)
    per_page = _normalize_per_page(request.args.get("per_page"), 10)
    search = (request.args.get("search") or "").strip()
    category = (request.args.get("category") or "").strip() or None
    logger.info(
        "课堂文章列表请求: user_id=%s, page=%s, per_page=%s, search=%s, category=%s",
        getattr(current_user, "id", "unknown"),
        page,
        per_page,
        search or "-",
        category or "-",
    )

    cache_key = f"articles:{page}:{per_page}:{search}:{category}"
    cached = _cache_get(cache_key)
    if cached:
        logger.info("课堂文章列表命中缓存: key=%s", cache_key)
        return jsonify(cached)

    query = Article.query
    if search:
        query = query.filter(or_(Article.title.ilike(f"%{search}%"), Article.content.ilike(f"%{search}%")))
    if category:
        query = query.filter_by(category=category)
    query = query.order_by(Article.publish_date.desc())

    result = _paginate(query, page, per_page)
    payload = {"status": "success", "data": result["items"], "pagination": result["pagination"]}
    _cache_set(cache_key, payload)
    logger.info("课堂文章列表返回: total=%s, page=%s", result["pagination"]["total"], page)
    return jsonify(payload)


@content_bp.route("/content/articles/<int:article_id>", methods=["GET"])
@token_required
def get_article_detail(current_user, article_id):
    article = Article.query.get(article_id)
    if not article:
        return jsonify({"status": "error", "message": "文章不存在"}), 404
    return jsonify({"status": "success", "data": article.to_dict()})


@content_bp.route("/content/wechat/publications", methods=["GET"])
@token_required
def get_wechat_publications(current_user):
    offset = _normalize_page(request.args.get("offset"), default=0, minimum=0)
    count = _normalize_per_page(request.args.get("count"), default=10, minimum=1, maximum=20)
    no_content = request.args.get("no_content", "1")
    logger.info(
        "公众号发布记录请求: user_id=%s, offset=%s, count=%s, no_content=%s",
        getattr(current_user, "id", "unknown"),
        offset,
        count,
        no_content,
    )
    try:
        payload = get_publication_records(offset=offset, count=count, no_content=int(no_content))
    except (ValueError, TypeError):
        return jsonify({"status": "error", "message": "no_content 参数必须为 0 或 1"}), 400
    except WechatOfficialError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400

    return jsonify({
        "status": "success",
        "message": "公众号发布记录获取成功",
        "data": payload,
    })


@content_bp.route("/content/wechat/article", methods=["GET"])
@token_required
def get_wechat_article(current_user):
    article_id = (request.args.get("article_id") or "").strip()
    if not article_id:
        return jsonify({"status": "error", "message": "article_id 不能为空"}), 400

    logger.info(
        "公众号文章详情请求: user_id=%s, article_id=%s",
        getattr(current_user, "id", "unknown"),
        article_id,
    )
    try:
        payload = get_article_by_id(article_id)
    except WechatOfficialError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400

    return jsonify({
        "status": "success",
        "message": "公众号文章详情获取成功",
        "data": payload,
    })


@content_bp.route("/content/wechat/sync", methods=["POST"])
@token_required
def sync_wechat_articles_to_db(current_user):
    def _parse_bool(value):
        if isinstance(value, bool):
            return value
        if value is None:
            return False
        if isinstance(value, (int, float)):
            return int(value) != 0
        text = str(value).strip().lower()
        if text in ("1", "true", "yes", "y", "on"):
            return True
        if text in ("0", "false", "no", "n", "off", ""):
            return False
        raise ValueError("invalid bool")

    data = request.get_json(silent=True) or {}
    max_pages = data.get("max_pages", request.args.get("max_pages", 10))
    count = data.get("count", request.args.get("count", 20))
    retry = data.get("retry", request.args.get("retry", 3))
    force_full = data.get("force_full", request.args.get("force_full", 0))

    try:
        logger.info(
            "触发公众号同步: user_id=%s, max_pages=%s, count=%s, retry=%s, force_full=%s",
            getattr(current_user, "id", "unknown"),
            max_pages,
            count,
            retry,
            force_full,
        )
        result = sync_wechat_articles(
            max_pages=max_pages,
            count=count,
            retry=retry,
            force_full=_parse_bool(force_full),
        )
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "max_pages/count/retry/force_full 参数格式错误"}), 400
    except WechatOfficialError as exc:
        return jsonify({"status": "error", "message": str(exc)}), 400
    except Exception as exc:
        return jsonify({"status": "error", "message": f"同步失败: {exc}"}), 500

    return jsonify({
        "status": "success",
        "message": "公众号文章同步完成",
        "data": result,
    })
