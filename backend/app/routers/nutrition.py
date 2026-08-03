from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.food_nutrition import FoodNutritionInfo
from app.schemas.nutrition import (
    CafeSearchResponse,
    FoodNutritionLookupResponse,
    NutritionOcrRequest,
    NutritionOcrResponse,
)
from app.services import cafe_nutrition_client, gemini_client

router = APIRouter(prefix="/nutrition", tags=["nutrition"])

# DB에 없는 음식 이름을 검색했을 때 쓰는 기본 추정치 (1인분 기준, 대략적인 한식 평균)
_DEFAULT_ESTIMATE = {"carb_g": 45.0, "sugar_g": 8.0, "kcal": 320.0}


@router.post("/ocr", response_model=NutritionOcrResponse)
async def analyze_nutrition_label(payload: NutritionOcrRequest):
    result = gemini_client.extract_nutrition_from_image(payload.image_base64, payload.mime_type)
    return NutritionOcrResponse(
        product_name=result["productName"],
        total_content=result["totalContent"],
        kcal=result["kcal"],
        carb_g=result["carbG"],
        sugar_g=result["sugarG"],
        sodium_mg=result["sodiumMg"],
        fat_g=result["fatG"],
        protein_g=result["proteinG"],
    )


@router.get("/cafe-search", response_model=CafeSearchResponse)
async def search_cafe(q: str):
    """
    '오늘의 카페인' 화면용 검색.
    프랜차이즈 카페 메뉴(외식 영양성분DB) + 집/개인 카페용 일반 커피(1잔 기준)를 함께 반환한다.
    """
    result = await cafe_nutrition_client.search_cafe_menu(q)
    return CafeSearchResponse(**result)


@router.get("/lookup", response_model=FoodNutritionLookupResponse)
def lookup_food_nutrition(
    food_name: str = Query("", alias="foodName", description="검색한 음식 이름. 예: 떡볶이"),
    db: Session = Depends(get_db),
):
    """
    '외식·집밥 메뉴 검색' 화면에서 사용.
    음식 이름으로 FoodNutritionInfo DB를 조회해 1인분 기준 탄수화물·당류·열량을 반환한다.
    이름/별칭이 정확히 일치하거나, 검색어가 이름에 포함되거나, 이름이 검색어에 포함되면 매칭으로 간주한다.
    매칭되는 항목이 없으면 matched=False와 함께 일반적인 한식 평균치로 폴백한다.
    """
    query = food_name.strip()
    if query:
        candidates = db.query(FoodNutritionInfo).all()
        for c in candidates:
            names = [c.name, *c.aliases.split("|")] if c.aliases else [c.name]
            if any(n and (n in query or query in n) for n in names):
                return FoodNutritionLookupResponse(
                    matched=True, name=c.name, carb_g=c.carb_g, sugar_g=c.sugar_g, kcal=c.kcal
                )

    return FoodNutritionLookupResponse(matched=False, name=query or "선택한 메뉴", **_DEFAULT_ESTIMATE)