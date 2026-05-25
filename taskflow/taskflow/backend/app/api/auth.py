"""
Auth Blueprint – Google OAuth 2.0 + JWT token issuance.
Routes:
  GET  /api/auth/google          → redirect to Google consent screen
  GET  /api/auth/google/callback → handle OAuth callback, issue JWT
  POST /api/auth/refresh         → refresh access token
  GET  /api/auth/me              → return current user profile
  POST /api/auth/logout          → (client-side token discard)
"""
import os
import requests as http
from flask import Blueprint, redirect, request, jsonify, g

from app.utils.supabase_client import get_supabase
from app.utils.jwt_helper import (
    create_access_token,
    create_refresh_token,
    decode_token,
    jwt_required,
)

auth_bp = Blueprint("auth", __name__)

GOOGLE_AUTH_URL    = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL   = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO    = "https://www.googleapis.com/oauth2/v3/userinfo"
SCOPES             = "openid email profile"


# ── Google OAuth initiation ────────────────────────────────────────────────

@auth_bp.get("/google")
def google_login():
    params = {
        "client_id":     os.getenv("GOOGLE_CLIENT_ID"),
        "redirect_uri":  os.getenv("GOOGLE_REDIRECT_URI"),
        "response_type": "code",
        "scope":         SCOPES,
        "access_type":   "offline",
        "prompt":        "select_account",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return redirect(f"{GOOGLE_AUTH_URL}?{query}")


# ── Google OAuth callback ──────────────────────────────────────────────────

@auth_bp.get("/google/callback")
def google_callback():
    code = request.args.get("code")
    if not code:
        return redirect(
            f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/auth/error?msg=no_code"
        )

    # Exchange code for tokens
    token_res = http.post(GOOGLE_TOKEN_URL, data={
        "code":          code,
        "client_id":     os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "redirect_uri":  os.getenv("GOOGLE_REDIRECT_URI"),
        "grant_type":    "authorization_code",
    }, timeout=10)

    if not token_res.ok:
        return redirect(
            f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/auth/error?msg=token_exchange_failed"
        )

    google_access = token_res.json().get("access_token")

    # Fetch user info from Google
    user_res = http.get(GOOGLE_USERINFO, headers={"Authorization": f"Bearer {google_access}"}, timeout=10)
    if not user_res.ok:
        return redirect(
            f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/auth/error?msg=userinfo_failed"
        )

    guser = user_res.json()
    email      = guser.get("email", "")
    full_name  = guser.get("name", email)
    avatar_url = guser.get("picture")
    google_id  = guser.get("sub")

    # Upsert user in Supabase
    sb = get_supabase()
    existing = (
        sb.table("users")
        .select("id,email,full_name,role")
        .eq("email", email)
        .execute()
    )

    if existing.data:
        user = existing.data[0]
        # Update last_login and avatar
        sb.table("users").update({
            "last_login": "now()",
            "avatar_url": avatar_url,
            "google_id":  google_id,
        }).eq("id", user["id"]).execute()
    else:
        result = sb.table("users").insert({
            "email":      email,
            "full_name":  full_name,
            "avatar_url": avatar_url,
            "google_id":  google_id,
        }).execute()
        user = result.data[0]

    # Issue JWTs
    access  = create_access_token(user["id"], user["email"])
    refresh = create_refresh_token(user["id"])

    # Redirect to frontend with tokens as query params (frontend stores in memory)
    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")
    return redirect(
        f"{frontend}/auth/callback?access_token={access}&refresh_token={refresh}"
    )


# ── Refresh token ──────────────────────────────────────────────────────────

@auth_bp.post("/refresh")
def refresh():
    data    = request.get_json(silent=True) or {}
    token   = data.get("refresh_token")
    if not token:
        return jsonify({"error": "refresh_token required"}), 400

    payload = decode_token(token)
    if not payload or payload.get("type") != "refresh":
        return jsonify({"error": "Invalid or expired refresh token"}), 401

    user_id = payload["sub"]
    sb = get_supabase()
    res = sb.table("users").select("id,email").eq("id", user_id).single().execute()
    if not res.data:
        return jsonify({"error": "User not found"}), 404

    user   = res.data
    access = create_access_token(user["id"], user["email"])
    return jsonify({"access_token": access})


# ── Current user profile ───────────────────────────────────────────────────

@auth_bp.get("/me")
@jwt_required
def me():
    user_id = g.current_user["id"]
    sb  = get_supabase()
    res = (
        sb.table("users")
        .select("id,email,full_name,avatar_url,role,created_at,last_login")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not res.data:
        return jsonify({"error": "User not found"}), 404
    return jsonify(res.data)


# ── Logout (client discards token; optionally invalidate server-side) ──────

@auth_bp.post("/logout")
@jwt_required
def logout():
    # With stateless JWTs, logout is handled client-side.
    # Add a token blocklist here if needed.
    return jsonify({"message": "Logged out successfully"})
