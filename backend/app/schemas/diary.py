from datetime import date

from app.schemas.base import CamelModel
from app.schemas.scan import AlternativeItem


class DiaryEntryCreate(CamelModel):
    food_name: str
    kcal: float = 0
    caffeine_mg: float = 0
    sugar_g: float = 0
    sodium_mg: float = 0


class DiaryEntryResponse(CamelModel):
    id: int
    time: str
    name: str
    kcal: float


class NutrientSummary(CamelModel):
    current: float
    max: float
    unit: str


class DiaryDayResponse(CamelModel):
    date: date
    entries: list[DiaryEntryResponse]
    caffeine: NutrientSummary
    sugar: NutrientSummary
    sodium: NutrientSummary


class AlternativesResponse(CamelModel):
    category: str
    items: list[AlternativeItem]
