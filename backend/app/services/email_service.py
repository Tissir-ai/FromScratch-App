import os
import asyncio
import smtplib
from email.message import EmailMessage
from typing import Optional
from app.core.observability import logger
from app.core.config import get_settings
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
    print("\n=== send_task_assignment_email called ===")
    print(f"Received payload type: {type(data)}")
    print(f"Payload data: {data}")
    
    try:
        # Extract assignee information from payload
        if not isinstance(data, dict):
            print("❌ Error: Payload is not a dictionary")
            logger.warning("Email service received non-dict payload; skipping email send")
            return False

 
        assignee_email = data.get("email")
        print(f"Assignee email: {assignee_email}")
        
        if not assignee_email:
            print("❌ Error: No email found in assignee object")
            logger.warning("No email found for assignee; skipping email send")
            return False

        assignee_name = data.get("name", "there")
        title = data.get("title") or "Task"
        description = data.get("description", "")
        due = data.get("due_date", None)
        
        print(f"✓ Email details extracted:")
        print(f"  - Name: {assignee_name}")
        print(f"  - Email: {assignee_email}")
        print(f"  - Title: {title}")
        print(f"  - Description: {description[:50]}..." if len(description) > 50 else f"  - Description: {description}")
        print(f"  - Due date: {due}")

        settings = get_settings()
        gmail_user = settings.gmail_user
        gmail_pass = settings.gmail_app_password
        
        if not gmail_user or not gmail_pass:
            print("❌ Error: Gmail credentials not configured")
            print(f"  - GMAIL_USER: {'✓ Set' if gmail_user else '✗ Not set'}")
            print(f"  - GMAIL_APP_PASSWORD: {'✓ Set' if gmail_pass else '✗ Not set'}")
            logger.warning("Gmail credentials not configured (GMAIL_USER/GMAIL_APP_PASSWORD); skipping email send")
            return False
        
        print(f"✓ Gmail credentials found (user: {gmail_user})")

        # Compose simple email
        print("\n📧 Composing email...")
        msg = EmailMessage()
        msg["From"] = gmail_user
        msg["To"] = str(assignee_email)
        msg["Subject"] = f"Assigned: {title}"

        body_lines = [f"Hello {assignee_name},", "", f"You have been assigned a task: {title}", "", f"Description: {description}"]
        if due:
            body_lines.append(f"Due date: {due}")
        body_lines.append("")
        body_lines.append("--\nFrom FromScratch")
        msg.set_content("\n".join(body_lines))
        
        print(f"  From: {gmail_user}")
        print(f"  To: {assignee_email}")
        print(f"  Subject: Assigned: {title}")

        # Send synchronously in a thread to avoid blocking the event loop
        print("\n📤 Attempting to send email...")
        
        def _send():
            try:
                print("  Connecting to Gmail SMTP server...")
                with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                    print("  Logging in...")
                    smtp.login(gmail_user, gmail_pass)
                    print("  Sending message...")
                    smtp.send_message(msg)
                    print("  ✓ Message sent successfully!")
                return True
            except Exception as e:
                print(f"  ❌ Error sending email: {str(e)}")
                # log but don't expose secrets
                logger.exception("Failed to send task assignment email")
                return False

        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(None, _send)
        
        if result:
            print(f"\n✅ Email successfully sent to {assignee_email}")
            logger.info("Task assignment email sent to %s", assignee_email)
        else:
            print(f"\n❌ Failed to send email to {assignee_email}")
        
        print("=== send_task_assignment_email completed ===\n")
        return bool(result)

    except Exception as exc:
        print(f"\n❌ Unexpected error in send_task_assignment_email: {str(exc)}")
        print(f"Exception type: {type(exc).__name__}")
        logger.exception("Unexpected error sending task assignment email: %s", exc)
        print("=== send_task_assignment_email failed ===\n")
        return False