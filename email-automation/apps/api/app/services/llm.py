"""
LLM personalisation service — wraps Groq to fill email template placeholders.
"""
import re
from groq import Groq
from app.core.config import settings


def personalise(template: str, company: str, email_type: str) -> tuple[str, str]:
    """
    Fills {{RECRUITER_NAME}}, {{COMPANY_NAME}}, {{ROLE_TITLE}}, {{COMPANY_HIGHLIGHT}}
    in the template for the given company.

    Returns (subject_line, personalised_body).
    """
    client = Groq(api_key=settings.GROQ_API_KEY)

    system_prompt = (
        "You are a professional email writing assistant helping a software engineer "
        "named Anirudh Chauhan send job application emails. "
        "You will receive a template with placeholders:\n"
        "  {{RECRUITER_NAME}}   — first name if known, else 'Hiring Team'\n"
        "  {{COMPANY_NAME}}     — target company name\n"
        "  {{ROLE_TITLE}}       — most relevant open role for an FDE/SDE with AI+systems background\n"
        "  {{COMPANY_HIGHLIGHT}} — 1 specific 10-15 word phrase about what makes this company exciting\n\n"
        "Rules:\n"
        "- Keep the body exactly as given — only replace placeholders.\n"
        "- Return ONLY the completed email (Subject line + body). No commentary."
    )

    recruiter_note = (
        "Use the recruiter's first name if inferable from their email, else 'Hiring Team'."
        if email_type == "recruiter"
        else "Use 'Hiring Team' as the greeting — this is a careers inbox."
    )

    user_prompt = f"""
Company: {company}
Email type: {email_type}
Note: {recruiter_note}

Template:
\"\"\"
{template}
\"\"\"

Fill ONLY the placeholders. Return ONLY the completed email starting from the Subject line.
"""

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=800,
    )

    body = response.choices[0].message.content.strip()

    subject_match = re.match(r"Subject:\s*(.+)\n", body)
    if subject_match:
        subject = subject_match.group(1).strip()
        body    = body[subject_match.end():].strip()
    else:
        subject = f"Application for a role at {company}"

    return subject, body
