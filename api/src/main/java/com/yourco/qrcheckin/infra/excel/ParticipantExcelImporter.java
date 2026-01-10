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

@Component
public class ParticipantExcelImporter {

    public record RowData(String name, String phone, String baptismalName, String district) {}

    public List<RowData> read(InputStream in) {
        try (Workbook wb = WorkbookFactory.create(in)) {
            Sheet sheet = wb.getSheetAt(0);

            List<RowData> rows = new ArrayList<>();
            for (int i = 0; i <= sheet.getLastRowNum(); i++) {
                Row r = sheet.getRow(i);
                if (r == null) continue;

                String name = cellToString(r.getCell(0)).trim();
                String phone = cellToString(r.getCell(1)).trim();
                String baptismalName = cellToString(r.getCell(2)).trim();
                String district = cellToString(r.getCell(3)).trim();

                if (name.isBlank() || phone.isBlank()) continue;
                if (i == 0 && (name.contains("이름") || phone.contains("전화"))) continue;

                rows.add(new RowData(name, phone, baptismalName, district));
            }
            return rows;
        } catch (Exception e) {
            throw new IllegalArgumentException("엑셀 읽기 실패: 첫 시트의 A열=이름, B열=전화번호, C열=세례명, D열=구역 형식인지 확인", e);
        }
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
