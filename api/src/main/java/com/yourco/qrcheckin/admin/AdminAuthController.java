package com.yourco.qrcheckin.admin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    @Value("${app.admin.pin:1234}")
    private String adminPin;

    @PostMapping("/verify")
    public Map<String, Object> verifyPin(@RequestBody Map<String, String> body) {
        String pin = body.get("pin");
        
        if (pin == null || pin.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PIN을 입력해주세요");
        }

        if (!adminPin.equals(pin)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "비밀번호가 일치하지 않습니다");
        }

        return Map.of(
            "success", true,
            "message", "인증 성공"
        );
    }
}

