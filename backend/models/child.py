from datetime import datetime
from . import db
import json

class Child(db.Model):
    __tablename__ = 'children'
    
    id = db.Column(db.Integer, primary_key=True)
    user_openid = db.Column(db.String(100), db.ForeignKey('users.openid'), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)  # '男' 或 '女'
    gestational_age = db.Column(db.Integer, nullable=False)  # 孕周
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 关联关系
    growth_records = db.relationship('GrowthRecord', backref='child', lazy=True, cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', backref='child', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'birthDate': self.birth_date.isoformat() if self.birth_date else None,
            'gender': self.gender,
            'gestationalAge': self.gestational_age,
            'growthRecords': [record.to_dict() for record in self.growth_records]
        }

class GrowthRecord(db.Model):
    __tablename__ = 'growth_records'
    
    id = db.Column(db.Integer, primary_key=True)
    child_id = db.Column(db.Integer, db.ForeignKey('children.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    age_in_months = db.Column(db.Integer, nullable=False)
    age_in_weeks = db.Column(db.Integer, nullable=False)
    height = db.Column(db.Float, nullable=False)  # 身高(cm)
    weight = db.Column(db.Float, nullable=False)  # 体重(kg)
    head_circumference = db.Column(db.Float, nullable=False)  # 头围(cm)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'ageInMonths': self.age_in_months,
            'ageInWeeks': self.age_in_weeks,
            'height': self.height,
            'weight': self.weight,
            'headCircumference': self.head_circumference
        }