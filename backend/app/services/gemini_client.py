"""
Gemini API를 이용한 임산부 성분 위험도 판단.

식약처 임산부 안전 기준 데이터(SAFETY_GUIDELINES)를 시스템 프롬프트에 구조화하여 전달하고,
스캔된 성분 + 임신 주차 + 당일 누적 섭취량을 함께 넣어 안전/주의/위험 3단계 판단과
맞춤 코멘트를 JSON 형식으로 받아온다.

GEMINI_API_KEY가 없으면 데모용 규칙 기반 판단으로 대체된다 (실제 서비스에서는 반드시 키 설정 필요).
"""

import json

from app.config import settings

# google.generativeai는 최상단에서 import하면 내부적으로 gRPC 인증 채널을 백그라운드에서
# 초기화하려 시도해 불필요한 네트워크 재시도가 발생할 수 있다.
# GEMINI_API_KEY가 설정되어 실제로 호출이 필요한 시점에만 지연 import 한다.

# TODO: 식약처 임산부 안전 기준 데이터로 구체화 (임신 주차별 카페인/알레르기 등 기준표)
SAFETY_GUIDELINES = """
[임산부 식품 섭취 안전 기준 요약]
- 카페인: 1일 200mg 이하 권장 (커피 1잔 기준 약 95mg)
- 당류: 1일 총열량의 10% 이내 권장
- 나트륨: 1일 2000mg 이하 권장
- 특정 알레르기 유발 성분(우유, 견과류, 갑각류 등)은 개인 알레르기 이력에 따라 위험도가 달라짐
- 미살균 유제품, 날 생선/육류, 특정 허브류(주의 성분)는 임신 중 섭취를 피할 것을 권장
"""

RESPONSE_SCHEMA_PROMPT = """
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.
{
  "level": "safe" | "caution" | "danger",
  "message": "산모에게 보여줄 한국어 코멘트 (2~3문장, 존댓말, 오늘 누적 섭취량과 연결지어 구체적으로)"
}
"""


def _build_prompt(product_name: str, ingredients: str, pregnancy_week: int, today_caffeine_mg: float) -> str:
    return f"""
{SAFETY_GUIDELINES}

[오늘 스캔된 제품]
- 제품명: {product_name}
- 성분: {ingredients}
- 사용자 임신 주차: {pregnancy_week}주
- 오늘 이미 섭취한 누적 카페인: {today_caffeine_mg}mg

위 정보를 바탕으로 이 제품이 현재 임신 주차 기준으로 안전한지 판단해주세요.
{RESPONSE_SCHEMA_PROMPT}
"""


def _mock_analysis(pregnancy_week: int, today_caffeine_mg: float) -> dict:
    level = "danger" if today_caffeine_mg > 150 else "caution" if today_caffeine_mg > 80 else "safe"
    messages = {
        "danger": f"오늘 이미 카페인 {today_caffeine_mg}mg을 섭취하셨어요. 이 제품을 더하면 하루 권장량 200mg을 초과할 수 있어요.",
        "caution": f"오늘 카페인 {today_caffeine_mg}mg을 섭취하셨어요. 잔여 허용량을 확인하고 적당히 즐겨주세요.",
        "safe": f"{pregnancy_week}주차 기준으로 안전하게 섭취 가능한 제품이에요.",
    }
    return {"level": level, "message": messages[level]}


def analyze_risk(product_name: str, ingredients: str, pregnancy_week: int, today_caffeine_mg: float = 0) -> dict:
    if not settings.gemini_api_key:
        return _mock_analysis(pregnancy_week, today_caffeine_mg)

    import google.generativeai as genai  # 실제 호출 시점에만 import

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(
        settings.gemini_model,
        generation_config={"response_mime_type": "application/json"},
    )

    prompt = _build_prompt(product_name, ingredients, pregnancy_week, today_caffeine_mg)

    try:
        response = model.generate_content(prompt)
        data = json.loads(response.text)
        if data.get("level") not in ("safe", "caution", "danger"):
            raise ValueError("invalid level from Gemini response")
        return data
    except Exception:
        # Gemini 호출 실패 시 서비스 중단 대신 규칙 기반 판단으로 안전하게 폴백
        return _mock_analysis(pregnancy_week, today_caffeine_mg)


# ---- 챗봇 ----

CHAT_SYSTEM_PROMPT = """
당신은 '맘편하게' 앱의 임산부 전용 안전 상담 챗봇입니다.
- 항상 한국어 존댓말로, 2~4문장 정도로 간결하게 답하세요.
- 식품 안전, 임신 주차별 건강 정보, 영양, 가벼운 운동에 대해서만 답하세요.
- 의약품 복용 여부 판단은 하지 마세요. 의약품 관련 질문에는
  "이 부분은 의사나 약사와 상담해주세요"라고 안내하세요.
- 확실하지 않은 의학적 판단은 하지 말고, 필요하면 병원 상담을 권하세요.
"""


def _build_chat_prompt(message: str, pregnancy_week: int | None, context: str | None) -> str:
    week_line = f"- 사용자 임신 주차: {pregnancy_week}주" if pregnancy_week else ""
    context_line = f"- 현재 화면 맥락: {context}" if context else ""
    return f"""
{CHAT_SYSTEM_PROMPT}

{SAFETY_GUIDELINES}

[대화 맥락]
{week_line}
{context_line}

[사용자 질문]
{message}

위 질문에 답해주세요.
"""


def _mock_chat_reply(message: str) -> str:
    return (
        "지금은 데모 모드라 정해진 답변만 드릴 수 있어요 :) "
        "실제 서비스에서는 이 자리에 AI가 질문에 맞춰 답변해드려요. "
        f'("{message[:30]}"에 대한 질문 잘 받았어요!)'
    )


def chat_reply(message: str, pregnancy_week: int | None = None, context: str | None = None) -> str:
    if not settings.gemini_api_key:
        return _mock_chat_reply(message)

    import google.generativeai as genai  # 실제 호출 시점에만 import

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.gemini_model)

    prompt = _build_chat_prompt(message, pregnancy_week, context)

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return _mock_chat_reply(message)