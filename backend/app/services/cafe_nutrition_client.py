"""
'오늘의 카페인' 화면용 카페 메뉴 검색 서비스.

세 가지 소스를 합쳐서 검색 결과를 만든다:
1. GENERIC_COFFEE     : 집/개인 카페에서 만든 커피 - 브랜드 없이 "1잔 기준" 일반적인 수치
                          (검색어가 이 목록의 이름과 일치하면 항상 결과에 포함됨)
2. MOCK_FRANCHISE_MENU : 프랜차이즈 카페 메뉴 - 카페인 포함 데모 수치 (아래 "왜 mock을 유지하나" 참고)
3. 식약처 식품영양성분DB(I2790) : 탄수화물/당류/열량을 실제 값으로 "보강"하는 용도로만 사용.
                          MFDS_API_KEY가 없거나 API 호출이 실패하면 조용히 건너뛴다 (필수 아님).

## 왜 I2790 API로 프랜차이즈 검색을 하지 않나 (2026-07-23 조사 결과)
data.go.kr에서 신청한 "식품의약품안전처_식품영양성분DB정보"(서비스ID I2790)를 확인해보니:
  - 이 데이터셋은 **카페인 필드가 없다.** 응답 필드는 NUTR_CONT1~9뿐이고, 그 의미는:
      NUTR_CONT1=에너지(kcal), NUTR_CONT2=탄수화물(g), NUTR_CONT3=단백질(g), NUTR_CONT4=지방(g),
      NUTR_CONT5=당류(g), NUTR_CONT6=나트륨(mg), NUTR_CONT7=콜레스테롤(mg),
      NUTR_CONT8=포화지방산(g), NUTR_CONT9=트랜스지방(g)
    카페인 항목 자체가 없다.
  - 이 DB는 "외식업체 메뉴DB"가 아니라 일반 식품/원재료 영양성분DB라서 "스타벅스 아메리카노" 같은
    브랜드 메뉴가 그대로 들어있을 가능성도 낮다.
  => 그래서 카페인 값과 브랜드 메뉴 목록은 계속 우리가 직접 관리하는 표(GENERIC_COFFEE / MOCK_FRANCHISE_MENU)를
     신뢰 소스로 쓰고, I2790 API는 "일반 커피명"의 탄수화물/당류/열량을 실측치로 보강하는 데만 보조적으로 쓴다.

TODO: 진짜 프랜차이즈 카페인 데이터가 필요하면 식약처 "고카페인 함유식품 카페인 함량 정보" 같은
별도 데이터셋을 새로 신청해서 이 파일에 연동해야 한다.
"""

import httpx

from app.config import settings

BASE_URL = "http://openapi.foodsafetykorea.go.kr/api"
SERVICE_ID = "I2790"

# 식약처 식품영양성분DB(I2790) 응답 필드 -> 의미 매핑 (실측 확인 완료)
NUTR_FIELD_KCAL = "NUTR_CONT1"
NUTR_FIELD_CARB = "NUTR_CONT2"
NUTR_FIELD_SUGAR = "NUTR_CONT5"

# 집/개인 카페 - "1잔 기준" 일반적인 수치 (표준화된 대표값, 데모용)
GENERIC_COFFEE: dict[str, dict] = {
    "아메리카노": {"caffeineMg": 120, "sugarG": 0, "carbG": 2, "kcal": 10},
    "디카페인 아메리카노": {"caffeineMg": 5, "sugarG": 0, "carbG": 2, "kcal": 10},
    "카페라떼": {"caffeineMg": 75, "sugarG": 10, "carbG": 12, "kcal": 150},
    "라떼": {"caffeineMg": 75, "sugarG": 10, "carbG": 12, "kcal": 150},
    "바닐라라떼": {"caffeineMg": 75, "sugarG": 33, "carbG": 38, "kcal": 240},
    "카푸치노": {"caffeineMg": 75, "sugarG": 8, "carbG": 10, "kcal": 120},
    "카라멜마키아토": {"caffeineMg": 75, "sugarG": 30, "carbG": 35, "kcal": 220},
    "콜드브루": {"caffeineMg": 200, "sugarG": 0, "carbG": 2, "kcal": 10},
    "카페모카": {"caffeineMg": 90, "sugarG": 30, "carbG": 35, "kcal": 280},
    "모카": {"caffeineMg": 90, "sugarG": 30, "carbG": 35, "kcal": 280},
    "에스프레소": {"caffeineMg": 75, "sugarG": 0, "carbG": 0, "kcal": 5},
}

# 프랜차이즈 메뉴 데이터 (카페인 포함 - 우리가 직접 관리하는 신뢰 소스, 데모 수치)
MOCK_FRANCHISE_MENU: list[dict] = [
    {"brand": "스타벅스", "name": "아메리카노", "caffeineMg": 150, "sugarG": 0, "carbG": 3, "kcal": 10},
    {"brand": "스타벅스", "name": "카페라떼", "caffeineMg": 75, "sugarG": 10, "carbG": 12, "kcal": 150},
    {"brand": "스타벅스", "name": "바닐라라떼", "caffeineMg": 75, "sugarG": 35, "carbG": 40, "kcal": 250},
    {"brand": "스타벅스", "name": "카라멜마키아토", "caffeineMg": 75, "sugarG": 32, "carbG": 38, "kcal": 230},
    {"brand": "스타벅스", "name": "콜드브루", "caffeineMg": 155, "sugarG": 0, "carbG": 3, "kcal": 10},
    {"brand": "이디야커피", "name": "아메리카노", "caffeineMg": 125, "sugarG": 0, "carbG": 2, "kcal": 5},
    {"brand": "이디야커피", "name": "카페라떼", "caffeineMg": 75, "sugarG": 12, "carbG": 14, "kcal": 140},
    {"brand": "투썸플레이스", "name": "아메리카노", "caffeineMg": 140, "sugarG": 0, "carbG": 3, "kcal": 10},
    {"brand": "투썸플레이스", "name": "바닐라빈라떼", "caffeineMg": 75, "sugarG": 38, "carbG": 42, "kcal": 260},
    {"brand": "메가MGC커피", "name": "아메리카노", "caffeineMg": 130, "sugarG": 0, "carbG": 2, "kcal": 5},
    {"brand": "컴포즈커피", "name": "아메리카노", "caffeineMg": 120, "sugarG": 0, "carbG": 2, "kcal": 5},
    {"brand": "빽다방", "name": "아메리카노", "caffeineMg": 115, "sugarG": 0, "carbG": 3, "kcal": 10},
    {"brand": "빽다방", "name": "바닐라라떼", "caffeineMg": 70, "sugarG": 40, "carbG": 45, "kcal": 270},
]


def _slugify(*parts: str) -> str:
    return "-".join(p.strip().lower().replace(" ", "") for p in parts if p)


def _matches(query: str, *fields: str) -> bool:
    q = query.strip()
    if not q:
        return False
    return any(q in f or f in q for f in fields if f)


def _find_generic_match(query: str) -> dict | None:
    q = query.strip()
    # 정확히 일치하는 이름 우선, 그 다음 이름이 긴(더 구체적인) 키 우선
    # (예: "바닐라라떼" 검색 시 "라떼"가 아니라 "바닐라라떼"에 먼저 매칭되도록)
    ordered = sorted(GENERIC_COFFEE.items(), key=lambda kv: (kv[0] != q, -len(kv[0])))
    for name, nutrient in ordered:
        if _matches(q, name):
            return {
                "id": _slugify("generic", name),
                "brand": None,
                "name": name,
                "isGeneric": True,
                **nutrient,
            }
    return None


def _franchise_matches(query: str) -> list[dict]:
    results = []
    for item in MOCK_FRANCHISE_MENU:
        if _matches(query, item["name"], item["brand"]):
            results.append(
                {
                    "id": _slugify(item["brand"], item["name"]),
                    "brand": item["brand"],
                    "name": item["name"],
                    "isGeneric": False,
                    "caffeineMg": item["caffeineMg"],
                    "sugarG": item["sugarG"],
                    "carbG": item["carbG"],
                    "kcal": item["kcal"],
                }
            )
    return results


def _parse_i2790_response(data: dict) -> list[dict]:
    try:
        rows = data["I2790"]["row"]
    except (KeyError, TypeError):
        return []
    if not isinstance(rows, list):
        rows = [rows]

    parsed = []
    for row in rows:
        try:
            parsed.append(
                {
                    "name": row.get("DESC_KOR", ""),
                    "kcal": float(row.get(NUTR_FIELD_KCAL) or 0),
                    "carbG": float(row.get(NUTR_FIELD_CARB) or 0),
                    "sugarG": float(row.get(NUTR_FIELD_SUGAR) or 0),
                }
            )
        except (TypeError, ValueError):
            continue
    return parsed


async def _fetch_generic_nutrient_from_api(name: str) -> dict | None:
    """
    (현재 미사용 - 아래 search_cafe_menu 참고)
    일반 커피명(예: '아메리카노')으로 식약처 식품영양성분DB(I2790)를 조회해서
    탄수화물/당류/열량 실측 평균값을 가져온다. 카페인은 이 DB에 없으므로 반환하지 않는다.
    """
    if not settings.mfds_api_key:
        return None

    url = f"{BASE_URL}/{settings.mfds_api_key}/{SERVICE_ID}/json/1/20/DESC_KOR={name}"
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            rows = _parse_i2790_response(resp.json())
    except Exception as e:
        print(f"[cafe_nutrition_client] 식품영양성분DB 호출 실패 -> 하드코딩된 일반 수치 사용. name={name}, 원인: {type(e).__name__}: {e}")
        return None

    if not rows:
        return None

    # 이름이 정확히 일치하는 항목이 있으면 그것을, 없으면 검색된 항목들의 평균을 사용
    exact = [r for r in rows if r["name"] == name]
    picked = exact if exact else rows
    n = len(picked)
    return {
        "kcal": sum(r["kcal"] for r in picked) / n,
        "carbG": sum(r["carbG"] for r in picked) / n,
        "sugarG": sum(r["sugarG"] for r in picked) / n,
    }


_BRANDS = sorted({item["brand"] for item in MOCK_FRANCHISE_MENU}, key=len, reverse=True)


def _query_mentions_brand(query: str) -> bool:
    q = query.strip()
    return any(brand in q for brand in _BRANDS)


async def search_cafe_menu(query: str) -> dict:
    generic = _find_generic_match(query)
    franchise = _franchise_matches(query)

    # NOTE: I2790 실측 보강은 현재 비활성화 상태.
    # DESC_KOR 부분일치 검색이라 "아메리카노"를 검색하면 커피와 무관한 식품까지
    # 함께 잡혀 평균이 실제 커피 값과 동떨어지는 경우가 확인돼서(예: 당류/탄수화물이
    # 거의 0에 수렴 -> 연하게 정도를 곱해도 반올림하면 항상 0으로 보이는 문제),
    # 우리가 직접 검증한 GENERIC_COFFEE 표 값을 그대로 신뢰 소스로 사용한다.
    # (다시 켜려면 아래 두 줄의 주석을 해제하면 됨 - 다만 이름 완전일치 매칭만 쓰는 등 보완 필요)
    # enrichment = await _fetch_generic_nutrient_from_api(generic["name"]) if generic else None
    # if generic and enrichment: generic = {**generic, **enrichment}

    if _query_mentions_brand(query):
        # "스타벅스 아메리카노"처럼 브랜드명이 포함된 검색 -> 프랜차이즈가 최상단, 직접입력이 최하단
        results = franchise + ([generic] if generic else [])
    else:
        # "아메리카노"처럼 메뉴명만 검색 -> 직접입력이 최상단 (기존 동작 유지)
        results = ([generic] if generic else []) + franchise

    return {"query": query, "results": results}