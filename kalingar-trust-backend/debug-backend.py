from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000'])

# Simple in-memory storage for testing
users = {'shamganesh': {'password': '123456789', 'name': 'Sham Ganesh'}}
members = []
token = 'test-token-12345'

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if username in users and users[username]['password'] == password:
        return {
            'access_token': token,
            'user': {'username': username, 'name': users[username]['name']}
        }
    return {'error': 'Invalid credentials'}, 401

@app.route('/api/members', methods=['GET'])
def get_members():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {'error': 'Missing token'}, 401

    return {'members': members, 'total': len(members)}

@app.route('/api/members', methods=['POST'])
def create_member():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {'error': 'Missing token'}, 401

    data = request.get_json()
    print(f"Received member data: {json.dumps(data, indent=2)}")

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
    print(f"Member added successfully: {member}")

    return {'message': 'Member created successfully', 'member': member}, 201

@app.route('/api/bank-accounts', methods=['GET'])
def get_bank_accounts():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return {'error': 'Missing token'}, 401

    return {'bankAccounts': [], 'total': 0}

if __name__ == '__main__':
    print("🚀 Debug Backend Server Starting...")
    print("📍 Login: POST /api/auth/login")
    print("👥 Members: GET/POST /api/members")
    print("🏦 Bank Accounts: GET /api/bank-accounts")
    app.run(debug=True, port=5000)
