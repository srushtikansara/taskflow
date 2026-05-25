"""
Email Service – sends HTML emails via Gmail SMTP.
All public methods are fire-and-forget (log errors, never raise).
"""
import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

log = logging.getLogger(__name__)


# ── HTML Templates ─────────────────────────────────────────────────────────

_BASE = """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{subject}</title>
<style>
  body {{ font-family: 'Segoe UI', Tahoma, sans-serif; background:#f4f6f9;
         margin:0; padding:0; }}
  .wrapper {{ max-width:600px; margin:40px auto; }}
  .card {{ background:#ffffff; border-radius:12px; overflow:hidden;
           box-shadow:0 2px 12px rgba(0,0,0,.08); }}
  .header {{ background:linear-gradient(135deg,#2563eb,#7c3aed);
             padding:32px 40px; }}
  .header h1 {{ color:#fff; margin:0; font-size:24px; font-weight:700; }}
  .header p  {{ color:rgba(255,255,255,.75); margin:6px 0 0; font-size:14px; }}
  .body {{ padding:32px 40px; }}
  .body p {{ color:#374151; font-size:15px; line-height:1.6; margin:0 0 16px; }}
  .badge {{ display:inline-block; padding:4px 12px; border-radius:999px;
            font-size:12px; font-weight:600; text-transform:uppercase;
            letter-spacing:.05em; }}
  .badge-high   {{ background:#fee2e2; color:#dc2626; }}
  .badge-medium {{ background:#fef3c7; color:#d97706; }}
  .badge-low    {{ background:#d1fae5; color:#059669; }}
  .badge-urgent {{ background:#fce7f3; color:#db2777; }}
  .task-box {{ background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;
               padding:20px 24px; margin:20px 0; }}
  .task-box h2 {{ margin:0 0 8px; font-size:17px; color:#111827; }}
  .meta {{ font-size:13px; color:#6b7280; margin:4px 0; }}
  .btn {{ display:inline-block; background:#2563eb; color:#fff !important;
          padding:12px 28px; border-radius:8px; text-decoration:none;
          font-weight:600; font-size:14px; margin-top:8px; }}
  .footer {{ padding:20px 40px; border-top:1px solid #f3f4f6; }}
  .footer p {{ font-size:12px; color:#9ca3af; margin:0; }}
</style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <h1>TaskFlow</h1>
      <p>Your intelligent task management platform</p>
    </div>
    <div class="body">
      {content}
    </div>
    <div class="footer">
      <p>You received this email because you are a member of TaskFlow.
         Please do not reply to this email.</p>
    </div>
  </div>
</div>
</body>
</html>
"""


def _task_assigned_html(task: dict, assignee_name: str, assigner_name: str) -> str:
    priority = task.get("priority", "medium")
    due = task.get("due_date", "No due date")
    if due and due != "No due date":
        from datetime import datetime
        try:
            due = datetime.fromisoformat(due.replace("Z", "+00:00")).strftime("%b %d, %Y")
        except Exception:
            pass

    content = f"""
    <p>Hi <strong>{assignee_name}</strong>,</p>
    <p><strong>{assigner_name}</strong> has assigned you a new task on TaskFlow.</p>
    <div class="task-box">
      <h2>{task.get('title', 'Untitled Task')}</h2>
      <p class="meta">{task.get('description') or 'No description provided.'}</p>
      <p class="meta" style="margin-top:12px;">
        Priority: <span class="badge badge-{priority}">{priority}</span>
      </p>
      <p class="meta">Due Date: <strong>{due}</strong></p>
    </div>
    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard/tasks/{task.get('id', '')}"
       class="btn">View Task →</a>
    """
    return _BASE.format(subject="New Task Assigned", content=content)


def _task_completed_html(task: dict, completed_by: str) -> str:
    content = f"""
    <p>Great news!</p>
    <p><strong>{completed_by}</strong> has marked the following task as
       <strong>completed</strong>.</p>
    <div class="task-box">
      <h2>{task.get('title', 'Untitled Task')}</h2>
      <p class="meta">{task.get('description') or ''}</p>
    </div>
    <a href="{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard/tasks/{task.get('id', '')}"
       class="btn">View Task →</a>
    """
    return _BASE.format(subject="Task Completed", content=content)


# ── SMTP sender ────────────────────────────────────────────────────────────

def _send(to: str, subject: str, html: str) -> bool:
    sender = os.getenv("GMAIL_SENDER", "")
    password = os.getenv("GMAIL_APP_PASSWORD", "")
    if not sender or not password:
        log.warning("Gmail credentials not configured – skipping email")
        return False

    msg = MIMEMultipart("alternative")
    msg["From"]    = f"TaskFlow <{sender}>"
    msg["To"]      = to
    msg["Subject"] = f"[TaskFlow] {subject}"
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(sender, password)
            server.sendmail(sender, to, msg.as_string())
        log.info("Email sent to %s | subject=%s", to, subject)
        return True
    except smtplib.SMTPAuthenticationError:
        log.error("Gmail SMTP auth failed – check GMAIL_APP_PASSWORD")
    except Exception as exc:
        log.error("Failed to send email to %s: %s", to, exc)
    return False


# ── Public API ─────────────────────────────────────────────────────────────

def send_task_assigned_email(
    assignee_email: str,
    assignee_name: str,
    assigner_name: str,
    task: dict,
) -> bool:
    html = _task_assigned_html(task, assignee_name, assigner_name)
    return _send(assignee_email, "New Task Assigned", html)


def send_task_completed_email(
    creator_email: str,
    task: dict,
    completed_by: str,
) -> bool:
    html = _task_completed_html(task, completed_by)
    return _send(creator_email, "Task Completed", html)
