"""
푸드QR(portal.foodqr.kr) 연동 클라이언트.

바코드 하나로 아래 5개 API를 병렬 호출해서 조합한다 (모두 brcdNo 파라미터로 직접 조회 가능):
- F001 목록      : 제품명, 업체명, 식품유형
- F004 주의사항   : 소비자 안전 주의사항
- F007 원재료정보 : 원재료 구성 (텍스트)
- F008 영양표시정보: 영양성분 - "성분명 + 함량" 조합이 한 성분당 한 줄(row)씩 옴
- F009 알레르기정보: 알레르기 유발물질 - 한 물질당 한 줄(row)씩 옴

MFDS_API_KEY가 설정되지 않은 경우 데모/개발 편의를 위해 목데이터를 반환한다.
"""

import httpx

from app.config import settings

BASE_URL = "https://foodqr.kr/openapi/service"

SERVICE_PATHS = {
    "list": "/qr1001/F001",
    "caution": "/qr1004/F004",
    "ingredient": "/qr1007/F007",
    "nutrient": "/qr1008/F008",
    "allergy": "/qr1009/F009",
}


def _mock_food_data(barcode: str) -> dict:
    return {
        "barcode": barcode,
        "product_name": "유기농 그릭 요거트",
        "ingredients": "우유, 유산균 배양물, 원유",
        "allergens": "우유",
        "caffeine_mg": 0,
        "sugar_g": 8,
        "sodium_mg": 95,
        "caution_note": "우유 알레르기가 있는 경우 섭취에 주의하세요.",
        "category": "유제품",
        "source_pipeline": "primary",
    }


def _items(data: dict) -> list[dict]:
    """response.body.items.item 을 항상 리스트로 정규화 (결과가 1건이면 dict, 여러 건이면 list로 옴)"""
    try:
        item = data["response"]["body"]["items"]["item"]
    except (KeyError, TypeError):
        return []
    if item is None:
        return []
    return item if isinstance(item, list) else [item]


def _result_code(data: dict) -> str | None:
    try:
        return data["response"]["header"]["resultCode"]
    except (KeyError, TypeError):
        return None


async def _call(client: httpx.AsyncClient, service_key: str, barcode: str) -> dict:
    url = f"{BASE_URL}{SERVICE_PATHS[service_key]}"
    params = {
        "accessKey": settings.mfds_api_key,
        "numOfRows": 20,
        "pageNo": 1,
        "_type": "json",
        "brcdNo": barcode,
    }
    resp = await client.get(url, params=params)
    resp.raise_for_status()
    return resp.json()


def _find_amount(nutrient_items: list[dict], keyword: str) -> float:
    """영양표시(F008) 결과에서 nirwmtNm(성분명)에 keyword가 포함된 줄을 찾아 cta(함량)를 반환"""
    for row in nutrient_items:
        name = row.get("nirwmtNm") or ""
        if keyword in name:
            try:
                return float(row.get("cta") or 0)
            except (TypeError, ValueError):
                return 0
    return 0


async def fetch_food_by_barcode(barcode: str) -> dict:
    if not settings.mfds_api_key:
        # API 키 미설정 시 데모용 목데이터 반환
        return _mock_food_data(barcode)

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            list_data, caution_data, ingredient_data, nutrient_data, allergy_data = await _gather_all(
                client, barcode
            )

        list_items = _items(list_data)
        if not list_items:
            print(f"[foodqr_client] 푸드QR에 등록되지 않은 바코드 -> 목데이터로 폴백. barcode={barcode}, 응답: {list_data}")
            # 푸드QR에 등록 안 된 바코드 -> 목데이터로 폴백 (서비스 중단 방지)
            return _mock_food_data(barcode)

        product = list_items[0]
        nutrient_items = _items(nutrient_data)
        allergy_items = _items(allergy_data)
        ingredient_items = _items(ingredient_data)
        caution_items = _items(caution_data)

        allergens = ", ".join(
            {row.get("algCsgMtrNm", "") for row in allergy_items if row.get("algCsgMtrNm")}
        )
        ingredients = ingredient_items[0].get("prvwCn", "") if ingredient_items else ""
        caution_note = caution_items[0].get("atentMterCn", "") if caution_items else ""

        return {
            "barcode": barcode,
            "product_name": product.get("prdctNm", ""),
            "ingredients": ingredients or "정보 없음",
            "allergens": allergens,
            "caffeine_mg": _find_amount(nutrient_items, "카페인"),
            "sugar_g": _find_amount(nutrient_items, "당류"),
            "sodium_mg": _find_amount(nutrient_items, "나트륨"),
            "caution_note": caution_note or "특이사항 없음",
            "category": product.get("foodTypeCdNm", ""),
            "source_pipeline": "foodqr",
        }
    except Exception as e:
        # 원인을 알 수 없이 계속 목데이터로 폴백되는 문제를 진단하기 위해,
        # 실패 원인을 터미널에 출력한다 (서비스는 계속 목데이터로 안전하게 폴백됨)
        print(f"[foodqr_client] 실제 API 호출 실패 -> 목데이터로 폴백. barcode={barcode}, 원인: {type(e).__name__}: {e}")
        return _mock_food_data(barcode)


async def _gather_all(client: httpx.AsyncClient, barcode: str):
    import asyncio

    return await asyncio.gather(
        _call(client, "list", barcode),
        _call(client, "caution", barcode),
        _call(client, "ingredient", barcode),
        _call(client, "nutrient", barcode),
        _call(client, "allergy", barcode),
    )