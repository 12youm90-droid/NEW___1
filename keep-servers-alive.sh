#!/bin/bash

# 서버 프로세스를 감시하고 중단되면 자동으로 재시작하는 스크립트

echo "👀 서버 감시 시작..."

while true; do
    # 백엔드 서버 확인
    if ! pgrep -f "node.*server.js" > /dev/null; then
        echo "⚠️  백엔드 서버 중단 감지 - 재시작 중..."
        cd /workspaces/NEW___1/server
        nohup node server.js > /tmp/server.log 2>&1 &
        echo "✅ 백엔드 서버 재시작 완료"
    fi
    
    # 프론트엔드 서버 확인
    if ! pgrep -f "python3 -m http.server 8000" > /dev/null; then
        echo "⚠️  프론트엔드 서버 중단 감지 - 재시작 중..."
        cd /workspaces/NEW___1
        nohup python3 -m http.server 8000 > /tmp/frontend.log 2>&1 &
        echo "✅ 프론트엔드 서버 재시작 완료"
    fi
    
    # 10초마다 확인
    sleep 10
done
