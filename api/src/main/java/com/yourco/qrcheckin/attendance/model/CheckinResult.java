package com.yourco.qrcheckin.attendance.model;

public record CheckinResult(
        boolean ok,
        String message
) {}