from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DiaryEntry(Base):
    """Food Diary — 사용자가 하루 동안 먹은 음식 기록. 당일 누적량 계산의 기준 데이터."""

    __tablename__ = "diary_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    entry_date: Mapped[date] = mapped_column(Date, default=date.today)
    food_name: Mapped[str] = mapped_column(String(200), nullable=False)
    kcal: Mapped[float] = mapped_column(Float, default=0)
    caffeine_mg: Mapped[float] = mapped_column(Float, default=0)
    sugar_g: Mapped[float] = mapped_column(Float, default=0)
    sodium_mg: Mapped[float] = mapped_column(Float, default=0)

    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="diary_entries")
