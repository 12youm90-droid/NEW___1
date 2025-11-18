#!/bin/bash

# 서버 자동 재시작 스크립트
# 5초마다 서버 상태를 확인하고 중지되면 자동으로 재시작합니다

BACKEND_DIR="/workspaces/NEW___1/server"
FRONTEND_DIR="/workspaces/NEW___1"

echo "[$(date)] 자동 재시작 모니터링 시작"

while true; do
    # 백엔드 서버 확인 (포트 3000)
    if ! pgrep -f "node server.js" > /dev/null; then
        echo "[$(date)] 백엔드 서버 중지됨. 재시작 중..."
        cd "$BACKEND_DIR"
        nohup node server.js > server.log 2>&1 &
        sleep 2
        echo "[$(date)] 백엔드 서버 재시작 완료"
    fi

    # 프론트엔드 서버 확인 (포트 8000)
    if ! pgrep -f "python.*http.server.*8000" > /dev/null; then
        echo "[$(date)] 프론트엔드 서버 중지됨. 재시작 중..."
        cd "$FRONTEND_DIR"
        nohup python3 -m http.server 8000 > frontend.log 2>&1 &
        sleep 2
        echo "[$(date)] 프론트엔드 서버 재시작 완료"
    fi

    # 5초 대기
    sleep 5
done
