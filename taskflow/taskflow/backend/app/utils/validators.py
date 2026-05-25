"""
Input validators – used by API blueprints to validate request bodies.
"""
import re
from datetime import datetime
from typing import Any


EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")

VALID_PRIORITIES = {"low", "medium", "high", "urgent"}
VALID_STATUSES   = {"todo", "in_progress", "review", "done", "cancelled"}


def validate_task_payload(data: dict[str, Any]) -> list[str]:
    """Return a list of validation error messages (empty = valid)."""
    errors: list[str] = []

    title = data.get("title", "")
    if not isinstance(title, str) or not title.strip():
        errors.append("title is required")
    elif len(title) > 255:
        errors.append("title must be ≤ 255 characters")

    priority = data.get("priority", "medium")
    if priority not in VALID_PRIORITIES:
        errors.append(f"priority must be one of {sorted(VALID_PRIORITIES)}")

    status = data.get("status", "todo")
    if status not in VALID_STATUSES:
        errors.append(f"status must be one of {sorted(VALID_STATUSES)}")

    due_date = data.get("due_date")
    if due_date:
        try:
            datetime.fromisoformat(due_date.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            errors.append("due_date must be an ISO-8601 datetime string")

    return errors


def validate_email(email: str) -> bool:
    return bool(EMAIL_RE.match(email))
