from app.schemas.base import CamelModel


class CafeMenuItem(CamelModel):
    id: str
    brand: str | None = None
    name: str
    is_generic: bool = False
    caffeine_mg: float
    sugar_g: float
    carb_g: float
    kcal: float


class CafeSearchResponse(CamelModel):
    query: str
    results: list[CafeMenuItem]


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


class FoodNutritionLookupResponse(CamelModel):
    """외식·집밥 메뉴 검색 결과. matched=False면 DB에 없어 기본 추정치를 반환한 것."""

    matched: bool
    name: str
    carb_g: float
    sugar_g: float
    kcal: float