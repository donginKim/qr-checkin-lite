package com.yourco.qrcheckin.attendance;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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
        if (retentionDays <= 0) {
            log.info("출석 기록 자동 삭제 비활성화 (retention-days={})", retentionDays);
            return;
        }

        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);
        String cutoffStr = cutoffDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

        log.info("{}일 이전 출석 기록 삭제 시작 (기준: {})", retentionDays, cutoffStr);

        int deleted = attendanceRepo.deleteOlderThan(cutoffStr);

        log.info("출석 기록 {}건 삭제 완료", deleted);
    }
}

