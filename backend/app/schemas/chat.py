from app.schemas.base import CamelModel


class ChatRequest(CamelModel):
    message: str
    pregnancy_week: int | None = None
    # 어느 화면에서 열었는지 (예: "스캔 결과 - 카페모카", "홈 화면")
    context: str | None = None


class ChatResponse(CamelModel):
    reply: str