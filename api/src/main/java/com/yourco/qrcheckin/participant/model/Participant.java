package com.yourco.qrcheckin.participant.model;

public record Participant(long id,
                          String name,
                          String phone,
                          String phoneHash,
                          String phoneLast4,
                          String baptismalName,
                          String district,
                          String createdAt) {
}
