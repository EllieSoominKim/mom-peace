from app.schemas.base import CamelModel


class GuideItem(CamelModel):
    icon: str
    title: str
    desc: str
    href: str = ""


class WeeklyGuideResponse(CamelModel):
    week: int
    stage: str
    health_info: str
    life_caution: str
    exercise: GuideItem
    nutrient: GuideItem
