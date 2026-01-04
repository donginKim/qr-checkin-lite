package com.yourco.qrcheckin.participant;

import com.yourco.qrcheckin.participant.model.ParticipantCreateRequest;
import com.yourco.qrcheckin.participant.model.ParticipantImportResult;
import com.yourco.qrcheckin.participant.model.ParticipantSearchItem;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/participants")
public class ParticipantController {

    private final ParticipantService service;

    public ParticipantController(ParticipantService service) {
        this.service = service;
    }

    @GetMapping
    public List<ParticipantSearchItem> list() {
        return service.findAllParticipants();
    }

    @PostMapping
    public ParticipantSearchItem add(@Valid @RequestBody ParticipantCreateRequest req) {
        return service.addParticipant(req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        service.deleteParticipant(id);
        return ResponseEntity.noContent().build();
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
