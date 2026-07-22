from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.guide import WeeklyGuide
from app.schemas.guide import GuideItem, WeeklyGuideResponse

router = APIRouter(prefix="/guide", tags=["guide"])


@router.get("/{week}", response_model=WeeklyGuideResponse)
def get_weekly_guide(week: int, db: Session = Depends(get_db)):
    guide = (
        db.query(WeeklyGuide)
        .filter(WeeklyGuide.week_start <= week, WeeklyGuide.week_end >= week)
        .first()
    )
    if not guide:
        raise HTTPException(status_code=404, detail="해당 주차의 가이드 정보가 아직 없어요.")

    return WeeklyGuideResponse(
        week=week,
        stage=guide.stage,
        health_info=guide.health_info,
        life_caution=guide.life_caution,
        exercise=GuideItem(icon="🚶‍♀️", title=guide.exercise_title, desc=guide.exercise_desc),
        nutrient=GuideItem(icon="🥬", title=guide.nutrient_title, desc=guide.nutrient_desc),
    )
