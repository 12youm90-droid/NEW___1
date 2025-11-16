# Flutter 개발 환경 설정

이 문서는 이 레포지토리에서 Flutter 개발을 시작하기 위한 최소한의 설정을 설명합니다.

필요 조건
- Flutter SDK 설치 (https://flutter.dev)
- Dart/Flutter 확장 (VS Code 사용 시)

빠른 시작

1. Flutter 설치 여부 확인:

```bash
flutter --version
```

2. 의존성 설치:

```bash
flutter pub get
```

3. VS Code에서 개발:
- `code .`로 열고 Dart & Flutter 확장을 설치하세요.
- `.vscode/launch.json`에 정의된 `Flutter` 구성을 사용해 앱을 실행할 수 있습니다.

유틸리티 스크립트
- `scripts/check_flutter.sh` : 로컬에 Flutter가 설치되어 있는지 간단히 확인합니다.

참고
- `analysis_options.yaml`은 `package:flutter_lints`를 포함합니다.
- 필요하면 `pubspec.yaml`의 `environment` 값을 프로젝트에 맞게 조정하세요.

프로토타입 실행 방법

1. Flutter SDK 설치 및 환경 준비 (공식 문서 참조)

2. 의존성 설치:

```bash
flutter pub get
```

3. Google Maps 사용 시
- Android/iOS에 API 키 설정이 필요합니다. (프로젝트 `android`/`ios` 설정에서 키를 추가하세요)

4. 앱 실행:

```bash
flutter run
```

비고
- 현재 레포지토리는 간단한 프로토타입(지도/목록/상세 더미 데이터)을 포함합니다. 실제 서비스 연동(Firestore, Storage, Maps API 키 등)은 추가 설정이 필요합니다.

Firebase 설정 (간단 가이드)

1. Firebase 콘솔에서 새 프로젝트 생성
2. Android/iOS 앱 추가 후 `google-services.json`(Android) / `GoogleService-Info.plist`(iOS)를 다운로드하여 `android/app/` 및 `ios/Runner/`에 배치
3. Firebase 콘솔에서 Firestore, Storage, Authentication(익명 로그인 사용)을 활성화
4. 로컬에서 앱을 실행하기 전에 `flutter pub get` 실행

Flutter 코드에서는 앱 시작 시 Firebase를 초기화하고 익명 인증을 시도합니다. (파일: `lib/services/firebase_service.dart`)

Google Maps API 키 설정

- Android: `android/app/src/main/AndroidManifest.xml`의 `<application>`에

```xml
<meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_API_KEY"/>
```

- iOS: `ios/Runner/AppDelegate.swift` 또는 `AppDelegate.m`에 다음을 추가하거나 `Info.plist`에 키 값을 설정

```xml
<key>GMSApiKey</key>
<string>YOUR_API_KEY</string>
```

자동화 팁

- Android: CI에서 `google-services.json`을 안전하게 사용하려면 비밀 관리(Secrets) 시스템에 파일 내용을 저장한 뒤 빌드 스텝에서 파일로 복원하세요.
- iOS: `GoogleService-Info.plist`도 마찬가지로 CI secret에 보관 후 빌드 시 복원합니다.

주의
- 실제 배포 전에는 Firestore 규칙과 Storage 규칙을 적절히 설정하세요. (개발 단계에서는 열려 있는 규칙을 사용하더라도, 배포 시에는 인증/권한 검토 필요)

수동 웹 배포 (링크로 접근 가능하게 만들기)

자동 배포를 원하지 않으시면, 리포지토리에는 수동 배포 워크플로(`Manual Web Deploy`)가 포함되어 있습니다. 이 워크플로를 수동으로 실행하면 `build/web`의 내용이 `gh-pages` 브랜치로 배포되어, 다음 URL로 앱에 접근할 수 있습니다:

- https://12youm90-droid.github.io/NEW___1/

수동 배포 방법

1. GitHub에서 리포지토리 페이지로 이동 → `Actions` 탭
2. 좌측 워크플로 목록에서 `Manual Web Deploy` 선택
3. `Run workflow` 버튼을 클릭하여 배포 실행
4. 배포가 완료되면 위 URL로 접속하여 웹 앱을 확인합니다

참고

- `peaceiris/actions-gh-pages` 액션이 `gh-pages` 브랜치를 관리하므로, 별도 설정 없이도 배포 가능합니다.
- 워크플로는 `GITHUB_TOKEN`을 사용해 배포하므로, 해당 리포지토리에 쓰기 권한이 있는 사용자가 실행해야 합니다.
- 링크는 공개적으로 접근해집니다. 비공개 접근이 필요하면 별도 호스팅(인증 가능한 서비스) 또는 리포지토리 접근 정책을 고려하세요.

스크립트로 수동 배포 트리거하기 (옵션)

리포지토리 루트의 `scripts` 폴더에 수동 배포와 QR 코드 생성을 돕는 스크립트가 포함되어 있습니다.

- `scripts/trigger_manual_deploy.sh` : `gh` CLI로 수동 배포 워크플로를 트리거합니다.
	- 사용법: `gh auth login`으로 로그인 후
		```bash
		./scripts/trigger_manual_deploy.sh
		```

- `scripts/trigger_manual_deploy_curl.sh` : `GITHUB_TOKEN`(repo/workflow 권한 필요) 환경변수로 GitHub REST API를 호출해 워크플로를 트리거합니다.
	- 사용법 예:
		```bash
		GITHUB_TOKEN=ghp_xxx ./scripts/trigger_manual_deploy_curl.sh
		```

QR 코드 생성

배포 후 사용자에게 공유할 링크의 QR 코드를 생성하려면 `scripts/generate_qr.py`를 사용하세요 (Python 필요).

```bash
# 설치
pip install "qrcode[pil]"

# 사용 예
python3 scripts/generate_qr.py "https://12youm90-droid.github.io/NEW___1/" out.png
```

생성된 `out.png`를 공유하거나 인쇄하면 사용자가 링크를 스캔해서 바로 웹 앱에 접근할 수 있습니다.

앱스토어 배포(참고)

- Android: AAB를 Play Console에 업로드하고 릴리스 절차(앱 서명 포함)를 진행하세요.
- iOS: App Store에 배포하려면 macOS에서 코드사인, 프로비저닝 프로파일, Fastlane 설정 등이 필요합니다. CI에서 자동 서명을 구성하려면 Apple Developer 계정과 secrets(키, 인증서)을 등록해야 합니다.

보안 노트

- CI에서 `google-services.json` 또는 `GoogleService-Info.plist`를 사용해야 하는 경우, 민감한 파일을 GitHub Secrets로 관리하고 워크플로에서 복원하는 방식으로 처리하세요.

Firebase 보안 규칙 배포

프로덕션 배포 전 Firestore와 Storage의 보안 규칙을 설정하세요. 레포지토리에 템플릿 규칙을 추가했습니다:

- `firebase/firestore.rules`
- `firebase/storage.rules`

배포 방법 (Firebase CLI 필요):

```bash
# 로그인
firebase login

# Firestore 규칙 배포
firebase deploy --only firestore:rules --project YOUR_PROJECT_ID

# Storage 규칙 배포
firebase deploy --only storage:rules --project YOUR_PROJECT_ID
```

`firebase.json`에 규칙 파일 경로를 지정하려면 예시:

```json
{
	"firestore": {
		"rules": "firebase/firestore.rules"
	},
	"storage": {
		"rules": "firebase/storage.rules"
	}
}
```

권장
- 관리자 권한(`admin`)은 Firebase Authentication custom claim으로 부여하고, 관리자 전용 콘솔에서 관리하세요.
- 실제 운영에서는 리뷰/스팟 생성 시 서버 측에서 추가 검증(악성 콘텐츠 검사, 중복 검토)을 수행하세요.
