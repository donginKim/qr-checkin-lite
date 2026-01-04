package com.yourco.qrcheckin.participant.model;

import jakarta.validation.constraints.NotBlank;

public record ParticipantCreateRequest(
    @NotBlank String name,
    @NotBlank String phone
) {}

