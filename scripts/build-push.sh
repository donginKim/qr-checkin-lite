#!/bin/bash

# Docker Hub 이미지 빌드 및 푸시 스크립트
# 사용법: ./scripts/build-push.sh

set -e

DOCKER_USER="steve1145"
API_IMAGE="${DOCKER_USER}/qr-checkin-api:latest"
WEB_IMAGE="${DOCKER_USER}/qr-checkin-web:latest"

echo "╔═══════════════════════════════════════════╗"
echo "║     Docker Build & Push Script            ║"
echo "╚═══════════════════════════════════════════╝"

# Docker 로그인 확인
echo ""
echo "🔐 Docker Hub 로그인 확인..."
if ! docker info 2>/dev/null | grep -q "Username"; then
    echo "   Docker Hub 로그인이 필요합니다."
    docker login
fi

# API 이미지 빌드
echo ""
echo "🔨 Building API image..."
docker build -t $API_IMAGE ./api

# Web 이미지 빌드
echo ""
echo "🔨 Building Web image..."
docker build -t $WEB_IMAGE ./web

# 이미지 푸시
echo ""
echo "📤 Pushing API image..."
docker push $API_IMAGE

echo ""
echo "📤 Pushing Web image..."
docker push $WEB_IMAGE

echo ""
echo "✅ Done!"
echo ""
echo "🚀 GCP에서 다음 명령어로 실행하세요:"
echo "   cd ~/qr-checkin-lite"
echo "   git pull"
echo "   docker compose pull"
echo "   docker compose up -d"

