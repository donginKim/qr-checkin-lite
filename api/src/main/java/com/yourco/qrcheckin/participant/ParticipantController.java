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
            // 헤더 스타일
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            // 구역별 시트 예시 (시트명 = 구역명)
            String[][] sheetExamples = {
                {"1.1구역", "홍길동", "베드로", "010-1234-5678"},
                {"2.2구역", "김철수", "요한",   "010-2345-6789"},
            };
            String[][][] dataExamples = {
                {{"홍길동", "베드로", "010-1234-5678"}, {"이영희", "마리아", "010-9876-5432"}},
                {{"김철수", "요한",   "010-2345-6789"}, {"박민수", "안드레아", "010-5555-1234"}},
            };
            String[] sheetNames = {"1.1구역", "2.2구역"};

            for (int si = 0; si < sheetNames.length; si++) {
                Sheet sheet = workbook.createSheet(sheetNames[si]);

                // 행1: 빈 행
                sheet.createRow(0);

                // 행2: 구역명
                Row districtRow = sheet.createRow(1);
                districtRow.createCell(0).setCellValue(sheetNames[si]);

                // 행3: 빈 행 (구역장 정보 등)
                sheet.createRow(2);

                // 행4: 출석회원
                Row categoryRow = sheet.createRow(3);
                categoryRow.createCell(0).setCellValue("출석회원");

                // 행5: 컬럼 헤더 (C=성명, D=세례명, E=연락처)
                Row colHeaderRow = sheet.createRow(4);
                colHeaderRow.createCell(0).setCellValue("순번");
                colHeaderRow.createCell(1).setCellValue("출생년도");
                Cell nameHeader = colHeaderRow.createCell(2);
                nameHeader.setCellValue("성명");
                nameHeader.setCellStyle(headerStyle);
                Cell baptismalHeader = colHeaderRow.createCell(3);
                baptismalHeader.setCellValue("세례명");
                baptismalHeader.setCellStyle(headerStyle);
                Cell phoneHeader = colHeaderRow.createCell(4);
                phoneHeader.setCellValue("연락처");
                phoneHeader.setCellStyle(headerStyle);

                // 행6~: 예시 데이터 (C=성명, D=세례명, E=연락처)
                String[][] data = dataExamples[si];
                for (int i = 0; i < data.length; i++) {
                    Row row = sheet.createRow(5 + i);
                    row.createCell(0).setCellValue(i + 1);     // 순번
                    row.createCell(2).setCellValue(data[i][0]); // C: 성명
                    row.createCell(3).setCellValue(data[i][1]); // D: 세례명
                    row.createCell(4).setCellValue(data[i][2]); // E: 연락처
                }

                sheet.setColumnWidth(2, 4000); // C: 성명
                sheet.setColumnWidth(3, 4000); // D: 세례명
                sheet.setColumnWidth(4, 5000); // E: 연락처
            }

            workbook.write(response.getOutputStream());
        }
    }
}
