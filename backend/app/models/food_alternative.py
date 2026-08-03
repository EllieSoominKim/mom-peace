from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class FoodCategoryKeyword(Base):
    """
    스캔/검색한 음식 이름(productName)에 이 키워드가 포함되어 있으면
    해당 category로 분류한다. (예: '떡볶이' -> '분식')
    같은 category에 여러 키워드를 등록할 수 있다.
    """

    __tablename__ = "food_category_keywords"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    keyword: Mapped[str] = mapped_column(String(50), nullable=False)


class SafeFoodAlternative(Base):
    """
    카테고리별 '당류·탄수화물 부담이 적은' 안전 대체 음식 추천 DB.
    /alternatives/by-product 에서 category로 조회해서 반환한다.
    """

    __tablename__ = "safe_food_alternatives"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    reason: Mapped[str] = mapped_column(String(200), default="")
    sugar_g: Mapped[float] = mapped_column(Float, default=0)
    carb_g: Mapped[float] = mapped_column(Float, default=0)
    kcal: Mapped[float] = mapped_column(Float, default=0)
    level: Mapped[str] = mapped_column(String(20), default="safe")  # safe | caution | danger