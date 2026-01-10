package com.yourco.qrcheckin.participant;

import com.yourco.qrcheckin.participant.model.ParticipantCreateRequest;
import com.yourco.qrcheckin.participant.model.ParticipantImportResult;
import com.yourco.qrcheckin.participant.model.ParticipantSearchItem;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/participants")
public class ParticipantController {

    private final ParticipantService service;
    private final ParticipantRepository repository;

    public ParticipantController(ParticipantService service, ParticipantRepository repository) {
        this.service = service;
        this.repository = repository;
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

    @GetMapping("/stats/by-district")
    public Map<String, Integer> statsByDistrict() {
        return repository.countByDistrict();
    }

    @GetMapping("/template")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=participants_template.xlsx");

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("회원 명단");

            // 헤더 스타일
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            // 헤더 행
            Row headerRow = sheet.createRow(0);
            String[] headers = {"이름", "전화번호", "세례명", "구역"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // 예시 데이터
            String[][] examples = {
                {"홍길동", "010-1234-5678", "베드로", "1구역"},
                {"김철수", "010-2345-6789", "요한", "2구역"},
                {"박영희", "010-3456-7890", "마리아", "1구역"}
            };
            for (int i = 0; i < examples.length; i++) {
                Row row = sheet.createRow(i + 1);
                for (int j = 0; j < examples[i].length; j++) {
                    row.createCell(j).setCellValue(examples[i][j]);
                }
            }

            // 열 너비 조정
            sheet.setColumnWidth(0, 4000);  // 이름
            sheet.setColumnWidth(1, 5000);  // 전화번호
            sheet.setColumnWidth(2, 4000);  // 세례명
            sheet.setColumnWidth(3, 4000);  // 구역

            workbook.write(response.getOutputStream());
        }
    }
}
