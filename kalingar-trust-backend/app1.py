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

    # Create members table with family_head_name field
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
            family_head_name TEXT DEFAULT '',
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
        print("✅ Default admin user created")

    conn.commit()
    conn.close()

def migrate_db():
    """Add family_head_name column if it doesn't exist"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    # Check if family_head_name column exists
    cursor.execute("PRAGMA table_info(members)")
    columns = [column[1] for column in cursor.fetchall()]

    if 'family_head_name' not in columns:
        cursor.execute('ALTER TABLE members ADD COLUMN family_head_name TEXT DEFAULT ""')
        print("✅ Added family_head_name column to members table")

    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

# Simple token storage
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
            token = f"valid-token-{username}-{int(datetime.now().timestamp())}"
            VALID_TOKENS.add(token)
            print(f"✅ Login successful, token created")
            return {
                'access_token': token,
                'user': {'username': user['username'], 'name': user['name']}
            }

        print("❌ Login failed - invalid credentials")
        return {'error': 'Invalid credentials'}, 401

    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return {'error': 'Login failed'}, 500

def verify_token(auth_header):
    if not auth_header or not auth_header.startswith('Bearer '):
        return False

    token = auth_header.replace('Bearer ', '').strip()
    return token in VALID_TOKENS

# MEMBERS ROUTES
@app.route('/api/members', methods=['GET'])
def get_members():
    auth_header = request.headers.get('Authorization')
    if not verify_token(auth_header):
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
            member['familyHeadName'] = member.pop('family_head_name')
            member['secondContact'] = member.pop('second_contact')
            member['oldBalance'] = member.pop('old_balance')
            member['isActive'] = bool(member.pop('is_active'))
            member['createdAt'] = member.pop('created_at')
            members.append(member)

        conn.close()
        print(f"📊 Getting members: {len(members)} found")
        return {'members': members, 'total': len(members)}

    except Exception as e:
        print(f"❌ Get members error: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/api/members', methods=['POST'])
def create_member():
    auth_header = request.headers.get('Authorization')
    if not verify_token(auth_header):
        return {'error': 'Missing or invalid token'}, 401

    try:
        data = request.get_json()
        print(f"➕ Creating member: {data['name']}")

        required = ['memberId', 'name', 'fatherName', 'email', 'address', 'gender']
        missing = [field for field in required if not data.get(field)]

        if data.get('headOfFamily') == 'No' and not data.get('familyHeadName', '').strip():
            missing.append('familyHeadName')

        if missing:
            error_msg = f'Missing required fields: {", ".join(missing)}'
            print(f"❌ Validation error: {error_msg}")
            return {'error': error_msg}, 400

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute('SELECT id FROM members WHERE member_id = ?', (data['memberId'],))
        if cursor.fetchone():
            conn.close()
            return {'error': f'Member ID {data["memberId"]} already exists'}, 400

        cursor.execute('''
            INSERT INTO members (
                member_id, name, father_name, mobile, email, address, gender,
                wife_name, head_of_family, family_head_name, second_contact, old_balance
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['memberId'], data['name'], data['fatherName'],
            data.get('contactNo', data.get('mobile', '')), data['email'],
            data['address'], data['gender'], data.get('wifeName', ''),
            data.get('headOfFamily', 'No'), data.get('familyHeadName', ''),
            data.get('secondContact', ''), float(data.get('oldBalance', 0))
        ))

        member_id = cursor.lastrowid
        conn.commit()
        conn.close()

        print(f"✅ Member added successfully: ID {member_id}")
        return {'message': 'Member created successfully'}, 201

    except Exception as e:
        print(f"❌ Create member error: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/api/members/<int:member_id>', methods=['PUT'])
def update_member(member_id):
    auth_header = request.headers.get('Authorization')
    if not verify_token(auth_header):
        return {'error': 'Missing or invalid token'}, 401

    try:
        data = request.get_json()
        print(f"✏️ Updating member {member_id}: {data['name']}")

        required = ['memberId', 'name', 'fatherName', 'email', 'address', 'gender']
        missing = [field for field in required if not data.get(field)]

        if data.get('headOfFamily') == 'No' and not data.get('familyHeadName', '').strip():
            missing.append('familyHeadName')

        if missing:
            error_msg = f'Missing required fields: {", ".join(missing)}'
            return {'error': error_msg}, 400

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute('SELECT id, member_id FROM members WHERE id = ?', (member_id,))
        existing_member = cursor.fetchone()
        if not existing_member:
            conn.close()
            return {'error': f'Member with ID {member_id} not found'}, 404

        if data['memberId'] != existing_member['member_id']:
            cursor.execute('SELECT id FROM members WHERE member_id = ? AND id != ?', 
                          (data['memberId'], member_id))
            if cursor.fetchone():
                conn.close()
                return {'error': f'Member ID {data["memberId"]} already exists'}, 400

        cursor.execute('''
            UPDATE members SET 
                member_id = ?, name = ?, father_name = ?, mobile = ?, email = ?, 
                address = ?, gender = ?, wife_name = ?, head_of_family = ?, 
                family_head_name = ?, second_contact = ?, old_balance = ?
            WHERE id = ?
        ''', (
            data['memberId'], data['name'], data['fatherName'],
            data.get('contactNo', data.get('mobile', '')), data['email'],
            data['address'], data['gender'], data.get('wifeName', ''),
            data.get('headOfFamily', 'No'), data.get('familyHeadName', ''),
            data.get('secondContact', ''), float(data.get('oldBalance', 0)),
            member_id
        ))

        conn.commit()
        conn.close()

        print(f"✅ Member {member_id} updated successfully")
        return {'message': 'Member updated successfully'}, 200

    except Exception as e:
        print(f"❌ Update member error: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/api/members/<int:member_id>', methods=['GET'])
def get_member(member_id):
    auth_header = request.headers.get('Authorization')
    if not verify_token(auth_header):
        return {'error': 'Missing or invalid token'}, 401

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM members WHERE id = ? AND is_active = 1', (member_id,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return {'error': 'Member not found'}, 404

        member = dict(row)
        member['memberId'] = member.pop('member_id')
        member['fatherName'] = member.pop('father_name')
        member['wifeName'] = member.pop('wife_name') 
        member['headOfFamily'] = member.pop('head_of_family')
        member['familyHeadName'] = member.pop('family_head_name')
        member['secondContact'] = member.pop('second_contact')
        member['oldBalance'] = member.pop('old_balance')
        member['isActive'] = bool(member.pop('is_active'))
        member['createdAt'] = member.pop('created_at')

        return {'member': member}, 200

    except Exception as e:
        print(f"❌ Get member error: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/api/members/<int:member_id>', methods=['DELETE'])
def delete_member(member_id):
    auth_header = request.headers.get('Authorization')
    if not verify_token(auth_header):
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
        print(f"❌ Delete member error: {str(e)}")
        return {'error': str(e)}, 500

# BANK ACCOUNTS ROUTES
@app.route('/api/bank-accounts', methods=['GET'])
def get_bank_accounts():
    auth_header = request.headers.get('Authorization')
    if not verify_token(auth_header):
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
        print(f"❌ Get bank accounts error: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/api/bank-accounts', methods=['POST'])
def create_bank_account():
    auth_header = request.headers.get('Authorization')
    if not verify_token(auth_header):
        return {'error': 'Missing or invalid token'}, 401

    try:
        data = request.get_json()
        print(f"🏦 Creating bank account: {data['accountName']}")

        required = ['accountNo', 'accountName', 'ifscCode', 'bankName', 
                   'branchName', 'branchAddress', 'contactNo']
        missing = [field for field in required if not data.get(field)]

        if missing:
            error_msg = f'Missing required fields: {", ".join(missing)}'
            return {'error': error_msg}, 400

        conn = get_db()
        cursor = conn.cursor()

        cursor.execute('SELECT id FROM bank_accounts WHERE account_no = ?', (data['accountNo'],))
        if cursor.fetchone():
            conn.close()
            return {'error': f'Account number {data["accountNo"]} already exists'}, 400

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
        print(f"❌ Create bank account error: {str(e)}")
        return {'error': str(e)}, 500

# MISSING ROUTE - BANK ACCOUNT UPDATE
@app.route('/api/bank-accounts/<int:account_id>', methods=['PUT'])
def update_bank_account(account_id):
    auth_header = request.headers.get('Authorization')
    if not verify_token(auth_header):
        return {'error': 'Missing or invalid token'}, 401

    try:
        data = request.get_json()
        print(f"✏️ Updating bank account {account_id}: {data['accountName']}")

        # Validate required fields
        required = ['accountNo', 'accountName', 'ifscCode', 'bankName', 
                   'branchName', 'branchAddress', 'contactNo']
        missing = [field for field in required if not data.get(field)]

        if missing:
            error_msg = f'Missing required fields: {", ".join(missing)}'
            print(f"❌ Validation error: {error_msg}")
            return {'error': error_msg}, 400

        conn = get_db()
        cursor = conn.cursor()

        # Check if account exists
        cursor.execute('SELECT id, account_no FROM bank_accounts WHERE id = ?', (account_id,))
        existing_account = cursor.fetchone()
        if not existing_account:
            conn.close()
            error_msg = f'Bank account with ID {account_id} not found'
            print(f"❌ Account not found: {error_msg}")
            return {'error': error_msg}, 404

        # Check if new account number already exists for a different account
        if data['accountNo'] != existing_account['account_no']:
            cursor.execute('SELECT id FROM bank_accounts WHERE account_no = ? AND id != ?', 
                          (data['accountNo'], account_id))
            if cursor.fetchone():
                conn.close()
                error_msg = f'Account number {data["accountNo"]} already exists'
                print(f"❌ Duplicate account number: {error_msg}")
                return {'error': error_msg}, 400

        # Update bank account
        cursor.execute('''
            UPDATE bank_accounts SET 
                account_no = ?, account_name = ?, ifsc_code = ?, bank_name = ?,
                branch_name = ?, branch_address = ?, contact_no = ?, status = ?
            WHERE id = ?
        ''', (
            data['accountNo'], data['accountName'], data['ifscCode'],
            data['bankName'], data['branchName'], data['branchAddress'],
            data['contactNo'], data.get('status', 'Active'), account_id
        ))

        conn.commit()
        conn.close()

        print(f"✅ Bank account {account_id} updated successfully")
        return {'message': 'Bank account updated successfully'}, 200

    except Exception as e:
        print(f"❌ Update bank account error: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/api/bank-accounts/<int:account_id>', methods=['GET'])
def get_bank_account(account_id):
    auth_header = request.headers.get('Authorization')
    if not verify_token(auth_header):
        return {'error': 'Missing or invalid token'}, 401

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM bank_accounts WHERE id = ?', (account_id,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return {'error': 'Bank account not found'}, 404

        account = dict(row)
        account['accountNo'] = account.pop('account_no')
        account['accountName'] = account.pop('account_name')
        account['ifscCode'] = account.pop('ifsc_code')
        account['bankName'] = account.pop('bank_name')
        account['branchName'] = account.pop('branch_name')
        account['branchAddress'] = account.pop('branch_address')
        account['contactNo'] = account.pop('contact_no')
        account['createdAt'] = account.pop('created_at')

        return {'bankAccount': account}, 200

    except Exception as e:
        print(f"❌ Get bank account error: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/api/bank-accounts/<int:account_id>', methods=['DELETE'])
def delete_bank_account(account_id):
    auth_header = request.headers.get('Authorization')
    if not verify_token(auth_header):
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
        print(f"❌ Delete bank account error: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    auth_header = request.headers.get('Authorization')
    if not verify_token(auth_header):
        return {'error': 'Missing or invalid token'}, 401

    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute('SELECT COUNT(*) FROM members WHERE is_active = 1')
        total_members = cursor.fetchone()[0]

        cursor.execute('SELECT COUNT(*) FROM members WHERE is_active = 1 AND head_of_family = "Yes"')
        family_heads = cursor.fetchone()[0]

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
        print(f"❌ Dashboard stats error: {str(e)}")
        return {'error': str(e)}, 500

if __name__ == '__main__':
    print("🚀 Kalingar Trust Backend Server Starting...")
    print("📍 Initializing SQLite Database...")
    init_db()
    migrate_db()
    print("✅ Database ready with COMPLETE CRUD support!")
    print("📍 Available endpoints:")
    print("  🔐 POST /api/auth/login")
    print("  👥 GET/POST/PUT/DELETE /api/members (COMPLETE)")
    print("  🏦 GET/POST/PUT/DELETE /api/bank-accounts (COMPLETE)")
    print("  📊 GET /api/dashboard/stats")
    print("=" * 50)
    print("🎉 Ready to use! Login: shamganesh / 123456789")
    print("✏️ Full editing support for members AND bank accounts!")
    app.run(debug=True, port=5000, host='0.0.0.0')
