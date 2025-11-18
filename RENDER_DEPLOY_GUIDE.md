# 🚀 Render.com 배포 가이드

## 준비 완료 ✅
- GitHub 저장소: https://github.com/12youm90-droid/NEW___1
- 배포 설정 파일: `render.yaml` 생성됨
- 서버 코드: `server/server.js` 준비됨
- 자동 배포 스크립트: `deploy.sh` 준비됨

## 배포 단계 (5분 소요)

### 1단계: Render.com 접속
🔗 https://render.com
- "Get Started for Free" 클릭
- GitHub 계정으로 로그인

### 2단계: 새 Web Service 생성
1. 대시보드에서 **"New +"** 버튼 클릭
2. **"Web Service"** 선택

### 3단계: GitHub 저장소 연결
1. **"Connect a repository"** 선택
2. GitHub 인증 (처음이면)
3. `NEW___1` 저장소 찾기
4. **"Connect"** 클릭

### 4단계: 설정 입력
```
Name: photospot-api
Environment: Node
Region: Singapore (가장 가까움)
Branch: main
Root Directory: (비워두기)
Build Command: cd server && npm install
Start Command: cd server && node server.js
```

### 5단계: 무료 플랜 선택
- **Instance Type**: Free
- **"Create Web Service"** 클릭

### 6단계: 배포 완료 대기
- 2~3분 후 배포 완료
- 상단에 서버 URL 표시됨
- 예: `https://photospot-api.onrender.com`

## 배포 후 확인

서버 URL이 생성되면:
```bash
# API 테스트
curl https://your-app-url.onrender.com/api/spots

# 또는 브라우저에서
https://your-app-url.onrender.com/api/spots
```

## 프론트엔드 설정

서버 URL을 받으면 프론트엔드 코드를 수정해드릴게요!

---

**지금 바로 시작하세요:** https://render.com
