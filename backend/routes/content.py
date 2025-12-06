from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from models import db
from models.content import Video, Article
from utils.auth import token_required

content_bp = Blueprint("content", __name__)


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
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    search = request.args.get("search", "")
    category = request.args.get("category")

    query = Video.query
    if search:
        query = query.filter(or_(Video.title.ilike(f"%{search}%"), Video.description.ilike(f"%{search}%")))
    if category:
        query = query.filter_by(category=category)
    query = query.order_by(Video.publish_date.desc())

    result = _paginate(query, page, per_page)
    return jsonify({"status": "success", "data": result["items"], "pagination": result["pagination"]})


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
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    search = request.args.get("search", "")
    category = request.args.get("category")

    query = Article.query
    if search:
        query = query.filter(or_(Article.title.ilike(f"%{search}%"), Article.content.ilike(f"%{search}%")))
    if category:
        query = query.filter_by(category=category)
    query = query.order_by(Article.publish_date.desc())

    result = _paginate(query, page, per_page)
    return jsonify({"status": "success", "data": result["items"], "pagination": result["pagination"]})


@content_bp.route("/content/articles/<int:article_id>", methods=["GET"])
@token_required
def get_article_detail(current_user, article_id):
    article = Article.query.get(article_id)
    if not article:
        return jsonify({"status": "error", "message": "文章不存在"}), 404
    return jsonify({"status": "success", "data": article.to_dict()})
