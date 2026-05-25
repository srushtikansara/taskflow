"""
Notifications Blueprint
Routes:
  GET   /api/notifications         → list user notifications
  PATCH /api/notifications/<id>    → mark as read
  PATCH /api/notifications/read-all → mark all read
  DELETE /api/notifications/<id>   → delete
"""
from flask import Blueprint, jsonify, g
from app.utils.supabase_client import get_supabase
from app.utils.jwt_helper import jwt_required

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.get("")
@jwt_required
def list_notifications():
    user_id = g.current_user["id"]
    sb = get_supabase()
    res = (
        sb.table("notifications")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    unread = sum(1 for n in (res.data or []) if not n["is_read"])
    return jsonify({"notifications": res.data or [], "unread_count": unread})


@notifications_bp.patch("/<notif_id>")
@jwt_required
def mark_read(notif_id: str):
    user_id = g.current_user["id"]
    sb = get_supabase()
    sb.table("notifications").update({"is_read": True}).eq("id", notif_id).eq("user_id", user_id).execute()
    return jsonify({"message": "Marked as read"})


@notifications_bp.patch("/read-all")
@jwt_required
def mark_all_read():
    user_id = g.current_user["id"]
    sb = get_supabase()
    sb.table("notifications").update({"is_read": True}).eq("user_id", user_id).eq("is_read", False).execute()
    return jsonify({"message": "All notifications marked as read"})


@notifications_bp.delete("/<notif_id>")
@jwt_required
def delete_notification(notif_id: str):
    user_id = g.current_user["id"]
    sb = get_supabase()
    sb.table("notifications").delete().eq("id", notif_id).eq("user_id", user_id).execute()
    return jsonify({"message": "Notification deleted"})
