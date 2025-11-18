# GitHub OAuth 설정 가이드

이 프로젝트는 GitHub OAuth를 사용하여 소셜 로그인을 구현합니다. 사용자는 별도 회원가입 없이 GitHub 계정으로 즉시 로그인할 수 있습니다.

## 📋 설정 단계

### 1️⃣ GitHub OAuth App 생성

1. **GitHub 개발자 설정 페이지 접속**
   - 링크: https://github.com/settings/developers
   - 또는: GitHub → Settings → Developer settings → OAuth Apps

2. **"New OAuth App" 버튼 클릭**

3. **애플리케이션 정보 입력**
   ```
   Application name: Photo Spot Community
   Homepage URL: http://localhost:8000
   Application description: (선택사항) 포토스팟 공유 커뮤니티
   Authorization callback URL: http://localhost:8000/preview/index.html
   ```

4. **"Register application" 클릭**

### 2️⃣ Client ID와 Secret 복사

1. 생성된 앱 페이지에서 **Client ID** 복사
2. **"Generate a new client secret"** 버튼 클릭
3. 생성된 **Client Secret** 즉시 복사 (다시 볼 수 없음!)

### 3️⃣ 환경 변수 설정

#### 백엔드 설정 (`server/.env`)

```env
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development

# GitHub OAuth (복사한 값으로 교체)
GITHUB_CLIENT_ID=Ov23lixxxxxxxxxx
GITHUB_CLIENT_SECRET=1234567890abcdefghijklmnopqrstuvwxyz
GITHUB_CALLBACK_URL=http://localhost:8000/preview/index.html
```

#### 프론트엔드 설정 (`preview/index.html`)

파일의 약 **1067번째 줄** 근처에서 다음 코드를 찾아 수정:

```javascript
const GITHUB_CLIENT_ID = 'Ov23lixxxxxxxxxx'; // 여기에 GitHub Client ID 입력
```

### 4️⃣ 서버 재시작

```bash
# 백엔드 서버 재시작
cd server
npm start

# 프론트엔드 서버 재시작
cd ..
python3 -m http.server 8000
```

## 🎯 로그인 흐름

1. **사용자**: "GitHub로 로그인" 버튼 클릭
2. **리디렉트**: GitHub 인증 페이지로 이동
3. **사용자**: GitHub에서 앱 권한 승인
4. **콜백**: 인증 코드와 함께 앱으로 리턴
5. **서버**: GitHub API로 사용자 정보 가져오기
6. **서버**: JWT 토큰 생성 및 반환
7. **클라이언트**: 토큰 저장 및 자동 로그인

## 🔒 보안 고려사항

### Client Secret 보호
- ⚠️ **절대 클라이언트 코드에 노출하지 마세요**
- ✅ 서버 사이드 환경 변수에만 저장
- ✅ `.env` 파일은 `.gitignore`에 추가

### 프로덕션 배포 시
```env
# 프로덕션 환경 변수
GITHUB_CALLBACK_URL=https://yourdomain.com/callback
NODE_ENV=production
```

GitHub OAuth App 설정도 프로덕션 URL로 업데이트 필요:
- Homepage URL: `https://yourdomain.com`
- Authorization callback URL: `https://yourdomain.com/callback`

## 🧪 테스트

1. 브라우저에서 `http://localhost:8000/preview/index.html` 접속
2. "GitHub로 로그인" 버튼 클릭
3. GitHub 인증 페이지에서 권한 승인
4. 자동으로 앱으로 리턴되며 로그인 완료
5. 우측 상단에 GitHub 프로필 이미지와 이름 표시 확인

## ❓ 문제 해결

### "Application not found" 오류
- Client ID가 올바른지 확인
- `.env` 파일과 `index.html`의 Client ID가 일치하는지 확인

### "The redirect_uri MUST match" 오류
- GitHub App 설정의 callback URL 확인
- `http://localhost:8000/preview/index.html` 정확히 일치해야 함

### "Bad credentials" 오류
- Client Secret이 올바른지 확인
- Secret을 재생성하고 다시 설정

### CORS 오류
- 서버가 `http://localhost:3000`에서 실행 중인지 확인
- CORS 설정이 활성화되어 있는지 확인

## 📚 참고 자료

- [GitHub OAuth 공식 문서](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [OAuth 2.0 스펙](https://oauth.net/2/)

## 🎉 완료!

이제 사용자들은 GitHub 계정만 있으면 별도 회원가입 없이 바로 포토스팟을 추가하고 관리할 수 있습니다!
