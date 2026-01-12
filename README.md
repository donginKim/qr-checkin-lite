<div align="center">

# 📱 간편 QR코드 출석체크

**종교 단체 및 소규모 행사를 위한 스마트 출석 관리 솔루션**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED?logo=docker&logoColor=white)](docker-compose.yml)

</div>

---

## 📋 소개

종교 단체, 팝업 행사, 세미나 등 **소규모 인원(약 4,000명 이하)**의 간편한 QR 코드 출석체크를 위한 웹/모바일 웹 서비스입니다.

> 복잡한 설정 없이 빠르게 배포하고, 직관적인 UI로 누구나 쉽게 사용할 수 있습니다.

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🔲 **QR 코드 생성** | 세션별 고유 QR 코드 자동 생성 및 표시 |
| ✅ **간편 체크인** | 이름 검색 → 본인 선택 → 출석 완료 (전화번호 인증 선택) |
| 👥 **회원 관리** | Excel 일괄 업로드, 구역별 관리, 검색 기능 |
| 📊 **출석 통계** | 세션별/구역별 출석 현황 및 통계 |
| 📥 **데이터 내보내기** | 출석 내역 Excel 다운로드 |
| ⚙️ **관리자 설정** | 간편 체크인 모드, 로고 커스터마이징 |

---

## 🛠 기술 스택

### Backend
![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle-02303A?style=flat-square&logo=gradle&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)

### Infrastructure
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white)
![GCP](https://img.shields.io/badge/GCP-4285F4?style=flat-square&logo=google-cloud&logoColor=white)

---

## 🚀 빠른 시작

### 사전 요구사항

- [Docker](https://www.docker.com/) & Docker Compose
- (개발 시) Java 21+, Node.js 20+

### 로컬 실행

```bash
# 1. 저장소 클론
git clone https://github.com/donginKim/qr-checkin-lite.git
cd qr-checkin-lite

# 2. 환경 설정
cp env.example .env

# 3. 서비스 시작
make start

# 4. (선택) 테스트 데이터 삽입
make seed
```

### 접속 URL

| 서비스 | URL |
|--------|-----|
| 🌐 웹 서비스 | http://localhost:5173 |
| 🔧 API 서버 | http://localhost:8080 |
| 🔐 관리자 페이지 | http://localhost:5173/admin |

---

## 📂 프로젝트 구조

```
qr-checkin-lite/
├── api/                    # Spring Boot 백엔드
│   ├── src/main/java/      # Java 소스 코드
│   ├── src/main/resources/ # 설정 파일
│   └── build.gradle        # Gradle 빌드 설정
├── web/                    # React 프론트엔드
│   ├── src/                # TypeScript 소스 코드
│   └── package.json        # npm 설정
├── scripts/                # 유틸리티 스크립트
├── docker-compose.yml      # Docker 구성
└── Makefile                # 편의 명령어
```

---

## 🧪 테스트 방법

### 기본 테스트 흐름

1. **회원 등록**
   - 관리자 페이지 → 회원 관리 → Excel 업로드 또는 수동 추가

2. **세션 생성**
   - 관리자 페이지 → 세션 관리 → 새 세션 생성

3. **QR 코드 표시**
   - 세션 목록에서 QR 코드 버튼 클릭 → 전체화면 표시

4. **출석 체크**
   - 참가자가 QR 스캔 → 이름 검색 → 본인 선택 → 출석 완료

5. **출석 확인**
   - 관리자 페이지 → 출석 내역에서 확인 및 Excel 다운로드

### 테스트 데이터 생성

```bash
make seed
```

---

## ⚙️ 환경 설정

`.env` 파일에서 설정 가능한 항목:

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `CHURCH_NAME` | 단체/기관 이름 | 우리성당 |
| `ADMIN_PIN` | 관리자 PIN | 1234 |
| `ATTENDANCE_RETENTION_DAYS` | 출석 기록 보존 기간 (일) | 90 |

---

## 📦 배포

### Docker Hub 이미지

```bash
# 이미지 빌드 & 푸시
./scripts/build-push.sh
```

### GCP 배포

```bash
# GCP 서버에서
cd ~/qr-checkin-lite
git pull
docker compose pull
docker compose up -d
```

자세한 GCP 배포 가이드는 [GCP_DEPLOY.md](docs/GCP_DEPLOY.md)를 참조하세요.

---

## 📞 문의

프로젝트 관련 문의사항이나 커스터마이징 요청은 아래로 연락 바랍니다.

<div align="center">

**📧 steve99890@gmail.com**

</div>

---

<div align="center">

Made with ❤️ by **DongIn Kim**

</div>
