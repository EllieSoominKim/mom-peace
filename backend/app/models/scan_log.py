from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ScanLog(Base):
    """
    누적 스캔 기록 DB
    사용자가 스캔/검색한 항목과 해당 시점의 임신 주차, 성분 누적량을 함께 관리.
    맥락 기반 안전 판단(당일 누적 카페인 등) 및 허용량 기반 음식 추천의 기반 데이터.
    """

    __tablename__ = "scan_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    barcode: Mapped[str] = mapped_column(String(30), nullable=True)
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)

    pregnancy_week: Mapped[int] = mapped_column(Integer, default=0)
    risk_level: Mapped[str] = mapped_column(String(10))  # safe | caution | danger
    ai_comment: Mapped[str] = mapped_column(String(1000), default="")

    caffeine_mg: Mapped[float] = mapped_column(Float, default=0)
    sugar_g: Mapped[float] = mapped_column(Float, default=0)
    sodium_mg: Mapped[float] = mapped_column(Float, default=0)

    scanned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="scan_logs")
