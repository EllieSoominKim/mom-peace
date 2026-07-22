# 맘(Mom)편하게 — Frontend (Expo)

디자인 시안(첨부 PNG) 기반으로 만든 Expo Router 프론트엔드 스캐폴드입니다.

## 시작하기

```bash
npm install
npm run start        # expo start --tunnel (Expo Go 기준)
```

Expo Go 앱에서 QR 스캔하여 실행하세요. iOS/Android 실기기에서 `--tunnel` 옵션이 필요합니다.

## 폴더 구조

```
app/                        # expo-router 파일 기반 라우팅
  index.tsx                 # 진입점 → welcome으로 리다이렉트
  (auth)/
    welcome.tsx              # 시작 화면
    login.tsx                # 로그인
    register.tsx             # 회원가입
    onboarding.tsx            # 기본정보 입력(주차/출산예정일)
  (tabs)/
    _layout.tsx               # 하단 탭 5개 (홈/스캔/Food Diary/커뮤니티/MY)
    home.tsx
    scan.tsx
    diary.tsx
    community/
      index.tsx               # 게시글 목록
      write.tsx                # 글쓰기
      [id].tsx                 # 게시글 상세 + 댓글
    mypage.tsx
  scan-result.tsx             # 스캔 결과 (안전/주의/위험 + 대체메뉴)

components/
  ui/                        # 공통 컴포넌트 (Button, Card, TextField, StatusBadge, ScreenContainer)
  home/                      # 홈 화면 전용 컴포넌트
  scan/                      # 대체 메뉴 섹션
  community/                 # 게시글 카드

theme/
  colors.ts                  # 디자인 시안에서 추출한 컬러 팔레트
  typography.ts               # 폰트/spacing/radius 토큰

constants/
  mock-data.ts                # 화면 연결용 목데이터 (백엔드 연동 전까지 사용)
```

## 디자인 토큰 (시안 이미지에서 추출)

- 배경: `#FEFAF9` (은은한 핑크 화이트)
- 포인트 컬러: `#F47E8A` (코랄 핑크)
- 상태색: 안전 `#5FBE7A` / 주의 `#F0B23D` / 위험 `#F0555C`
- 카드: 흰 배경 + 둥근 모서리(16px) + 옅은 핑크 그림자

전체 화면에서 `theme/colors.ts`, `theme/typography.ts`만 통일해서 쓰면 시안과의 톤 싱크로율을 유지할 수 있습니다.

## 로고/이미지 교체

`assets/images/logo.png`, `icon.png`, `splash.png`, `adaptive-icon.png`는 임시 플레이스홀더입니다.
직접 다운로드한 로고 파일로 같은 파일명으로 덮어쓰면 됩니다.

## 아직 목업 상태인 부분 (백엔드 연동 필요)

- `constants/mock-data.ts`의 모든 데이터 → FastAPI 엔드포인트로 교체
- `app/(tabs)/scan.tsx` → `expo-camera`의 `CameraView` + `onBarcodeScanned`로 실제 스캔 로직 연결
- `app/(tabs)/community/write.tsx`의 `handleSubmit` → `POST /community/posts` 연동
- `app/(tabs)/community/[id].tsx`의 댓글 → `GET/POST /community/posts/{id}/comments` 연동
- 로그인/회원가입 → 실제 인증 API 연동, 토큰 저장(예: `expo-secure-store`)

## 새 화면 추가 시 참고

기존 화면 패턴(예: `home.tsx`, `community/index.tsx`)을 그대로 따라가면 됩니다:
1. `ScreenContainer`로 감싸기
2. `Card`, `Button`, `TextField`, `StatusBadge` 등 `components/ui`의 기존 컴포넌트 재사용
3. 색상/폰트는 항상 `theme/colors.ts`, `theme/typography.ts`에서 가져오기 (하드코딩 지양)

이 패턴을 유지하면 입덧 케어, 영양제 가이드, 운동 추천 상세 화면 등을 추가할 때도 시안과의 톤이 자동으로 맞습니다.
