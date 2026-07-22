from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.food import FoodItem
from app.schemas.diary import AlternativesResponse
from app.schemas.scan import AlternativeItem

router = APIRouter(prefix="/alternatives", tags=["alternatives"])


@router.get("", response_model=AlternativesResponse)
def get_alternatives(category: str = Query(..., description="예: 커피, 유제품"), db: Session = Depends(get_db)):
    """
    오늘의 추천 화면에서 카테고리 선택 시, 해당 카테고리 내 카페인이 낮은
    (=안전 등급으로 간주) 순서로 추천.
    """
    candidates = (
        db.query(FoodItem)
        .filter(FoodItem.category == category)
        .order_by(FoodItem.caffeine_mg.asc())
        .limit(5)
        .all()
    )

    items = [
        AlternativeItem(
            id=c.barcode,
            name=c.product_name,
            reason=f"카페인 {c.caffeine_mg:.0f}mg / 당류 {c.sugar_g:.0f}g",
            level="safe",
        )
        for c in candidates
    ]

    return AlternativesResponse(category=category, items=items)
