#!/bin/bash

# 포토스팟 커뮤니티 서버 시작 스크립트
# 백엔드와 프론트엔드 서버를 백그라운드에서 실행하고 계속 유지합니다.

echo "🚀 서버 시작 중..."

# 기존 프로세스 정리
pkill -f "node.*server.js" 2>/dev/null
pkill -f "python3 -m http.server 8000" 2>/dev/null

sleep 1

# 백엔드 서버 시작 (포트 3000)
cd /workspaces/NEW___1/server
nohup node server.js > /tmp/server.log 2>&1 &
BACKEND_PID=$!
echo "✅ 백엔드 서버 시작 (PID: $BACKEND_PID) - http://localhost:3000"

# 프론트엔드 서버 시작 (포트 8000)
cd /workspaces/NEW___1
nohup python3 -m http.server 8000 > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ 프론트엔드 서버 시작 (PID: $FRONTEND_PID) - http://localhost:8000"

sleep 2

# 서버 상태 확인
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ 백엔드 서버 실행 중"
else
    echo "❌ 백엔드 서버 시작 실패"
fi

if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ 프론트엔드 서버 실행 중"
else
    echo "❌ 프론트엔드 서버 시작 실패"
fi

echo ""
echo "📊 실행 중인 포트:"
lsof -i -P -n | grep LISTEN | grep -E "3000|8000"

echo ""
echo "🌐 접속 주소: http://localhost:8000/preview/index.html"
echo "📝 백엔드 로그: tail -f /tmp/server.log"
echo "📝 프론트엔드 로그: tail -f /tmp/frontend.log"
