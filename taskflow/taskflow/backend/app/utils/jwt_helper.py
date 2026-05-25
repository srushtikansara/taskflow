"""
JWT utilities – token creation, verification, and route decorator.
"""
import os
import functools
from datetime import datetime, timezone, timedelta
from typing import Optional

import jwt
from flask import request, jsonify, g


SECRET = os.getenv("JWT_SECRET_KEY", "change-jwt-secret")
ALGORITHM = "HS256"
ACCESS_EXPIRES = timedelta(hours=1)
REFRESH_EXPIRES = timedelta(days=30)


# ── Token creation ─────────────────────────────────────────────────────────

def create_access_token(user_id: str, email: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "iat": now,
        "exp": now + ACCESS_EXPIRES,
        "type": "access",
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + REFRESH_EXPIRES,
        "type": "refresh",
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)


# ── Token decoding ─────────────────────────────────────────────────────────

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


# ── Auth decorator ─────────────────────────────────────────────────────────

def jwt_required(fn):
    """Protect a route – extracts Bearer token and sets g.current_user."""
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header missing or malformed"}), 401

        token = auth_header[len("Bearer "):]
        payload = decode_token(token)
        if not payload or payload.get("type") != "access":
            return jsonify({"error": "Invalid or expired token"}), 401

        # Attach caller identity to Flask's request context
        g.current_user = {
            "id":    payload["sub"],
            "email": payload.get("email"),
        }
        return fn(*args, **kwargs)
    return wrapper
