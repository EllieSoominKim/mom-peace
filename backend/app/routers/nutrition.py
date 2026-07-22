from fastapi import APIRouter

from app.schemas.nutrition import CafeSearchResponse, NutritionOcrRequest, NutritionOcrResponse
from app.services import cafe_nutrition_client, gemini_client

router = APIRouter(prefix="/nutrition", tags=["nutrition"])


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