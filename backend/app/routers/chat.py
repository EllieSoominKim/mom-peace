from fastapi import APIRouter, Depends

from app.core.security import get_current_user_optional
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services import gemini_client

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    current_user: User | None = Depends(get_current_user_optional),
):
    pregnancy_week = payload.pregnancy_week
    if current_user and not pregnancy_week:
        pregnancy_week = current_user.pregnancy_week

    reply = gemini_client.chat_reply(
        message=payload.message,
        pregnancy_week=pregnancy_week,
        context=payload.context,
    )
    return ChatResponse(reply=reply)