package com.yourco.qrcheckin.attendance.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CheckinRequest(
        @NotBlank String sessionId,
        @NotBlank String token,
        @NotNull Long participantId,
        @NotBlank String phone
) {}