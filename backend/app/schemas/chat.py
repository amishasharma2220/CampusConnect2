from typing import Literal

from pydantic import BaseModel, Field, field_validator

MAX_MESSAGES = 12
MAX_MESSAGE_CHARS = 1000


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    # The browser keeps the conversation and sends it each time; the server
    # stores nothing and only uses the last MAX_MESSAGES turns.
    messages: list[ChatMessage] = Field(min_length=1, max_length=200)

    @field_validator("messages")
    @classmethod
    def _last_is_a_short_user_message(cls, messages: list[ChatMessage]) -> list[ChatMessage]:
        last = messages[-1]
        if last.role != "user":
            raise ValueError("The last message must be from the user.")
        if not last.content.strip():
            raise ValueError("Message can't be empty.")
        if len(last.content) > MAX_MESSAGE_CHARS:
            raise ValueError(f"Keep messages under {MAX_MESSAGE_CHARS} characters.")
        return messages


class ChatResponse(BaseModel):
    reply: str
