package com.yourco.qrcheckin.session;

import com.yourco.qrcheckin.common.util.HashingService;
import com.yourco.qrcheckin.session.model.Session;
import com.yourco.qrcheckin.session.model.SessionCreateRequest;
import com.yourco.qrcheckin.session.model.SessionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SessionService {

    private final SessionRepository repo;
    private final HashingService hashing;
    private final SecureRandom random = new SecureRandom();
    
    // 짧은 코드용 문자셋 (혼동 방지를 위해 일부 문자 제외)
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    
    @Value("${app.frontend.checkin-base-url:http://localhost:5173}")
    private String checkinBaseUrl;

    public SessionService(SessionRepository repo, HashingService hashing) {
        this.repo = repo;
        this.hashing = hashing;
    }

    public SessionResponse createSession(SessionCreateRequest req) {
        // ID 생성: 날짜-제목 (URL-safe)
        String id = req.sessionDate() + "-" + sanitizeForId(req.title());
        
        // 중복 체크
        if (repo.findById(id).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 세션입니다: " + id);
        }

        // 짧은 코드 생성 (8자리)
        String shortCode = generateShortCode();
        
        // 토큰 생성 (shortCode 기반 해시)
        String tokenHash = hashing.sha256(shortCode);

        // 시작/종료 시간은 하루 전체
        String startsAt = req.sessionDate() + "T00:00:00";
        String endsAt = req.sessionDate() + "T23:59:59";
        String now = OffsetDateTime.now().toString();

        Session session = new Session(
                id,
                req.title(),
                req.sessionDate(),
                startsAt,
                endsAt,
                tokenHash,
                shortCode,
                "ACTIVE",
                now
        );

        repo.insert(session);

        return toResponse(session);
    }

    public List<SessionResponse> getAllSessions() {
        return repo.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public Optional<SessionResponse> getSession(String id) {
        return repo.findById(id).map(this::toResponse);
    }

    public Optional<SessionResponse> getSessionByShortCode(String shortCode) {
        return repo.findByShortCode(shortCode.toUpperCase()).map(this::toResponse);
    }

    public SessionResponse getSessionWithToken(String id) {
        Session session = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("세션을 찾을 수 없습니다: " + id));
        return toResponse(session);
    }

    public boolean validateShortCode(String shortCode) {
        return repo.findByShortCode(shortCode.toUpperCase())
                .map(s -> "ACTIVE".equals(s.status()))
                .orElse(false);
    }

    public void deleteSession(String id) {
        repo.delete(id);
    }

    public void closeSession(String id) {
        repo.updateStatus(id, "CLOSED");
    }

    private SessionResponse toResponse(Session session) {
        // 짧은 URL: /c/{shortCode}
        String qrUrl = checkinBaseUrl + "/c/" + session.shortCode();
        
        return new SessionResponse(
                session.id(),
                session.title(),
                session.sessionDate(),
                session.startsAt(),
                session.endsAt(),
                session.status(),
                session.createdAt(),
                session.shortCode(),
                qrUrl
        );
    }

    private String generateShortCode() {
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
        }
        String code = sb.toString();
        
        // 중복 체크
        if (repo.findByShortCode(code).isPresent()) {
            return generateShortCode(); // 재귀로 다시 생성
        }
        return code;
    }

    private String sanitizeForId(String input) {
        return input.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9가-힣]", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}
