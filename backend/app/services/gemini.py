"""
Minimal Google Gemini client: one generateContent call over httpx.

Uses the REST API directly instead of the google-genai SDK (fewer
dependencies, easy to mock in tests), the same approach as services/razorpay.py.
Docs: https://ai.google.dev/gemini-api/docs/function-calling

The API key goes in the x-goog-api-key header, never in the URL, so it can't
end up in proxy or access logs.
"""

import httpx

from app.core.config import settings

GEMINI_API = "https://generativelanguage.googleapis.com/v1beta"


class GeminiError(Exception):
    """Gemini rejected the request or could not be reached."""


class GeminiRateLimited(GeminiError):
    """Gemini returned 429: the project's quota is used up for now."""


def is_configured() -> bool:
    return bool(settings.GEMINI_API_KEY)


def generate(*, system: str, contents: list[dict], tools: list[dict]) -> dict:
    """Call models/{GEMINI_MODEL}:generateContent and return the parsed JSON response."""
    body = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": contents,
        "tools": [{"functionDeclarations": tools}],
        # Generous cap: on thinking models, reasoning tokens can count toward it.
        "generationConfig": {"maxOutputTokens": 2048},
    }
    try:
        response = httpx.post(
            f"{GEMINI_API}/models/{settings.GEMINI_MODEL}:generateContent",
            headers={"x-goog-api-key": settings.GEMINI_API_KEY},
            json=body,
            timeout=20,
        )
    except httpx.HTTPError as exc:
        raise GeminiError("Could not reach Gemini.") from exc
    if response.status_code == 429:
        raise GeminiRateLimited("Gemini quota exceeded.")
    if response.status_code >= 400:
        raise GeminiError(f"Gemini returned {response.status_code}.")
    try:
        return response.json()
    except ValueError as exc:
        raise GeminiError("Gemini returned a response that isn't JSON.") from exc
