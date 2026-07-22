# 맘(Mom)편하게 — Backend (FastAPI)

프론트엔드(`mompeace-app`)의 `constants/mock-data.ts`와 필드명(camelCase)이 그대로 맞도록 설계된 백엔드입니다.
Claude API 대신 **Gemini API**로 성분 위험도 판단을 수행합니다.

## 실행 방법

```bash
# 1. 가상환경 (선택)
python -m venv venv
source venv/bin/activate   # Windows PowerShell: venv\Scripts\Activate.ps1

# 2. 패키지 설치
pip install -r requirements.txt

# 3. 환경변수 설정
cp .env.example .env
# .env 파일 열어서 GEMINI_API_KEY, MFDS_API_KEY 채워넣기
# (비워두면 데모용 mock 데이터/규칙 기반 판단으로 자동 동작합니다)

# 4. 초기 데모 데이터 생성 (주차별 가이드, 대체메뉴용 식품 샘플)
python -m app.seed

# 5. 서버 실행 (Expo Go 등 모바일 기기 접근을 위해 0.0.0.0 바인딩)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

실행 후 `http://localhost:8000/docs` 에서 Swagger UI로 모든 API를 바로 테스트할 수 있어요.

프론트엔드(Expo Go)에서 접근할 때는 PC의 로컬 IP(`http://192.168.x.x:8000`)를 써야 실기기에서 접근 가능합니다.
(`ipconfig`/`ifconfig`로 확인). `--tunnel`로 Expo를 띄운 경우, API 서버도 별도로 ngrok 등을 쓰거나
같은 와이파이 네트워크에서 로컬 IP로 접근하는 방식을 권장합니다.

## 폴더 구조

```
app/
  main.py                 # FastAPI 앱 진입점, CORS 전체 허용(개발용)
  config.py                # .env 기반 설정 (pydantic-settings)
  database.py               # SQLAlchemy 엔진/세션
  seed.py                   # 개발용 초기 데이터 시드 스크립트

  models/                  # ERD 기준 SQLAlchemy 테이블 6개
    user.py                 # 사용자 정보 DB
    food.py                  # 식품 정보 DB (푸드QR 캐시)
    guide.py                 # 임신 주차별 가이드 DB
    scan_log.py              # 누적 스캔 기록 DB
    community.py             # 커뮤니티 게시글/댓글 DB (신규)
    diary.py                  # Food Diary DB

  schemas/                 # Pydantic 스키마 (camelCase 자동 변환)
    base.py                  # CamelModel — snake_case -> camelCase alias 자동 생성
    auth.py / scan.py / guide.py / community.py / diary.py

  core/
    security.py              # JWT 발급/검증, bcrypt 비밀번호 해싱, get_current_user 의존성

  services/
    foodqr_client.py          # 식약처 푸드QR(1차) → fallback 3단계 파이프라인
    gemini_client.py           # Gemini API 성분 위험도 판단 (지연 import)

  routers/
    auth.py                   # 회원가입/로그인/온보딩/내정보
    scan.py                    # 바코드 조회 + AI 위험도 분석 + 대체메뉴
    guide.py                   # 주차별 가이드 (건강정보/운동/영양제)
    alternatives.py             # 오늘의 추천 화면용 카테고리별 대체메뉴
    community.py                # 게시글/댓글 CRUD (신규)
    diary.py                    # Food Diary 기록/조회
```

## API 목록 (검증 완료)

| Method | Path | 설명 |
|---|---|---|
| POST | `/auth/register` | 회원가입 |
| POST | `/auth/login` | 로그인 |
| POST | `/auth/onboarding` | 임신 주차/출산예정일 등록 |
| GET | `/auth/me` | 내 정보 조회 |
| GET | `/scan/{barcode}` | 바코드로 식품 정보 조회 (캐시 → 1차 → fallback) |
| POST | `/scan/analyze` | 위험도 판단(Gemini) + 스캔 기록 저장 + 대체메뉴 반환 |
| GET | `/guide/{week}` | 주차별 가이드 (건강정보/운동/영양제) |
| GET | `/alternatives?category=` | 카테고리별 대체메뉴 추천 |
| GET/POST | `/community/posts` | 게시글 목록/작성 |
| GET | `/community/posts/{id}` | 게시글 상세 |
| GET/POST | `/community/posts/{id}/comments` | 댓글 목록/작성 |
| GET/POST | `/diary` | Food Diary 오늘 조회 / 기록 추가 |

모든 응답은 `productName`, `scannedAt`, `commentCount`처럼 프론트엔드가 기대하는 camelCase 형식으로 자동 변환됩니다
(`schemas/base.py`의 `CamelModel` 덕분에 모델은 snake_case로 짜도 됩니다).

## Gemini API 연동 방식

`app/services/gemini_client.py`:
- 식약처 임산부 안전 기준 데이터를 시스템 프롬프트(`SAFETY_GUIDELINES`)에 구조화
- 스캔된 성분 + 임신 주차 + 오늘 누적 카페인을 프롬프트에 포함
- `response_mime_type: application/json`으로 안전/주의/위험 3단계 + 코멘트를 JSON으로 강제 응답받음
- `GEMINI_API_KEY`가 없으면 규칙 기반 mock 판단으로 자동 대체 (개발 중 API 비용 없이 테스트 가능)
- **주의**: `google-generativeai`는 실제 호출 시점에만 지연 import 하도록 되어 있어요. 최상단에서 import하면
  이 네트워크 환경에서 gRPC 인증 채널이 백그라운드에서 재시도를 반복해 서버가 멈추는 문제가 있었습니다.

## 식약처 API 연동 (TODO)

`app/services/foodqr_client.py`에 실제 엔드포인트 URL, 응답 파싱 로직이 `TODO`로 표시되어 있어요.
[공공데이터포털](https://www.data.go.kr)에서 푸드QR/바코드연계제품정보/식품원재료정보/식품영양성분DB API를
신청하고 키를 받으면, `_parse_primary_response`, `_fetch_fallback` 함수 안의 TODO 부분만 채우면 됩니다.
`MFDS_API_KEY`가 비어있는 동안은 데모용 mock 데이터가 반환됩니다.

## 알려진 이슈 / 주의사항

- **bcrypt 버전 고정 필요**: `passlib[bcrypt]==1.7.4`가 `bcrypt>=4.1`과 호환되지 않는 버그가 있어
  `requirements.txt`에 `bcrypt==4.0.1`로 고정해뒀습니다. 임의로 버전을 올리면 회원가입/로그인이
  `password cannot be longer than 72 bytes` 에러와 함께 깨질 수 있어요.
- **SQLite 파일 재생성 시 서버 재시작 필요**: 서버 실행 중에 `mompeace.db`를 삭제하고 새로 만들면
  서버가 물고 있던 파일 핸들이 무효화돼 `readonly database` 에러가 날 수 있습니다. DB를 초기화했다면
  서버도 같이 재시작하세요.
- 이 프로젝트는 데모/개발 편의를 위해 CORS를 전체 허용(`allow_origins=["*"]`)하고 있습니다. 실제 배포 시에는
  프론트엔드 도메인으로 좁혀야 합니다.

## 프론트엔드 연동 시

`mompeace-app/constants/mock-data.ts`의 각 mock 객체를 아래처럼 fetch 호출로 교체하면 됩니다.

```ts
// 예: 스캔 분석
const res = await fetch(`${API_BASE_URL}/scan/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ barcode }),
});
const scanResult = await res.json(); // scanResultMock과 동일한 필드 구조
```
