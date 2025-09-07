from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.bank_account import BankAccount
from sqlalchemy import or_

bank_accounts_bp = Blueprint('bank_accounts', __name__)

@bank_accounts_bp.route('', methods=['GET'])
@jwt_required()
def get_bank_accounts():
    try:
        # Verify JWT token first
        current_user_id = get_jwt_identity()
        if not current_user_id:
            return {'error': 'Invalid token'}, 401

        # Get query parameters
        search = request.args.get('search', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Build query
        query = BankAccount.query

        # Apply search filter
        if search:
            query = query.filter(
                or_(
                    BankAccount.account_name.ilike(f'%{search}%'),
                    BankAccount.account_no.ilike(f'%{search}%'),
                    BankAccount.bank_name.ilike(f'%{search}%'),
                    BankAccount.branch_name.ilike(f'%{search}%')
                )
            )

        # Handle pagination
        if per_page == -1:  # Get all records
            accounts = query.all()
            return {
                'bankAccounts': [account.to_dict() for account in accounts],
                'total': len(accounts)
            }, 200
        else:
            accounts = query.paginate(
                page=page, 
                per_page=per_page, 
                error_out=False
            )

            return {
                'bankAccounts': [account.to_dict() for account in accounts.items],
                'total': accounts.total,
                'pages': accounts.pages,
                'current_page': accounts.page,
                'per_page': accounts.per_page
            }, 200

    except Exception as e:
        print(f"Error in get_bank_accounts: {str(e)}")  # Debug log
        return {'error': f'Server error: {str(e)}'}, 500


@bank_accounts_bp.route('/<int:account_id>', methods=['GET'])
@jwt_required()
def get_bank_account(account_id):
    try:
        account = BankAccount.query.get_or_404(account_id)
        return jsonify({'bankAccount': account.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@bank_accounts_bp.route('', methods=['POST'])
@jwt_required()
def create_bank_account():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['accountNo', 'accountName', 'ifscCode', 'bankName', 
                          'branchName', 'branchAddress', 'contactNo']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        # Check if account number already exists
        existing_account = BankAccount.query.filter_by(account_no=data['accountNo']).first()
        if existing_account:
            return jsonify({'error': 'Account number already exists'}), 400

        # Create new bank account
        account = BankAccount.from_dict(data)
        db.session.add(account)
        db.session.commit()

        return jsonify({
            'message': 'Bank account created successfully',
            'bankAccount': account.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bank_accounts_bp.route('/<int:account_id>', methods=['PUT'])
@jwt_required()
def update_bank_account(account_id):
    try:
        account = BankAccount.query.get_or_404(account_id)
        data = request.get_json()

        # Check if account number is being changed and if it already exists
        if data.get('accountNo') != account.account_no:
            existing_account = BankAccount.query.filter_by(account_no=data['accountNo']).first()
            if existing_account:
                return jsonify({'error': 'Account number already exists'}), 400

        # Update account fields
        account.account_no = data.get('accountNo', account.account_no)
        account.account_name = data.get('accountName', account.account_name)
        account.ifsc_code = data.get('ifscCode', account.ifsc_code)
        account.bank_name = data.get('bankName', account.bank_name)
        account.branch_name = data.get('branchName', account.branch_name)
        account.branch_address = data.get('branchAddress', account.branch_address)
        account.contact_no = data.get('contactNo', account.contact_no)
        account.status = data.get('status', account.status)

        db.session.commit()

        return jsonify({
            'message': 'Bank account updated successfully',
            'bankAccount': account.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bank_accounts_bp.route('/<int:account_id>', methods=['DELETE'])
@jwt_required()
def delete_bank_account(account_id):
    try:
        account = BankAccount.query.get_or_404(account_id)

        # Hard delete for bank accounts (or you can implement soft delete)
        db.session.delete(account)
        db.session.commit()

        return jsonify({'message': 'Bank account deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500