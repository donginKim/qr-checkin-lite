package com.yourco.qrcheckin.participant;

import com.yourco.qrcheckin.common.util.HashingService;
import com.yourco.qrcheckin.common.util.PhoneNormalizer;
import com.yourco.qrcheckin.infra.excel.ParticipantExcelImporter;
import com.yourco.qrcheckin.participant.model.ParticipantImportResult;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.HashSet;
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

}
