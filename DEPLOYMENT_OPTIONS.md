# 24/7 서버 운영 옵션

## 1. Render.com (추천 - 무료)
- **무료 플랜**: 웹 서비스 무료 호스팅
- **자동 배포**: GitHub 연동 시 자동 배포
- **단점**: 15분 미사용 시 슬립 모드 (첫 요청 시 재시작)

### 배포 방법:
1. https://render.com 회원가입
2. New → Web Service 선택
3. GitHub 저장소 연결
4. 설정:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && node server.js`
   - Environment Variables 추가 필요 시

## 2. Railway.app (무료 5달러 크레딧)
- **무료 크레딧**: 월 5달러 크레딧 제공
- **자동 배포**: GitHub 연동
- **장점**: 슬립 모드 없음

### 배포 방법:
1. https://railway.app 회원가입
2. New Project → Deploy from GitHub
3. 저장소 선택 및 자동 배포

## 3. Fly.io (무료 티어)
- **무료 플랜**: 작은 앱 무료 호스팅
- **장점**: 항상 켜져있음
- **Docker 기반**

## 4. Vercel (프론트엔드) + Railway (백엔드)
- **Vercel**: 프론트엔드 무료 호스팅
- **Railway**: 백엔드 API 호스팅

## 5. 유료 옵션
- **AWS EC2**: 월 ~$5
- **Google Cloud**: 월 ~$5
- **DigitalOcean**: 월 $4

## 현재 Codespace 설정
✅ Codespace 실행 중일 때 서버 자동 시작
✅ 터미널 닫아도 서버 유지
❌ Codespace 중지 시 서버도 중단

## 추천 방안
**초기 단계**: Render.com (완전 무료, 15분 슬립)
**본격 운영**: Railway.app (월 5달러 크레딧) 또는 Fly.io
