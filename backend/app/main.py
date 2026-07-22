from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import alternatives, auth, chat, community, diary, guide, nutrition, scan

# 최초 실행 시 테이블 자동 생성 (SQLite 기준, 운영 전환 시 Alembic 마이그레이션 권장)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="맘(Mom)편하게 API", version="1.0.0")

# Expo Go 등 모바일 환경에서 접근 가능하도록 전체 허용 (개발 단계 한정)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(scan.router)
app.include_router(guide.router)
app.include_router(alternatives.router)
app.include_router(community.router)
app.include_router(diary.router)
app.include_router(chat.router)
app.include_router(nutrition.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "mompeace-api"}