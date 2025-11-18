# Fly.io / Railway 배포용 Dockerfile
FROM node:18-alpine

WORKDIR /app

# 서버 파일 복사
COPY server/package*.json ./server/
COPY server/*.js ./server/
COPY server/data ./server/data/

# 의존성 설치
WORKDIR /app/server
RUN npm install --production

# 포트 노출
EXPOSE 3000

# 서버 시작
CMD ["node", "server.js"]
