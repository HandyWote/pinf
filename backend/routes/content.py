import time

from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from models import db
from models.content import Article, Video
from utils.auth import token_required

content_bp = Blueprint("content", __name__)

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


@content_bp.route("/content/videos", methods=["GET"])
@token_required
def get_videos(current_user):
    page = _normalize_page(request.args.get("page"), 1)
    per_page = _normalize_per_page(request.args.get("per_page"), 10)
    search = (request.args.get("search") or "").strip()
    category = (request.args.get("category") or "").strip() or None

    cache_key = f"videos:{page}:{per_page}:{search}:{category}"
    cached = _cache_get(cache_key)
    if cached:
        return jsonify(cached)

    query = Video.query
    if search:
        query = query.filter(or_(Video.title.ilike(f"%{search}%"), Video.description.ilike(f"%{search}%")))
    if category:
        query = query.filter_by(category=category)
    query = query.order_by(Video.publish_date.desc())

    result = _paginate(query, page, per_page)
    payload = {"status": "success", "data": result["items"], "pagination": result["pagination"]}
    _cache_set(cache_key, payload)
    return jsonify(payload)


@content_bp.route("/content/videos/<int:video_id>", methods=["GET"])
@token_required
def get_video_detail(current_user, video_id):
    video = Video.query.get(video_id)
    if not video:
        return jsonify({"status": "error", "message": "视频不存在"}), 404

    video.views += 1
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()

    return jsonify({"status": "success", "data": video.to_dict()})


@content_bp.route("/content/articles", methods=["GET"])
@token_required
def get_articles(current_user):
    page = _normalize_page(request.args.get("page"), 1)
    per_page = _normalize_per_page(request.args.get("per_page"), 10)
    search = (request.args.get("search") or "").strip()
    category = (request.args.get("category") or "").strip() or None

    cache_key = f"articles:{page}:{per_page}:{search}:{category}"
    cached = _cache_get(cache_key)
    if cached:
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
    return jsonify(payload)


@content_bp.route("/content/articles/<int:article_id>", methods=["GET"])
@token_required
def get_article_detail(current_user, article_id):
    article = Article.query.get(article_id)
    if not article:
        return jsonify({"status": "error", "message": "文章不存在"}), 404
    return jsonify({"status": "success", "data": article.to_dict()})
