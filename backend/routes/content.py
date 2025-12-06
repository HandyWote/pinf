from flask import Blueprint, request, jsonify
from models import db
from models.content import Video, Article
from utils.auth import token_required
from sqlalchemy import or_

content_bp = Blueprint('content', __name__)

@content_bp.route('/getVideos', methods=['GET'])
@token_required
def get_videos(current_user):
    """获取视频列表"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        
        # 构建查询
        query = Video.query
        
        # 如果有搜索关键词，按标题和描述搜索
        if search:
            query = query.filter(
                or_(
                    Video.title.contains(search),
                    Video.description.contains(search)
                )
            )
        
        # 按发布日期倒序排列
        query = query.order_by(Video.publish_date.desc())
        
        # 分页
        videos = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'success': True,
            'videos': [video.to_dict() for video in videos.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': videos.total,
                'pages': videos.pages,
                'has_next': videos.has_next,
                'has_prev': videos.has_prev
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取视频列表失败: {str(e)}'
        }), 500

@content_bp.route('/getVideoDetail/<int:video_id>', methods=['GET'])
@token_required
def get_video_detail(current_user, video_id):
    """获取视频详情"""
    try:
        video = Video.query.get(video_id)
        if not video:
            return jsonify({
                'success': False,
                'message': '视频不存在'
            }), 404
        
        # 增加观看次数
        video.views += 1
        db.session.commit()
        
        return jsonify({
            'success': True,
            'video': video.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'获取视频详情失败: {str(e)}'
        }), 500

@content_bp.route('/getArticles', methods=['GET'])
@token_required
def get_articles(current_user):
    """获取文章列表"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        
        # 构建查询
        query = Article.query
        
        # 如果有搜索关键词，按标题和内容搜索
        if search:
            query = query.filter(
                or_(
                    Article.title.contains(search),
                    Article.content.contains(search)
                )
            )
        
        # 按发布日期倒序排列
        query = query.order_by(Article.publish_date.desc())
        
        # 分页
        articles = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'success': True,
            'articles': [article.to_dict() for article in articles.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': articles.total,
                'pages': articles.pages,
                'has_next': articles.has_next,
                'has_prev': articles.has_prev
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取文章列表失败: {str(e)}'
        }), 500

@content_bp.route('/getArticleDetail/<int:article_id>', methods=['GET'])
@token_required
def get_article_detail(current_user, article_id):
    """获取文章详情"""
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({
                'success': False,
                'message': '文章不存在'
            }), 404
        
        return jsonify({
            'success': True,
            'article': article.to_dict()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取文章详情失败: {str(e)}'
        }), 500

@content_bp.route('/searchContent', methods=['GET'])
@token_required
def search_content(current_user):
    """搜索内容（视频和文章）"""
    try:
        keyword = request.args.get('keyword', '')
        content_type = request.args.get('type', 'all')  # all, video, article
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        if not keyword:
            return jsonify({
                'success': False,
                'message': '搜索关键词不能为空'
            }), 400
        
        results = {
            'videos': [],
            'articles': [],
            'total': 0
        }
        
        # 搜索视频
        if content_type in ['all', 'video']:
            video_query = Video.query.filter(
                or_(
                    Video.title.contains(keyword),
                    Video.description.contains(keyword)
                )
            ).order_by(Video.publish_date.desc())
            
            if content_type == 'video':
                videos = video_query.paginate(
                    page=page, 
                    per_page=per_page, 
                    error_out=False
                )
                results['videos'] = [video.to_dict() for video in videos.items]
                results['pagination'] = {
                    'page': page,
                    'per_page': per_page,
                    'total': videos.total,
                    'pages': videos.pages,
                    'has_next': videos.has_next,
                    'has_prev': videos.has_prev
                }
            else:
                results['videos'] = [video.to_dict() for video in video_query.limit(5).all()]
        
        # 搜索文章
        if content_type in ['all', 'article']:
            article_query = Article.query.filter(
                or_(
                    Article.title.contains(keyword),
                    Article.content.contains(keyword)
                )
            ).order_by(Article.publish_date.desc())
            
            if content_type == 'article':
                articles = article_query.paginate(
                    page=page, 
                    per_page=per_page, 
                    error_out=False
                )
                results['articles'] = [article.to_dict() for article in articles.items]
                results['pagination'] = {
                    'page': page,
                    'per_page': per_page,
                    'total': articles.total,
                    'pages': articles.pages,
                    'has_next': articles.has_next,
                    'has_prev': articles.has_prev
                }
            else:
                results['articles'] = [article.to_dict() for article in article_query.limit(5).all()]
        
        # 计算总数
        results['total'] = len(results['videos']) + len(results['articles'])
        
        return jsonify({
            'success': True,
            'keyword': keyword,
            'type': content_type,
            'results': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'搜索失败: {str(e)}'
        }), 500