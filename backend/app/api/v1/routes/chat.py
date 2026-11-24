"""
POST /chat: the CampusConnect assistant.

Logged-in users only, rate limited per user, and capped per day across all
users (CHAT_DAILY_LIMIT). Message text is not logged.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.chat import MAX_MESSAGES, ChatRequest, ChatResponse
from app.services import chatbot

router = APIRouter(tags=["Chat assistant"])
logger = logging.getLogger(__name__)


@router.post("/chat", response_model=ChatResponse)
def chat(data: ChatRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    limiter.hit(f"chat-user:{user.id}", limit=10, window_seconds=300)
    # One person can't use up the whole site's daily Gemini budget.
    limiter.hit(f"chat-user-day:{user.id}", limit=50, window_seconds=86_400)
    # Only the latest turns are sent to Gemini: keeps requests small and cheap.
    messages = [m.model_dump() for m in data.messages[-MAX_MESSAGES:]]
    try:
        text, tools_used = chatbot.reply(db, user, messages)
    except chatbot.ChatUnavailable as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    logger.info("Chat answered", extra={"tools": ",".join(tools_used) or "-", "turns": len(messages)})
    return {"reply": text}
