package com.yourco.qrcheckin.session;

import com.yourco.qrcheckin.session.model.SessionCreateRequest;
import com.yourco.qrcheckin.session.model.SessionResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/sessions")
public class SessionController {

    private final SessionService service;

    public SessionController(SessionService service) {
        this.service = service;
    }

    @GetMapping
    public List<SessionResponse> list() {
        return service.getAllSessions();
    }

    @PostMapping
    public SessionResponse create(@Valid @RequestBody SessionCreateRequest req) {
        return service.createSession(req);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionResponse> get(@PathVariable String id) {
        return service.getSession(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/qr")
    public SessionResponse getWithToken(@PathVariable String id) {
        return service.getSessionWithToken(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Void> close(@PathVariable String id) {
        service.closeSession(id);
        return ResponseEntity.noContent().build();
    }
}

