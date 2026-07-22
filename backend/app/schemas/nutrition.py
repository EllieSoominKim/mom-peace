from app.schemas.base import CamelModel


class NutritionOcrRequest(CamelModel):
    image_base64: str
    mime_type: str = "image/jpeg"


class NutritionOcrResponse(CamelModel):
    product_name: str
    total_content: float
    kcal: float
    carb_g: float
    sugar_g: float
    sodium_mg: float
    fat_g: float
    protein_g: float