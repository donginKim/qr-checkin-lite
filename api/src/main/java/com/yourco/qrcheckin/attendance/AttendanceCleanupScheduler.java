package com.yourco.qrcheckin.attendance;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Component
public class AttendanceCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(AttendanceCleanupScheduler.class);

    private final AttendanceRepository attendanceRepo;

    @Value("${app.attendance.retention-days:0}")
    private int retentionDays; // 0 = 영구 보관

    public AttendanceCleanupScheduler(AttendanceRepository attendanceRepo) {
        this.attendanceRepo = attendanceRepo;
    }

    // 매일 새벽 3시에 실행
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOldAttendances() {
        runCleanup(retentionDays);
    }

    /**
     * 수동 실행용 메소드
     * @param days 보관 기간 (0이면 설정값 사용)
     * @return 삭제 결과
     */
    public Map<String, Object> runCleanup(int days) {
        int effectiveDays = days > 0 ? days : retentionDays;

        if (effectiveDays <= 0) {
            log.info("출석 기록 자동 삭제 비활성화 (retention-days={})", effectiveDays);
            return Map.of(
                "enabled", false,
                "retentionDays", effectiveDays,
                "deleted", 0,
                "message", "자동 삭제가 비활성화되어 있습니다 (retention-days=0)"
            );
        }

        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(effectiveDays);
        String cutoffStr = cutoffDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

        log.info("{}일 이전 출석 기록 삭제 시작 (기준: {})", effectiveDays, cutoffStr);

        int deleted = attendanceRepo.deleteOlderThan(cutoffStr);

        log.info("출석 기록 {}건 삭제 완료", deleted);

        return Map.of(
            "enabled", true,
            "retentionDays", effectiveDays,
            "cutoffDate", cutoffStr,
            "deleted", deleted,
            "message", deleted + "건의 출석 기록이 삭제되었습니다"
        );
    }

    public int getRetentionDays() {
        return retentionDays;
    }
}

