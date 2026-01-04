# QR Check-in Lite - Makefile
# 편리한 개발 명령어 모음

.PHONY: start stop api web install clean build help

# 기본 명령어
help:
	@echo "╔═══════════════════════════════════════════════════════════╗"
	@echo "║           QR Check-in Lite - Available Commands           ║"
	@echo "╠═══════════════════════════════════════════════════════════╣"
	@echo "║  make start    - API + Web 동시 실행                      ║"
	@echo "║  make stop     - 모든 서비스 종료                         ║"
	@echo "║  make api      - API 서버만 실행                          ║"
	@echo "║  make web      - Web 서버만 실행                          ║"
	@echo "║  make install  - 의존성 설치 (npm + gradle)               ║"
	@echo "║  make build    - 프로덕션 빌드                            ║"
	@echo "║  make clean    - 빌드 파일 정리                           ║"
	@echo "╚═══════════════════════════════════════════════════════════╝"

# 동시 실행
start:
	@./scripts/start.sh

# 서비스 종료
stop:
	@./scripts/stop.sh

# API만 실행
api:
	@echo "🚀 Starting API server..."
	@cd api && ./gradlew bootRun

# Web만 실행
web:
	@echo "🚀 Starting Web server..."
	@cd web && npm run dev

# 의존성 설치
install:
	@echo "📦 Installing dependencies..."
	@cd web && npm install
	@cd api && ./gradlew dependencies --quiet
	@echo "✅ Dependencies installed"

# 프로덕션 빌드
build:
	@echo "🔨 Building for production..."
	@cd web && npm run build
	@cd api && ./gradlew build -x test
	@echo "✅ Build complete"

# 정리
clean:
	@echo "🧹 Cleaning build files..."
	@cd api && ./gradlew clean
	@cd web && rm -rf dist node_modules/.vite
	@echo "✅ Clean complete"

