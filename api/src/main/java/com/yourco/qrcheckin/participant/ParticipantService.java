package com.yourco.qrcheckin.participant;

import com.yourco.qrcheckin.common.util.HashingService;
import com.yourco.qrcheckin.common.util.PhoneNormalizer;
import com.yourco.qrcheckin.infra.excel.ParticipantExcelImporter;
import com.yourco.qrcheckin.participant.model.ParticipantCreateRequest;
import com.yourco.qrcheckin.participant.model.ParticipantImportResult;
import com.yourco.qrcheckin.participant.model.ParticipantSearchItem;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ParticipantService {

    private final ParticipantRepository repo;
    private final ParticipantExcelImporter importer;
    private final HashingService hashing;

    public ParticipantService(ParticipantRepository repo, ParticipantExcelImporter importer, HashingService hashing) {
        this.repo = repo;
        this.importer = importer;
        this.hashing = hashing;
    }

    @Transactional
    public ParticipantImportResult importExcel(InputStream in, boolean replaceAll) {
        var rows = importer.read(in);

        if (replaceAll) repo.deleteAll();

        int inserted = 0;
        int skipped = 0;

        // 동일 파일 내 중복 방지(이름+폰 정규화)
        Set<String> seen = new HashSet<>();

        for (var r : rows) {
            String name = r.name().trim();
            String phoneNorm = PhoneNormalizer.normalize(r.phone());
            if (name.isBlank() || phoneNorm.isBlank()) {
                skipped++;
                continue;
            }

            String key = name + "|" + phoneNorm;
            if (!seen.add(key)) { // 파일 내 중복
                skipped++;
                continue;
            }

            String phoneHash = hashing.sha256(phoneNorm);
            String last4 = PhoneNormalizer.last4(phoneNorm);

            // 이미 DB에 같은 사람이 있으면 스킵
            if (repo.findByNameAndPhoneHash(name, phoneHash).isPresent()) {
                skipped++;
                continue;
            }

            repo.insert(name, phoneHash, last4);
            inserted++;
        }

        return new ParticipantImportResult(rows.size(), inserted, skipped);
    }

    public int countParticipants() {
        return repo.countAll();
    }

    public List<ParticipantSearchItem> findAllParticipants() {
        return repo.findAll().stream()
                .map(p -> new ParticipantSearchItem(p.id(), p.name(), p.phoneLast4()))
                .toList();
    }

    @Transactional
    public ParticipantSearchItem addParticipant(ParticipantCreateRequest req) {
        String name = req.name().trim();
        String phoneNorm = PhoneNormalizer.normalize(req.phone());
        
        if (name.isBlank()) {
            throw new IllegalArgumentException("이름을 입력해주세요.");
        }
        if (phoneNorm.isBlank()) {
            throw new IllegalArgumentException("올바른 전화번호를 입력해주세요.");
        }

        String phoneHash = hashing.sha256(phoneNorm);
        String last4 = PhoneNormalizer.last4(phoneNorm);

        // 중복 체크
        if (repo.findByNameAndPhoneHash(name, phoneHash).isPresent()) {
            throw new IllegalArgumentException("이미 등록된 신자입니다.");
        }

        repo.insert(name, phoneHash, last4);
        
        // 방금 추가된 신자 조회해서 반환
        var participant = repo.findByNameAndPhoneHash(name, phoneHash)
                .orElseThrow(() -> new RuntimeException("신자 등록 실패"));
        
        return new ParticipantSearchItem(participant.id(), participant.name(), participant.phoneLast4());
    }

    @Transactional
    public void deleteParticipant(long id) {
        repo.deleteById(id);
    }
}
