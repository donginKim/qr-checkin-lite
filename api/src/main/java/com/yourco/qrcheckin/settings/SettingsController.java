package com.yourco.qrcheckin.settings;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class SettingsController {

    private final SettingsRepository repo;

    public SettingsController(SettingsRepository repo) {
        this.repo = repo;
    }

    // 공개 API - 성당 이름 조회
    @GetMapping("/settings/church-name")
    public Map<String, String> getChurchName() {
        String name = repo.get("church_name").orElse("성당");
        return Map.of("churchName", name);
    }

    // 공개 API - 간편 체크인 모드 조회
    @GetMapping("/settings/simple-checkin-mode")
    public Map<String, Object> getSimpleCheckinMode() {
        boolean enabled = repo.get("simple_checkin_mode")
                .map("true"::equals)
                .orElse(false);
        return Map.of("enabled", enabled);
    }

    // 관리자 API - 모든 설정 조회
    @GetMapping("/admin/settings")
    public Map<String, String> getAllSettings() {
        return repo.getAll();
    }

    // 관리자 API - 설정 변경
    @PutMapping("/admin/settings/{key}")
    public Map<String, String> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> body
    ) {
        String value = body.get("value");
        if (value == null) {
            throw new IllegalArgumentException("value is required");
        }
        
        // 허용된 키만 수정 가능
        if (!key.equals("church_name") && !key.equals("simple_checkin_mode") && !key.equals("logo_url")) {
            throw new IllegalArgumentException("Unknown setting key: " + key);
        }
        
        repo.set(key, value);
        return Map.of("key", key, "value", value);
    }
}

