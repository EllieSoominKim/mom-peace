from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.food import FoodItem
from app.models.food_alternative import FoodCategoryKeyword, SafeFoodAlternative
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
            sugar_g=c.sugar_g,
        )
        for c in candidates
    ]

    return AlternativesResponse(category=category, items=items)


def _guess_category(product_name: str, db: Session) -> str:
    """product_name에 등록된 키워드가 포함되어 있으면 해당 카테고리를 반환.
    매칭되는 게 없으면 '기본'으로 폴백."""
    if product_name:
        keywords = db.query(FoodCategoryKeyword).all()
        for kw in keywords:
            if kw.keyword in product_name:
                return kw.category
    return "기본"


@router.get("/by-product", response_model=AlternativesResponse)
def get_alternatives_by_product(
    product_name: str = Query("", alias="productName", description="스캔/검색한 음식 이름. 예: 초코케이크"),
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """
    스캔 결과 화면 '대체 메뉴 보기'에서 사용.
    product_name에서 카테고리를 추정한 뒤, 그 카테고리의 당류·탄수화물
    부담이 적은 안전 대체 음식 DB(SafeFoodAlternative)에서 추천 목록을 반환한다.
    """
    category = _guess_category(product_name, db)

    candidates = (
        db.query(SafeFoodAlternative)
        .filter(SafeFoodAlternative.category == category)
        .order_by(SafeFoodAlternative.sugar_g.asc())
        .limit(limit)
        .all()
    )

    if not candidates and category != "기본":
        # 혹시 해당 카테고리에 데이터가 없으면 기본 카테고리로 폴백
        category = "기본"
        candidates = (
            db.query(SafeFoodAlternative)
            .filter(SafeFoodAlternative.category == category)
            .order_by(SafeFoodAlternative.sugar_g.asc())
            .limit(limit)
            .all()
        )

    items = [
        AlternativeItem(
            id=str(c.id),
            name=c.name,
            reason=c.reason,
            level=c.level,
            sugar_g=c.sugar_g,
            carb_g=c.carb_g,
            kcal=c.kcal,
        )
        for c in candidates
    ]

    return AlternativesResponse(category=category, items=items)