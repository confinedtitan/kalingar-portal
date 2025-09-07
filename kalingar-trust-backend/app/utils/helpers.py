from flask import jsonify

def success_response(message, data=None, status_code=200):
    """Create a standardized success response"""
    response = {'success': True, 'message': message}
    if data:
        response['data'] = data
    return jsonify(response), status_code

def error_response(message, errors=None, status_code=400):
    """Create a standardized error response"""
    response = {'success': False, 'error': message}
    if errors:
        response['errors'] = errors
    return jsonify(response), status_code

def paginate_query(query, page=1, per_page=10):
    """Paginate a SQLAlchemy query"""
    try:
        paginated = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        return {
            'items': paginated.items,
            'total': paginated.total,
            'pages': paginated.pages,
            'current_page': paginated.page,
            'per_page': paginated.per_page,
            'has_next': paginated.has_next,
            'has_prev': paginated.has_prev
        }
    except Exception as e:
        return None