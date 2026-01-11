package com.yourco.qrcheckin.attendance;

import com.yourco.qrcheckin.attendance.model.AttendanceRecord;
import com.yourco.qrcheckin.attendance.model.CheckinRequest;
import com.yourco.qrcheckin.attendance.model.CheckinResult;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
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

    // 기간별 출석 내역 삭제
    @DeleteMapping("/admin/attendances")
    public Map<String, Object> deleteAttendances(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String sessionId) {
        
        int deleted = 0;
        String message;
        
        if (sessionId != null && !sessionId.isBlank()) {
            // 세션별 삭제
            deleted = service.deleteBySessionId(sessionId);
            message = "세션의 출석 기록 " + deleted + "건이 삭제되었습니다.";
        } else if (startDate != null && endDate != null) {
            // 기간별 삭제
            deleted = service.deleteByDateRange(startDate, endDate);
            message = startDate + " ~ " + endDate + " 기간의 출석 기록 " + deleted + "건이 삭제되었습니다.";
        } else {
            return Map.of(
                "success", false,
                "deleted", 0,
                "message", "삭제 조건을 지정해주세요 (sessionId 또는 startDate/endDate)"
            );
        }
        
        return Map.of(
            "success", true,
            "deleted", deleted,
            "message", message
        );
    }
}
