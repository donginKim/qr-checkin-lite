#!/bin/bash

# QR Check-in Lite 배포 스크립트
# GCP VM에서 실행

set -e

echo "╔═══════════════════════════════════════════╗"
echo "║     QR Check-in Lite - Deploy Script      ║"
echo "╚═══════════════════════════════════════════╝"

# 현재 디렉토리 확인
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found!"
    echo "   Please run this script from the project root."
    exit 1
fi

# 데이터 디렉토리 생성
echo "📁 Creating data directory..."
mkdir -p data

# 기존 컨테이너 중지
echo "🛑 Stopping existing containers..."
docker compose down 2>/dev/null || true

# 이미지 빌드 및 실행
echo "🔨 Building and starting containers..."
docker compose up -d --build

# 상태 확인
echo ""
echo "📊 Container Status:"
docker compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your app at: http://$(curl -s ifconfig.me 2>/dev/null || echo 'YOUR_IP')"
echo ""
echo "📝 Useful commands:"
echo "   docker compose logs -f    # View logs"
echo "   docker compose restart    # Restart services"
echo "   docker compose down       # Stop services"

