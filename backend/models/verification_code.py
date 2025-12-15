from datetime import datetime, timedelta
from . import db


class VerificationCode(db.Model):
    """手机验证码临时存储表（因无法接入第三方短信服务）"""
    __tablename__ = "verification_codes"

    id = db.Column(db.Integer, primary_key=True)
    phone = db.Column(db.String(20), nullable=False, index=True)
    code = db.Column(db.String(6), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @staticmethod
    def generate_code():
        """生成6位随机验证码"""
        import random
        return ''.join([str(random.randint(0, 9)) for _ in range(6)])

    @staticmethod
    def create_code(phone: str, valid_minutes: int = 5):
        """创建新验证码，使旧验证码失效"""
        # 将该手机号的旧验证码标记为已使用
        VerificationCode.query.filter_by(
            phone=phone, 
            is_used=False
        ).update({'is_used': True})
        
        # 生成新验证码
        code = VerificationCode.generate_code()
        expires_at = datetime.utcnow() + timedelta(minutes=valid_minutes)
        
        verification = VerificationCode(
            phone=phone,
            code=code,
            expires_at=expires_at
        )
        db.session.add(verification)
        db.session.commit()
        
        return code

    @staticmethod
    def verify_code(phone: str, code: str) -> bool:
        """验证验证码是否有效"""
        verification = VerificationCode.query.filter_by(
            phone=phone,
            code=code,
            is_used=False
        ).order_by(VerificationCode.created_at.desc()).first()
        
        if not verification:
            return False
        
        # 检查是否过期
        if verification.expires_at < datetime.utcnow():
            return False
        
        # 标记为已使用
        verification.is_used = True
        db.session.commit()
        
        return True

    def to_dict(self):
        return {
            "id": self.id,
            "phone": self.phone,
            "expiresAt": self.expires_at.isoformat() if self.expires_at else None,
            "isUsed": self.is_used,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
