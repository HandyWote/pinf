import json
import os
import time
from datetime import date

from flask import Blueprint, request, jsonify
from sqlalchemy import or_

from models import db
from models.content import Video, Article
from utils.auth import token_required

content_bp = Blueprint("content", __name__)

_CACHE_TTL_SECONDS = 60 * 60
_CACHE = {}


def _seed_enabled():
    flag = os.getenv("CONTENT_SEED", "").strip().lower()
    return flag in {"1", "true", "yes", "on"}


def _ensure_seed_data():
    if not _seed_enabled():
        return
    if Video.query.first() or Article.query.first():
        return
    today = date.today()
    videos = [
        Video(
            title="早产儿喂养关键点",
            description="适合0-6月龄的喂养建议与注意事项。",
            video_url="https://example.com/videos/feeding",
            cover_url="https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=800&q=80",
            category="喂养",
            views=0,
            publish_date=today,
            tags=json.dumps(["喂养", "护理"]),
        ),
        Video(
            title="宝宝夜醒怎么办？",
            description="夜醒原因分析与家长可操作的安抚方法。",
            video_url="https://example.com/videos/sleep",
            cover_url="https://images.unsplash.com/photo-1504151932400-72d4384f04b3?auto=format&fit=crop&w=800&q=80",
            category="发育",
            views=0,
            publish_date=today,
            tags=json.dumps(["睡眠", "发育"]),
        ),
    ]
    articles = [
        Article(
            title="早产儿出院后如何科学喂养？专家给出这3点建议",
            content="1. 观察喂养耐受情况...\n2. 规律喂养并记录...\n3. 及时复诊评估生长曲线...",
            cover_url="https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=800&q=80",
            author="张医生",
            category="喂养",
            publish_date=today,
            tags=json.dumps(["喂养", "护理"]),
        ),
        Article(
            title="生长曲线怎么看？Fenton 与 WHO 标准的区别",
            content="Fenton 更适合早产儿，WHO 标准适合足月儿...",
            cover_url="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80",
            author="李医生",
            category="发育",
            publish_date=today,
            tags=json.dumps(["生长曲线", "发育"]),
        ),
        Article(
            title="复诊前准备清单：带什么、问什么",
            content="出院记录、喂养记录、近期体重变化、问题清单...",
            cover_url="https://images.unsplash.com/photo-1504151932400-72d4384f04b3?auto=format&fit=crop&w=800&q=80",
            author="护理团队",
            category="复诊",
            publish_date=today,
            tags=json.dumps(["复诊", "护理"]),
        ),
    ]
    try:
        db.session.add_all(videos + articles)
        db.session.commit()
        _CACHE.clear()
    except Exception:
        db.session.rollback()


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
    _ensure_seed_data()
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
    _ensure_seed_data()
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
