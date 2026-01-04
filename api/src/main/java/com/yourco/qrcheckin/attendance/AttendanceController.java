package com.yourco.qrcheckin.attendance;

import com.yourco.qrcheckin.attendance.model.AttendanceRecord;
import com.yourco.qrcheckin.attendance.model.CheckinRequest;
import com.yourco.qrcheckin.attendance.model.CheckinResult;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AttendanceController {
    private final AttendanceService service;

    public AttendanceController(AttendanceService service) {
        this.service = service;
    }

    @PostMapping("/checkin")
    public CheckinResult checkin(@Valid @RequestBody CheckinRequest req) {
        return service.checkin(req);
    }

    @GetMapping("/admin/attendances")
    public List<AttendanceRecord> getAttendances(
            @RequestParam(required = false) String sessionId) {
        if (sessionId != null && !sessionId.isBlank()) {
            return service.getAttendancesBySessionId(sessionId);
        }
        return service.getAllAttendances();
    }

    @GetMapping("/admin/attendances/count")
    public int getAttendanceCount(@RequestParam String sessionId) {
        return service.getAttendanceCount(sessionId);
    }
}
