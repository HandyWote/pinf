"""
Pytest fixtures for backend tests
"""
import pytest
from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from models import db
from models.user import User
from models.baby import Baby
from models.growth import GrowthRecord
from models.appointment import Appointment


class TestConfig:
    """Test configuration - uses SQLite in-memory database"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = "test-secret-key"
    JWT_SECRET_KEY = "test-jwt-secret"
    CORS_ORIGINS = ["*"]
    WTF_CSRF_ENABLED = False
    RUN_MIGRATIONS = False  # Skip migrations in tests


@pytest.fixture
def app():
    """Create and configure a test Flask app"""
    app = Flask(__name__)
    app.config.from_object(TestConfig)

    # Initialize extensions
    db.init_app(app)
    JWTManager(app)
    CORS(app, origins=["*"])

    # Create tables
    with app.app_context():
        db.create_all()

    yield app

    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create a test client"""
    return app.test_client()


@pytest.fixture
def db_session(app):
    """Create a database session for tests"""
    with app.app_context():
        yield db.session


@pytest.fixture
def sample_user(app):
    """Create a sample user"""
    with app.app_context():
        user = User(phone="13800138000", name="Test User")
        db.session.add(user)
        db.session.commit()
        yield user
        db.session.delete(user)
        db.session.commit()


@pytest.fixture
def sample_baby(app, sample_user):
    """Create a sample baby"""
    with app.app_context():
        baby = Baby(
            name="Test Baby",
            gender="男",
            birthday="2024-01-15",
            user_id=sample_user.id
        )
        db.session.add(baby)
        db.session.commit()
        yield baby
        db.session.delete(baby)
        db.session.commit()
