import os
import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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

        # Compose email with both plain text and HTML for better UX
        print("\n📧 Composing email...")
        msg = MIMEMultipart("alternative")
        msg["From"] = gmail_user
        msg["To"] = str(assignee_email)
        msg["Subject"] = f"Assigned: {title}"

        body_lines = [
            f"Hello {assignee_name},",
            "",
            f"You have been assigned a task: {title}",
            "",
            f"Description: {description}",
        ]
        if due:
            body_lines.append(f"Due date: {due}")
        body_lines.append("")
        body_lines.append("--\nFrom FromScratch")

        text_body = "\n".join(body_lines)

        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif;
                    background: #f7f5f2;
                    margin: 0;
                    padding: 24px;
                    color: #1f2937;
                }}
                .wrapper {{
                    max-width: 640px;
                    margin: 0 auto;
                }}
                .card {{
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 12px 35px rgba(17, 24, 39, 0.08);
                    overflow: hidden;
                    border: 1px solid #f0ede7;
                }}
                .header {{
                    background: linear-gradient(135deg, #ff7a1a 0%, #ff974d 100%);
                    color: #ffffff;
                    padding: 24px;
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                }}
                .content {{
                    padding: 24px;
                }}
                .row {{
                    margin-bottom: 12px;
                }}
                .label {{
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: #9ca3af;
                    margin-bottom: 4px;
                }}
                .value {{
                    font-size: 16px;
                    color: #111827;
                    line-height: 1.6;
                }}
                .badge {{
                    display: inline-block;
                    background: rgba(255, 122, 26, 0.12);
                    color: #c65b0c;
                    border-radius: 999px;
                    padding: 6px 12px;
                    font-weight: 600;
                    font-size: 13px;
                    margin-top: 8px;
                }}
                .footer {{
                    padding: 18px 24px 22px;
                    background: #fcfbf9;
                    font-size: 12px;
                    color: #6b7280;
                    border-top: 1px solid #f0ede7;
                }}
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="card">
                    <div class="header">New Task Assigned</div>
                    <div class="content">
                        <div class="row">
                            <div class="label">Hello</div>
                            <div class="value">{assignee_name}, you have been assigned a task.</div>
                        </div>
                        <div class="row">
                            <div class="label">Title</div>
                            <div class="value"><span class="badge">{title}</span></div>
                        </div>
                        <div class="row">
                            <div class="label">Details</div>
                            <div class="value">{description or 'No description provided.'}</div>
                        </div>
                        {f'<div class="row"><div class="label">Due date</div><div class="value">{due}</div></div>' if due else ''}
                    </div>
                    <div class="footer">FromScratch · Keep momentum going.</div>
                </div>
            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))
        
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
        return False


async def send_invitation_email(
    recipient_email: str,
    project_name: str,
    invitation_token: str,
    frontend_url: str
) -> bool:
    """
    Send a project invitation email.
    
    Args:
        recipient_email: Email address of the person being invited
        project_name: Name of the project
        invitation_token: JWT token for accepting the invitation
        frontend_url: Frontend base URL for constructing acceptance link
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    settings = get_settings()
    
    if not settings.gmail_user or not settings.gmail_app_password:
        logger.error("Gmail credentials not configured")
        raise ValueError("Email service not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD.")
    
    # Construct acceptance URL
    accept_url = f"{frontend_url}/accept-invitation?token={invitation_token}"
    
    # Create email message
    message = MIMEMultipart("alternative")
    message["Subject"] = f"🎉 You're invited to join {project_name} on FromScratch"
    message["From"] = settings.gmail_user
    message["To"] = recipient_email
    
    # HTML email template
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: #f7f5f2;
                margin: 0;
                padding: 24px;
                color: #1f2937;
            }}
            .wrapper {{
                max-width: 640px;
                margin: 0 auto;
            }}
            .hero {{
                background: linear-gradient(135deg, #ff7a1a 0%, #ff974d 100%);
                border-radius: 16px;
                padding: 32px;
                box-shadow: 0 14px 45px rgba(255, 122, 26, 0.2);
                text-align: center;
                color: #ffffff;
            }}
            .hero h1 {{
                margin: 0 0 8px;
                font-size: 26px;
                letter-spacing: -0.02em;
            }}
            .hero p {{
                margin: 0;
                opacity: 0.92;
                font-size: 15px;
            }}
            .card {{
                margin-top: -18px;
                background: #ffffff;
                border-radius: 16px;
                padding: 28px;
                box-shadow: 0 12px 35px rgba(17, 24, 39, 0.08);
                border: 1px solid #f0ede7;
            }}
            .body-text {{
                font-size: 15px;
                line-height: 1.7;
                color: #111827;
                margin: 0 0 12px;
            }}
            .project-name {{
                color: #d3610f;
                font-weight: 700;
            }}
            .button {{
                display: inline-block;
                padding: 14px 26px;
                background: linear-gradient(135deg, #ff7a1a 0%, #ff974d 100%);
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 10px;
                font-weight: 700;
                letter-spacing: 0.01em;
                box-shadow: 0 10px 28px rgba(255, 122, 26, 0.25);
                transition: transform 0.18s ease, box-shadow 0.18s ease;
                margin: 18px 0;
            }}
            .button:hover {{
                transform: translateY(-1px);
                box-shadow: 0 14px 32px rgba(255, 122, 26, 0.32);
            }}
            .meta {{
                font-size: 13px;
                color: #6b7280;
                margin-top: 12px;
            }}
            .divider {{
                border: none;
                border-top: 1px solid #f0ede7;
                margin: 24px 0 16px;
            }}
            .fallback {{
                font-size: 13px;
                color: #374151;
                line-height: 1.6;
            }}
            .fallback a {{
                color: #d3610f;
                word-break: break-all;
            }}
            .footer {{
                margin-top: 20px;
                font-size: 12px;
                color: #6b7280;
                text-align: center;
                line-height: 1.5;
            }}
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="hero">
                <h1>🎉 Project Invitation</h1>
                <p>Join {project_name} on FromScratch</p>
            </div>
            <div class="card">
                <p class="body-text">Hello!</p>
                <p class="body-text">You've been invited to collaborate on <span class="project-name">{project_name}</span> in FromScratch.</p>
                <p class="body-text">Click below to accept your invitation and join the team as a <strong>Visitor</strong>.</p>

                <a href="{accept_url}" class="button">Accept Invitation</a>

                <p class="meta">This invitation expires in 5 days.</p>

                <hr class="divider">

                <p class="fallback">If the button does not work, copy and paste this link into your browser:<br>
                <a href="{accept_url}">{accept_url}</a></p>
            </div>

            <div class="footer">
                <p>You received this email because someone invited you to join their project on FromScratch.</p>
                <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                <p>© 2026 FromScratch. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text alternative
    text_content = f"""
    You're invited to join {project_name} on FromScratch!
    
    Click the link below to accept your invitation and join the team as a Visitor:
    {accept_url}
    
    This invitation will expire in 5 days.
    
    If you didn't expect this invitation, you can safely ignore this email.
    
    © 2026 FromScratch. All rights reserved.
    """
    
    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    
    message.attach(part1)
    message.attach(part2)
    
    def _send():
        try:
            # Connect to Gmail SMTP server
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(settings.gmail_user, settings.gmail_app_password)
                server.send_message(message)
            
            logger.info(f"Invitation email sent successfully to {recipient_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send invitation email to {recipient_email}: {str(e)}")
            return False
    
    loop = asyncio.get_running_loop()
    result = await loop.run_in_executor(None, _send)
    return bool(result)
