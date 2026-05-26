"""
Tasks Blueprint – full CRUD + assignment + status transitions.
Routes:
  GET    /api/tasks           → list tasks (with filters)
  POST   /api/tasks           → create task
  GET    /api/tasks/<id>      → get single task
  PATCH  /api/tasks/<id>      → update task
  DELETE /api/tasks/<id>      → delete task
  PATCH  /api/tasks/<id>/status  → quick status update
  POST   /api/tasks/<id>/assign  → assign to user
"""
import threading
from flask import Blueprint, request, jsonify, g

from app.utils.supabase_client import get_supabase
from app.utils.jwt_helper import jwt_required
from app.utils.validators import validate_task_payload
from app.services.email_service import (
    send_task_assigned_email,
    send_task_completed_email,
)

tasks_bp = Blueprint("tasks", __name__)


# ── List / filter tasks ────────────────────────────────────────────────────

@tasks_bp.get("")
@jwt_required
def list_tasks():
    user_id  = g.current_user["id"]
    sb       = get_supabase()

    q = sb.table("tasks").select(
        "*, creator:creator_id(id,full_name,avatar_url,email), "
        "assignee:assignee_id(id,full_name,avatar_url,email)"
    ).or_(f"creator_id.eq.{user_id},assignee_id.eq.{user_id}")

    # Optional filters
    status   = request.args.get("status")
    priority = request.args.get("priority")
    search   = request.args.get("search", "").strip()

    if status:
        q = q.eq("status", status)
    if priority:
        q = q.eq("priority", priority)
    if search:
        q = q.ilike("title", f"%{search}%")

    q = q.eq("is_archived", False).order("created_at", desc=True)
    res = q.execute()
    return jsonify({"tasks": res.data or [], "count": len(res.data or [])})


# ── Create task ────────────────────────────────────────────────────────────

@tasks_bp.post("")
@jwt_required
def create_task():
    user_id = g.current_user["id"]
    data    = request.get_json(silent=True) or {}

    errors = validate_task_payload(data)
    if errors:
        return jsonify({"error": "Validation failed", "detail": errors}), 422

    payload = {
        "title":       data["title"].strip(),
        "description": data.get("description", ""),
        "due_date":    data.get("due_date"),
        "priority":    data.get("priority", "medium"),
        "status":      data.get("status", "todo"),
        "creator_id":  user_id,
        "assignee_id": data.get("assignee_id"),
        "tags":        data.get("tags", []),
    }

    sb  = get_supabase()
    res = sb.table("tasks").insert(payload).execute()
    if not res.data:
        return jsonify({"error": "Failed to create task"}), 500

    task = res.data[0]

    # Send assignment email in background if assignee != creator
    assignee_id = payload.get("assignee_id")
    if assignee_id and assignee_id != user_id:
        _trigger_assignment_email(sb, task, user_id, assignee_id)

    return jsonify(task), 201


# ── Get single task ────────────────────────────────────────────────────────

@tasks_bp.get("/<task_id>")
@jwt_required
def get_task(task_id: str):
    user_id = g.current_user["id"]
    sb = get_supabase()
    res = (
        sb.table("tasks")
        .select(
            "*, creator:creator_id(id,full_name,avatar_url,email), "
            "assignee:assignee_id(id,full_name,avatar_url,email)"
        )
        .eq("id", task_id)
        .single()
        .execute()
    )
    if not res.data:
        return jsonify({"error": "Task not found"}), 404

    task = res.data
    if task["creator_id"] != user_id and task.get("assignee_id") != user_id:
        return jsonify({"error": "Forbidden"}), 403

    return jsonify(task)


# ── Update task ────────────────────────────────────────────────────────────

@tasks_bp.patch("/<task_id>")
@jwt_required
def update_task(task_id: str):
    user_id = g.current_user["id"]
    sb = get_supabase()

    existing = sb.table("tasks").select("*").eq("id", task_id).single().execute()
    if not existing.data:
        return jsonify({"error": "Task not found"}), 404
    task = existing.data

    if task["creator_id"] != user_id and task.get("assignee_id") != user_id:
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json(silent=True) or {}
    allowed = {"title", "description", "due_date", "priority", "status", "assignee_id", "tags"}
    updates = {k: v for k, v in data.items() if k in allowed}

    if not updates:
        return jsonify({"error": "No updatable fields provided"}), 422

    errors = validate_task_payload({**task, **updates})
    if errors:
        return jsonify({"error": "Validation failed", "detail": errors}), 422

    res = sb.table("tasks").update(updates).eq("id", task_id).execute()
    updated = res.data[0] if res.data else task

    # Email: new assignee
    new_assignee = updates.get("assignee_id")
    if new_assignee and new_assignee != task.get("assignee_id") and new_assignee != user_id:
        _trigger_assignment_email(sb, updated, user_id, new_assignee)

    # Email: task completed
    if updates.get("status") == "done" and task["status"] != "done":
        _trigger_completion_email(sb, updated, user_id)

    return jsonify(updated)


# ── Quick status patch ─────────────────────────────────────────────────────

@tasks_bp.patch("/<task_id>/status")
@jwt_required
def update_status(task_id: str):
    user_id = g.current_user["id"]
    data    = request.get_json(silent=True) or {}
    status  = data.get("status")

    from app.utils.validators import VALID_STATUSES
    if status not in VALID_STATUSES:
        return jsonify({"error": f"status must be one of {sorted(VALID_STATUSES)}"}), 422

    sb  = get_supabase()
    res = sb.table("tasks").update({"status": status}).eq("id", task_id).execute()
    if not res.data:
        return jsonify({"error": "Task not found or forbidden"}), 404

    task = res.data[0]
    if status == "done":
        _trigger_completion_email(sb, task, user_id)

    return jsonify(task)


# ── Assign task ────────────────────────────────────────────────────────────

@tasks_bp.post("/<task_id>/assign")
@jwt_required
def assign_task(task_id: str):
    user_id    = g.current_user["id"]
    data       = request.get_json(silent=True) or {}
    assignee_id = data.get("assignee_id")

    if not assignee_id:
        return jsonify({"error": "assignee_id is required"}), 422

    sb = get_supabase()

    # Only creator can reassign
    check = sb.table("tasks").select("creator_id,title").eq("id", task_id).single().execute()
    if not check.data:
        return jsonify({"error": "Task not found"}), 404
    if check.data["creator_id"] != user_id:
        return jsonify({"error": "Only the task creator can reassign"}), 403

    # Update assignee
    sb.table("tasks").update({"assignee_id": assignee_id}).eq("id", task_id).execute()

    # Log assignment history
    sb.table("task_assignments").insert({
        "task_id":     task_id,
        "assigned_by": user_id,
        "assigned_to": assignee_id,
        "note":        data.get("note"),
    }).execute()

    # Create in-app notification
    sb.table("notifications").insert({
        "user_id": assignee_id,
        "type":    "task_assigned",
        "title":   "New Task Assigned",
        "message": f"You have been assigned: {check.data['title']}",
        "task_id": task_id,
    }).execute()

    task = sb.table("tasks").select("*").eq("id", task_id).single().execute().data
    _trigger_assignment_email(sb, task, user_id, assignee_id)

    return jsonify({"message": "Task assigned", "task_id": task_id, "assignee_id": assignee_id})


# ── Delete task ────────────────────────────────────────────────────────────

@tasks_bp.delete("/<task_id>")
@jwt_required
def delete_task(task_id: str):
    user_id = g.current_user["id"]
    sb = get_supabase()

    check = sb.table("tasks").select("creator_id").eq("id", task_id).single().execute()
    if not check.data:
        return jsonify({"error": "Task not found"}), 404
    if check.data["creator_id"] != user_id:
        return jsonify({"error": "Only the creator can delete this task"}), 403

    sb.table("tasks").delete().eq("id", task_id).execute()
    return jsonify({"message": "Task deleted"}), 200


# ── Private helpers ────────────────────────────────────────────────────────

def _trigger_assignment_email(sb, task: dict, assigner_id: str, assignee_id: str) -> None:
    def _send():
        
        try:
            assigner = sb.table("users").select("full_name").eq("id", assigner_id).single().execute().data
            assignee = sb.table("users").select("email,full_name").eq("id", assignee_id).single().execute().data
            if assignee:
                send_task_assigned_email(
                    assignee_email  = assignee["email"],
                    assignee_name   = assignee["full_name"],
                    assigner_name   = assigner["full_name"] if assigner else "Someone",
                    task            = task,
                )
        except Exception as exc:
            import logging
            logging.getLogger(__name__).error("Assignment email error: %s", exc)

    threading.Thread(target=_send, daemon=True).start()


def _trigger_completion_email(sb, task: dict, completer_id: str) -> None:
    def _send():
        try:
            completer = sb.table("users").select("full_name").eq("id", completer_id).single().execute().data
            creator   = sb.table("users").select("email").eq("id", task["creator_id"]).single().execute().data
            if creator:
                send_task_completed_email(
                    creator_email = creator["email"],
                    task          = task,
                    completed_by  = completer["full_name"] if completer else "Someone",
                )
                # In-app notification for creator
                if task["creator_id"] != completer_id:
                    sb.table("notifications").insert({
                        "user_id": task["creator_id"],
                        "type":    "task_completed",
                        "title":   "Task Completed",
                        "message": f'"{task["title"]}" was marked as done.',
                        "task_id": task["id"],
                    }).execute()
        except Exception as exc:
            import logging
            logging.getLogger(__name__).error("Completion email error: %s", exc)

    threading.Thread(target=_send, daemon=True).start()
