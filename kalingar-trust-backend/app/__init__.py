from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from config.config import config
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

def create_app(config_name='default'):
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    # JWT Configuration - FIXED
    app.config['JWT_SECRET_KEY'] = app.config.get('JWT_SECRET_KEY', 'your-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    app.config['JWT_ALGORITHM'] = 'HS256'

    # Initialize extensions
    db.init_app(app)
    cors.init_app(app, 
                  origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
                  methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                  allow_headers=['Content-Type', 'Authorization'],
                  supports_credentials=True)

    jwt.init_app(app)
    migrate.init_app(app, db)

    # JWT Error Handlers - ADD THIS
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {'error': 'Token has expired'}, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {'error': 'Invalid token'}, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return {'error': 'Authorization token required'}, 401

    # ... rest of your code


# Initialize extensions
db = SQLAlchemy()
cors = CORS()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_name='default'):
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    # Initialize extensions with app
    db.init_app(app)
    cors.init_app(app, origins=app.config['CORS_ORIGINS'])
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Import models (to ensure they're registered with SQLAlchemy)
    from app.models import User, Member, BankAccount

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.members import members_bp
    from app.routes.bank_accounts import bank_accounts_bp
    from app.routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(members_bp, url_prefix='/api/members')
    app.register_blueprint(bank_accounts_bp, url_prefix='/api/bank-accounts')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    # Create database tables
    with app.app_context():
        db.create_all()

        # Create default admin user if not exists
        from app.models.user import User
        admin_user = User.query.filter_by(username=app.config['ADMIN_USERNAME']).first()
        if not admin_user:
            admin_user = User(
                username=app.config['ADMIN_USERNAME'],
                password=app.config['ADMIN_PASSWORD'],
                name='Sham Ganesh',
                role='superadmin'
            )
            db.session.add(admin_user)
            db.session.commit()
            print(f"Created admin user: {app.config['ADMIN_USERNAME']}")

    return app