package com.yourco.qrcheckin.attendance;

import com.yourco.qrcheckin.attendance.model.CheckinRequest;
import com.yourco.qrcheckin.attendance.model.CheckinResult;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
