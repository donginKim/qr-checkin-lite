#!/bin/bash

# QR Check-in Lite - 서비스 종료 스크립트

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping QR Check-in Lite services...${NC}"

# Spring Boot (8080 포트) 종료
if lsof -ti:8080 > /dev/null 2>&1; then
    echo -e "${YELLOW}Stopping API server on port 8080...${NC}"
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ API server stopped${NC}"
else
    echo -e "${YELLOW}API server not running${NC}"
fi

# Vite (5173 포트) 종료
if lsof -ti:5173 > /dev/null 2>&1; then
    echo -e "${YELLOW}Stopping Web server on port 5173...${NC}"
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ Web server stopped${NC}"
else
    echo -e "${YELLOW}Web server not running${NC}"
fi

echo -e "${GREEN}✅ All services stopped.${NC}"

