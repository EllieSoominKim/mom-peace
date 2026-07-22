from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_user_optional
from app.database import get_db
from app.models.food import FoodItem
from app.models.scan_log import ScanLog
from app.models.user import User
from app.schemas.scan import (
    AlternativeItem,
    FoodLookupResponse,
    NutrientItem,
    ScanAnalyzeRequest,
    ScanResultResponse,
)
from app.services import foodqr_client, gemini_client

router = APIRouter(prefix="/scan", tags=["scan"])

DEFAULT_PREGNANCY_WEEK = 20


@router.get("/{barcode}", response_model=FoodLookupResponse)
async def lookup_food(barcode: str, db: Session = Depends(get_db)):
    cached = db.query(FoodItem).filter(FoodItem.barcode == barcode).first()
    if cached:
        return cached

    data = await foodqr_client.fetch_food_by_barcode(barcode)

    # 실제 푸드QR API에서 정상적으로 받아온 결과만 캐싱한다.
    # 목데이터(폴백)를 캐싱하면, 나중에 실제 데이터가 등록되거나 일시적 오류가 해결돼도
    # 예전 가짜 결과가 영구히 남아 바코드-제품명이 계속 안 맞는 문제가 생긴다.
    if data.get("source_pipeline") == "foodqr":
        food = FoodItem(**data)
        db.merge(food)
        db.commit()

    return data


def _today_caffeine_total(db: Session, user_id: int) -> float:
    total = (
        db.query(func.coalesce(func.sum(ScanLog.caffeine_mg), 0))
        .filter(ScanLog.user_id == user_id, func.date(ScanLog.scanned_at) == date.today())
        .scalar()
    )
    return float(total or 0)


def _find_alternatives(db: Session, category: str, exclude_barcode: str, limit: int = 3) -> list[AlternativeItem]:
    candidates = (
        db.query(FoodItem)
        .filter(FoodItem.category == category, FoodItem.barcode != exclude_barcode)
        .order_by(FoodItem.caffeine_mg.asc())
        .limit(limit)
        .all()
    )
    return [
        AlternativeItem(
            id=c.barcode,
            name=c.product_name,
            reason=f"카페인 {c.caffeine_mg:.0f}mg으로 상대적으로 안심하고 즐길 수 있어요",
            level="safe",
        )
        for c in candidates
    ]


def _tone(value: float, caution_at: float, alert_at: float) -> tuple[str, str]:
    """단계별 임계값으로 안전/주의/확인 필요 등급과 라벨을 계산"""
    if value >= alert_at:
        return "alert", "확인 필요"
    if value >= caution_at:
        return "caution", "주의"
    return "safe", "안전"


def _build_nutrients(caffeine_mg: float, sugar_g: float, sodium_mg: float, allergens: str) -> list[NutrientItem]:
    caf_tone, caf_label = _tone(caffeine_mg, caution_at=80, alert_at=150)
    sugar_tone, sugar_label = _tone(sugar_g, caution_at=10, alert_at=25)
    sodium_tone, sodium_label = _tone(sodium_mg, caution_at=300, alert_at=600)

    has_allergen = bool(allergens and allergens.strip())
    allergy_tone = "alert" if has_allergen else "safe"
    allergy_label = "확인 필요" if has_allergen else "안전"
    allergy_value = allergens if has_allergen else "해당 없음"

    return [
        NutrientItem(label="카페인", value=f"{caffeine_mg:.0f}mg", tone=caf_tone, status_label=caf_label),
        NutrientItem(label="당류", value=f"{sugar_g:.0f}g", tone=sugar_tone, status_label=sugar_label),
        NutrientItem(label="나트륨", value=f"{sodium_mg:.0f}mg", tone=sodium_tone, status_label=sodium_label),
        NutrientItem(label="알레르기", value=allergy_value, tone=allergy_tone, status_label=allergy_label),
    ]


@router.post("/analyze", response_model=ScanResultResponse)
async def analyze_scan(
    payload: ScanAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    food = await lookup_food(payload.barcode, db)

    if current_user:
        pregnancy_week = current_user.pregnancy_week or DEFAULT_PREGNANCY_WEEK
        today_caffeine = _today_caffeine_total(db, current_user.id)
    else:
        pregnancy_week = payload.pregnancy_week or DEFAULT_PREGNANCY_WEEK
        today_caffeine = 0

    # 테스트용 오버라이드가 있으면 실제 로그인/누적 여부와 무관하게 그 값을 사용
    if payload.debug_today_caffeine_mg is not None:
        today_caffeine = payload.debug_today_caffeine_mg

    ai_result = gemini_client.analyze_risk(
        product_name=food["product_name"] if isinstance(food, dict) else food.product_name,
        ingredients=food["ingredients"] if isinstance(food, dict) else food.ingredients,
        pregnancy_week=pregnancy_week,
        today_caffeine_mg=today_caffeine,
    )

    product_name = food["product_name"] if isinstance(food, dict) else food.product_name
    caffeine_mg = food["caffeine_mg"] if isinstance(food, dict) else food.caffeine_mg
    sugar_g = food["sugar_g"] if isinstance(food, dict) else food.sugar_g
    sodium_mg = food["sodium_mg"] if isinstance(food, dict) else food.sodium_mg
    allergens = food["allergens"] if isinstance(food, dict) else food.allergens
    category = food["category"] if isinstance(food, dict) else food.category

    if current_user:
        log = ScanLog(
            user_id=current_user.id,
            barcode=payload.barcode,
            product_name=product_name,
            pregnancy_week=pregnancy_week,
            risk_level=ai_result["level"],
            ai_comment=ai_result["message"],
            caffeine_mg=caffeine_mg,
            sugar_g=sugar_g,
            sodium_mg=sodium_mg,
        )
        db.add(log)
        db.commit()

    alternatives = []
    if ai_result["level"] in ("caution", "danger") and category:
        alternatives = _find_alternatives(db, category, payload.barcode)

    return ScanResultResponse(
        product_name=product_name,
        barcode=payload.barcode,
        scanned_at=datetime.now().strftime("%Y.%m.%d. %H:%M"),
        level=ai_result["level"],
        message=ai_result["message"],
        nutrients=_build_nutrients(caffeine_mg, sugar_g, sodium_mg, allergens),
        alternatives=alternatives,
    )