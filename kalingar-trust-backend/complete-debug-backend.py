from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])

# Simple in-memory storage for testing
users = {'shamganesh': {'password': '123456789', 'name': 'Sham Ganesh'}}
members = []
bank_accounts = []
token = 'test-token-12345'

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    print(f"🔐 Login attempt: {username}")

    if username in users and users[username]['password'] == password:
        print("✅ Login successful")
        return {
            'access_token': token,
            'user': {'username': username, 'name': users[username]['name']}
        }

    print("❌ Login failed")
    return {'error': 'Invalid credentials'}, 401

@app.route('/api/members', methods=['GET'])
def get_members():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {'error': 'Missing token'}, 401

    print(f"📊 Getting members: {len(members)} found")
    return {'members': members, 'total': len(members)}

@app.route('/api/members', methods=['POST'])
def create_member():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {'error': 'Missing token'}, 401

    data = request.get_json()
    print(f"➕ Creating member: {json.dumps(data, indent=2)}")

    # Simple validation
    required = ['memberId', 'name', 'fatherName', 'email', 'address', 'gender']
    for field in required:
        if not data.get(field):
            return {'error': f'Missing field: {field}'}, 400

    # Add member
    member = {
        'id': len(members) + 1,
        'memberId': data['memberId'],
        'name': data['name'],
        'fatherName': data['fatherName'],
        'mobile': data.get('contactNo', data.get('mobile', '')),
        'email': data['email'],
        'address': data['address'],
        'gender': data['gender'],
        'wifeName': data.get('wifeName', ''),
        'headOfFamily': data.get('headOfFamily', 'No'),
        'secondContact': data.get('secondContact', ''),
        'oldBalance': data.get('oldBalance', 0),
        'isActive': True
    }

    members.append(member)
    print(f"✅ Member added successfully: ID {member['id']}")

    return {'message': 'Member created successfully', 'member': member}, 201

@app.route('/api/bank-accounts', methods=['GET'])
def get_bank_accounts():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {'error': 'Missing token'}, 401

    print(f"🏦 Getting bank accounts: {len(bank_accounts)} found")
    return {'bankAccounts': bank_accounts, 'total': len(bank_accounts)}

@app.route('/api/bank-accounts', methods=['POST'])
def create_bank_account():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {'error': 'Missing token'}, 401

    data = request.get_json()
    print(f"🏦 Creating bank account: {json.dumps(data, indent=2)}")

    # Simple validation
    required = ['accountNo', 'accountName', 'ifscCode', 'bankName', 'branchName', 'branchAddress', 'contactNo']
    for field in required:
        if not data.get(field):
            return {'error': f'Missing field: {field}'}, 400

    # Check if account number already exists
    for account in bank_accounts:
        if account['accountNo'] == data['accountNo']:
            return {'error': f'Account number {data["accountNo"]} already exists'}, 400

    # Add bank account
    account = {
        'id': len(bank_accounts) + 1,
        'accountNo': data['accountNo'],
        'accountName': data['accountName'],
        'ifscCode': data['ifscCode'],
        'bankName': data['bankName'],
        'branchName': data['branchName'],
        'branchAddress': data['branchAddress'],
        'contactNo': data['contactNo'],
        'status': data.get('status', 'Active')
    }

    bank_accounts.append(account)
    print(f"✅ Bank account added successfully: ID {account['id']}")

    return {'message': 'Bank account created successfully', 'bankAccount': account}, 201

@app.route('/api/members/<int:member_id>', methods=['DELETE'])
def delete_member(member_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {'error': 'Missing token'}, 401

    # Find and mark as inactive
    for member in members:
        if member['id'] == member_id:
            member['isActive'] = False
            print(f"🗑️ Member {member_id} marked as inactive")
            return {'message': 'Member deleted successfully'}, 200

    return {'error': 'Member not found'}, 404

@app.route('/api/bank-accounts/<int:account_id>', methods=['DELETE'])
def delete_bank_account(account_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {'error': 'Missing token'}, 401

    # Remove bank account
    global bank_accounts
    bank_accounts = [acc for acc in bank_accounts if acc['id'] != account_id]
    print(f"🗑️ Bank account {account_id} deleted")
    return {'message': 'Bank account deleted successfully'}, 200

@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {'error': 'Missing token'}, 401

    active_members = [m for m in members if m.get('isActive', True)]
    family_heads = [m for m in active_members if m.get('headOfFamily') == 'Yes']

    return {
        'totalMembers': len(active_members),
        'familyHeads': len(family_heads),
        'totalBankAccounts': len(bank_accounts),
        'activeBankAccounts': len([acc for acc in bank_accounts if acc.get('status') == 'Active']),
        'activeMemberPercent': 100.0 if active_members else 0
    }, 200

if __name__ == '__main__':
    print("🚀 Complete Debug Backend Server Starting...")
    print("📍 Login: POST /api/auth/login")
    print("👥 Members: GET/POST/DELETE /api/members")
    print("🏦 Bank Accounts: GET/POST/DELETE /api/bank-accounts")
    print("📊 Dashboard: GET /api/dashboard/stats")
    print("=" * 50)
    app.run(debug=True, port=5000)
