from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.diary import DiaryEntry
from app.models.user import User
from app.schemas.diary import DiaryDayResponse, DiaryEntryCreate, DiaryEntryResponse, NutrientSummary

router = APIRouter(prefix="/diary", tags=["diary"])

# 임산부 1일 권장 허용량 (기준값 — 추후 주차별로 세분화 가능)
DAILY_LIMITS = {"caffeine": 200, "sugar": 50, "sodium": 2000}


@router.get("", response_model=DiaryDayResponse)
def get_today_diary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entries = (
        db.query(DiaryEntry)
        .filter(DiaryEntry.user_id == current_user.id, DiaryEntry.entry_date == date.today())
        .order_by(DiaryEntry.logged_at.asc())
        .all()
    )

    def total(field):
        return sum(getattr(e, field) for e in entries)

    return DiaryDayResponse(
        date=date.today(),
        entries=[
            DiaryEntryResponse(id=e.id, time=e.logged_at.strftime("%H:%M"), name=e.food_name, kcal=e.kcal)
            for e in entries
        ],
        caffeine=NutrientSummary(current=total("caffeine_mg"), max=DAILY_LIMITS["caffeine"], unit="mg"),
        sugar=NutrientSummary(current=total("sugar_g"), max=DAILY_LIMITS["sugar"], unit="g"),
        sodium=NutrientSummary(current=total("sodium_mg"), max=DAILY_LIMITS["sodium"], unit="mg"),
    )


@router.post("", response_model=DiaryEntryResponse)
def add_diary_entry(
    payload: DiaryEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = DiaryEntry(user_id=current_user.id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return DiaryEntryResponse(id=entry.id, time=entry.logged_at.strftime("%H:%M"), name=entry.food_name, kcal=entry.kcal)
