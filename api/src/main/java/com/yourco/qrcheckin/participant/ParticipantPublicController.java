package com.yourco.qrcheckin.participant;

import com.yourco.qrcheckin.participant.model.ParticipantSearchItem;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participants")
public class ParticipantPublicController {

    private final ParticipantRepository repo;

    public ParticipantPublicController(ParticipantRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/search")
    public List<ParticipantSearchItem> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit
    ) {
        String keyword = q == null ? "" : q.trim();
        if (keyword.isEmpty()) return List.of();

        int safeLimit = Math.min(Math.max(limit, 1), 20);
        // 공개 API에서는 전화번호 마스킹 유지 (phone 대신 빈 문자열)
        return repo.searchByNamePrefix(keyword, safeLimit).stream()
                .map(p -> new ParticipantSearchItem(p.id(), p.name(), "", p.phoneLast4(), p.baptismalName(), p.district()))
                .toList();
    }
}