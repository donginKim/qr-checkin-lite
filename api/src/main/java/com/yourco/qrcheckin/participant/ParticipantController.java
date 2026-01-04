package com.yourco.qrcheckin.participant;

import com.yourco.qrcheckin.participant.model.ParticipantImportResult;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/participants")
public class ParticipantController {

    private final ParticipantService service;

    public ParticipantController(ParticipantService service) {
        this.service = service;
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ParticipantImportResult importExcel(
            @RequestPart("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean replaceAll
    ) throws Exception {
        if (file.isEmpty()) throw new IllegalArgumentException("파일이 비었습니다.");
        try (var in = file.getInputStream()) {
            return service.importExcel(in, replaceAll);
        }
    }

    @GetMapping("/count")
    public int count() {
        return service.countParticipants();
    }
}
