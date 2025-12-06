from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

# 导入数据库和模型
from models import db
from models.user import User
from models.child import Child, GrowthRecord
from models.content import Video, Article
from models.appointment import Appointment
from models.chat import ChatMessage

jwt = JWTManager()
cors = CORS()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # 初始化扩展
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)
    
    # 注册蓝图（路由）
    from routes.auth import auth_bp
    from routes.child import child_bp
    from routes.content import content_bp
    from routes.appointment import appointment_bp
    from routes.chat import chat_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(child_bp, url_prefix='/api')
    app.register_blueprint(content_bp, url_prefix='/api')
    app.register_blueprint(appointment_bp, url_prefix='/api')
    app.register_blueprint(chat_bp, url_prefix='/api')
    
    # 创建数据库表
    with app.app_context():
        db.create_all()
        # 创建测试数据
        create_test_data()
    
    # 基础路由测试
    @app.route('/')
    def index():
        return {'message': '早护通后端API服务正在运行', 'status': 'success'}
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'API服务正常'}
    
    return app

def create_test_data():
    """创建测试数据"""
    # 检查是否已有测试视频数据
    if Video.query.count() == 0:
        # 创建测试视频
        test_videos = [
            Video(
                title="新生儿护理基础知识",
                description="介绍新生儿日常护理的基本方法和注意事项",
                video_url="https://example.com/video1.mp4",
                cover_url="https://example.com/cover1.jpg",
                views=150,
                tags='["新生儿", "护理", "基础知识"]'
            ),
            Video(
                title="婴儿喂养指南",
                description="详细讲解母乳喂养和人工喂养的方法",
                video_url="https://example.com/video2.mp4",
                cover_url="https://example.com/cover2.jpg",
                views=200,
                tags='["喂养", "母乳", "奶粉"]'
            ),
            Video(
                title="宝宝睡眠训练",
                description="帮助宝宝建立良好的睡眠习惯",
                video_url="https://example.com/video3.mp4",
                cover_url="https://example.com/cover3.jpg",
                views=180,
                tags='["睡眠", "训练", "习惯"]'
            )
        ]
        
        for video in test_videos:
            db.session.add(video)
    
    # 创建测试文章
    if Article.query.count() == 0:
        test_articles = [
            Article(
                title="如何正确给宝宝洗澡",
                content="<h2>准备工作</h2><p>给宝宝洗澡前需要准备...</p>",
                cover_url="https://example.com/article1.jpg",
                author="张医生",
                tags='["洗澡", "护理", "卫生"]'
            ),
            Article(
                title="宝宝发烧怎么办",
                content="<h2>发烧的原因</h2><p>宝宝发烧可能是由于...</p>",
                cover_url="https://example.com/article2.jpg",
                author="李医生",
                tags='["发烧", "健康", "护理"]'
            )
        ]
        
        for article in test_articles:
            db.session.add(article)
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"创建测试数据失败: {e}")

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5010, debug=False)