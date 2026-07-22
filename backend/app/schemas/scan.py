from typing import Literal

from app.schemas.base import CamelModel

RiskLevel = Literal["safe", "caution", "danger"]


class FoodLookupResponse(CamelModel):
    """GET /scan/{barcode} 응답 — 식품 정보 DB(캐시) 또는 외부 API 원문 결과"""

    barcode: str
    product_name: str
    ingredients: str
    allergens: str
    caffeine_mg: float
    sugar_g: float
    sodium_mg: float
    caution_note: str
    category: str
    source_pipeline: str  # primary | fallback


NutrientTone = Literal["safe", "caution", "alert"]


class NutrientItem(CamelModel):
    label: str
    value: str
    tone: NutrientTone
    status_label: str  # "안전" | "주의" | "확인 필요"


class AlternativeItem(CamelModel):
    id: str
    name: str
    reason: str
    level: RiskLevel


class ScanAnalyzeRequest(CamelModel):
    barcode: str
    # 로그인 없이도 스캔 테스트가 가능하도록 주차를 직접 넘길 수 있게 함.
    # 값이 없으면 서버가 기본값(20주)으로 판단한다.
    pregnancy_week: int | None = None
    # 테스트 전용: "오늘 이미 섭취한 카페인" 값을 강제로 지정해서 안전/주의/위험
    # 3단계를 실제 바코드 데이터와 무관하게 확인할 수 있게 함. 값이 없으면 평소처럼
    # 실제 오늘 누적(로그인 시) 또는 0(비로그인 시)을 사용한다.
    debug_today_caffeine_mg: float | None = None


class ScanResultResponse(CamelModel):
    """
    프론트 constants/mock-data.ts 의 scanResultMock 과 동일한 필드 구조.
    productName / scannedAt / level / message / nutrients / alternatives
    """

    product_name: str
    barcode: str
    scanned_at: str
    level: RiskLevel
    message: str
    nutrients: list[NutrientItem]
    alternatives: list[AlternativeItem]