package com.yourco.qrcheckin.attendance;

import com.yourco.qrcheckin.attendance.model.CheckinRequest;
import com.yourco.qrcheckin.attendance.model.CheckinResult;
import com.yourco.qrcheckin.common.util.HashingService;
import com.yourco.qrcheckin.common.util.PhoneNormalizer;
import com.yourco.qrcheckin.participant.ParticipantRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class AttendanceService {

    private final ParticipantRepository participantRepo;
    private final AttendanceRepository attendanceRepo;
    private final HashingService hashing;

    public AttendanceService(ParticipantRepository participantRepo,
                             AttendanceRepository attendanceRepo,
                             HashingService hashing) {
        this.participantRepo = participantRepo;
        this.attendanceRepo = attendanceRepo;
        this.hashing = hashing;
    }

    @Transactional
    public CheckinResult checkin(CheckinRequest req) {
        // TODO: 다음 단계에서 token/세션 검증 붙이기

        long participantId = req.participantId();

        // 1) 참가자 존재 확인x1
        var participantOpt = participantRepo.findById(participantId);
        if (participantOpt.isEmpty()) {
            return new CheckinResult(false, "선택한 참가자를 찾을 수 없습니다.");
        }

        var participant = participantOpt.get();

        // 2) 전화번호 검증(명단 선택 + 폰 입력이 같은 사람인지 확인)
        String phoneNorm = PhoneNormalizer.normalize(req.phone());
        if (phoneNorm.isBlank()) {
            return new CheckinResult(false, "전화번호를 확인하세요.");
        }

        String phoneHash = hashing.sha256(phoneNorm);
        if (!phoneHash.equals(participant.phoneHash())) {
            // 개인정보 노출을 줄이려면 상세 사유를 과하게 말하지 않는 게 안전
            return new CheckinResult(false, "전화번호가 일치하지 않습니다.");
        }

        // 3) 출석 기록 insert (UNIQUE(session_id, participant_id)로 중복 방지)
        String checkedAt = OffsetDateTime.now().toString();
        try {
            attendanceRepo.insert(req.sessionId(), participantId, checkedAt, null, null);
            return new CheckinResult(true, "출석 완료");
        } catch (DuplicateKeyException e) {
            return new CheckinResult(false, "이미 출석 처리되었습니다.");
        }
    }
}