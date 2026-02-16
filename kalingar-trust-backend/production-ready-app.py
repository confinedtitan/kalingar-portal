from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import sqlite3

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

# Database setup
DATABASE = 'kalingar_trust.db'

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create members table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            father_name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            email TEXT NOT NULL,
            address TEXT NOT NULL,
            gender TEXT NOT NULL,
            wife_name TEXT DEFAULT '',
            head_of_family TEXT DEFAULT 'No',
            second_contact TEXT DEFAULT '',
            old_balance REAL DEFAULT 0.0,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create bank_accounts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bank_accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_no TEXT UNIQUE NOT NULL,
            account_name TEXT NOT NULL,
            ifsc_code TEXT NOT NULL,
            bank_name TEXT NOT NULL,
            branch_name TEXT NOT NULL,
            branch_address TEXT NOT NULL,
            contact_no TEXT NOT NULL,
            status TEXT DEFAULT 'Active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Insert default admin user
    cursor.execute('SELECT COUNT(*) FROM users WHERE username = ?', ('shamganesh',))
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO users (username, password, name) 
            VALUES (?, ?, ?)
        ''', ('shamganesh', '123456789', 'Sham Ganesh'))

    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

# Simple token (in production, use proper JWT)
VALID_TOKENS = set()

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        print(f"🔐 Login attempt: {username}")

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ? AND password = ?', 
                      (username, password))
        user = cursor.fetchone()
        conn.close()

        if user:
            token = f"token-{username}-{datetime.now().timestamp()}"
            VALID_TOKENS.add(token)
            print("✅ Login successful")
            return {
                'access_token': token,
                'user': {'username': user['username'], 'name': user['name']}
            }

        print("❌ Login failed")
        return {'error': 'Invalid credentials'}, 401

    except Exception as e:
        print(f"Login error: {str(e)}")
        return {'error': 'Login failed'}, 500

def verify_token(auth_header):
    if not auth_header or not auth_header.startswith('Bearer '):
        return False
    token = auth_header.replace('Bearer ', '')
    return token in VALID_TOKENS

@app.route('/api/members', methods=['GET'])
def get_members():
    if not verify_token(request.headers.get('Authorization')):
        return {'error': 'Missing or invalid token'}, 401

    try:
        conn = get_db()
        cursor = conn.cursor()

        search = request.args.get('search', '')
        if search:
            cursor.execute('''
                SELECT * FROM members 
                WHERE is_active = 1 AND (
                    name LIKE ? OR member_id LIKE ? OR 
                    father_name LIKE ? OR mobile LIKE ?
                )
            ''', (f'%{search}%', f'%{search}%', f'%{search}%', f'%{search}%'))
        else:
            cursor.execute('SELECT * FROM members WHERE is_active = 1')

        members = []
        for row in cursor.fetchall():
            member = dict(row)
            member['memberId'] = member.pop('member_id')
            member['fatherName'] = member.pop('father_name')
            member['wifeName'] = member.pop('wife_name') 
            member['headOfFamily'] = member.pop('head_of_family')
            member['secondContact'] = member.pop('second_contact')
            member['oldBalance'] = member.pop('old_balance')
            member['isActive'] = bool(member.pop('is_active'))
            member['createdAt'] = member.pop('created_at')
            members.append(member)

        conn.close()
        print(f"📊 Getting members: {len(members)} found")
        return {'members': members, 'total': len(members)}

    except Exception as e:
        print(f"Get members error: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/api/members', methods=['POST'])
def create_member():
    if not verify_token(request.headers.get('Authorization')):
        return {'error': 'Missing or invalid token'}, 401

    try:
        data = request.get_json()
        print(f"➕ Creating member: {json.dumps(data, indent=2)}")

        # Validate required fields
        required = ['memberId', 'name', 'fatherName', 'email', 'address', 'gender']
        for field in required:
            if not data.get(field):
                return {'error': f'Missing field: {field}'}, 400

        conn = get_db()
        cursor = conn.cursor()

        # Check if member ID exists
        cursor.execute('SELECT id FROM members WHERE member_id = ?', (data['memberId'],))
        if cursor.fetchone():
            conn.close()
            return {'error': f'Member ID {data["memberId"]} already exists'}, 400

        # Insert member
        cursor.execute('''
            INSERT INTO members (
                member_id, name, father_name, mobile, email, address, gender,
                wife_name, head_of_family, second_contact, old_balance
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['memberId'], data['name'], data['fatherName'],
            data.get('contactNo', data.get('mobile', '')), data['email'],
            data['address'], data['gender'], data.get('wifeName', ''),
            data.get('headOfFamily', 'No'), data.get('secondContact', ''),
            float(data.get('oldBalance', 0))
        ))

        member_id = cursor.lastrowid
        conn.commit()
        conn.close()

        print(f"✅ Member added successfully: ID {member_id}")

        return {'message': 'Member created successfully'}, 201

    except Exception as e:
        print(f"Create member error: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/api/bank-accounts', methods=['GET'])
def get_bank_accounts():
    if not verify_token(request.headers.get('Authorization')):
        return {'error': 'Missing or invalid token'}, 401

    try:
        conn = get_db()
        cursor = conn.cursor()

        search = request.args.get('search', '')
        if search:
            cursor.execute('''
                SELECT * FROM bank_accounts 
                WHERE account_name LIKE ? OR account_no LIKE ? OR 
                      bank_name LIKE ? OR branch_name LIKE ?
            ''', (f'%{search}%', f'%{search}%', f'%{search}%', f'%{search}%'))
        else:
            cursor.execute('SELECT * FROM bank_accounts')

        accounts = []
        for row in cursor.fetchall():
            account = dict(row)
            account['accountNo'] = account.pop('account_no')
            account['accountName'] = account.pop('account_name')
            account['ifscCode'] = account.pop('ifsc_code')
            account['bankName'] = account.pop('bank_name')
            account['branchName'] = account.pop('branch_name')
            account['branchAddress'] = account.pop('branch_address')
            account['contactNo'] = account.pop('contact_no')
            account['createdAt'] = account.pop('created_at')
            accounts.append(account)

        conn.close()
        print(f"🏦 Getting bank accounts: {len(accounts)} found")
        return {'bankAccounts': accounts, 'total': len(accounts)}

    except Exception as e:
        print(f"Get bank accounts error: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/api/bank-accounts', methods=['POST'])
def create_bank_account():
    if not verify_token(request.headers.get('Authorization')):
        return {'error': 'Missing or invalid token'}, 401

    try:
        data = request.get_json()
        print(f"🏦 Creating bank account: {json.dumps(data, indent=2)}")

        # Validate required fields
        required = ['accountNo', 'accountName', 'ifscCode', 'bankName', 
                   'branchName', 'branchAddress', 'contactNo']
        for field in required:
            if not data.get(field):
                return {'error': f'Missing field: {field}'}, 400

        conn = get_db()
        cursor = conn.cursor()

        # Check if account exists
        cursor.execute('SELECT id FROM bank_accounts WHERE account_no = ?', (data['accountNo'],))
        if cursor.fetchone():
            conn.close()
            return {'error': f'Account number {data["accountNo"]} already exists'}, 400

        # Insert bank account
        cursor.execute('''
            INSERT INTO bank_accounts (
                account_no, account_name, ifsc_code, bank_name,
                branch_name, branch_address, contact_no, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['accountNo'], data['accountName'], data['ifscCode'],
            data['bankName'], data['branchName'], data['branchAddress'],
            data['contactNo'], data.get('status', 'Active')
        ))

        account_id = cursor.lastrowid
        conn.commit()
        conn.close()

        print(f"✅ Bank account added successfully: ID {account_id}")

        return {'message': 'Bank account created successfully'}, 201

    except Exception as e:
        print(f"Create bank account error: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/api/members/<int:member_id>', methods=['DELETE'])
def delete_member(member_id):
    if not verify_token(request.headers.get('Authorization')):
        return {'error': 'Missing or invalid token'}, 401

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('UPDATE members SET is_active = 0 WHERE id = ?', (member_id,))

        if cursor.rowcount > 0:
            conn.commit()
            print(f"🗑️ Member {member_id} marked as inactive")
            result = {'message': 'Member deleted successfully'}
        else:
            result = {'error': 'Member not found'}, 404

        conn.close()
        return result

    except Exception as e:
        print(f"Delete member error: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/api/bank-accounts/<int:account_id>', methods=['DELETE'])
def delete_bank_account(account_id):
    if not verify_token(request.headers.get('Authorization')):
        return {'error': 'Missing or invalid token'}, 401

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM bank_accounts WHERE id = ?', (account_id,))

        if cursor.rowcount > 0:
            conn.commit()
            print(f"🗑️ Bank account {account_id} deleted")
            result = {'message': 'Bank account deleted successfully'}
        else:
            result = {'error': 'Bank account not found'}, 404

        conn.close()
        return result

    except Exception as e:
        print(f"Delete bank account error: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    if not verify_token(request.headers.get('Authorization')):
        return {'error': 'Missing or invalid token'}, 401

    try:
        conn = get_db()
        cursor = conn.cursor()

        # Get member stats
        cursor.execute('SELECT COUNT(*) FROM members WHERE is_active = 1')
        total_members = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM members WHERE is_active = 1 AND head_of_family = "Yes"')
        family_heads = cursor.fetchone()[0]

        # Get bank account stats
        cursor.execute('SELECT COUNT(*) FROM bank_accounts')
        total_accounts = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM bank_accounts WHERE status = "Active"')
        active_accounts = cursor.fetchone()[0]

        conn.close()

        return {
            'totalMembers': total_members,
            'familyHeads': family_heads,
            'totalBankAccounts': total_accounts,
            'activeBankAccounts': active_accounts,
            'activeMemberPercent': 100.0 if total_members > 0 else 0
        }

    except Exception as e:
        print(f"Dashboard stats error: {str(e)}")
        return {'error': str(e)}, 500

if __name__ == '__main__':
    print("🚀 Kalingar Trust Backend Server Starting...")
    print("📍 Initializing SQLite Database...")
    init_db()
    print("✅ Database ready!")
    print("📍 Login: POST /api/auth/login")
    print("👥 Members: GET/POST/DELETE /api/members")
    print("🏦 Bank Accounts: GET/POST/DELETE /api/bank-accounts")
    print("📊 Dashboard: GET /api/dashboard/stats")
    print("=" * 50)
    print("🎉 Ready to use! Login: shamganesh / 123456789")
    app.run(debug=True, port=5000, host='0.0.0.0')
