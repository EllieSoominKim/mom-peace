from fastapi import APIRouter

from app.schemas.nutrition import NutritionOcrRequest, NutritionOcrResponse
from app.services import gemini_client

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