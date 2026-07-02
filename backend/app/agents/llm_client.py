"""Gemini LLM client factory."""

import json
import re
from typing import Optional

import structlog
from langchain_google_genai import ChatGoogleGenerativeAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import get_settings

settings = get_settings()
logger = structlog.get_logger(__name__)


def get_llm(
    api_key: Optional[str] = None,
    temperature: float = 0.3,
    model: Optional[str] = None,
) -> ChatGoogleGenerativeAI:
    """Return a configured Gemini LLM instance."""
    return ChatGoogleGenerativeAI(
        model=model or settings.gemini_model,
        google_api_key=api_key or settings.gemini_api_key,
        temperature=temperature,
        max_tokens=8192,
        timeout=120,
    )


def extract_json_from_response(text: str) -> dict:
    """Extract JSON object from LLM response, handling markdown code blocks."""
    # Try direct parse first
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Look for ```json ... ``` block
    match = re.search(r"```(?:json)?\s*([\s\S]+?)```", text, re.IGNORECASE)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except json.JSONDecodeError:
            pass

    # Look for first { ... } block
    match = re.search(r"\{[\s\S]+\}", text)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    logger.warning("Could not parse JSON from LLM response", preview=text[:200])
    return {}
