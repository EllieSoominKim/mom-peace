from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class FoodNutritionInfo(Base):
    """
    '외식·집밥 메뉴 검색' 화면용 음식별 예상 영양정보(1인분 기준) DB.
    name/aliases에 검색어가 포함되어 있으면 매칭되는 항목으로 간주한다.
    """

    __tablename__ = "food_nutrition_info"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    aliases: Mapped[str] = mapped_column(String(300), default="")  # '|' 구분
    carb_g: Mapped[float] = mapped_column(Float, default=0)
    sugar_g: Mapped[float] = mapped_column(Float, default=0)
    kcal: Mapped[float] = mapped_column(Float, default=0)