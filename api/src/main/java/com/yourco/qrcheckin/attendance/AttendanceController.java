package com.yourco.qrcheckin.attendance;

import com.yourco.qrcheckin.attendance.model.AttendanceRecord;
import com.yourco.qrcheckin.attendance.model.CheckinRequest;
import com.yourco.qrcheckin.attendance.model.CheckinResult;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AttendanceController {
    private final AttendanceService service;
    private final AttendanceCleanupScheduler cleanupScheduler;

    public AttendanceController(AttendanceService service, AttendanceCleanupScheduler cleanupScheduler) {
        this.service = service;
        this.cleanupScheduler = cleanupScheduler;
    }

    @PostMapping("/checkin")
    public CheckinResult checkin(@Valid @RequestBody CheckinRequest req) {
        return service.checkin(req);
    }

    @GetMapping("/admin/attendances")
    public List<AttendanceRecord> getAttendances(
            @RequestParam(required = false) String sessionId) {
        if (sessionId != null && !sessionId.isBlank()) {
            return service.getAttendancesBySessionId(sessionId);
        }
        return service.getAllAttendances();
    }

    @GetMapping("/admin/attendances/count")
    public int getAttendanceCount(@RequestParam String sessionId) {
        return service.getAttendanceCount(sessionId);
    }

    // 자동 삭제 설정 확인
    @GetMapping("/admin/attendances/cleanup/status")
    public Map<String, Object> getCleanupStatus() {
        int days = cleanupScheduler.getRetentionDays();
        return Map.of(
            "enabled", days > 0,
            "retentionDays", days,
            "message", days > 0 
                ? days + "일 이후 출석 기록이 자동 삭제됩니다" 
                : "자동 삭제가 비활성화되어 있습니다 (영구 보관)"
        );
    }

    // 자동 삭제 수동 실행 (테스트용)
    @PostMapping("/admin/attendances/cleanup/run")
    public Map<String, Object> runCleanup(
            @RequestParam(required = false, defaultValue = "0") int days) {
        return cleanupScheduler.runCleanup(days);
    }
}
