from pydantic import BaseModel, ConfigDict


def to_camel(snake_str: str) -> str:
    parts = snake_str.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])


class CamelModel(BaseModel):
    """
    프론트엔드(constants/mock-data.ts)가 camelCase 필드명을 쓰기 때문에,
    응답 시 자동으로 snake_case -> camelCase 변환되도록 하는 베이스 스키마.
    예: product_name -> productName
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
