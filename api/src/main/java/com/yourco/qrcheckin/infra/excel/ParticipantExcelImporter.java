package com.yourco.qrcheckin.infra.excel;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class ParticipantExcelImporter {

    public record RowData(String name, String phone, String baptismalName, String district) {}

    // "1.개봉구역", "1. 성가대", "3) 장년" 등 앞의 숫자·기호 제거
    private static final Pattern DISTRICT_PREFIX = Pattern.compile("^[\\d\\s.\\-)\\]]+");

    public List<RowData> read(InputStream in) {
        try (Workbook wb = WorkbookFactory.create(in)) {
            List<RowData> rows = new ArrayList<>();

            for (int si = 0; si < wb.getNumberOfSheets(); si++) {
                Sheet sheet = wb.getSheetAt(si);
                String district = cleanDistrictName(sheet.getSheetName());

                // 5행 = 컬럼 헤더, 6행(index 5)부터 데이터
                // C열(index 2)=성명, D열(index 3)=세례명, E열(index 4)=연락처
                for (int i = 5; i <= sheet.getLastRowNum(); i++) {
                    Row r = sheet.getRow(i);
                    if (r == null) continue;

                    String name         = cellToString(r.getCell(2)).trim();
                    String baptismalName = cellToString(r.getCell(3)).trim();
                    String phone        = cellToString(r.getCell(4)).trim();

                    if (name.isBlank() || name.equals("성명") || name.equals("이름")) continue;

                    rows.add(new RowData(name, phone, baptismalName, district));
                }
            }
            return rows;
        } catch (Exception e) {
            throw new IllegalArgumentException(
                "엑셀 읽기 실패: 시트명=구역명, 6행~=데이터, C열=성명, D열=세례명, E열=연락처 형식인지 확인", e);
        }
    }

    private static String cleanDistrictName(String sheetName) {
        String cleaned = DISTRICT_PREFIX.matcher(sheetName).replaceFirst("");
        return cleaned.isBlank() ? sheetName.trim() : cleaned.trim();
    }

    private static String cellToString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                double v = cell.getNumericCellValue();
                long lv = (long) v;
                yield String.valueOf(lv);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }
}
