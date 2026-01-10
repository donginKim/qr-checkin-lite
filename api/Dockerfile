# API Dockerfile - Spring Boot
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app
COPY . .
RUN chmod +x gradlew && ./gradlew bootJar -x test

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 데이터 디렉토리 생성 (uploads 포함)
RUN mkdir -p /app/data/uploads

COPY --from=builder /app/build/libs/*.jar app.jar

# SQLite 데이터 영구 저장을 위한 볼륨 포인트
VOLUME /app/data

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

