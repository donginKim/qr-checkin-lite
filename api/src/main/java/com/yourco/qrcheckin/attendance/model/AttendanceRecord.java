package com.yourco.qrcheckin.attendance.model;

public record AttendanceRecord(
    long id,
    String sessionId,
    String sessionTitle,
    long participantId,
    String name,
    String phone,
    String phoneLast4,
    String district,
    String checkedInAt
) {
}

