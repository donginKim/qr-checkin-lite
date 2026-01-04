package com.yourco.qrcheckin.session.model;

public record SessionResponse(
    String id,
    String title,
    String sessionDate,
    String startsAt,
    String endsAt,
    String status,
    String createdAt,
    String shortCode,
    String qrUrl
) {}

