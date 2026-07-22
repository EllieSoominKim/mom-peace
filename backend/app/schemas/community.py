from typing import Literal

from app.schemas.base import CamelModel

Category = Literal["나눔", "판매", "질문"]


class CommunityPostCreate(CamelModel):
    category: Category
    title: str
    content: str
    price: str | None = None
    photo_url: str | None = None


class CommunityPostResponse(CamelModel):
    """프론트 CommunityPost 타입과 동일한 필드 구조"""

    id: str
    category: Category
    title: str
    preview: str
    author: str
    week: int
    price: str | None = None
    comment_count: int
    created_at: str


class CommunityPostDetailResponse(CommunityPostResponse):
    content: str


class CommentCreate(CamelModel):
    content: str


class CommentResponse(CamelModel):
    id: str
    author: str
    content: str
    created_at: str
