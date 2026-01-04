package com.yourco.qrcheckin.session.model;

public record Session(
    String id,
    String title,
    String sessionDate,
    String startsAt,
    String endsAt,
    String tokenHash,
    String shortCode,
    String status,
    String createdAt
) {}

