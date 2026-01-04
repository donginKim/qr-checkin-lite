# GCP 배포 가이드

## 📋 목차
1. [GCP 프로젝트 생성](#1-gcp-프로젝트-생성)
2. [VM 인스턴스 생성](#2-vm-인스턴스-생성)
3. [서버 초기 설정](#3-서버-초기-설정)
4. [앱 배포](#4-앱-배포)
5. [도메인 및 HTTPS 설정](#5-도메인-및-https-설정-선택)

---

## 1. GCP 프로젝트 생성

### 1.1 GCP Console 접속
```
https://console.cloud.google.com
```

### 1.2 새 프로젝트 생성
1. 상단 프로젝트 선택 → "새 프로젝트"
2. 프로젝트 이름: `qr-checkin` (원하는 이름)
3. "만들기" 클릭

### 1.3 결제 계정 연결
- $300 무료 크레딧 받기 (신규 사용자)
- 카드 등록 필요 (자동 결제 안 됨, 수동 업그레이드 필요)

---

## 2. VM 인스턴스 생성

### 2.1 Compute Engine 활성화
1. 햄버거 메뉴 → Compute Engine → VM 인스턴스
2. API 활성화 (최초 1회)

### 2.2 인스턴스 만들기
```
이름: qr-checkin-server
리전: asia-northeast3 (서울)
영역: asia-northeast3-a

머신 구성:
  시리즈: E2
  머신 유형: e2-micro (무료 tier)
  
부팅 디스크:
  운영체제: Ubuntu
  버전: Ubuntu 22.04 LTS
  크기: 30GB (무료 한도)

방화벽:
  ✅ HTTP 트래픽 허용
  ✅ HTTPS 트래픽 허용
```

### 2.3 고정 IP 설정 (선택, 권장)
1. VPC 네트워크 → IP 주소 → 외부 고정 주소 예약
2. 이름: `qr-checkin-ip`
3. 리전: asia-northeast3
4. 연결 대상: 위에서 만든 VM 선택

---

## 3. 서버 초기 설정

### 3.1 SSH 접속
GCP Console에서 VM 인스턴스 → "SSH" 버튼 클릭

### 3.2 Docker 설치
```bash
# 패키지 업데이트
sudo apt update && sudo apt upgrade -y

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose 설치
sudo apt install docker-compose-plugin -y

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 로그아웃 후 다시 SSH 접속
exit
```

### 3.3 다시 SSH 접속 후 확인
```bash
docker --version
docker compose version
```

---

## 4. 앱 배포

### 4.1 코드 업로드 (방법 1: Git)
```bash
# Git 설치
sudo apt install git -y

# 코드 클론
git clone https://github.com/YOUR_USERNAME/qr-checkin-lite.git
cd qr-checkin-lite
```

### 4.2 코드 업로드 (방법 2: SCP)
로컬에서 실행:
```bash
# GCP VM으로 파일 전송
gcloud compute scp --recurse ./qr-checkin-lite USER@qr-checkin-server:~/ --zone=asia-northeast3-a
```

### 4.3 Docker Compose로 실행
```bash
cd qr-checkin-lite

# 데이터 디렉토리 생성
mkdir -p data

# 빌드 및 실행
docker compose up -d --build

# 로그 확인
docker compose logs -f
```

### 4.4 확인
```bash
# 컨테이너 상태 확인
docker compose ps

# 브라우저에서 접속
http://[VM_외부_IP]
```

---

## 5. 도메인 및 HTTPS 설정 (선택)

### 5.1 도메인 연결
1. 도메인 DNS 설정에서 A 레코드 추가
2. 호스트: @ 또는 원하는 서브도메인
3. 값: VM의 외부 IP 주소

### 5.2 Let's Encrypt SSL 인증서 (무료)
```bash
# Certbot 설치
sudo apt install certbot -y

# 인증서 발급 (docker compose down 먼저)
docker compose down
sudo certbot certonly --standalone -d your-domain.com

# nginx.conf 수정하여 HTTPS 설정 후
docker compose up -d
```

---

## 📌 유용한 명령어

```bash
# 서비스 시작
docker compose up -d

# 서비스 중지
docker compose down

# 로그 확인
docker compose logs -f

# 재시작
docker compose restart

# 업데이트 배포
git pull
docker compose up -d --build
```

---

## 💰 예상 비용

| 항목 | 무료 한도 | 초과 시 |
|------|----------|---------|
| e2-micro VM | 월 720시간 (1대) | ~$6/월 |
| 30GB 디스크 | 30GB | $0.04/GB |
| 네트워크 | 1GB/월 | $0.12/GB |

**소규모 운영 시 대부분 무료!**

---

## ⚠️ 주의사항

1. **결제 알림 설정**: 예산 알림을 설정하여 예상치 못한 비용 방지
2. **데이터 백업**: `./data` 폴더 주기적 백업 권장
3. **보안**: 방화벽 규칙 최소화, SSH 키 인증 사용

