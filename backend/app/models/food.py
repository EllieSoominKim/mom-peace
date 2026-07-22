from datetime import datetime

from sqlalchemy import DateTime, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class FoodItem(Base):
    """
    식품 정보 DB
    1차 파이프라인(푸드QR) 또는 fallback(바코드연계+원재료+영양성분) 결과를 캐싱해서 저장.
    한 번 조회된 바코드는 재조회 없이 DB에서 바로 응답 가능하도록 캐시 역할을 겸함.
    """

    __tablename__ = "food_items"

    barcode: Mapped[str] = mapped_column(String(30), primary_key=True)
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)

    ingredients: Mapped[str] = mapped_column(String(1000), default="")  # 원재료명
    allergens: Mapped[str] = mapped_column(String(300), default="")  # 알레르기 유발 성분 (콤마 구분)
    caffeine_mg: Mapped[float] = mapped_column(Float, default=0)
    sugar_g: Mapped[float] = mapped_column(Float, default=0)
    sodium_mg: Mapped[float] = mapped_column(Float, default=0)
    caution_note: Mapped[str] = mapped_column(String(500), default="")  # 식품표시 주의사항

    category: Mapped[str] = mapped_column(String(50), default="")  # 대체메뉴 매칭용 카테고리 (예: 커피)
    source_pipeline: Mapped[str] = mapped_column(String(20), default="primary")  # primary | fallback

    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
