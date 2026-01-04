package com.yourco.qrcheckin.session.model;

import jakarta.validation.constraints.NotBlank;

public record SessionCreateRequest(
    @NotBlank String title,
    @NotBlank String sessionDate
) {}

