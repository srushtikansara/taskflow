"""
TaskFlow Backend - Flask Application Factory
"""
import os
from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from app.api.auth import auth_bp
from app.api.tasks import tasks_bp
from app.api.users import users_bp
from app.api.notifications import notifications_bp
from app.utils.error_handlers import register_error_handlers


def create_app(config_name: str = None) -> Flask:
    """Application factory – creates and configures the Flask app."""
    app = Flask(__name__)

    # ── Configuration ──────────────────────────────────────────
    env = config_name or os.getenv("FLASK_ENV", "production")
    if env == "development":
        app.config.from_object("app.config.DevelopmentConfig")
    elif env == "testing":
        app.config.from_object("app.config.TestingConfig")
    else:
        app.config.from_object("app.config.ProductionConfig")

    # ── CORS ───────────────────────────────────────────────────
    allowed_origins = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000"
    ).split(",")
    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
    )

    # ── Rate Limiting ──────────────────────────────────────────
    Limiter(
        get_remote_address,
        app=app,
        default_limits=["200 per day", "60 per hour"],
        storage_uri=os.getenv("REDIS_URL", "memory://"),
    )

    # ── Blueprints ─────────────────────────────────────────────
    app.register_blueprint(auth_bp,          url_prefix="/api/auth")
    app.register_blueprint(tasks_bp,         url_prefix="/api/tasks")
    app.register_blueprint(users_bp,         url_prefix="/api/users")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")

    # ── Error Handlers ─────────────────────────────────────────
    register_error_handlers(app)

    # ── Health Check ───────────────────────────────────────────
    @app.get("/health")
    def health():
        return {"status": "ok", "version": "1.0.0"}

    return app
