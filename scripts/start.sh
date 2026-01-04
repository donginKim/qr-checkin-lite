#!/bin/bash

# QR Check-in Lite - 통합 실행 스크립트
# api(Spring Boot)와 web(React/Vite)을 동시에 실행합니다.

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT_DIR/api"
WEB_DIR="$ROOT_DIR/web"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# PID 저장용
API_PID=""
WEB_PID=""

cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    
    if [ -n "$API_PID" ] && kill -0 "$API_PID" 2>/dev/null; then
        echo -e "${BLUE}Stopping API server (PID: $API_PID)...${NC}"
        kill "$API_PID" 2>/dev/null || true
    fi
    
    if [ -n "$WEB_PID" ] && kill -0 "$WEB_PID" 2>/dev/null; then
        echo -e "${BLUE}Stopping Web server (PID: $WEB_PID)...${NC}"
        kill "$WEB_PID" 2>/dev/null || true
    fi
    
    # 자식 프로세스들도 정리
    pkill -P $$ 2>/dev/null || true
    
    echo -e "${GREEN}✅ All services stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

print_banner() {
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════╗"
    echo "║       QR Check-in Lite Dev Server         ║"
    echo "╠═══════════════════════════════════════════╣"
    echo "║  API: http://localhost:8080               ║"
    echo "║  WEB: http://localhost:5173               ║"
    echo "╠═══════════════════════════════════════════╣"
    echo "║  Press Ctrl+C to stop all services        ║"
    echo "╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

start_api() {
    echo -e "${BLUE}🚀 Starting API server (Spring Boot)...${NC}"
    cd "$API_DIR"
    ./gradlew bootRun --console=plain 2>&1 | sed 's/^/[API] /' &
    API_PID=$!
    echo -e "${GREEN}   API PID: $API_PID${NC}"
}

start_web() {
    echo -e "${BLUE}🚀 Starting Web server (Vite)...${NC}"
    cd "$WEB_DIR"
    
    # node_modules 체크
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}   Installing npm dependencies...${NC}"
        npm install
    fi
    
    npm run dev 2>&1 | sed 's/^/[WEB] /' &
    WEB_PID=$!
    echo -e "${GREEN}   WEB PID: $WEB_PID${NC}"
}

# 메인 실행
print_banner
start_api
sleep 2  # API 시작 대기
start_web

echo -e "\n${GREEN}✅ All services started!${NC}\n"

# 두 프로세스 모두 실행 중일 때까지 대기
wait

