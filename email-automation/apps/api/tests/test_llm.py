import pytest
from unittest.mock import patch, MagicMock
from app.services.llm import personalise


def make_mock_groq(content: str):
    mock_response = MagicMock()
    mock_response.choices[0].message.content = content
    return mock_response


def test_personalise_extracts_subject_from_body():
    mock_content = "Subject: Application for FDE at Google\n\nHi Hiring Team, I am reaching out..."

    with patch("app.services.llm.Groq") as MockGroq:
        instance = MockGroq.return_value
        instance.chat.completions.create.return_value = make_mock_groq(mock_content)

        subject, body = personalise("Hi {{RECRUITER_NAME}}", "Google", "recruiter")

    assert subject == "Application for FDE at Google"
    assert "Hi Hiring Team" in body
    assert "Subject:" not in body


def test_personalise_fallback_subject_when_missing():
    """If LLM doesn't include a Subject: line, use the default fallback."""
    mock_content = "Hi Hiring Team, I am interested in working at Stripe."

    with patch("app.services.llm.Groq") as MockGroq:
        instance = MockGroq.return_value
        instance.chat.completions.create.return_value = make_mock_groq(mock_content)

        subject, body = personalise("Hi {{RECRUITER_NAME}}", "Stripe", "careers")

    assert "Stripe" in subject
    assert "Hi Hiring Team" in body


def test_personalise_passes_correct_model():
    """The configured GROQ_MODEL must be used, not a hardcoded one."""
    with patch("app.services.llm.Groq") as MockGroq:
        instance = MockGroq.return_value
        instance.chat.completions.create.return_value = make_mock_groq("Subject: Test\n\nBody")

        with patch("app.services.llm.settings") as mock_settings:
            mock_settings.GROQ_API_KEY = "test-key"
            mock_settings.GROQ_MODEL   = "qwen/qwen3.8-27b"
            personalise("template", "Notion", "recruiter")

        call_kwargs = instance.chat.completions.create.call_args.kwargs
        assert call_kwargs["model"] == "qwen/qwen3.8-27b"


def test_personalise_careers_inbox_uses_hiring_team():
    """For careers inboxes the system prompt should say 'Hiring Team'."""
    with patch("app.services.llm.Groq") as MockGroq:
        instance = MockGroq.return_value
        instance.chat.completions.create.return_value = make_mock_groq("Subject: S\n\nB")

        personalise("Hi {{RECRUITER_NAME}}", "Anthropic", "careers")

        system_msg = instance.chat.completions.create.call_args.kwargs["messages"][0]["content"]
        assert "Hiring Team" in system_msg or "careers inbox" in system_msg
