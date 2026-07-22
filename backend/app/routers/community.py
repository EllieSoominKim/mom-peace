from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database import get_db
from app.models.community import CommunityComment, CommunityPost
from app.models.user import User
from app.schemas.community import (
    CommentCreate,
    CommentResponse,
    CommunityPostCreate,
    CommunityPostDetailResponse,
    CommunityPostResponse,
)

router = APIRouter(prefix="/community", tags=["community"])


def _relative_time(dt: datetime) -> str:
    diff = datetime.utcnow() - dt
    minutes = int(diff.total_seconds() // 60)
    if minutes < 1:
        return "방금"
    if minutes < 60:
        return f"{minutes}분 전"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}시간 전"
    return f"{hours // 24}일 전"


def _to_post_response(post: CommunityPost) -> CommunityPostResponse:
    return CommunityPostResponse(
        id=str(post.id),
        category=post.category,
        title=post.title,
        preview=post.content[:60],
        author=post.author.nickname,
        week=post.author.pregnancy_week,
        price=post.price,
        comment_count=len(post.comments),
        created_at=_relative_time(post.created_at),
    )


@router.get("/posts", response_model=list[CommunityPostResponse])
def list_posts(category: str | None = None, db: Session = Depends(get_db)):
    query = db.query(CommunityPost).order_by(CommunityPost.created_at.desc())
    if category and category != "전체":
        query = query.filter(CommunityPost.category == category)
    return [_to_post_response(p) for p in query.all()]


@router.post("/posts", response_model=CommunityPostResponse)
def create_post(
    payload: CommunityPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = CommunityPost(
        author_id=current_user.id,
        category=payload.category,
        title=payload.title,
        content=payload.content,
        price=payload.price,
        photo_url=payload.photo_url,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return _to_post_response(post)


@router.get("/posts/{post_id}", response_model=CommunityPostDetailResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없어요.")

    base = _to_post_response(post)
    return CommunityPostDetailResponse(**base.model_dump(by_alias=False), content=post.content)


@router.get("/posts/{post_id}/comments", response_model=list[CommentResponse])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    comments = (
        db.query(CommunityComment)
        .filter(CommunityComment.post_id == post_id)
        .order_by(CommunityComment.created_at.asc())
        .all()
    )
    return [
        CommentResponse(
            id=str(c.id),
            author=c.author.nickname,
            content=c.content,
            created_at=_relative_time(c.created_at),
        )
        for c in comments
    ]


@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
def create_comment(
    post_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없어요.")

    comment = CommunityComment(post_id=post_id, author_id=current_user.id, content=payload.content)
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return CommentResponse(
        id=str(comment.id),
        author=current_user.nickname,
        content=comment.content,
        created_at="방금",
    )
