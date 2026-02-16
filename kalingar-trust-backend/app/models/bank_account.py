from datetime import datetime
from app import db

class BankAccount(db.Model):
    __tablename__ = 'bank_accounts'

    id = db.Column(db.Integer, primary_key=True)
    account_no = db.Column(db.String(50), unique=True, nullable=False, index=True)
    account_name = db.Column(db.String(200), nullable=False)
    ifsc_code = db.Column(db.String(20), nullable=False)
    bank_name = db.Column(db.String(100), nullable=False)
    branch_name = db.Column(db.String(100), nullable=False)
    branch_address = db.Column(db.Text, nullable=False)
    contact_no = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, account_no, account_name, ifsc_code, bank_name, 
                 branch_name, branch_address, contact_no, status='Active'):
        self.account_no = account_no
        self.account_name = account_name
        self.ifsc_code = ifsc_code
        self.bank_name = bank_name
        self.branch_name = branch_name
        self.branch_address = branch_address
        self.contact_no = contact_no
        self.status = status

    def to_dict(self):
        return {
            'id': self.id,
            'accountNo': self.account_no,
            'accountName': self.account_name,
            'ifscCode': self.ifsc_code,
            'bankName': self.bank_name,
            'branchName': self.branch_name,
            'branchAddress': self.branch_address,
            'contactNo': self.contact_no,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

    @staticmethod
    def from_dict(data):
        return BankAccount(
            account_no=data.get('accountNo'),
            account_name=data.get('accountName'),
            ifsc_code=data.get('ifscCode'),
            bank_name=data.get('bankName'),
            branch_name=data.get('branchName'),
            branch_address=data.get('branchAddress'),
            contact_no=data.get('contactNo'),
            status=data.get('status', 'Active')
        )

    def __repr__(self):
        return f'<BankAccount {self.account_name} ({self.account_no})>'