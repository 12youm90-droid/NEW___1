#!/bin/bash

# 빠른 배포 스크립트
# Codespace에서 수정 후 이 스크립트를 실행하면 자동으로 Git push

echo "🚀 변경사항 배포 시작..."

# 변경된 파일 확인
if [[ -z $(git status -s) ]]; then
    echo "✅ 변경사항이 없습니다."
    exit 0
fi

echo "📝 변경된 파일:"
git status -s

# 커밋 메시지 입력 받기
read -p "커밋 메시지 (엔터=자동 메시지): " COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Git 작업
git add .
git commit -m "$COMMIT_MSG"
git push origin main

echo "✅ 배포 완료!"
echo "🌐 Render/Railway가 자동으로 업데이트합니다 (2~5분 소요)"
