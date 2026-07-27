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
    # 커피
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
    "플랫화이트": {"caffeineMg": 130, "sugarG": 8, "carbG": 10, "kcal": 130},
    "아인슈페너": {"caffeineMg": 150, "sugarG": 18, "carbG": 20, "kcal": 200},
    "헤이즐넛라떼": {"caffeineMg": 75, "sugarG": 28, "carbG": 33, "kcal": 220},
    "콘파냐": {"caffeineMg": 75, "sugarG": 12, "carbG": 14, "kcal": 100},
    "아포가토": {"caffeineMg": 75, "sugarG": 20, "carbG": 24, "kcal": 210},
    "더치커피": {"caffeineMg": 180, "sugarG": 0, "carbG": 2, "kcal": 10},
    "비엔나커피": {"caffeineMg": 90, "sugarG": 20, "carbG": 22, "kcal": 190},
    "연유라떼": {"caffeineMg": 75, "sugarG": 36, "carbG": 40, "kcal": 260},
    "돌체라떼": {"caffeineMg": 75, "sugarG": 34, "carbG": 39, "kcal": 250},
    # 차(티) 메뉴 - 커피보다 카페인이 적지만 무시할 수 없는 수준이라 함께 관리
    "녹차": {"caffeineMg": 30, "sugarG": 0, "carbG": 1, "kcal": 5},
    "녹차라떼": {"caffeineMg": 35, "sugarG": 20, "carbG": 25, "kcal": 180},
    "말차라떼": {"caffeineMg": 45, "sugarG": 22, "carbG": 27, "kcal": 190},
    "홍차": {"caffeineMg": 40, "sugarG": 0, "carbG": 1, "kcal": 5},
    "얼그레이": {"caffeineMg": 40, "sugarG": 0, "carbG": 1, "kcal": 5},
    "얼그레이라떼": {"caffeineMg": 42, "sugarG": 24, "carbG": 28, "kcal": 200},
    "밀크티": {"caffeineMg": 30, "sugarG": 24, "carbG": 28, "kcal": 190},
    "자몽허니블랙티": {"caffeineMg": 30, "sugarG": 35, "carbG": 40, "kcal": 200},
    "레몬블랙티": {"caffeineMg": 30, "sugarG": 30, "carbG": 34, "kcal": 160},
    "우롱차": {"caffeineMg": 35, "sugarG": 0, "carbG": 1, "kcal": 5},
    "자스민차": {"caffeineMg": 25, "sugarG": 0, "carbG": 1, "kcal": 5},
    "차이라떼": {"caffeineMg": 50, "sugarG": 26, "carbG": 30, "kcal": 210},
    # 초콜릿/기타 - 카페인이 소량 있는 비커피 음료
    "핫초코": {"caffeineMg": 5, "sugarG": 28, "carbG": 32, "kcal": 220},
    "초콜릿라떼": {"caffeineMg": 8, "sugarG": 30, "carbG": 34, "kcal": 230},
}

# 프랜차이즈 메뉴 데이터 (카페인 포함 - 우리가 직접 관리하는 신뢰 소스)
# 각 브랜드 "아메리카노" 카페인 값은 2026-07 웹 검색으로 확인한 실측/공식 자료 기반으로 보정함
# (식약처 2012 카페인 실측조사 + 각 브랜드 공식 발표 자료 종합, 1잔=Regular/Tall 기준).
# 탐앤탐스 "카페라떼"도 실측조사 자료로 보정함(189mg).
# 그 외 라떼/모카/티 등 나머지 메뉴의 카페인·당류·탄수화물·칼로리는 여전히 데모 근사치임 -
# 정확한 값이 필요하면 각 브랜드 공식 영양정보 페이지를 메뉴별로 추가 확인해야 함.
MOCK_FRANCHISE_MENU: list[dict] = [
    # 스타벅스
    {"brand": "스타벅스", "name": "아메리카노", "caffeineMg": 150, "sugarG": 0, "carbG": 3, "kcal": 10},
    {"brand": "스타벅스", "name": "카페라떼", "caffeineMg": 75, "sugarG": 10, "carbG": 12, "kcal": 150},
    {"brand": "스타벅스", "name": "바닐라라떼", "caffeineMg": 75, "sugarG": 35, "carbG": 40, "kcal": 250},
    {"brand": "스타벅스", "name": "카라멜마키아토", "caffeineMg": 75, "sugarG": 32, "carbG": 38, "kcal": 230},
    {"brand": "스타벅스", "name": "콜드브루", "caffeineMg": 155, "sugarG": 0, "carbG": 3, "kcal": 10},
    {"brand": "스타벅스", "name": "카푸치노", "caffeineMg": 75, "sugarG": 9, "carbG": 11, "kcal": 120},
    {"brand": "스타벅스", "name": "카페모카", "caffeineMg": 95, "sugarG": 32, "carbG": 37, "kcal": 290},
    {"brand": "스타벅스", "name": "그린티라떼", "caffeineMg": 40, "sugarG": 24, "carbG": 29, "kcal": 200},
    {"brand": "스타벅스", "name": "얼그레이밀크티", "caffeineMg": 40, "sugarG": 26, "carbG": 30, "kcal": 210},
    {"brand": "스타벅스", "name": "자몽허니블랙티", "caffeineMg": 30, "sugarG": 36, "carbG": 41, "kcal": 210},
    {"brand": "스타벅스", "name": "차이티라떼", "caffeineMg": 50, "sugarG": 28, "carbG": 32, "kcal": 220},
    # 이디야커피
    {"brand": "이디야커피", "name": "아메리카노", "caffeineMg": 103, "sugarG": 0, "carbG": 2, "kcal": 5},
    {"brand": "이디야커피", "name": "카페라떼", "caffeineMg": 75, "sugarG": 12, "carbG": 14, "kcal": 140},
    {"brand": "이디야커피", "name": "바닐라라떼", "caffeineMg": 75, "sugarG": 33, "carbG": 37, "kcal": 235},
    {"brand": "이디야커피", "name": "카라멜마키아토", "caffeineMg": 75, "sugarG": 30, "carbG": 34, "kcal": 225},
    {"brand": "이디야커피", "name": "밀크티", "caffeineMg": 28, "sugarG": 22, "carbG": 26, "kcal": 180},
    {"brand": "이디야커피", "name": "자몽에이드", "caffeineMg": 0, "sugarG": 30, "carbG": 34, "kcal": 150},
    # 투썸플레이스
    {"brand": "투썸플레이스", "name": "아메리카노", "caffeineMg": 170, "sugarG": 0, "carbG": 3, "kcal": 10},
    {"brand": "투썸플레이스", "name": "카페라떼", "caffeineMg": 75, "sugarG": 11, "carbG": 13, "kcal": 155},
    {"brand": "투썸플레이스", "name": "바닐라빈라떼", "caffeineMg": 75, "sugarG": 38, "carbG": 42, "kcal": 260},
    {"brand": "투썸플레이스", "name": "얼그레이티라떼", "caffeineMg": 42, "sugarG": 25, "carbG": 30, "kcal": 210},
    {"brand": "투썸플레이스", "name": "그린티라떼", "caffeineMg": 40, "sugarG": 23, "carbG": 28, "kcal": 195},
    {"brand": "투썸플레이스", "name": "핫초코", "caffeineMg": 5, "sugarG": 30, "carbG": 34, "kcal": 235},
    # 메가MGC커피
    {"brand": "메가MGC커피", "name": "아메리카노", "caffeineMg": 97, "sugarG": 0, "carbG": 2, "kcal": 5},
    {"brand": "메가MGC커피", "name": "카페라떼", "caffeineMg": 70, "sugarG": 10, "carbG": 12, "kcal": 140},
    {"brand": "메가MGC커피", "name": "바닐라라떼", "caffeineMg": 70, "sugarG": 32, "carbG": 36, "kcal": 230},
    {"brand": "메가MGC커피", "name": "콜드브루", "caffeineMg": 160, "sugarG": 0, "carbG": 2, "kcal": 5},
    # 컴포즈커피
    {"brand": "컴포즈커피", "name": "아메리카노", "caffeineMg": 150, "sugarG": 0, "carbG": 2, "kcal": 5},
    {"brand": "컴포즈커피", "name": "카페라떼", "caffeineMg": 68, "sugarG": 10, "carbG": 12, "kcal": 135},
    {"brand": "컴포즈커피", "name": "바닐라라떼", "caffeineMg": 68, "sugarG": 31, "carbG": 35, "kcal": 225},
    # 빽다방
    {"brand": "빽다방", "name": "아메리카노", "caffeineMg": 237, "sugarG": 0, "carbG": 3, "kcal": 10},
    {"brand": "빽다방", "name": "바닐라라떼", "caffeineMg": 70, "sugarG": 40, "carbG": 45, "kcal": 270},
    {"brand": "빽다방", "name": "밀크티", "caffeineMg": 25, "sugarG": 30, "carbG": 34, "kcal": 200},
    {"brand": "빽다방", "name": "카페모카", "caffeineMg": 85, "sugarG": 34, "carbG": 39, "kcal": 285},
    # 할리스
    {"brand": "할리스", "name": "아메리카노", "caffeineMg": 114, "sugarG": 0, "carbG": 3, "kcal": 10},
    {"brand": "할리스", "name": "카페라떼", "caffeineMg": 75, "sugarG": 11, "carbG": 13, "kcal": 150},
    {"brand": "할리스", "name": "바닐라라떼", "caffeineMg": 75, "sugarG": 34, "carbG": 38, "kcal": 245},
    {"brand": "할리스", "name": "그린티라떼", "caffeineMg": 40, "sugarG": 24, "carbG": 29, "kcal": 195},
    # 커피빈
    {"brand": "커피빈", "name": "아메리카노", "caffeineMg": 168, "sugarG": 0, "carbG": 3, "kcal": 10},
    {"brand": "커피빈", "name": "카페라떼", "caffeineMg": 75, "sugarG": 11, "carbG": 13, "kcal": 155},
    {"brand": "커피빈", "name": "카라멜마키아토", "caffeineMg": 75, "sugarG": 33, "carbG": 39, "kcal": 235},
    {"brand": "커피빈", "name": "그린티라떼", "caffeineMg": 42, "sugarG": 25, "carbG": 30, "kcal": 205},
    # 폴바셋
    {"brand": "폴바셋", "name": "아메리카노", "caffeineMg": 160, "sugarG": 0, "carbG": 3, "kcal": 10},
    {"brand": "폴바셋", "name": "플랫화이트", "caffeineMg": 150, "sugarG": 9, "carbG": 11, "kcal": 140},
    {"brand": "폴바셋", "name": "카페라떼", "caffeineMg": 90, "sugarG": 11, "carbG": 13, "kcal": 155},
    # 탐앤탐스
    {"brand": "탐앤탐스", "name": "아메리카노", "caffeineMg": 179, "sugarG": 0, "carbG": 3, "kcal": 10},
    {"brand": "탐앤탐스", "name": "카페라떼", "caffeineMg": 189, "sugarG": 11, "carbG": 13, "kcal": 150},
    {"brand": "탐앤탐스", "name": "허니자몽블랙티", "caffeineMg": 28, "sugarG": 34, "carbG": 39, "kcal": 195},
    # 파스쿠찌
    {"brand": "파스쿠찌", "name": "아메리카노", "caffeineMg": 196, "sugarG": 0, "carbG": 2, "kcal": 10},
    {"brand": "파스쿠찌", "name": "카페라떼", "caffeineMg": 65, "sugarG": 10, "carbG": 12, "kcal": 145},
    {"brand": "파스쿠찌", "name": "카푸치노", "caffeineMg": 65, "sugarG": 8, "carbG": 10, "kcal": 115},
    # 엔제리너스
    {"brand": "엔제리너스", "name": "아메리카노", "caffeineMg": 211, "sugarG": 0, "carbG": 3, "kcal": 10},
    {"brand": "엔제리너스", "name": "카페라떼", "caffeineMg": 70, "sugarG": 11, "carbG": 13, "kcal": 150},
    {"brand": "엔제리너스", "name": "바닐라라떼", "caffeineMg": 70, "sugarG": 33, "carbG": 37, "kcal": 235},
    # 더벤티
    {"brand": "더벤티", "name": "아메리카노", "caffeineMg": 100, "sugarG": 0, "carbG": 2, "kcal": 5},
    {"brand": "더벤티", "name": "카페라떼", "caffeineMg": 60, "sugarG": 12, "carbG": 14, "kcal": 150},
    {"brand": "더벤티", "name": "청포도에이드", "caffeineMg": 0, "sugarG": 32, "carbG": 36, "kcal": 160},
    # 매머드커피
    {"brand": "매머드커피", "name": "아메리카노", "caffeineMg": 110, "sugarG": 0, "carbG": 2, "kcal": 5},
    {"brand": "매머드커피", "name": "카페라떼", "caffeineMg": 65, "sugarG": 10, "carbG": 12, "kcal": 140},
    {"brand": "매머드커피", "name": "바닐라라떼", "caffeineMg": 65, "sugarG": 32, "carbG": 36, "kcal": 225},
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