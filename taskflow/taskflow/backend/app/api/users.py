"""
Users Blueprint
Routes:
  GET  /api/users        → list all users (for assignment dropdowns)
  GET  /api/users/<id>   → get user by id
"""
from flask import Blueprint, jsonify, request, g
from app.utils.supabase_client import get_supabase
from app.utils.jwt_helper import jwt_required

users_bp = Blueprint("users", __name__)


@users_bp.get("")
@jwt_required
def list_users():
    sb = get_supabase()
    search = request.args.get("search", "").strip()
    q = sb.table("users").select("id,email,full_name,avatar_url,role").eq("is_active", True)
    if search:
        q = q.ilike("full_name", f"%{search}%")
    res = q.order("full_name").execute()
    return jsonify({"users": res.data or []})


@users_bp.get("/<user_id>")
@jwt_required
def get_user(user_id: str):
    sb  = get_supabase()
    res = (
        sb.table("users")
        .select("id,email,full_name,avatar_url,role,created_at")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not res.data:
        return jsonify({"error": "User not found"}), 404
    return jsonify(res.data)
