package com.yourco.qrcheckin.session;

import com.yourco.qrcheckin.session.model.SessionResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
public class SessionPublicController {

    private final SessionService service;

    public SessionPublicController(SessionService service) {
        this.service = service;
    }

    @GetMapping("/code/{shortCode}")
    public ResponseEntity<SessionPublicInfo> getByShortCode(@PathVariable String shortCode) {
        return service.getSessionByShortCode(shortCode)
                .map(s -> ResponseEntity.ok(new SessionPublicInfo(
                        s.id(),
                        s.title(),
                        s.sessionDate(),
                        s.status(),
                        s.shortCode()
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    // 공개용 세션 정보 (민감한 정보 제외)
    public record SessionPublicInfo(
            String id,
            String title,
            String sessionDate,
            String status,
            String shortCode
    ) {}
}

