from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models.member import Member
from app.models.bank_account import BankAccount

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        # Get member statistics
        total_members = Member.query.filter_by(is_active=True).count()
        family_heads = Member.query.filter_by(is_active=True, head_of_family='Yes').count()

        # Get bank account statistics
        total_bank_accounts = BankAccount.query.count()
        active_bank_accounts = BankAccount.query.filter_by(status='Active').count()

        # Calculate active member percentage
        active_member_percent = (total_members / max(total_members, 1)) * 100

        return jsonify({
            'totalMembers': total_members,
            'familyHeads': family_heads,
            'totalBankAccounts': total_bank_accounts,
            'activeBankAccounts': active_bank_accounts,
            'activeMemberPercent': round(active_member_percent, 1)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/recent-members', methods=['GET'])
@jwt_required()
def get_recent_members():
    try:
        # Get 5 most recent members
        recent_members = Member.query.filter_by(is_active=True)\
                                   .order_by(Member.created_at.desc())\
                                   .limit(5).all()

        return jsonify({
            'recentMembers': [member.to_dict() for member in recent_members]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500