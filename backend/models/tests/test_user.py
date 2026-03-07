"""
Tests for User model
"""
import pytest
from models.user import User
from models import db


class TestUserModel:
    """Test User model"""

    def test_user_default_role(self, app):
        """Test user default role"""
        with app.app_context():
            user = User(phone="13800138001")
            db.session.add(user)
            db.session.commit()

            assert user.role == "user"

            db.session.delete(user)
            db.session.commit()

    def test_user_to_dict(self, app):
        """Test user to_dict method"""
        with app.app_context():
            user = User(phone="13800138000", name="Test User")
            db.session.add(user)
            db.session.commit()

            user_dict = user.to_dict()

            assert user_dict["phone"] == "13800138000"
            assert user_dict["name"] == "Test User"
            assert user_dict["role"] == "user"
            assert user_dict["needSetPassword"] is True

            db.session.delete(user)
            db.session.commit()
