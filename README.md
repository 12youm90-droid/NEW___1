# 📸 숨은 사진 스팟 - 포토스팟 커뮤니티

전국의 숨은 포토스팟을 발견하고 공유하는 공공 플랫폼입니다.

## ✨ 주요 기능

### 사용자 인증
- **GitHub OAuth 소셜 로그인** - 별도 회원가입 없이 GitHub 계정으로 즉시 사용
- JWT 토큰 기반 인증
- 30일간 자동 로그인 유지
- GitHub 프로필 이미지 표시

### 포토스팟 관리
- **모든 사용자**: 포토스팟 조회, 검색, 좋아요, 댓글 작성
- **로그인 사용자**: 새로운 포토스팟 추가
- **작성자만**: 본인이 작성한 포토스팟 수정/삭제 가능

### 검색 및 필터
- 지역별 필터링 (광역시/도, 시/군/구)
- 키워드 검색
- 태그 기반 탐색

### 지도 기능
- Leaflet.js 기반 인터랙티브 지도
- 마커 클릭으로 상세 정보 확인
- 위치 기반 검색

## 🚀 설치 및 실행

### 1. 필수 요구사항
- Node.js (v14 이상)
- npm 또는 yarn

### 2. 서버 설치

```bash
cd server
npm install
```

### 3. GitHub OAuth App 설정

GitHub OAuth를 사용하여 로그인하므로 GitHub App을 만들어야 합니다.

1. **GitHub에서 OAuth App 생성**
   - https://github.com/settings/developers 접속
   - "New OAuth App" 클릭
   - 다음 정보 입력:
     - Application name: `Photo Spot Community`
     - Homepage URL: `http://localhost:8000`
     - Authorization callback URL: `http://localhost:8000/preview/index.html`
   - "Register application" 클릭

2. **Client ID와 Client Secret 복사**
   - 생성된 앱 페이지에서 Client ID 복사
   - "Generate a new client secret" 클릭하여 Client Secret 생성 및 복사

### 4. 환경 변수 설정

`server/.env` 파일 수정:

```env
PORT=3000
JWT_SECRET=여기에-안전한-비밀키-입력
NODE_ENV=development

# GitHub OAuth (위에서 복사한 값 입력)
GITHUB_CLIENT_ID=여기에_GitHub_Client_ID_입력
GITHUB_CLIENT_SECRET=여기에_GitHub_Client_Secret_입력
GITHUB_CALLBACK_URL=http://localhost:8000/preview/index.html
```

**중요**: `preview/index.html` 파일에서도 `GITHUB_CLIENT_ID`를 수정해야 합니다.

```javascript
// preview/index.html 파일의 약 1067번째 줄 근처
const GITHUB_CLIENT_ID = '여기에_GitHub_Client_ID_입력';
```

### 5. axios 패키지 설치

```bash
cd server
npm install
```

### 6. 서버 실행

```bash
cd server
npm start
```

개발 모드 (자동 재시작):
```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

### 7. 프론트엔드 실행

새 터미널에서:

```bash
cd preview
python3 -m http.server 8000
```

브라우저에서 http://localhost:8000 접속

## 📁 프로젝트 구조

```
.
├── server/
│   ├── server.js          # Express 백엔드 서버
│   ├── package.json       # 서버 의존성
│   └── .env              # 환경 변수
│
└── preview/
    └── index.html         # 프론트엔드 (Single Page Application)
```

## 🔐 보안 기능

### 권한 관리
- 포토스팟 수정: 작성자만 가능
- 포토스팟 삭제: 작성자만 가능
- 댓글 작성: 로그인한 사용자만 가능

### 인증
- JWT 토큰 기반 인증
- 비밀번호 bcrypt 해시화
- CORS 설정으로 안전한 API 통신

## 📡 API 엔드포인트

### 인증
- `POST /api/auth/github` - GitHub OAuth 인증 (주 로그인 방식)
- `POST /api/auth/register` - 일반 회원가입 (옵션)
- `POST /api/auth/login` - 일반 로그인 (옵션)
- `GET /api/auth/me` - 현재 사용자 정보

### 포토스팟
- `GET /api/spots` - 모든 포토스팟 조회
- `POST /api/spots` - 새 포토스팟 추가 (로그인 필요)
- `PUT /api/spots/:id` - 포토스팟 수정 (작성자만)
- `DELETE /api/spots/:id` - 포토스팟 삭제 (작성자만)
- `POST /api/spots/:id/like` - 좋아요 토글
- `POST /api/spots/:id/comments` - 댓글 추가

## 🎯 사용 방법

### 1. GitHub 로그인
- 우측 상단의 "GitHub로 로그인" 버튼 클릭
- GitHub 인증 페이지에서 권한 승인
- 자동으로 로그인되어 즉시 포토스팟 추가 가능
- **별도 회원가입 불필요!**

### 2. 포토스팟 탐색
- 목록 보기: 카드 형식으로 모든 스팟 확인
- 지도 보기: 지도에서 위치 기반으로 탐색
- 필터링: 지역별, 키워드로 검색

### 3. 포토스팟 추가
- 로그인 후 "관리" 탭 이동
- "➕ 새 포토스팟 추가" 버튼 클릭
- 정보 입력 후 저장

### 4. 포토스팟 수정/삭제
- 본인이 작성한 포토스팟의 상세 페이지에서 "✏️ 수정" 또는 "🗑️ 삭제" 버튼 클릭
- 또는 "관리" 탭에서 수정

## ⚠️ 주의사항

### 현재 버전의 제한사항
- 데이터가 서버 메모리에 저장됩니다 (서버 재시작 시 초기화)
- 실제 운영 환경에서는 MongoDB, PostgreSQL 등의 데이터베이스 사용을 권장합니다
- 이미지는 외부 URL로만 추가 가능 (파일 업로드 미지원)

### 향후 개선 사항
- 데이터베이스 연동
- 이미지 업로드 기능
- 이메일 인증
- 비밀번호 재설정
- 프로필 관리
- 알림 기능

## 🛠️ 기술 스택

### Backend
- Node.js + Express
- JWT (jsonwebtoken)
- bcryptjs (비밀번호 암호화)
- CORS

### Frontend
- Vanilla JavaScript
- Leaflet.js (지도)
- Font Awesome (아이콘)
- CSS3 (반응형 디자인) — 미리보기 (프로토타입 UI)
아래는 프로젝트에 포함된 웹 기반 미리보기(`preview/index.html`)의 주요 화면을 Markdown으로 재구성한 내용입니다.

## 목록 화면
- **숨은 언덕 전망대**
	- 설명: 작은 언덕 위의 감성 전망대. 노을이 예쁜 곳.
	- 태그: `#노을` `#언덕` `#야경`

- **낡은 카페 골목**
	- 설명: 빈티지 감성의 골목 카페들, 포토스팟이 곳곳에 있음.
	- 태그: `#감성카페` `#빈티지` `#골목`

- **한적한 강변 산책로**
	- 설명: 사람이 적고 강변 뷰가 좋은 포인트.
	- 태그: `#자연` `#산책로` `#강변`

## 지도 화면
- 정적 미리보기 이미지(프로토타입): 실제 앱에서는 `Google Maps`가 동작합니다.

## 상세 화면 (예시)
- 제목: **숨은 언덕 전망대**
- 큰 헤더 사진
- 설명: 노을이 아름다운 조용한 전망대입니다. 광각 렌즈 추천, 골든아워(17:30–18:15)에 방문하세요.
- 촬영 팁: 광각 추천 / 골든아워 / 주차 가능
- 버튼: `지도에서 보기`, `사진 업로드`
- 리뷰 예시:
	- 익명: "사람이 거의 없었어요. 안전하고 편안한 곳."
	- 사용자A: "골든아워에 가면 정말 예쁩니다!"

---

## 로컬 미리보기 실행 방법
미리보기 HTML(`preview/index.html`)을 로컬에서 열려면 간단한 HTTP 서버를 사용하세요.

```bash
# 프로젝트 루트에서
python3 -m http.server 8000

# 브라우저에서 열기 (선택)
http://127.0.0.1:8000/preview/index.html
```

> 참고: 현재 이 개발 컨테이너에서 이미 `python3 -m http.server 8000` 명령으로 서버를 실행해 두었습니다(백그라운드). 만약 로컬에서 직접 실행하려면 위 명령을 복사해 사용하세요.

## 파일 위치
- 미리보기 HTML: `preview/index.html`
- 스크립트: `scripts/generate_qr.py`, `scripts/trigger_manual_deploy.sh`, `scripts/trigger_manual_deploy_curl.sh`

---

원하시면 이 Markdown을 `README.md`로 병합하거나, 미리보기 HTML을 더 정교하게 바꿔 데스크톱/모바일 반응형으로 개선해 드리겠습니다.