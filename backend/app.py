import logging
import os

from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from sqlalchemy import text

from config import Config
from models import db
from utils.db_migrations import run_migrations
from utils.wechat_sync_scheduler import start_wechat_sync_scheduler

jwt = JWTManager()
cors = CORS()


def _configure_logging():
    root_logger = logging.getLogger()
    if not root_logger.handlers:
        logging.basicConfig(
            level=logging.INFO,
            format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
        )
    else:
        root_logger.setLevel(logging.INFO)


def _ensure_required_config(app: Flask):
    missing = []
    if not app.config.get("SQLALCHEMY_DATABASE_URI"):
        missing.append("DATABASE_URL")
    if not app.config.get("SECRET_KEY"):
        missing.append("SECRET_KEY")
    if not app.config.get("JWT_SECRET_KEY"):
        missing.append("JWT_SECRET_KEY")
    if missing:
        raise RuntimeError(f"缺少必要环境变量: {', '.join(missing)}")


def create_app(config_class=Config):
    _configure_logging()
    app = Flask(__name__)
    app.config.from_object(config_class)

    _ensure_required_config(app)

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)

    # 注册蓝图（路由）
    from routes.auth import auth_bp
    from routes.baby import baby_bp
    from routes.growth import growth_bp
    from routes.content import content_bp
    from routes.appointment import appointment_bp
    from routes.chat import chat_bp
    from routes.notifications import notifications_bp
    from routes.devices import devices_bp
    from utils.notification_scheduler import start_notification_scheduler

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(baby_bp, url_prefix="/api")
    app.register_blueprint(growth_bp, url_prefix="/api")
    app.register_blueprint(content_bp, url_prefix="/api")
    app.register_blueprint(appointment_bp, url_prefix="/api")
    app.register_blueprint(chat_bp, url_prefix="/api")
    app.register_blueprint(notifications_bp, url_prefix="/api")
    app.register_blueprint(devices_bp, url_prefix="/api")

    with app.app_context():
        db.create_all()
        run_migrations(db)

    start_wechat_sync_scheduler(app)
    start_notification_scheduler(app)

    @app.route("/")
    def index():
        return {"message": "早护通后端API服务正在运行", "status": "success"}

    @app.route("/api/health")
    def health_check():
        db_status = "ok"
        try:
            db.session.execute(text("SELECT 1"))
        except Exception as exc:  # pragma: no cover - 健康检查容错
            db_status = f"error: {exc}"
            logging.exception("数据库健康检查失败")
        return jsonify({
            "status": "ok" if db_status == "ok" else "degraded",
            "message": "API服务正常" if db_status == "ok" else "数据库异常",
            "data": {"database": db_status}
        })

    return app


if __name__ == "__main__":
    application = create_app()
    host = os.getenv("BACKEND_HOST", "127.0.0.1")
    port = int(os.getenv("BACKEND_PORT", "5010"))
    application.run(host=host, port=port, debug=False)
