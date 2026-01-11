package com.yourco.qrcheckin.attendance;

import com.yourco.qrcheckin.attendance.model.AttendanceRecord;
import com.yourco.qrcheckin.attendance.model.CheckinRequest;
import com.yourco.qrcheckin.attendance.model.CheckinResult;
import com.yourco.qrcheckin.common.util.HashingService;
import com.yourco.qrcheckin.common.util.PhoneNormalizer;
import com.yourco.qrcheckin.participant.ParticipantRepository;
import com.yourco.qrcheckin.session.SessionRepository;
import com.yourco.qrcheckin.settings.SettingsRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AttendanceService {

    private final ParticipantRepository participantRepo;
    private final AttendanceRepository attendanceRepo;
    private final SessionRepository sessionRepo;
    private final SettingsRepository settingsRepo;
    private final HashingService hashing;

    public AttendanceService(ParticipantRepository participantRepo,
                             AttendanceRepository attendanceRepo,
                             SessionRepository sessionRepo,
                             SettingsRepository settingsRepo,
                             HashingService hashing) {
        this.participantRepo = participantRepo;
        this.attendanceRepo = attendanceRepo;
        this.sessionRepo = sessionRepo;
        this.settingsRepo = settingsRepo;
        this.hashing = hashing;
    }

    @Transactional
    public CheckinResult checkin(CheckinRequest req) {
        // 0) 세션/토큰 검증 (token은 shortCode)
        var sessionOpt = sessionRepo.findByShortCode(req.token().toUpperCase());
        if (sessionOpt.isEmpty()) {
            return new CheckinResult(false, "유효하지 않은 출석 코드입니다.");
        }
        
        var session = sessionOpt.get();
        if (!"ACTIVE".equals(session.status())) {
            return new CheckinResult(false, "출석이 마감되었습니다.");
        }
        
        // sessionId 검증 (shortCode로 찾은 세션과 요청의 sessionId가 일치해야 함)
        if (!session.id().equals(req.sessionId())) {
            return new CheckinResult(false, "세션 정보가 일치하지 않습니다.");
        }

        long participantId = req.participantId();

        // 1) 참가자 존재 확인x1
        var participantOpt = participantRepo.findById(participantId);
        if (participantOpt.isEmpty()) {
            return new CheckinResult(false, "선택한 참가자를 찾을 수 없습니다.");
        }

        var participant = participantOpt.get();

        // 2) 간편 체크인 모드 확인
        boolean simpleMode = settingsRepo.get("simple_checkin_mode")
                .map("true"::equals)
                .orElse(false);

        String phoneNorm;
        if (simpleMode) {
            // 간편 모드: 전화번호 검증 없이 마스킹된 번호 저장
            phoneNorm = "***-****-" + participant.phoneLast4();
        } else {
            // 일반 모드: 전화번호 검증 필수
            phoneNorm = PhoneNormalizer.normalize(req.phone() != null ? req.phone() : "");
            if (phoneNorm.isBlank()) {
                return new CheckinResult(false, "전화번호를 확인하세요.");
            }

            String phoneHash = hashing.sha256(phoneNorm);
            if (!phoneHash.equals(participant.phoneHash())) {
                return new CheckinResult(false, "전화번호가 일치하지 않습니다.");
            }
        }

        // 3) 출석 기록 insert (UNIQUE(session_id, participant_id)로 중복 방지)
        String checkedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        try {
            attendanceRepo.insert(
                session.id(),
                session.title(),
                participantId, 
                participant.name(),
                phoneNorm,
                participant.phoneLast4(),
                checkedAt, 
                null, 
                null
            );
            return new CheckinResult(true, "출석 완료");
        } catch (DuplicateKeyException e) {
            return new CheckinResult(false, "이미 출석 처리되었습니다.");
        }
    }

    public List<AttendanceRecord> getAllAttendances() {
        return attendanceRepo.findAll();
    }

    public List<AttendanceRecord> getAttendancesBySessionId(String sessionId) {
        return attendanceRepo.findBySessionId(sessionId);
    }

    public int getAttendanceCount(String sessionId) {
        return attendanceRepo.countBySessionId(sessionId);
    }

    @Transactional
    public int deleteByDateRange(String startDate, String endDate) {
        return attendanceRepo.deleteByDateRange(startDate, endDate);
    }

    @Transactional
    public int deleteBySessionId(String sessionId) {
        return attendanceRepo.deleteBySessionId(sessionId);
    }
}