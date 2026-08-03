"""
개발 편의를 위한 초기 데이터 시드 스크립트.
실행: python -m app.seed
- 주차별 가이드 샘플 3구간 (초/중/후기)
- 대체 메뉴 매칭용 식품 샘플 (커피 카테고리)
- 카테고리별 안전 대체 음식 추천 DB (카테고리 20개, 음식 120개)
- 외식·집밥 메뉴 검색용 음식 영양정보 DB (CSV에서 로드, 40개)
"""

import csv
from pathlib import Path

from app.database import Base, SessionLocal, engine
from app.data.food_alternatives_data import CATEGORY_KEYWORDS, SAFE_ALTERNATIVES
from app.models.food import FoodItem
from app.models.food_alternative import FoodCategoryKeyword, SafeFoodAlternative
from app.models.food_nutrition import FoodNutritionInfo
from app.models.guide import WeeklyGuide

Base.metadata.create_all(bind=engine)

FOOD_NUTRITION_CSV = Path(__file__).parent / "data" / "food_nutrition.csv"


def seed():
    db = SessionLocal()
    try:
        if db.query(WeeklyGuide).count() == 0:
            db.add_all(
                [
                    WeeklyGuide(
                        week_start=1, week_end=12, stage="초기",
                        health_info="입덧이 심할 수 있는 시기예요. 소량씩 자주 먹는 것이 도움이 돼요.",
                        life_caution="무리한 운동, 카페인 과다 섭취를 피해주세요.",
                        exercise_title="가벼운 스트레칭 10분",
                        exercise_desc="컨디션이 좋은 시간대에 가볍게 스트레칭 해보세요.",
                        nutrient_title="오늘은 엽산이 필요해요",
                        nutrient_desc="시금치, 브로콜리, 아스파라거스로 채워보세요.",
                    ),
                    WeeklyGuide(
                        week_start=13, week_end=27, stage="중기",
                        health_info="태동을 느끼기 시작하는 시기예요. 안정기에 접어들어요.",
                        life_caution="장시간 서 있는 자세는 피하고 자주 스트레칭 해주세요.",
                        exercise_title="가벼운 걷기 15분",
                        exercise_desc="중기에는 혈액순환에 좋은 가벼운 유산소 운동을 추천해요.",
                        nutrient_title="오늘은 철분이 필요해요",
                        nutrient_desc="시금치, 소고기, 두부로 채워보세요.",
                    ),
                    WeeklyGuide(
                        week_start=28, week_end=40, stage="후기",
                        health_info="부종과 요통이 심해질 수 있는 시기예요.",
                        life_caution="장거리 이동은 피하고 출산 준비물을 미리 챙겨보세요.",
                        exercise_title="골반 이완 스트레칭",
                        exercise_desc="출산을 대비한 가벼운 골반 스트레칭을 추천해요.",
                        nutrient_title="철분과 DHA를 함께 챙겨요",
                        nutrient_desc="등푸른 생선, 견과류(알레르기 없을 시)로 채워보세요.",
                    ),
                ]
            )

        if db.query(FoodItem).count() == 0:
            db.add_all(
                [
                    FoodItem(
                        barcode="8801234567890", product_name="카페모카 (톨 사이즈)",
                        ingredients="우유, 에스프레소, 초콜릿시럽", allergens="우유",
                        caffeine_mg=150, sugar_g=32, sodium_mg=95,
                        caution_note="카페인 함량이 높은 편이에요.", category="커피", source_pipeline="primary",
                    ),
                    FoodItem(
                        barcode="8801234567891", product_name="디카페인 카페라떼",
                        ingredients="우유, 디카페인 에스프레소", allergens="우유",
                        caffeine_mg=0, sugar_g=12, sodium_mg=80,
                        caution_note="", category="커피", source_pipeline="primary",
                    ),
                    FoodItem(
                        barcode="8801234567892", product_name="하프샷 아메리카노",
                        ingredients="에스프레소 하프샷, 물", allergens="",
                        caffeine_mg=37, sugar_g=0, sodium_mg=5,
                        caution_note="", category="커피", source_pipeline="primary",
                    ),
                    FoodItem(
                        barcode="8801234567893", product_name="루이보스 티라떼",
                        ingredients="루이보스 티, 우유", allergens="우유",
                        caffeine_mg=0, sugar_g=10, sodium_mg=60,
                        caution_note="", category="커피", source_pipeline="primary",
                    ),
                    FoodItem(
                        barcode="8801234567894", product_name="유기농 그릭 요거트",
                        ingredients="우유, 유산균 배양물, 원유", allergens="우유",
                        caffeine_mg=0, sugar_g=8, sodium_mg=95,
                        caution_note="우유 알레르기가 있는 경우 섭취에 주의하세요.",
                        category="유제품", source_pipeline="primary",
                    ),
                ]
            )

        db.commit()

        if db.query(FoodCategoryKeyword).count() == 0:
            db.add_all(
                FoodCategoryKeyword(category=category, keyword=keyword)
                for category, keywords in CATEGORY_KEYWORDS.items()
                for keyword in keywords
            )

        if db.query(SafeFoodAlternative).count() == 0:
            db.add_all(
                SafeFoodAlternative(
                    category=category,
                    name=item["name"],
                    reason=item["reason"],
                    sugar_g=item["sugar_g"],
                    carb_g=item["carb_g"],
                    kcal=item["kcal"],
                    level="safe",
                )
                for category, items in SAFE_ALTERNATIVES.items()
                for item in items
            )

        db.commit()

        if db.query(FoodNutritionInfo).count() == 0:
            with open(FOOD_NUTRITION_CSV, encoding="utf-8") as f:
                reader = csv.DictReader(f)
                db.add_all(
                    FoodNutritionInfo(
                        name=row["name"],
                        aliases=row["aliases"],
                        carb_g=float(row["carb_g"]),
                        sugar_g=float(row["sugar_g"]),
                        kcal=float(row["kcal"]),
                    )
                    for row in reader
                )

        db.commit()
        print("시드 데이터 생성 완료")
    finally:
        db.close()


if __name__ == "__main__":
    seed()