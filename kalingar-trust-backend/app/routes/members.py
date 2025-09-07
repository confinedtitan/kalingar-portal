from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models.member import Member
from sqlalchemy import or_

members_bp = Blueprint('members', __name__)

@members_bp.route('', methods=['GET'])
@jwt_required()
def get_members():
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
        query = Member.query.filter_by(is_active=True)

        # Apply search filter
        if search:
            query = query.filter(
                or_(
                    Member.name.ilike(f'%{search}%'),
                    Member.member_id.ilike(f'%{search}%'),
                    Member.father_name.ilike(f'%{search}%'),
                    Member.mobile.ilike(f'%{search}%')
                )
            )

        # Handle pagination
        if per_page == -1:  # Get all records
            members = query.all()
            return {
                'members': [member.to_dict() for member in members],
                'total': len(members)
            }, 200
        else:
            members = query.paginate(
                page=page, 
                per_page=per_page, 
                error_out=False
            )

            return {
                'members': [member.to_dict() for member in members.items],
                'total': members.total,
                'pages': members.pages,
                'current_page': members.page,
                'per_page': members.per_page
            }, 200

    except Exception as e:
        print(f"Error in get_members: {str(e)}")  # Debug log
        return {'error': f'Server error: {str(e)}'}, 500


@members_bp.route('/<int:member_id>', methods=['GET'])
@jwt_required()
def get_member(member_id):
    try:
        member = Member.query.get_or_404(member_id)
        return jsonify({'member': member.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@members_bp.route('', methods=['POST'])
@jwt_required()
def create_member():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['memberId', 'name', 'fatherName', 'mobile', 'email', 'address', 'gender']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        # Check if member ID already exists
        existing_member = Member.query.filter_by(member_id=data['memberId']).first()
        if existing_member:
            return jsonify({'error': 'Member ID already exists'}), 400

        # Create new member
        member = Member.from_dict(data)
        db.session.add(member)
        db.session.commit()

        return jsonify({
            'message': 'Member created successfully',
            'member': member.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@members_bp.route('/<int:member_id>', methods=['PUT'])
@jwt_required()
def update_member(member_id):
    try:
        member = Member.query.get_or_404(member_id)
        data = request.get_json()

        # Check if member ID is being changed and if it already exists
        if data.get('memberId') != member.member_id:
            existing_member = Member.query.filter_by(member_id=data['memberId']).first()
            if existing_member:
                return jsonify({'error': 'Member ID already exists'}), 400

        # Update member fields
        member.member_id = data.get('memberId', member.member_id)
        member.name = data.get('name', member.name)
        member.father_name = data.get('fatherName', member.father_name)
        member.mobile = data.get('mobile', member.mobile)
        member.email = data.get('email', member.email)
        member.address = data.get('address', member.address)
        member.gender = data.get('gender', member.gender)
        member.wife_name = data.get('wifeName', member.wife_name)
        member.head_of_family = data.get('headOfFamily', member.head_of_family)
        member.second_contact = data.get('secondContact', member.second_contact)
        member.old_balance = float(data.get('oldBalance', member.old_balance))

        db.session.commit()

        return jsonify({
            'message': 'Member updated successfully',
            'member': member.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@members_bp.route('/<int:member_id>', methods=['DELETE'])
@jwt_required()
def delete_member(member_id):
    try:
        member = Member.query.get_or_404(member_id)

        # Soft delete - mark as inactive
        member.is_active = False
        db.session.commit()

        return jsonify({'message': 'Member deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500