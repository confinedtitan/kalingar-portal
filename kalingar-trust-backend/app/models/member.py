from datetime import datetime
from app import db

class Member(db.Model):
    __tablename__ = 'members'

    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    father_name = db.Column(db.String(100), nullable=False)
    mobile = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    address = db.Column(db.Text, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    wife_name = db.Column(db.String(100), nullable=True)
    head_of_family = db.Column(db.String(10), nullable=False, default='No')
    second_contact = db.Column(db.String(15), nullable=True)
    old_balance = db.Column(db.Float, default=0.0)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, member_id, name, father_name, mobile, email, address, gender, 
                 wife_name=None, head_of_family='No', second_contact=None, old_balance=0.0):
        self.member_id = member_id
        self.name = name
        self.father_name = father_name
        self.mobile = mobile
        self.email = email
        self.address = address
        self.gender = gender
        self.wife_name = wife_name
        self.head_of_family = head_of_family
        self.second_contact = second_contact
        self.old_balance = old_balance

    def to_dict(self):
        return {
            'id': self.id,
            'memberId': self.member_id,
            'name': self.name,
            'fatherName': self.father_name,
            'mobile': self.mobile,
            'email': self.email,
            'address': self.address,
            'gender': self.gender,
            'wifeName': self.wife_name,
            'headOfFamily': self.head_of_family,
            'secondContact': self.second_contact,
            'oldBalance': self.old_balance,
            'isActive': self.is_active,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

    @staticmethod
    def from_dict(data):
        return Member(
            member_id=data.get('memberId'),
            name=data.get('name'),
            father_name=data.get('fatherName'),
            mobile=data.get('mobile'),
            email=data.get('email'),
            address=data.get('address'),
            gender=data.get('gender'),
            wife_name=data.get('wifeName'),
            head_of_family=data.get('headOfFamily', 'No'),
            second_contact=data.get('secondContact'),
            old_balance=float(data.get('oldBalance', 0))
        )

    def __repr__(self):
        return f'<Member {self.name} ({self.member_id})>'