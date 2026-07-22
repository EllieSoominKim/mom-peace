from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class WeeklyGuide(Base):
    """
    임신 주차별 가이드 DB
    week_start ~ week_end 구간에 해당하는 건강정보 / 운동 / 영양제 가이드를 자체 구축.
    """

    __tablename__ = "weekly_guides"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    week_start: Mapped[int] = mapped_column(Integer, nullable=False)
    week_end: Mapped[int] = mapped_column(Integer, nullable=False)
    stage: Mapped[str] = mapped_column(String(10))  # 초기 | 중기 | 후기

    health_info: Mapped[str] = mapped_column(String(1000), default="")
    life_caution: Mapped[str] = mapped_column(String(1000), default="")

    exercise_title: Mapped[str] = mapped_column(String(100), default="")
    exercise_desc: Mapped[str] = mapped_column(String(500), default="")

    nutrient_title: Mapped[str] = mapped_column(String(100), default="")
    nutrient_desc: Mapped[str] = mapped_column(String(500), default="")
