import os
import asyncio
import smtplib
from email.message import EmailMessage
from typing import Optional
from app.core.observability import logger
from app.repositories.users_repo import get_user
from app.domain.task import TaskStructure


async def send_task_assignment_email(data: object) -> bool:
    """Send an email notification to the user about their task assignment.

    The function will try to determine a recipient email from (in order):
    - data.assignee_email or data.get('assignee_email')
    - the User record for data.assignee_id (field 'email' if present)
    - the User.info_id if it looks like an email (contains '@')

    Uses environment variables `GMAIL_USER` and `GMAIL_APP_PASSWORD` to send via
    Gmail SMTP (SSL).
    Returns True on success, False on failure or when no recipient is found.
    """
    try:
        # Extract assignee id / email from payload
        assignee_email: Optional[str] = None
        assignee_id: Optional[str] = None

        if isinstance(data, dict):
            # Prefer nested user.email if provided
            user_obj = data.get("user") or {}
            if user_obj and isinstance(user_obj, dict):
                assignee_email = user_obj.get("email") or assignee_email
                user_first = user_obj.get("first_name")
                user_last = user_obj.get("last_name")
                title = data.get("title") or data.get("name") or "Task"
                description = data.get("description", "")
                due = data.get("due_date", None)
            else:
                return False  # Unsupported nested user object
            
        else:
            return False  # Unsupported payload type

        gmail_user = os.environ.get("GMAIL_USER")
        gmail_pass = os.environ.get("GMAIL_APP_PASSWORD")
        if not gmail_user or not gmail_pass:
            logger.warning("Gmail credentials not configured (GMAIL_USER/GMAIL_APP_PASSWORD); skipping email send")
            return False

        # Compose simple email
        msg = EmailMessage()
        msg["From"] = gmail_user
        msg["To"] = str(assignee_email)
        msg["Subject"] = f"Assigned: {title}"

        body_lines = [f"Hello,", "", f"You have been assigned a task: {title}", "", f"Description: {description}"]
        if due:
            body_lines.append(f"Due date: {due}")
        body_lines.append("")
        body_lines.append("--\nFrom FromScratch")
        msg.set_content("\n".join(body_lines))

        # Send synchronously in a thread to avoid blocking the event loop
        def _send():
            try:
                with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                    smtp.login(gmail_user, gmail_pass)
                    smtp.send_message(msg)
                return True
            except Exception as e:
                # log but don't expose secrets
                logger.exception("Failed to send task assignment email")
                return False

        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(None, _send)
        if result:
            logger.info("Task assignment email sent to %s", assignee_email)
        return bool(result)

    except Exception as exc:
        logger.exception("Unexpected error sending task assignment email: %s", exc)
        return False